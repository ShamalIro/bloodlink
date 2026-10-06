const mongoose = require('mongoose');

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const responseSchema = new mongoose.Schema(
  {
    donorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    status: { type: String, enum: ['accepted', 'declined'], required: true },
    respondedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const requestSchema = new mongoose.Schema(
  {
    // User id from auth-service (different database, so no populate)
    requester: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    bloodType: { type: String, enum: BLOOD_TYPES, required: true },
    unitsRequired: { type: Number, required: true, min: 1, max: 20 },
    unitsFulfilled: { type: Number, default: 0, min: 0 },
    hospital: {
      name: { type: String, required: true, trim: true },
      address: { type: String, trim: true },
      // Optional GeoJSON point: [longitude, latitude]. Add a 2dsphere index
      // when nearby-donor search is built.
      location: {
        type: { type: String, enum: ['Point'] },
        coordinates: { type: [Number], default: undefined },
      },
    },
    notes: { type: String, trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ['active', 'fulfilled', 'cancelled', 'expired'],
      default: 'active',
      index: true,
    },
    responses: [responseSchema],
    closedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Request', requestSchema);
module.exports.BLOOD_TYPES = BLOOD_TYPES;