import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required in environment variables');
}

/**
 * Middleware to authenticate incoming API requests using JSON Web Tokens (JWT).
 *
 * Extracts the Bearer token from the 'Authorization' header, verifies its validity
 * against the server's secret, and attaches the decoded user payload to the request.
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {void|import('express').Response} Returns a 401 JSON response if auth fails, otherwise calls next().
 */
export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({error: 'Authorization header missing or malformed'});
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({error: 'Invalid or expired token'});
  }
}
