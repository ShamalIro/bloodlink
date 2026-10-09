const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { sendPush, isExpoToken } = require('../utils/expoPush');
const { matchDonors, getPushTokens } = require('../utils/donorClient');

const DEFAULT_RADIUS_KM = Number(process.env.NOTIFY_RADIUS_KM) || 15;

const fail = (res, err) => {
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ message: err.message });
  }
  console.error('notification-service error:', err);
  return res.status(500).json({ message: 'Server error' });
};

// Saves one in-app notification per recipient, pushes to those with a valid Expo token,
// then records the delivery result. recipients: [{ userId, pushToken, extraData? }]
async function deliver({ recipients, type, title, body, data, priority }) {
  if (recipients.length === 0) return { total: 0, sent: 0, failed: 0, noToken: 0 };

  const docs = await Notification.insertMany(
    recipients.map((r) => ({
      userId: r.userId,
      type,
      title,
      body: r.body || body,
      data: { ...data, ...(r.extraData || {}) },
    }))
  );

  const toPush = [];
  recipients.forEach((r, i) => {
    if (isExpoToken(r.pushToken)) toPush.push({ i, message: { to: r.pushToken, title, body: docs[i].body, data: docs[i].data, ...(priority ? { priority } : {}) } });
  });

  const tickets = await sendPush(toPush.map((p) => p.message));
  const updates = [];
  const pushedIdx = new Set();
  toPush.forEach((p, k) => {
    pushedIdx.add(p.i);
    const ok = tickets[k]?.status === 'ok';
    updates.push({
      updateOne: {
        filter: { _id: docs[p.i]._id },
        update: { delivery: ok ? 'sent' : 'failed', deliveryError: ok ? undefined : tickets[k]?.message || 'push failed' },
      },
    });
  });
  docs.forEach((d, i) => {
    if (!pushedIdx.has(i)) updates.push({ updateOne: { filter: { _id: d._id }, update: { delivery: 'no-token' } } });
  });
  if (updates.length) await Notification.bulkWrite(updates);

  const sent = tickets.filter((t) => t.status === 'ok').length;
  return { total: docs.length, sent, failed: toPush.length - sent, noToken: docs.length - toPush.length };
}

// ---------- Public (JWT) ----------

// GET /api/notifications/mine
exports.listMine = async (req, res) => {
  try {
    const [items, unread] = await Promise.all([
      Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50),
      Notification.countDocuments({ userId: req.user.id, readAt: { $exists: false } }),
    ]);
    res.json({ unread, notifications: items });
  } catch (err) {
    fail(res, err);
  }
};

// PATCH /api/notifications/:id/read
exports.markRead = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid notification id' });
    }
    const doc = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { readAt: new Date() },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Notification not found' });
    res.json(doc);
  } catch (err) {
    fail(res, err);
  }
};

// ---------- Internal (x-internal-key) ----------

// POST /internal/notifications/request-broadcast
// body: { requestId, requesterId, bloodType, unitsRequired, hospitalName, location: { coordinates: [lng, lat] }, radiusKm? }
exports.broadcastRequest = async (req, res) => {
  try {
    const { requestId, requesterId, bloodType, unitsRequired, hospitalName, location, radiusKm } = req.body;
    const [lng, lat] = location?.coordinates || [];
    if (!mongoose.isValidObjectId(requestId) || !bloodType || !Number.isFinite(lng) || !Number.isFinite(lat)) {
      return res.status(400).json({ message: 'requestId, bloodType and location.coordinates [lng, lat] are required' });
    }

    const matches = await matchDonors({ bloodType, lat, lng, radiusKm: radiusKm || DEFAULT_RADIUS_KM });
    const targets = matches.filter((d) => String(d.userId) !== String(requesterId));

    const result = await deliver({
      recipients: targets.map((d) => ({
        userId: d.userId,
        pushToken: d.pushToken,
        body: `${hospitalName || 'A hospital'} needs ${unitsRequired || 1} unit(s) - ${d.distanceKm} km away`,
        extraData: { distanceKm: d.distanceKm },
      })),
      type: 'blood_request',
      title: `Urgent: ${bloodType} blood needed`,
      body: `${hospitalName || 'A hospital'} needs ${bloodType} blood`,
      data: { requestId, hospitalName, bloodType },
    });
    res.json({ matched: matches.length, ...result });
  } catch (err) {
    fail(res, err);
  }
};

// POST /internal/notifications/request-closed
// body: { requestId, status: 'fulfilled' | 'closed', hospitalName?, donorIds: [...] }
exports.requestClosed = async (req, res) => {
  try {
    const { requestId, status, hospitalName, donorIds } = req.body;
    if (!mongoose.isValidObjectId(requestId) || !Array.isArray(donorIds) || donorIds.length === 0) {
      return res.status(400).json({ message: 'requestId and a non-empty donorIds array are required' });
    }
    const tokens = await getPushTokens(donorIds);
    const tokenById = new Map(tokens.map((t) => [String(t.userId), t.pushToken]));

    const fulfilled = status === 'fulfilled';
    const result = await deliver({
      recipients: donorIds.map((id) => ({ userId: id, pushToken: tokenById.get(String(id)) })),
      type: 'request_closed',
      title: fulfilled ? 'Request fulfilled - thank you' : 'Request cancelled',
      body: fulfilled
        ? 'Enough blood has been collected. You no longer need to travel.'
        : 'The requester cancelled this blood request. You no longer need to travel.',
      data: { requestId, hospitalName, status },
    });
    res.json(result);
  } catch (err) {
    fail(res, err);
  }
};

// POST /internal/notifications/stock-appeal
// body: { hospitalId, hospitalName, bloodType, location: { coordinates: [lng, lat] }, radiusKm? }
// Lower urgency than an emergency request: only donors of exactly this blood type, normal push priority.
exports.stockAppeal = async (req, res) => {
  try {
    const { hospitalId, hospitalName, bloodType, location, radiusKm } = req.body;
    const [lng, lat] = location?.coordinates || [];
    if (!hospitalId || !bloodType || !Number.isFinite(lng) || !Number.isFinite(lat)) {
      return res.status(400).json({ message: 'hospitalId, bloodType and location.coordinates [lng, lat] are required' });
    }
    const matches = await matchDonors({
      bloodType, lat, lng, radiusKm: radiusKm || DEFAULT_RADIUS_KM, exact: true,
    });
    const name = hospitalName || 'A hospital';
    const result = await deliver({
      recipients: matches.map((d) => ({
        userId: d.userId,
        pushToken: d.pushToken,
        body: `${name} is low on ${bloodType} - ${d.distanceKm} km away. Could you donate?`,
        extraData: { distanceKm: d.distanceKm },
      })),
      type: 'stock_appeal',
      title: `${bloodType} stock running low`,
      body: `${name} is low on ${bloodType}. Could you donate?`,
      data: { hospitalId, hospitalName, bloodType },
      priority: 'normal',
    });
    res.json({ matched: matches.length, ...result });
  } catch (err) {
    fail(res, err);
  }
};