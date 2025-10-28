const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { AppError } = require('../middleware/error-handler');
const { sendSuccess } = require('../utils/response-formatter');

function resolveMarkdownPath(slug) {
  const baseDir = process.env.CONTENT_MARKDOWN_ROOT || path.join(__dirname, '../../../content/markdown');
  const safeSlug = slug.replace(/\.\./g, '').replace(/[^a-zA-Z0-9_\-\/]/g, '');
  const target = path.normalize(path.join(baseDir, `${safeSlug}.md`));

  if (!target.startsWith(path.normalize(baseDir))) {
    throw new AppError('CONTENT_PATH_INVALID', 'Slug results in invalid path', 400);
  }

  return { baseDir, target };
}

router.get('/markdown/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!slug || slug.trim().length === 0) {
      throw new AppError('CONTENT_SLUG_REQUIRED', 'Slug is required', 400);
    }

    const { target } = resolveMarkdownPath(slug);

    let content;
    try {
      content = await fs.readFile(target, 'utf-8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new AppError('CONTENT_NOT_FOUND', `Markdown content not found for slug: ${slug}`, 404);
      }
      throw error;
    }

    sendSuccess(res, {
      slug,
      content
    }, 200, {
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
