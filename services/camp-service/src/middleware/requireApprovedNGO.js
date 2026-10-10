const { getVerification } = require('../utils/verificationClient');

// Use after auth + requireRole('ngo').
// NGO accounts do NOT need manual approval: any NGO account may use the camp features.
// An admin can still block an NGO by rejecting its application (status 'rejected').
// The organization name comes from the verification record when there is one.
module.exports = async function requireApprovedNgo(req, res, next) {
  let record = null;
  try {
    record = await getVerification(req.user.id);
  } catch (err) {
    // The verification service being down must not stop NGOs from working.
    console.error('verification lookup failed (continuing):', err.message);
  }

  if (record && record.status === 'rejected') {
    return res.status(403).json({ message: 'Your NGO application was rejected' });
  }

  req.user.organizationName =
    (record && record.organizationType === 'ngo' && record.organizationName) || 'NGO';
  next();
};