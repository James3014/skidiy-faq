const jwt = require('jsonwebtoken');
const { AppError } = require('./error-handler');

function extractToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  if (req.cookies && req.cookies.id_token) {
    return req.cookies.id_token;
  }

  return null;
}

function requireAdminAuth(req, res, next) {
  try {
    const secret = process.env.ADMIN_JWT_SECRET;
    if (!secret) {
      throw new AppError(
        'ADMIN_AUTH_CONFIG_MISSING',
        'ADMIN_JWT_SECRET is not configured',
        500
      );
    }

    const token = extractToken(req);
    if (!token) {
      throw new AppError('ADMIN_AUTH_REQUIRED', 'Authorization token missing', 401);
    }

    let payload;
    try {
      payload = jwt.verify(token, secret, {
        audience: process.env.ADMIN_JWT_AUDIENCE,
        issuer: process.env.ADMIN_JWT_ISSUER
      });
    } catch (error) {
      throw new AppError('ADMIN_AUTH_INVALID', 'Invalid or expired token', 401, { message: error.message });
    }

    const roles = payload.roles || payload.role || payload.scope || [];
    const hasAdminRole = Array.isArray(roles)
      ? roles.includes('admin') || roles.includes('ADMIN')
      : typeof roles === 'string'
        ? roles.split(/[\s,]/).includes('admin')
        : false;

    if (!hasAdminRole && payload.admin !== true) {
      throw new AppError('ADMIN_AUTH_FORBIDDEN', 'Admin role required', 403);
    }

    req.adminUser = payload;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = requireAdminAuth;
