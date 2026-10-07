import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  try {
    // Try cookie first, then Authorization header as fallback
    let token = req.cookies?.token;

    if (!token) {
      const authHeader = req.headers.authorization || '';
      token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    }

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (_error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
