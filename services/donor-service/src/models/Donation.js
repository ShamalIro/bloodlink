const mongoose = require('mongoose');
const { BLOOD_TYPES } = require('../utils/bloodCompatibility');

const donationSchema = new mongoose.Schema(
  {
    donorId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    // The blood request this donation was for (lives in request-service's database)
    requestId: { type: mongoose.Schema.Types.ObjectId, required: true },
    hospitalName: { type: String, trim: true },
    bloodType: { type: String, enum: BLOOD_TYPES },
    units: { type: Number, default: 1, min: 1, max: 4 },
    confirmedBy: mongoose.Schema.Types.ObjectId, // coordinator who confirmed collection
    donatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One donation record per donor per request (makes the confirm call safe to retry)
donationSchema.index({ donorId: 1, requestId: 1 }, { unique: true });

module.exports = mongoose.model('Donation', donationSchema);