const mongoose = require('mongoose');
const Request = require('../models/Request');
const { notifyBroadcast, notifyClosed } = require('../utils/notificationClient');
const { validateQr, recordDonation } = require('../utils/donorClient');

const ACTIVE = ['pending', 'broadcasting'];
const PAST = ['fulfilled', 'closed'];

// TEMPORARY, dev only: skips coordinator verification so requests broadcast at creation.
// Must be OFF (unset) in any real deployment.
const DEV_AUTO_VERIFY = process.env.DEV_AUTO_VERIFY === 'true';
if (DEV_AUTO_VERIFY) {
  console.warn('WARNING: DEV_AUTO_VERIFY is ON - coordinator verification is bypassed.');
}

const fail = (res, err) => {
  if (err.code === 'UPSTREAM') {
    console.error('request-service upstream error:', err.message);
    return res.status(503).json({ message: 'A dependent service is unavailable, try again' });
  }
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

// POST /api/requests  -> created as 'pending' until a coordinator verifies it
exports.create = async (req, res) => {
  try {
    const { bloodType, unitsRequired, hospital, notes } = req.body;
    if (!bloodType || !unitsRequired || !hospital?.name) {
      return res
        .status(400)
        .json({ message: 'bloodType, unitsRequired and hospital.name are required' });
    }
    // The hospitalId routes the request to that hospital's coordinators.
    if (!DEV_AUTO_VERIFY && !hospital.hospitalId) {
      return res.status(400).json({
        message: 'hospital.hospitalId is required (choose a hospital from /api/verification/hospitals)',
      });
    }
    const doc = new Request({ requesterId: req.user.id, bloodType, unitsRequired, hospital, notes });
    if (DEV_AUTO_VERIFY) {
      doc.isVerified = true;
      doc.status = 'broadcasting';
      doc.verifiedAt = new Date();
    }
    await doc.save();
    if (doc.status === 'broadcasting') notifyBroadcast(doc); // only with the dev bypass on
    res.status(201).json(doc);
  } catch (err) {
    fail(res, err);
  }
};

// GET /api/requests/mine?status=active|past   (default: active)
exports.listMine = async (req, res) => {
  try {
    const past = req.query.status === 'past';
    const items = await Request.find({
      requesterId: req.user.id,
      status: { $in: past ? PAST : ACTIVE },
    }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    fail(res, err);
  }
};

// GET /api/requests/pending   (approved coordinators: their hospital's requests awaiting verification)
exports.listPending = async (req, res) => {
  try {
    res.json(
      await Request.find({ status: 'pending', 'hospital.hospitalId': req.user.hospitalId }).sort({
        createdAt: -1,
      })
    );
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

// PATCH /api/requests/:id/verify   (approved coordinators only) -> pending -> broadcasting
exports.verify = async (req, res) => {
  try {
    const doc = await loadRequest(req, res);
    if (!doc) return;
    if (doc.hospital?.hospitalId !== req.user.hospitalId) {
      return res.status(403).json({ message: 'This request belongs to another hospital' });
    }
    if (doc.status !== 'pending') {
      return res.status(409).json({ message: 'Only pending requests can be verified' });
    }
    doc.isVerified = true;
    doc.status = 'broadcasting';
    doc.verifiedBy = req.user.id;
    doc.verifiedAt = new Date();
    await doc.save();
    notifyBroadcast(doc);
    res.json(doc);
  } catch (err) {
    fail(res, err);
  }
};

// PATCH /api/requests/:id/respond
// body: { action: 'accept' | 'decline', distanceKm?, etaMinutes? }   (donors only)
exports.respond = async (req, res) => {
  try {
    const { action, distanceKm, etaMinutes } = req.body;
    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ message: "action must be 'accept' or 'decline'" });
    }
    const doc = await loadRequest(req, res);
    if (!doc) return;
    if (doc.status !== 'broadcasting') {
      return res.status(409).json({ message: 'This request is not open for responses' });
    }
    const existing = doc.donorResponses.find((r) => String(r.donorId) === req.user.id);
    if (existing && ['arrived', 'donated'].includes(existing.status)) {
      return res.status(409).json({ message: 'You have already checked in for this request' });
    }
    doc.donorResponses = doc.donorResponses.filter((r) => String(r.donorId) !== req.user.id);
    doc.donorResponses.push({
      donorId: req.user.id,
      status: action === 'accept' ? 'responding' : 'declined',
      // TODO: compute distance/ETA server-side from donor and hospital locations
      distanceKm: Number.isFinite(distanceKm) ? distanceKm : undefined,
      etaMinutes: Number.isFinite(etaMinutes) ? etaMinutes : undefined,
    });
    await doc.save();
    res.json(doc);
  } catch (err) {
    fail(res, err);
  }
};

// Shared by fulfill and close (owner only, request must still be open)
const closeAs = (status) => async (req, res) => {
  try {
    const doc = await loadRequest(req, res);
    if (!doc) return;
    if (String(doc.requesterId) !== req.user.id) {
      return res.status(403).json({ message: 'Only the requester can close this request' });
    }
    if (!ACTIVE.includes(doc.status)) {
      return res.status(409).json({ message: 'This request is already closed' });
    }
    doc.status = status;
    doc.closedAt = new Date();
    if (status === 'fulfilled') {
      doc.unitsFulfilled = req.body?.unitsFulfilled ?? doc.unitsRequired;
    }
    await doc.save();
    notifyClosed(doc);
    res.json(doc);
  } catch (err) {
    fail(res, err);
  }
};

exports.fulfill = closeAs('fulfilled'); // PATCH /api/requests/:id/fulfill
exports.close = closeAs('closed'); // PATCH /api/requests/:id/close (cancel)

// Shared checks for coordinator actions on one request:
// loads it, enforces same-hospital, and requires it to be open (broadcasting).
async function loadForCoordinator(req, res) {
  const doc = await loadRequest(req, res);
  if (!doc) return null;
  if (doc.hospital?.hospitalId !== req.user.hospitalId) {
    res.status(403).json({ message: 'This request belongs to another hospital' });
    return null;
  }
  if (doc.status !== 'broadcasting') {
    res.status(409).json({ message: 'This request is not open' });
    return null;
  }
  return doc;
}

const findResponse = (doc, donorId) =>
  doc.donorResponses.find((r) => String(r.donorId) === String(donorId));

// POST /api/requests/:id/check-in   body: { qrToken }   (approved coordinator, same hospital)
// Donor arrived: validates their short-lived QR token and marks them 'arrived'.
exports.checkIn = async (req, res) => {
  try {
    const { qrToken } = req.body;
    if (!qrToken) return res.status(400).json({ message: 'qrToken is required' });

    const doc = await loadForCoordinator(req, res);
    if (!doc) return;

    const qr = await validateQr(qrToken);
    if (!qr.valid) {
      return res
        .status(400)
        .json({ message: 'QR code is invalid or has expired - ask the donor to reopen it' });
    }

    const entry = findResponse(doc, qr.donorId);
    if (!entry || entry.status === 'declined') {
      return res.status(409).json({ message: 'This donor has not accepted this request' });
    }
    if (entry.status !== 'responding') {
      return res.status(409).json({ message: `Donor is already marked ${entry.status}` });
    }
    if (!qr.isEligible) {
      return res.status(409).json({ message: 'This donor is not eligible to donate yet' });
    }

    entry.status = 'arrived';
    entry.arrivedAt = new Date();
    await doc.save();
    res.json({ request: doc, donor: { donorId: qr.donorId, bloodType: qr.bloodType } });
  } catch (err) {
    fail(res, err);
  }
};

// POST /api/requests/:id/confirm-donation   body: { donorId, units? }   (approved coordinator)
// Collection done: records the donation (starts the donor's 120-day cooldown),
// adds to unitsFulfilled, and closes the request when enough units are in.
exports.confirmDonation = async (req, res) => {
  try {
    const { donorId } = req.body;
    const units = req.body.units === undefined ? 1 : req.body.units;
    if (!mongoose.isValidObjectId(donorId) || !Number.isInteger(units) || units < 1 || units > 4) {
      return res.status(400).json({ message: 'A valid donorId and units (1-4) are required' });
    }

    const doc = await loadForCoordinator(req, res);
    if (!doc) return;

    const entry = findResponse(doc, donorId);
    if (!entry) return res.status(409).json({ message: 'This donor has not responded to this request' });
    if (entry.status === 'donated') return res.status(409).json({ message: 'Donation already confirmed' });
    if (entry.status !== 'arrived') {
      return res.status(409).json({ message: 'The donor must check in (scan QR) first' });
    }

    await recordDonation(donorId, {
      requestId: String(doc._id),
      hospitalName: doc.hospital.name,
      units,
      confirmedBy: req.user.id,
    });

    entry.status = 'donated';
    entry.donatedAt = new Date();
    entry.unitsDonated = units;
    doc.unitsFulfilled += units;
    if (doc.unitsFulfilled >= doc.unitsRequired) {
      doc.status = 'fulfilled';
      doc.closedAt = new Date();
    }
    await doc.save();
    if (doc.status === 'fulfilled') notifyClosed(doc); // tells donors still on their way to stop
    res.json(doc);
  } catch (err) {
    fail(res, err);
  }
};