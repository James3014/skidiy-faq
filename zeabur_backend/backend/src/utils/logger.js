/**
 * Logger Utility
 *
 * Structured logging with timestamps and levels
 * Simple console-based logger for development and production
 */

/**
 * Log levels
 */
const LogLevels = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

/**
 * ANSI color codes for terminal output
 */
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

/**
 * Get color for log level
 */
function getLevelColor(level) {
  switch (level) {
    case LogLevels.DEBUG:
      return colors.gray;
    case LogLevels.INFO:
      return colors.cyan;
    case LogLevels.WARN:
      return colors.yellow;
    case LogLevels.ERROR:
      return colors.red;
    default:
      return colors.reset;
  }
}

/**
 * Format log message
 */
function formatMessage(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const color = getLevelColor(level);
  const resetColor = colors.reset;

  let logStr = `${color}[${timestamp}] [${level}]${resetColor} ${message}`;

  // Add metadata if provided
  if (Object.keys(meta).length > 0) {
    logStr += `\n${colors.gray}${JSON.stringify(meta, null, 2)}${resetColor}`;
  }

  return logStr;
}

/**
 * Check if log level should be output
 */
function shouldLog(level) {
  const minLevel = process.env.LOG_LEVEL || 'INFO';
  const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
  const minLevelIndex = levels.indexOf(minLevel);
  const currentLevelIndex = levels.indexOf(level);

  return currentLevelIndex >= minLevelIndex;
}

/**
 * Logger object with methods for each level
 */
const logger = {
  /**
   * Debug level logging
   */
  debug(message, meta = {}) {
    if (shouldLog(LogLevels.DEBUG)) {
      console.log(formatMessage(LogLevels.DEBUG, message, meta));
    }
  },

  /**
   * Info level logging
   */
  info(message, meta = {}) {
    if (shouldLog(LogLevels.INFO)) {
      console.log(formatMessage(LogLevels.INFO, message, meta));
    }
  },

  /**
   * Warning level logging
   */
  warn(message, meta = {}) {
    if (shouldLog(LogLevels.WARN)) {
      console.warn(formatMessage(LogLevels.WARN, message, meta));
    }
  },

  /**
   * Error level logging
   */
  error(message, meta = {}) {
    if (shouldLog(LogLevels.ERROR)) {
      console.error(formatMessage(LogLevels.ERROR, message, meta));
    }
  },

  /**
   * Log HTTP request
   */
  http(req, res, duration) {
    const { method, path, ip } = req;
    const { statusCode } = res;

    const statusColor = statusCode >= 500 ? colors.red
      : statusCode >= 400 ? colors.yellow
      : statusCode >= 300 ? colors.cyan
      : colors.green;

    const logStr = `${colors.gray}[${new Date().toISOString()}]${colors.reset} ` +
      `${method} ${path} ` +
      `${statusColor}${statusCode}${colors.reset} ` +
      `${duration}ms ` +
      `${colors.gray}${ip}${colors.reset}`;

    console.log(logStr);
  },
};

module.exports = logger;
