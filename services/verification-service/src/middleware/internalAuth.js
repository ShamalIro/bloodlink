// Service-to-service calls (e.g. notification-service -> donor-service).
// These routes are NOT proxied by the gateway; they also require a shared key.
module.exports = (req, res, next) => {
  const key = process.env.INTERNAL_API_KEY;
  if (!key || req.headers['x-internal-key'] !== key) {
    return res.status(401).json({ message: 'Internal access only' });
  }
  next();
};