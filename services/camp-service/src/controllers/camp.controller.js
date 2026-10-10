const mongoose = require('mongoose');
const Camp = require('../models/Camp');
const Rsvp = require('../models/Rsvp');
const { BLOOD_TYPES } = require('../utils/bloodTypes');
const { sendCampInvite } = require('../utils/notificationClient');

const INVITE_COOLDOWN_MS = (Number(process.env.INVITE_COOLDOWN_HOURS) || 12) * 60 * 60 * 1000;
const isNum = Number.isFinite;

const fail = (res, err) => {
  if (err.code === 'UPSTREAM') {
    console.error('camp-service upstream error:', err.message);
    return res.status(503).json({ message: 'A dependent service is unavailable, try again' });
  }
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ message: err.message });
  }
  console.error('camp-service error:', err);
  return res.status(500).json({ message: 'Server error' });
};

const view = (camp) => {
  const c = typeof camp.toObject === 'function' ? camp.toObject() : camp;
  return { ...c, spotsLeft: Math.max(0, c.capacity - c.registeredCount) };
};

// Validates camp input. On create every field is required; on update only provided ones are checked.
function parseFields(body, existing) {
  const f = {};
  const errors = [];
  const has = (k) => body[k] !== undefined;
  if (!existing) {
    ['title', 'venue', 'startsAt', 'endsAt', 'bloodTypesNeeded', 'capacity'].forEach((k) => {
      if (!has(k)) errors.push(`${k} is required`);
    });
  }

  if (has('title')) {
    const t = String(body.title).trim();
    if (!t || t.length > 120) errors.push('title must be 1-120 characters');
    else f.title = t;
  }
  if (has('description')) f.description = String(body.description).trim().slice(0, 1000);
  if (has('venue')) {
    const v = body.venue || {};
    if (!v.name || !isNum(v.latitude) || !isNum(v.longitude) || Math.abs(v.latitude) > 90 || Math.abs(v.longitude) > 180) {
      errors.push('venue needs name, latitude and longitude');
    } else {
      f.venue = {
        name: String(v.name).trim(),
        address: v.address ? String(v.address).trim() : undefined,
        location: { type: 'Point', coordinates: [v.longitude, v.latitude] },
      };
    }
  }
  for (const k of ['startsAt', 'endsAt']) {
    if (has(k)) {
      const d = new Date(body[k]);
      if (Number.isNaN(d.getTime())) errors.push(`${k} must be a valid date`);
      else f[k] = d;
    }
  }
  if (has('bloodTypesNeeded')) {
    const a = body.bloodTypesNeeded;
    if (!Array.isArray(a) || a.length === 0 || !a.every((t) => BLOOD_TYPES.includes(t))) {
      errors.push(`bloodTypesNeeded must be a non-empty array of ${BLOOD_TYPES.join(', ')}`);
    } else {
      f.bloodTypesNeeded = [...new Set(a)];
    }
  }
  if (has('capacity')) {
    const c = body.capacity;
    if (!Number.isInteger(c) || c < 1 || c > 5000) {
      errors.push('capacity must be a whole number from 1 to 5000');
    } else if (existing && c < existing.registeredCount) {
      errors.push(`capacity cannot be below the ${existing.registeredCount} donors already registered`);
    } else {
      f.capacity = c;
    }
  }

  const startsAt = f.startsAt ?? existing?.startsAt;
  const endsAt = f.endsAt ?? existing?.endsAt;
  if (startsAt && endsAt && endsAt <= startsAt) errors.push('endsAt must be after startsAt');
  if (f.startsAt && f.startsAt <= new Date()) errors.push('startsAt must be in the future');
  return { fields: f, errors };
}

