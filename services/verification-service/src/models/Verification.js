const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema(
  {
    // User id from auth-service (different database, so no populate)
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
    role: { type: String, enum: ['coordinator', 'ngo'], required: true },
    organizationType: { type: String, enum: ['hospital', 'ngo'], required: true },
    organizationName: { type: String, required: true, trim: true },
    registrationNumber: { type: String, required: true, trim: true }, // staff ID or org reg. number
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    // Hospitals only: set on approval. Scopes coordinators to their own hospital's requests.
    hospitalId: { type: String, trim: true },
    // Hospitals only: GeoJSON [longitude, latitude], set by the admin on approval.
    // Used to find donors near the hospital.
    hospitalLocation: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number], default: undefined },
    },
    reviewNote: { type: String, trim: true },
    reviewedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Verification', verificationSchema);