/**
 * Links Routes
 *
 * Handles link registry endpoints for FAQ and resort links
 * - GET /api/v1/links/registry - Get complete link registry
 * - GET /api/v1/links/resolve?name=TOKEN&context=json - Resolve specific link
 */

const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { formatSuccess, formatError, sendSuccess, sendError } = require('../utils/response-formatter');
const { AppError } = require('../middleware/error-handler');

// Cache link registry data in memory
let linkRegistry = null;
let linkRegistryLoadTime = null;

/**
 * Load link registry from link_registry.json
 *
 * Tries multiple possible paths to locate the file:
 * 1. ../../../data/link_registry.json (development)
 * 2. ./data/link_registry.json (alternative)
 * 3. /app/data/link_registry.json (Zeabur container path)
 *
 * @returns {Promise<Object>} Link registry data
 */
async function loadLinkRegistry() {
  // Use cache if available and less than 5 minutes old
  if (linkRegistry && linkRegistryLoadTime && (Date.now() - linkRegistryLoadTime) < 5 * 60 * 1000) {
    return linkRegistry;
  }

  const possiblePaths = [
    path.join(__dirname, '../../../data/link_registry.json'),
    path.join(__dirname, './data/link_registry.json'),
    '/app/data/link_registry.json',
    path.join(process.cwd(), 'data/link_registry.json'),
  ];

  for (const registryPath of possiblePaths) {
    try {
      const content = await fs.readFile(registryPath, 'utf-8');
      linkRegistry = JSON.parse(content);
      linkRegistryLoadTime = Date.now();

      // Validate structure
      if (!linkRegistry || typeof linkRegistry !== 'object') {
        throw new Error('Invalid link registry structure');
      }

      console.log(`[Links Routes] Loaded link registry from: ${registryPath}`);
      return linkRegistry;
    } catch (error) {
      // Continue to next path
      continue;
    }
  }

  // If no file found, log all attempted paths and throw error
  console.error('[Links Routes] Failed to load link registry from any path. Tried:', possiblePaths);
  throw new AppError('LINKS_LOAD_ERROR', 'Failed to load link registry from any location', 500);
}

/**
 * GET /api/v1/links/registry
 *
 * Returns the complete link registry with all FAQ and resort links
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "faq": { ... },
 *     "resort": { ... },
 *     "categories": { ... }
 *   }
 * }
 */
router.get('/registry', async (req, res, next) => {
  try {
    const registry = await loadLinkRegistry();

    return sendSuccess(res, registry, 'Link registry retrieved successfully');
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/v1/links/resolve
 *
 * Resolves a specific link token, optionally with dynamic URL variable substitution
 *
 * Query parameters:
 * - name: Link token name (e.g., "LINK_SCHEDULE", "official_site")
 * - context: Optional JSON context for dynamic URL variables
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "link_name": "LINK_SCHEDULE",
 *     "url": "https://booking.diy.ski/schedule",
 *     "labels": { "zh": "預約系統", "en": "Schedule", "th": "ตารางเวลา" }
 *   }
 * }
 */
router.get('/resolve', async (req, res, next) => {
  try {
    const { name, context } = req.query;

    if (!name) {
      throw new AppError('INVALID_LINK_NAME', 'Link name parameter is required', 400);
    }

    const registry = await loadLinkRegistry();

    // Search for the link in FAQ section
    let link = registry.faq?.[name];

    // If not found in FAQ, search in resort section
    if (!link) {
      link = registry.resort?.[name];
    }

    if (!link) {
      throw new AppError('LINK_NOT_FOUND', `Link "${name}" not found in registry`, 404);
    }

    // Handle dynamic URL template substitution if context is provided
    let resolvedUrl = link.url || link.url_template;

    if (link.dynamic && context) {
      try {
        // Parse context if it's a JSON string
        const contextObj = typeof context === 'string' ? JSON.parse(context) : context;

        // Replace variables in URL template (e.g., {resort.official_site})
        resolvedUrl = resolvedUrl.replace(/{([^}]+)}/g, (match, path) => {
          const value = getNestedProperty(contextObj, path);
          return value !== undefined ? encodeURIComponent(value) : match;
        });
      } catch (parseError) {
        console.warn('[Links Routes] Failed to parse context:', parseError);
        // Use template as-is if parsing fails
      }
    }

    return sendSuccess(res, {
      link_name: link.name,
      url: resolvedUrl,
      labels: link.labels,
    }, 'Link resolved successfully');
  } catch (error) {
    return next(error);
  }
});

/**
 * Helper function to get nested object properties
 * Used for resolving dynamic URL variables like {resort.official_site}
 *
 * @param {Object} obj - Object to search in
 * @param {string} path - Dot-separated path (e.g., "resort.coordinates.lat")
 * @returns {any} Value at the path or undefined
 */
function getNestedProperty(obj, path) {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

module.exports = router;
