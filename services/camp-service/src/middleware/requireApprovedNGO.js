const { getVerification } = require('../utils/verificationClient');

// Use after auth + requireRole('ngo'): only approved NGO accounts pass.
module.exports = async function requireApprovedNgo(req, res, next) {
  try {
    const v = await getVerification(req.user.id);
    if (!v || !v.approved || v.organizationType !== 'ngo') {
      return res.status(403).json({ message: 'Your NGO account has not been verified yet' });
    }
    req.user.organizationName = v.organizationName;
    next();
  } catch (err) {
    console.error('verification check failed:', err.message);
    res.status(503).json({ message: 'Verification service unavailable' });
  }
};