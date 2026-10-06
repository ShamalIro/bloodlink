const mongoose = require('mongoose');
const Request = require('../models/Request');

const fail = (res, err) => {
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  console.error('request-service error:', err);
  return res.status(500).json({ message: 'Server error' });
};

// Loads a request by :id or sends the error response and returns null.
async function loadRequest(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: 'Invalid request id' });
    return null;
  }
  const doc = await Request.findById(req.params.id);
  if (!doc) res.status(404).json({ message: 'Request not found' });
  return doc;
}

// POST /api/requests
exports.create = async (req, res) => {
  try {
    const { bloodType, unitsRequired, hospital, notes } = req.body;
    if (!bloodType || !unitsRequired || !hospital?.name) {
      return res
        .status(400)
        .json({ message: 'bloodType, unitsRequired and hospital.name are required' });
    }
    const doc = await Request.create({
      requester: req.user.id,
      bloodType,
      unitsRequired,
      hospital,
      notes,
    });
    res.status(201).json(doc);
  } catch (err) {
    fail(res, err);
  }
};

// GET /api/requests/my?status=active|past   (default: active)
exports.listMine = async (req, res) => {
  try {
    const past = req.query.status === 'past';
    const filter = {
      requester: req.user.id,
      status: past ? { $ne: 'active' } : 'active',
    };
    const items = await Request.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    fail(res, err);
  }
};

// GET /api/requests/:id
exports.getById = async (req, res) => {
  try {
    const doc = await loadRequest(req, res);
    if (doc) res.json(doc);
  } catch (err) {
    fail(res, err);
  }
};

// POST /api/requests/:id/respond   body: { action: 'accept' | 'decline' }  (donors only)
exports.respond = async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ message: 'Only donors can respond to requests' });
    }
    const { action } = req.body;
    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ message: "action must be 'accept' or 'decline'" });
    }
    const doc = await loadRequest(req, res);
    if (!doc) return;
    if (doc.status !== 'active') {
      return res.status(409).json({ message: 'This request is no longer active' });
    }
    doc.responses = doc.responses.filter((r) => String(r.donorId) !== req.user.id);
    doc.responses.push({
      donorId: req.user.id,
      status: action === 'accept' ? 'accepted' : 'declined',
    });
    await doc.save();
    res.json(doc);
  } catch (err) {
    fail(res, err);
  }
};

// PATCH /api/requests/:id/fulfill   body (optional): { unitsFulfilled }  (owner only)
exports.fulfill = async (req, res) => {
  try {
    const doc = await loadRequest(req, res);
    if (!doc) return;
    if (String(doc.requester) !== req.user.id) {
      return res.status(403).json({ message: 'Only the requester can close this request' });
    }
    if (doc.status !== 'active') {
      return res.status(409).json({ message: 'This request is already closed' });
    }
    doc.status = 'fulfilled';
    doc.closedAt = new Date();
    doc.unitsFulfilled = req.body.unitsFulfilled ?? doc.unitsRequired;
    await doc.save();
    res.json(doc);
  } catch (err) {
    fail(res, err);
  }
};