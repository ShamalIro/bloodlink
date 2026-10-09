const { getVerification } = require('../utils/verificationClient');

// Use after auth + requireRole('coordinator').
// Only approved hospital coordinators pass; sets req.user.hospitalId for scoping.
module.exports = async function requireApprovedOrg(req, res, next) {
  try {
    const v = await getVerification(req.user.id);
    if (!v || !v.approved || v.organizationType !== 'hospital' || !v.hospitalId) {
      return res.status(403).json({ message: 'Your account has not been verified yet' });
    }
    req.user.hospitalId = v.hospitalId;
    req.user.organizationName = v.organizationName;
    next();
  } catch (err) {
    console.error('verification check failed:', err.message);
    res.status(503).json({ message: 'Verification service unavailable' });
  }
};