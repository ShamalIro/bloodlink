const mongoose = require('mongoose');
const { BLOOD_TYPES } = require('../utils/bloodTypes');

const stockSchema = new mongoose.Schema(
  {
    hospitalId: { type: String, required: true, trim: true },
    bloodType: { type: String, enum: BLOOD_TYPES, required: true },
    units: { type: Number, required: true, min: 0, default: 0 },
    updatedBy: mongoose.Schema.Types.ObjectId, // coordinator who last changed it
    lastAppealAt: Date, // limits how often a hospital can send a donor appeal for this type
  },
  { timestamps: true }
);

// One row per hospital per blood type
stockSchema.index({ hospitalId: 1, bloodType: 1 }, { unique: true });

module.exports = mongoose.model('Stock', stockSchema);