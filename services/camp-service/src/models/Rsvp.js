const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema(
  {
    campId: { type: mongoose.Schema.Types.ObjectId, required: true },
    donorId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  },
  { timestamps: true }
);

// A donor can register for a camp only once
rsvpSchema.index({ campId: 1, donorId: 1 }, { unique: true });

module.exports = mongoose.model('Rsvp', rsvpSchema);