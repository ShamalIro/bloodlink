const jwt = require('jsonwebtoken');

// Attach req.user = { id, role } if the request carries a valid JWT.
module.exports = function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token provided' });

  const token = header.replace('Bearer ', '');
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
