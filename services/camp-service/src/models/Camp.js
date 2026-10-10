const mongoose = require('mongoose');
const { BLOOD_TYPES } = require('../utils/bloodTypes');

const campSchema = new mongoose.Schema(
  {
    organizerId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true }, // NGO user
    organizationName: String,
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000 },
    venue: {
      name: { type: String, required: true, trim: true },
      address: { type: String, trim: true },
      // GeoJSON [longitude, latitude]
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: undefined },
      },
    },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    bloodTypesNeeded: { type: [{ type: String, enum: BLOOD_TYPES }], default: undefined },
    capacity: { type: Number, required: true, min: 1, max: 5000 },
    // Real RSVP count (the "86/120" progress). Kept in step with the Rsvp collection.
    registeredCount: { type: Number, default: 0, min: 0 },
    // Cancelling is a soft delete so the record (and its history) is kept.
    status: { type: String, enum: ['scheduled', 'cancelled'], default: 'scheduled', index: true },
    lastInviteAt: Date, // limits how often an NGO can re-broadcast invites for one camp
  },
  { timestamps: true }
);

campSchema.index({ 'venue.location': '2dsphere' });
campSchema.index({ status: 1, startsAt: 1 });

module.exports = mongoose.model('Camp', campSchema);