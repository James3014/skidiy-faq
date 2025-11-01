const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { sendSuccess } = require('../utils/response-formatter');

const JWT_SECRET = process.env.ADMIN_JWT_SECRET;
const JWT_EXPIRES_IN = '1d';
const ALLOW_DEV_LOGIN =
  process.env.ENABLE_DEV_LOGIN === 'true' || process.env.NODE_ENV !== 'production';

/**
 * OPTIONS /api/v1/auth/dev-login
 *
 * Handle CORS preflight request
 */
router.options('/dev-login', (req, res) => {
  res.status(200).end();
});

/**
 * POST /api/v1/auth/dev-login
 *
 * Development-only endpoint to generate an admin JWT token.
 * Allows frontend admin tools to authenticate in local environments.
 */
router.post('/dev-login', (req, res) => {
  if (!ALLOW_DEV_LOGIN) {
    return res.status(404).send('Not Found');
  }

  if (!JWT_SECRET) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'ADMIN_AUTH_CONFIG_MISSING',
        message: 'ADMIN_JWT_SECRET is not configured on the server.',
        hint: 'Set ADMIN_JWT_SECRET and ENABLE_DEV_LOGIN=true to enable dev login in non-development environments.',
      },
    });
  }

  const mockAdminUser = {
    id: 'dev-admin-001',
    username: 'dev-admin',
    roles: ['admin'],
  };

  const payload = {
    sub: mockAdminUser.id,
    user: mockAdminUser.username,
    roles: mockAdminUser.roles,
    admin: true,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  sendSuccess(res, {
    message: 'Development admin token generated.',
    token,
    expiresIn: JWT_EXPIRES_IN,
    user: mockAdminUser,
  });
});

module.exports = router;
