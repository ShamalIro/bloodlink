const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const DonorProfile = require('../models/DonorProfile');
const Donation = require('../models/Donation');
const { BLOOD_TYPES, compatibleDonorTypes } = require('../utils/bloodCompatibility');

const QR_TTL_SECONDS = 10 * 60;

const fail = (res, err) => {
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ message: err.message });
  }
  console.error('donor-service error:', err);
  return res.status(500).json({ message: 'Server error' });
};

const validCoords = (lat, lng) =>
  Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

// PUT /api/donors/me  (create or update own profile)
// body: { bloodType, district, latitude, longitude, lastDonationDate, available, pushToken }
exports.upsertMe = async (req, res) => {
  try {
    const { bloodType, district, latitude, longitude, lastDonationDate, available, pushToken } =
      req.body;

    let profile = await DonorProfile.findOne({ userId: req.user.id });
    if (!profile) {
      if (!bloodType) return res.status(400).json({ message: 'bloodType is required' });
      profile = new DonorProfile({ userId: req.user.id, bloodType });
    } else if (bloodType) {
      profile.bloodType = bloodType;
    }

    if (district !== undefined) profile.district = district;
    if (typeof available === 'boolean') profile.available = available;
    if (pushToken !== undefined) profile.pushToken = pushToken;

    if (latitude !== undefined || longitude !== undefined) {
      if (!validCoords(latitude, longitude)) {
        return res.status(400).json({ message: 'latitude and longitude must be valid numbers' });
      }
      profile.location = { type: 'Point', coordinates: [longitude, latitude] };
    }

    if (lastDonationDate !== undefined) {
      const d = new Date(lastDonationDate);
      if (Number.isNaN(d.getTime()) || d > new Date()) {
        return res.status(400).json({ message: 'lastDonationDate must be a past date' });
      }
      profile.lastDonationDate = d;
    }

    profile.recalcEligibility();
    await profile.save();
    res.json(profile);
  } catch (err) {
    fail(res, err);
  }
};

// GET /api/donors/me
exports.getMe = async (req, res) => {
  try {
    const profile = await DonorProfile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Donor profile not set up yet' });
    res.json(profile);
  } catch (err) {
    fail(res, err);
  }
};

// PATCH /api/donors/me/availability   body: { available: boolean }
exports.setAvailability = async (req, res) => {
  try {
    if (typeof req.body.available !== 'boolean') {
      return res.status(400).json({ message: 'available must be true or false' });
    }
    const profile = await DonorProfile.findOneAndUpdate(
      { userId: req.user.id },
      { available: req.body.available },
      { new: true }
    );
    if (!profile) return res.status(404).json({ message: 'Donor profile not set up yet' });
    res.json(profile);
  } catch (err) {
    fail(res, err);
  }
};

// GET /api/donors/me/qr  -> short-lived signed token for the check-in QR
exports.issueQr = async (req, res) => {
  try {
    if (!process.env.QR_SECRET) return res.status(500).json({ message: 'QR_SECRET not configured' });
    const profile = await DonorProfile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Donor profile not set up yet' });
    const token = jwt.sign({ donorId: req.user.id, purpose: 'checkin' }, process.env.QR_SECRET, {
      expiresIn: QR_TTL_SECONDS,
    });
    res.json({ token, expiresInSeconds: QR_TTL_SECONDS });
  } catch (err) {
    fail(res, err);
  }
};

