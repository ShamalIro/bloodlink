const mongoose = require('mongoose');

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const donorResponseSchema = new mongoose.Schema(
  {
    donorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    // responding -> arrived (QR check-in) -> donated (coordinator confirms collection)
    status: {
      type: String,
      enum: ['responding', 'arrived', 'donated', 'declined'],
      required: true,
    },
    distanceKm: Number,
    etaMinutes: Number,
    respondedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const requestSchema = new mongoose.Schema(
  {
    // User id from auth-service (different database, so no populate)
    requesterId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    bloodType: { type: String, enum: BLOOD_TYPES, required: true },
    unitsRequired: { type: Number, required: true, min: 1, max: 20 },
    unitsFulfilled: { type: Number, default: 0, min: 0 },
    hospital: {
      name: { type: String, required: true, trim: true },
      address: { type: String, trim: true },
      hospitalId: { type: String, trim: true }, // used later to scope coordinators to their hospital
      // Optional GeoJSON point: [longitude, latitude]. Needed for donor matching.
      location: {
        type: { type: String, enum: ['Point'] },
        coordinates: { type: [Number], default: undefined },
      },
    },
    notes: { type: String, trim: true, maxlength: 500 },

    // pending = waiting for coordinator verification (invisible to donors)
    // broadcasting = verified, donors are being alerted
    status: {
      type: String,
      enum: ['pending', 'broadcasting', 'fulfilled', 'closed'],
      default: 'pending',
      index: true,
    },
    isVerified: { type: Boolean, default: false },
    verifiedBy: mongoose.Schema.Types.ObjectId,
    verifiedAt: Date,

    donorResponses: [donorResponseSchema],
    closedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Request', requestSchema);
module.exports.BLOOD_TYPES = BLOOD_TYPES;