const Stock = require('../models/Stock');
const { BLOOD_TYPES } = require('../utils/bloodTypes');
const { getHospital } = require('../utils/verificationClient');
const { sendStockAppeal } = require('../utils/notificationClient');

const LOW = Number(process.env.INVENTORY_LOW_UNITS) || 5;
const CRITICAL = Number(process.env.INVENTORY_CRITICAL_UNITS) || 2;

const levelOf = (units) => (units <= CRITICAL ? 'critical' : units <= LOW ? 'low' : 'ok');

const APPEAL_COOLDOWN_MS = (Number(process.env.APPEAL_COOLDOWN_HOURS) || 6) * 60 * 60 * 1000;

const fail = (res, err) => {
  if (err.code === 'UPSTREAM') {
    console.error('inventory-service upstream error:', err.message);
    return res.status(503).json({ message: 'A dependent service is unavailable, try again' });
  }
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ message: err.message });
  }
  console.error('inventory-service error:', err);
  return res.status(500).json({ message: 'Server error' });
};

// GET /api/inventory/:hospitalId
// Current units for all 8 blood types (types never recorded count as 0).
exports.getStock = async (req, res) => {
  try {
    const rows = await Stock.find({ hospitalId: req.params.hospitalId });
    const byType = new Map(rows.map((r) => [r.bloodType, r]));
    const stock = BLOOD_TYPES.map((bloodType) => {
      const row = byType.get(bloodType);
      const units = row?.units ?? 0;
      return { bloodType, units, level: levelOf(units), updatedAt: row?.updatedAt };
    });
    res.json({
      hospitalId: req.params.hospitalId,
      thresholds: { low: LOW, critical: CRITICAL },
      stock,
      lowStockTypes: stock.filter((s) => s.level !== 'ok').map((s) => s.bloodType),
    });
  } catch (err) {
    fail(res, err);
  }
};

// PUT /api/inventory/:hospitalId/:bloodType   body: { units }   (sets the absolute count)
exports.setStock = async (req, res) => {
  try {
    const { hospitalId, bloodType } = req.params;
    const { units } = req.body;
    if (!BLOOD_TYPES.includes(bloodType)) {
      return res.status(400).json({ message: `bloodType must be one of ${BLOOD_TYPES.join(', ')}` });
    }
    if (!Number.isInteger(units) || units < 0 || units > 10000) {
      return res.status(400).json({ message: 'units must be a whole number from 0 to 10000' });
    }
    const row = await Stock.findOneAndUpdate(
      { hospitalId, bloodType },
      { units, updatedBy: req.user.id },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ bloodType, units: row.units, level: levelOf(row.units), updatedAt: row.updatedAt });
  } catch (err) {
    fail(res, err);
  }
};

// POST /api/inventory/:hospitalId/broadcast-appeal   body: { bloodType }
// Asks nearby donors of that exact blood type to donate. Only for low or critical stock,
// and at most once per cooldown per blood type (so donors are not spammed).
exports.broadcastAppeal = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { bloodType } = req.body;
    if (!BLOOD_TYPES.includes(bloodType)) {
      return res.status(400).json({ message: `bloodType must be one of ${BLOOD_TYPES.join(', ')}` });
    }

    const row = await Stock.findOne({ hospitalId, bloodType });
    const units = row?.units ?? 0;
    if (levelOf(units) === 'ok') {
      return res.status(409).json({ message: `${bloodType} stock is not low (${units} units)` });
    }
    if (row?.lastAppealAt && Date.now() - row.lastAppealAt.getTime() < APPEAL_COOLDOWN_MS) {
      return res.status(429).json({
        message: `An appeal for ${bloodType} was already sent recently`,
        nextAllowedAt: new Date(row.lastAppealAt.getTime() + APPEAL_COOLDOWN_MS),
      });
    }

    const hospital = await getHospital(hospitalId);
    const coords = hospital?.location?.coordinates;
    if (!coords || coords.length !== 2) {
      return res.status(409).json({
        message: 'Hospital location is not set. Ask the admin to approve it again with latitude and longitude.',
      });
    }

    const result = await sendStockAppeal({
      hospitalId,
      hospitalName: hospital.name,
      bloodType,
      location: { type: 'Point', coordinates: [...coords] },
    });

    await Stock.updateOne(
      { hospitalId, bloodType },
      { $set: { lastAppealAt: new Date() }, $setOnInsert: { units: 0 } },
      { upsert: true }
    );
    res.json({ bloodType, ...result });
  } catch (err) {
    fail(res, err);
  }
};