// GET /internal/donors/match?bloodType=O%2B&lat=6.93&lng=79.86&radiusKm=15[&exact=true]
// Internal only (notification-service). Returns eligible, available, nearby, compatible donors.
exports.match = async (req, res) => {
  try {
    const { bloodType } = req.query;
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radiusKm = req.query.radiusKm === undefined ? 15 : Number(req.query.radiusKm);
    if (!BLOOD_TYPES.includes(bloodType) || !validCoords(lat, lng) || !(radiusKm > 0)) {
      return res.status(400).json({ message: 'bloodType, lat, lng (and optional radiusKm) required' });
    }

    const donors = await DonorProfile.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distanceMeters',
          maxDistance: radiusKm * 1000,
          spherical: true,
          query: {
            available: true,
            // exact=true: only this blood type (stock appeals); otherwise all compatible donors
            bloodType: { $in: req.query.exact === 'true' ? [bloodType] : compatibleDonorTypes(bloodType) },
            $or: [
              { eligibleFromDate: { $exists: false } },
              { eligibleFromDate: null },
              { eligibleFromDate: { $lte: new Date() } },
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
          userId: 1,
          bloodType: 1,
          pushToken: 1,
          distanceKm: { $round: [{ $divide: ['$distanceMeters', 1000] }, 1] },
        },
      },
    ]);
    res.json(donors);
  } catch (err) {
    fail(res, err);
  }
};

// GET /api/donors/me/donations  (Donation History screen)
exports.listMyDonations = async (req, res) => {
  try {
    const profile = await DonorProfile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Donor profile not set up yet' });
    const donations = await Donation.find({ donorId: req.user.id }).sort({ donatedAt: -1 });
    res.json({
      count: donations.length,
      lastDonationDate: profile.lastDonationDate,
      eligibleFromDate: profile.eligibleFromDate,
      isEligible: profile.isEligible,
      donations,
    });
  } catch (err) {
    fail(res, err);
  }
};

// POST /internal/donors/validate-qr   body: { token }
// Called by the check-in flow when a coordinator scans a donor's QR code.
exports.validateQr = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ valid: false, message: 'token is required' });
    if (!process.env.QR_SECRET) return res.status(500).json({ message: 'QR_SECRET not configured' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.QR_SECRET);
    } catch (e) {
      return res.status(401).json({ valid: false, message: 'QR code is invalid or has expired' });
    }
    if (payload.purpose !== 'checkin') {
      return res.status(401).json({ valid: false, message: 'QR code is invalid or has expired' });
    }

    const profile = await DonorProfile.findOne({ userId: payload.donorId });
    if (!profile) return res.status(404).json({ valid: false, message: 'Donor profile not found' });

    res.json({
      valid: true,
      donorId: payload.donorId,
      bloodType: profile.bloodType,
      district: profile.district,
      isEligible: profile.isEligible,
    });
  } catch (err) {
    fail(res, err);
  }
};

// POST /internal/donors/:donorId/donations
// body: { requestId, hospitalName?, units?, confirmedBy? }
// Called when a coordinator confirms collection. Starts the 120-day cooldown.
exports.recordDonation = async (req, res) => {
  try {
    const { donorId } = req.params;
    const { requestId, hospitalName, units, confirmedBy } = req.body;
    if (!mongoose.isValidObjectId(donorId) || !mongoose.isValidObjectId(requestId)) {
      return res.status(400).json({ message: 'Valid donorId and requestId are required' });
    }
    const profile = await DonorProfile.findOne({ userId: donorId });
    if (!profile) return res.status(404).json({ message: 'Donor profile not found' });

    const donation = await Donation.create({
      donorId,
      requestId,
      hospitalName,
      bloodType: profile.bloodType,
      units,
      confirmedBy,
    });

    profile.lastDonationDate = donation.donatedAt;
    profile.recalcEligibility();
    await profile.save();

    res.status(201).json({ donation, eligibleFromDate: profile.eligibleFromDate });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'This donation was already recorded' });
    }
    fail(res, err);
  }
};

// POST /internal/donors/push-tokens   body: { userIds: [...] }
// Used by notification-service to reach donors who already responded to a request.
exports.pushTokens = async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0 || userIds.length > 500) {
      return res.status(400).json({ message: 'userIds must be an array of 1 to 500 ids' });
    }
    const profiles = await DonorProfile.find({ userId: { $in: userIds } }).select('userId pushToken -_id');
    res.json(profiles);
  } catch (err) {
    fail(res, err);
  }
};