/**
 * Routes Index
 *
 * Aggregates all route modules
 * Central place to register all API routes
 */

const express = require('express');
const router = express.Router();

// Import route modules
const faqRoutes = require('./faq');
const faqAdminRoutes = require('./faq-admin');
const parkFaqRoutes = require('./park_faq');
const adminAuth = require('../middleware/admin-auth');
const resortAdminRoutes = require('./resort-admin');
const resortRoutes = require('./resort');
const intentRoutes = require('./intent');
const llmRoutes = require('./llm');
const analyticsRoutes = require('./analytics');
const crmRoutes = require('./crm');
const contentRoutes = require('./content');
const eventsRoutes = require('./events');
const authRoutes = require('./auth');
const linksRoutes = require('./links');
const adminRoutes = require('./admin');

/**
 * API Routes
 * All routes are prefixed with /api/v1 in server.js
 */

// Register routes
router.use('/faq', faqRoutes);           // FAQ search and retrieval
router.use('/park-faq', parkFaqRoutes);  // Park FAQ cards with analytics
router.use('/admin/faq', adminAuth, faqAdminRoutes); // FAQ admin CRUD operations
router.use('/admin/resort', adminAuth, resortAdminRoutes); // Resort admin CRUD operations
router.use('/resort', resortRoutes);     // Resort information and search
router.use('/intent', intentRoutes);     // Intent detection and slot extraction (Phase 5)
router.use('/llm', llmRoutes);           // LLM chat and RAG (Phase 6)
router.use('/analytics', analyticsRoutes); // Analytics and statistics (Phase 7)
router.use('/content', contentRoutes);   // Markdown content delivery
router.use('/events', eventsRoutes);     // User event tracking
router.use('/crm', crmRoutes);           // CRM integration (Phase 9)
router.use('/links', linksRoutes);       // Link registry management (FAQ and resort links)
router.use('/auth', authRoutes);         // Development auth helper
router.use('/admin', adminRoutes);       // System administration (analytics reset, etc.)

// Placeholder route for testing
router.get('/placeholder', (req, res) => {
  res.json({
    success: true,
    message: 'API routes placeholder - routes will be implemented in Phase 3',
    availableRoutes: [
      'POST /api/v1/faq/search',
      'GET /api/v1/faq/:id',
      'POST /api/v1/intent/detect',
      'POST /api/v1/intent/extract-slots',
      'POST /api/v1/events/track',
      'GET /api/v1/analytics/faq-insights',
      'POST /api/v1/crm/log-usage',
    ],
  });
});

module.exports = router;