// Loads :id and checks the NGO owns it; sends the error response and returns null otherwise.
async function loadOwnCamp(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: 'Invalid camp id' });
    return null;
  }
  const camp = await Camp.findById(req.params.id);
  if (!camp) {
    res.status(404).json({ message: 'Camp not found' });
    return null;
  }
  if (String(camp.organizerId) !== req.user.id) {
    res.status(403).json({ message: 'This is not your camp' });
    return null;
  }
  return camp;
}

// ---------- NGO staff (approved NGO accounts) ----------

// POST /api/camps
// body: { title, description?, venue: { name, address?, latitude, longitude }, startsAt, endsAt,
//         bloodTypesNeeded: [...], capacity }
exports.create = async (req, res) => {
  try {
    const { fields, errors } = parseFields(req.body, null);
    if (errors.length) return res.status(400).json({ message: errors.join('; ') });
    const camp = await Camp.create({
      ...fields,
      organizerId: req.user.id,
      organizationName: req.user.organizationName,
    });
    res.status(201).json(view(camp));
  } catch (err) {
    fail(res, err);
  }
};

// GET /api/camps/mine
exports.listMine = async (req, res) => {
  try {
    const camps = await Camp.find({ organizerId: req.user.id }).sort({ startsAt: -1 });
    res.json(camps.map(view));
  } catch (err) {
    fail(res, err);
  }
};

// PATCH /api/camps/:id   (only while the camp is still scheduled)
exports.update = async (req, res) => {
  try {
    const camp = await loadOwnCamp(req, res);
    if (!camp) return;
    if (camp.status !== 'scheduled') {
      return res.status(409).json({ message: 'A cancelled camp cannot be edited' });
    }
    const { fields, errors } = parseFields(req.body, camp);
    if (errors.length) return res.status(400).json({ message: errors.join('; ') });
    camp.set(fields);
    await camp.save();
    res.json(view(camp));
  } catch (err) {
    fail(res, err);
  }
};

// DELETE /api/camps/:id  -> soft cancel (record is kept)
exports.cancel = async (req, res) => {
  try {
    const camp = await loadOwnCamp(req, res);
    if (!camp) return;
    if (camp.status === 'cancelled') {
      return res.status(409).json({ message: 'This camp is already cancelled' });
    }
    camp.status = 'cancelled';
    await camp.save();
    res.json(view(camp));
  } catch (err) {
    fail(res, err);
  }
};

// POST /api/camps/:id/invite
// Broadcasts an invite to nearby donors whose blood type the camp needs (via notification-service).
exports.invite = async (req, res) => {
  try {
    const camp = await loadOwnCamp(req, res);
    if (!camp) return;
    if (camp.status !== 'scheduled' || camp.startsAt <= new Date()) {
      return res.status(409).json({ message: 'Invites can only be sent for upcoming, active camps' });
    }
    if (camp.lastInviteAt && Date.now() - camp.lastInviteAt.getTime() < INVITE_COOLDOWN_MS) {
      return res.status(429).json({
        message: 'Invites for this camp were already sent recently',
        nextAllowedAt: new Date(camp.lastInviteAt.getTime() + INVITE_COOLDOWN_MS),
      });
    }
    const result = await sendCampInvite({
      campId: String(camp._id),
      title: camp.title,
      venueName: camp.venue.name,
      startsAt: camp.startsAt,
      bloodTypesNeeded: camp.bloodTypesNeeded,
      location: { type: 'Point', coordinates: [...camp.venue.location.coordinates] },
    });
    camp.lastInviteAt = new Date();
    await camp.save();
    res.json(result);
  } catch (err) {
    fail(res, err);
  }
};

// ---------- Donors ----------

