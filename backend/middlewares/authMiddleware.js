const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

function authenticate(req, res, next) {
  try {
    // 1. Get header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // 2. Extract token (Bearer TOKEN)
    const token = authHeader.split(' ')[1];

    // 3. Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 4. Attach user to request
    req.user = decoded; 

    // decoded = { user_id, role }

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authenticate };
