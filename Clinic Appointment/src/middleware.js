const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./auth');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Add user info (id, role) to the request object
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Role-based check: Only allow 'staff' for certain actions
function authorizeStaff(req, res, next) {
  if (req.user.role !== 'staff') {
    return res.status(403).json({ error: 'Access denied. Staff only.' });
  }
  next();
}

module.exports = { authenticateToken, authorizeStaff };