const jwt = require('jsonwebtoken');

// Reads the JWT from "Authorization: Bearer <token>" or from a "token" cookie.
function extractToken(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.slice(7);

  const cookies = req.headers.cookie || '';
  const match = cookies.split(';').map((c) => c.trim()).find((c) => c.startsWith('token='));
  return match ? match.slice('token='.length) : null;
}

function authenticate(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(403).json({ message: 'No token provided' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, username, role }
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Role-based access control: authorize('admin')
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied: insufficient role' });
  }
  next();
};

module.exports = { authenticate, authorize };
