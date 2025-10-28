/**
 * API Key verification middleware.
 *
 * Protects routes by requiring a valid API key via header or query parameter.
 * Keys are configured through the FAQ_INSIGHTS_API_KEYS env variable.
 */
const { AppError } = require('./error-handler');

function parseAllowedKeys(rawKeys) {
  if (!rawKeys) {
    return [];
  }

  return rawKeys
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean);
}

/**
 * Factory returning Express middleware enforcing API key validation.
 *
 * @param {Object} options Optional configuration
 * @param {string} options.headerName Header to check (default: x-api-key)
 * @param {boolean} options.allowIfUnconfigured Skip validation when no keys configured
 */
function requireApiKey(options = {}) {
  const {
    headerName = 'x-api-key',
    allowIfUnconfigured = false,
  } = options;

  const allowedKeys = parseAllowedKeys(process.env.FAQ_INSIGHTS_API_KEYS);

  return (req, res, next) => {
    if (!allowedKeys.length) {
      if (allowIfUnconfigured) {
        return next();
      }

      return next(
        new AppError(
          'CONFIG_ERROR',
          'FAQ insights API keys are not configured. Set FAQ_INSIGHTS_API_KEYS in environment.',
          500,
        ),
      );
    }

    const providedKey =
      req.get(headerName) ||
      req.query.api_key ||
      req.query.apiKey;

    if (!providedKey) {
      return next(
        new AppError(
          'UNAUTHORIZED',
          'Missing API key. Provide a valid key in header or query string.',
          401,
        ),
      );
    }

    if (!allowedKeys.includes(providedKey)) {
      return next(
        new AppError(
          'FORBIDDEN',
          'Invalid API key provided.',
          403,
        ),
      );
    }

    return next();
  };
}

module.exports = requireApiKey;
