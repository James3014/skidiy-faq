/**
 * Resort API Routes
 *
 * Provides endpoints for accessing ski resort information
 */

const express = require('express');
const router = express.Router();
const resortKB = require('../data/resort_kb.js');

/**
 * GET /api/v1/resort/list
 *
 * Get list of all resorts grouped by region
 */
router.get('/list', (req, res) => {
  try {
    const { region } = req.query;

    let resorts = resortKB.resorts || [];

    // Filter by region if specified
    if (region) {
      resorts = resorts.filter(r =>
        r.region.toLowerCase().includes(region.toLowerCase()) ||
        r._metadata?.region === region
      );
    }

    // Group by region
    const grouped = {};
    resorts.forEach(resort => {
      const regionName = resort.region;
      if (!grouped[regionName]) {
        grouped[regionName] = [];
      }
      grouped[regionName].push({
        resort_id: resort.resort_id,
        name: resort.names.zh,
        name_en: resort.names.en,
        name_ja: resort.names.ja,
        region: resort.region,
        amenities: resort.amenities || [],
        night_ski: resort.snow_stats?.night_ski || false,
        lifts: resort.snow_stats?.lifts || 0,
        courses: resort.snow_stats?.courses_total || 0
      });
    });

    res.json({
      success: true,
      data: {
        total: resorts.length,
        by_region: grouped,
        metadata: resortKB.meta
      }
    });
  } catch (error) {
    console.error('[Resort API] Error in /list:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '取得雪場列表失敗'
      }
    });
  }
});

/**
 * GET /api/v1/resort/search
 *
 * Search resorts by name (supports Chinese, English, Japanese)
 */
router.get('/search', (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({
        success: true,
        data: {
          results: [],
          total: 0
        }
      });
    }

    const query = q.trim().toLowerCase();
    const resorts = resortKB.resorts || [];

    // Search in all name fields
    const results = resorts.filter(resort => {
      const nameZh = (resort.names.zh || '').toLowerCase();
      const nameEn = (resort.names.en || '').toLowerCase();
      const nameJa = (resort.names.ja || '').toLowerCase();

      return nameZh.includes(query) ||
             nameEn.includes(query) ||
             nameJa.includes(query);
    });

    res.json({
      success: true,
      data: {
        results: results.map(r => ({
          resort_id: r.resort_id,
          name: r.names.zh,
          name_en: r.names.en,
          name_ja: r.names.ja,
          region: r.region
        })),
        total: results.length,
        query: q
      }
    });
  } catch (error) {
    console.error('[Resort API] Error in /search:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '搜尋雪場失敗'
      }
    });
  }
});

/**
 * GET /api/v1/resort/:resort_id
 *
 * Get detailed information for a specific resort
 */
router.get('/:resort_id', (req, res) => {
  try {
    const { resort_id } = req.params;
    const resorts = resortKB.resorts || [];

    const resort = resorts.find(r => r.resort_id === resort_id);

    if (!resort) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESORT_NOT_FOUND',
          message: '找不到該雪場資訊'
        }
      });
    }

    // Extract key information
    const pricing = resort.pricing?.ticket_types || [];
    const oneDayTicket = pricing.find(t => t.type.includes('1-day'));

    const transportation = resort.transportation?.domestic?.bus || [];
    const mainRoute = transportation[0];

    const rental = resort.rental?.items || [];
    const standardRental = rental.find(r => r.item.includes('Standard'));

    res.json({
      success: true,
      data: {
        resort_id: resort.resort_id,
        names: resort.names,
        region: resort.region,
        coordinates: resort.coordinates,
        season: resort.season,
        official_site: resort.official_site,
        description: resort.description,
        amenities: resort.amenities || [],

        // Snow statistics
        snow_stats: resort.snow_stats,

        // Pricing (simplified)
        pricing: {
          one_day_adult: oneDayTicket?.adult || null,
          one_day_child: oneDayTicket?.child || null,
          last_verified: resort.pricing?.last_verified || null
        },

        // Transportation (main route)
        transportation: mainRoute ? {
          route: mainRoute.route,
          duration_minutes: mainRoute.duration_minutes,
          notes: mainRoute.notes
        } : null,

        // Rental (standard set)
        rental: standardRental ? {
          adult_price: standardRental.adult_price,
          child_price: standardRental.child_price
        } : null,

        // Top courses
        top_courses: (resort.courses || []).slice(0, 3),

        notes: resort.notes
      }
    });
  } catch (error) {
    console.error('[Resort API] Error in /:resort_id:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '取得雪場詳細資訊失敗'
      }
    });
  }
});

/**
 * GET /api/v1/resort/region/:region
 *
 * Get all resorts in a specific region
 */
router.get('/region/:region', (req, res) => {
  try {
    const { region } = req.params;
    const resorts = resortKB.resorts || [];

    const filtered = resorts.filter(r =>
      r._metadata?.region === region ||
      r.region.toLowerCase().includes(region.toLowerCase())
    );

    res.json({
      success: true,
      data: {
        region: region,
        resorts: filtered.map(r => ({
          resort_id: r.resort_id,
          name: r.names.zh,
          name_en: r.names.en,
          lifts: r.snow_stats?.lifts || 0,
          courses: r.snow_stats?.courses_total || 0,
          night_ski: r.snow_stats?.night_ski || false,
          amenities: r.amenities || []
        })),
        total: filtered.length
      }
    });
  } catch (error) {
    console.error('[Resort API] Error in /region/:region:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '取得地區雪場失敗'
      }
    });
  }
});

/**
 * GET /api/v1/resort/all
 *
 * Get complete resort knowledge base for frontend initialization
 * This replaces the need for frontend to load resort_kb.json directly
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "resorts": [...],
 *     "meta": {...}
 *   }
 * }
 */
router.get('/all', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        resorts: resortKB.resorts || [],
        meta: resortKB.meta || {},
        total: (resortKB.resorts || []).length
      },
      meta: {
        timestamp: new Date().toISOString(),
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    });
  } catch (error) {
    console.error('[Resort API] Error in /all:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '取得雪場資料失敗'
      }
    });
  }
});

module.exports = router;