// GET /api/camps/nearby?lat=..&lng=..&radiusKm=25
// Upcoming scheduled camps, nearest first when coordinates are given.
exports.nearby = async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radiusKm = Number(req.query.radiusKm) || 25;
    const open = { status: 'scheduled', startsAt: { $gt: new Date() } };

    let camps;
    if (req.query.lat !== undefined && req.query.lng !== undefined) {
      if (!isNum(lat) || !isNum(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        return res.status(400).json({ message: 'lat and lng must be valid numbers' });
      }
      camps = await Camp.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [lng, lat] },
            distanceField: 'distanceMeters',
            maxDistance: radiusKm * 1000,
            spherical: true,
            key: 'venue.location',
            query: open,
          },
        },
        { $limit: 50 },
      ]);
      camps.forEach((c) => {
        c.distanceKm = Math.round(c.distanceMeters / 100) / 10;
        delete c.distanceMeters;
      });
    } else {
      camps = await Camp.find(open).sort({ startsAt: 1 }).limit(50).lean();
    }

    const mine = await Rsvp.find({ donorId: req.user.id, campId: { $in: camps.map((c) => c._id) } });
    const registered = new Set(mine.map((r) => String(r.campId)));
    res.json(camps.map((c) => ({ ...view(c), isRegistered: registered.has(String(c._id)) })));
  } catch (err) {
    fail(res, err);
  }
};

// GET /api/camps/my-rsvps   camps I registered for, soonest first
exports.myRsvps = async (req, res) => {
  try {
    const rsvps = await Rsvp.find({ donorId: req.user.id });
    const camps = await Camp.find({ _id: { $in: rsvps.map((r) => r.campId) } }).sort({ startsAt: 1 });
    res.json(camps.map((c) => ({ ...view(c), isRegistered: true })));
  } catch (err) {
    fail(res, err);
  }
};

// GET /api/camps/:id   (any logged-in user) camp details with the live registered count
exports.getById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid camp id' });
    }
    const camp = await Camp.findById(req.params.id);
    if (!camp) return res.status(404).json({ message: 'Camp not found' });
    const rsvp = await Rsvp.exists({ campId: camp._id, donorId: req.user.id });
    res.json({ ...view(camp), isRegistered: !!rsvp });
  } catch (err) {
    fail(res, err);
  }
};

// POST /api/camps/:id/rsvp   (donors)
exports.rsvp = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid camp id' });
    }
    const camp = await Camp.findById(req.params.id);
    if (!camp) return res.status(404).json({ message: 'Camp not found' });
    if (camp.status !== 'scheduled' || camp.startsAt <= new Date()) {
      return res.status(409).json({ message: 'This camp is not open for registration' });
    }

    try {
      await Rsvp.create({ campId: camp._id, donorId: req.user.id });
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ message: 'You are already registered' });
      throw err;
    }

    // Atomic capacity check: only increments while there is room.
    const updated = await Camp.findOneAndUpdate(
      { _id: camp._id, $expr: { $lt: ['$registeredCount', '$capacity'] } },
      { $inc: { registeredCount: 1 } },
      { new: true }
    );
    if (!updated) {
      await Rsvp.deleteOne({ campId: camp._id, donorId: req.user.id });
      return res.status(409).json({ message: 'This camp is full' });
    }
    res.status(201).json({ ...view(updated), isRegistered: true });
  } catch (err) {
    fail(res, err);
  }
};

// DELETE /api/camps/:id/rsvp   (donors) cancel my registration
exports.cancelRsvp = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid camp id' });
    }
    const camp = await Camp.findById(req.params.id);
    if (!camp) return res.status(404).json({ message: 'Camp not found' });
    if (camp.startsAt <= new Date()) {
      return res.status(409).json({ message: 'This camp has already started' });
    }
    const removed = await Rsvp.findOneAndDelete({ campId: camp._id, donorId: req.user.id });
    if (!removed) return res.status(404).json({ message: 'You are not registered for this camp' });
    const updated = await Camp.findOneAndUpdate(
      { _id: camp._id, registeredCount: { $gt: 0 } },
      { $inc: { registeredCount: -1 } },
      { new: true }
    );
    res.json({ ...view(updated || camp), isRegistered: false });
  } catch (err) {
    fail(res, err);
  }
};