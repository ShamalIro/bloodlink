const mongoose = require('mongoose');
const Verification = require('../models/Verification');

const slug = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const fail = (res, err) => {
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ message: err.message });
  }
  console.error('verification-service error:', err);
  return res.status(500).json({ message: 'Server error' });
};

// ---------- Public (JWT) ----------

// POST /api/verification/apply   (coordinator / ngo)
// body: { organizationName, registrationNumber }
exports.apply = async (req, res) => {
  try {
    const { organizationName, registrationNumber } = req.body;
    if (!organizationName || !registrationNumber) {
      return res
        .status(400)
        .json({ message: 'organizationName and registrationNumber are required' });
    }
    let doc = await Verification.findOne({ userId: req.user.id });
    if (doc && doc.status !== 'rejected') {
      return res.status(409).json({ message: `Your application is already ${doc.status}` });
    }
    if (!doc) doc = new Verification({ userId: req.user.id, role: req.user.role });

    doc.organizationType = req.user.role === 'coordinator' ? 'hospital' : 'ngo';
    doc.organizationName = organizationName;
    doc.registrationNumber = registrationNumber;
    doc.status = 'pending';
    doc.hospitalId = undefined;
    doc.reviewNote = undefined;
    doc.reviewedAt = undefined;
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    fail(res, err);
  }
};

// GET /api/verification/me   (coordinator / ngo): my application status
exports.getMine = async (req, res) => {
  try {
    const doc = await Verification.findOne({ userId: req.user.id });
    if (!doc) return res.status(404).json({ message: 'No verification application yet' });
    res.json(doc);
  } catch (err) {
    fail(res, err);
  }
};

// GET /api/verification/hospitals   (any logged-in user): approved hospitals to pick from
exports.listHospitals = async (req, res) => {
  try {
    const hospitals = await Verification.aggregate([
      { $match: { organizationType: 'hospital', status: 'approved' } },
      {
        $group: {
          _id: '$hospitalId',
          name: { $first: '$organizationName' },
          location: { $max: '$hospitalLocation' }, // picks the record that has coordinates
        },
      },
      { $project: { _id: 0, hospitalId: '$_id', name: 1, location: 1 } },
      { $sort: { name: 1 } },
    ]);
    res.json(hospitals);
  } catch (err) {
    fail(res, err);
  }
};

// ---------- Internal (x-internal-key): admin actions and service-to-service checks ----------

// GET /internal/verification/pending
exports.listPending = async (req, res) => {
  try {
    res.json(await Verification.find({ status: 'pending' }).sort({ createdAt: 1 }));
  } catch (err) {
    fail(res, err);
  }
};

// GET /internal/verification/:userId  -> used by other services as the verification guard
exports.getStatus = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    const doc = await Verification.findOne({ userId: req.params.userId });
    if (!doc) return res.status(404).json({ approved: false, message: 'Not found' });
    res.json({
      userId: doc.userId,
      role: doc.role,
      status: doc.status,
      approved: doc.status === 'approved',
      organizationName: doc.organizationName,
      organizationType: doc.organizationType,
      hospitalId: doc.hospitalId,
      hospitalLocation: doc.hospitalLocation,
    });
  } catch (err) {
    fail(res, err);
  }
};

// GET /internal/verification/hospitals/:hospitalId -> { hospitalId, name, location }
exports.getHospital = async (req, res) => {
  try {
    const docs = await Verification.find({
      organizationType: 'hospital',
      status: 'approved',
      hospitalId: req.params.hospitalId,
    });
    const doc = docs.find((d) => d.hospitalLocation?.coordinates?.length === 2) || docs[0];
    if (!doc) return res.status(404).json({ message: 'Hospital not found' });
    res.json({ hospitalId: doc.hospitalId, name: doc.organizationName, location: doc.hospitalLocation });
  } catch (err) {
    fail(res, err);
  }
};

const review = (status) => async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    const doc = await Verification.findOne({ userId: req.params.userId });
    if (!doc) return res.status(404).json({ message: 'Application not found' });

    doc.status = status;
    doc.reviewedAt = new Date();
    doc.reviewNote = req.body?.note;
    if (status === 'approved' && doc.organizationType === 'hospital') {
      doc.hospitalId = req.body?.hospitalId?.trim() || slug(doc.organizationName);
      const { latitude, longitude } = req.body || {};
      if (latitude !== undefined || longitude !== undefined) {
        if (
          !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
          Math.abs(latitude) > 90 || Math.abs(longitude) > 180
        ) {
          return res.status(400).json({ message: 'latitude and longitude must be valid numbers' });
        }
        doc.hospitalLocation = { type: 'Point', coordinates: [longitude, latitude] };
      }
    }
    await doc.save();
    res.json(doc);
  } catch (err) {
    fail(res, err);
  }
};

// PATCH /internal/verification/:userId/approve   body (optional): { hospitalId, latitude, longitude, note }
exports.approve = review('approved');
// PATCH /internal/verification/:userId/reject    body (optional): { note }
exports.reject = review('rejected');