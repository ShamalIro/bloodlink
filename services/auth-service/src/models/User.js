const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['donor', 'requester', 'coordinator', 'ngo'], required: true },
    // Donor-only fields (FR2)
    bloodType: { type: String, enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] },
    district: String,
    lastDonationDate: Date,
    // Coordinator/NGO-only fields (FR5 — verification)
    organizationName: String,
    organizationType: { type: String, enum: ['hospital', 'ngo'] },
    staffIdOrRegNumber: String,
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
