const mongoose = require('mongoose');
const { BLOOD_TYPES } = require('../utils/bloodCompatibility');

const COOLDOWN_DAYS = 120;

const donorProfileSchema = new mongoose.Schema(
  {
    // User id from auth-service (different database, so no populate)
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
    bloodType: { type: String, enum: BLOOD_TYPES, required: true },
    district: { type: String, trim: true },
    available: { type: Boolean, default: true },
    lastDonationDate: Date,
    // Derived server-side from lastDonationDate. Never accepted from the client.
    eligibleFromDate: Date,
    // GeoJSON point: [longitude, latitude]
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number], default: undefined },
    },
    pushToken: String, // Expo push token, used by notification-service
  },
  { timestamps: true, toJSON: { virtuals: true }, id: false }
);

donorProfileSchema.index({ location: '2dsphere' });

donorProfileSchema.virtual('isEligible').get(function () {
  return !this.eligibleFromDate || this.eligibleFromDate <= new Date();
});

donorProfileSchema.methods.recalcEligibility = function () {
  this.eligibleFromDate = this.lastDonationDate
    ? new Date(this.lastDonationDate.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000)
    : undefined;
};

module.exports = mongoose.model('DonorProfile', donorProfileSchema);