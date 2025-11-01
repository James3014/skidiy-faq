/**
 * Resort Service
 *
 * Business logic for Resort CRUD operations
 * Similar to FAQ Service but for resort data
 */

const fs = require('fs').promises;
const path = require('path');
const { AppError } = require('../middleware/error-handler');

class ResortService {
  constructor() {
    const dataDir = process.env.FAQ_DATA_DIR || path.join(__dirname, '../data');
    this.dataPath = path.join(dataDir, 'resort_kb.json');
    this.backupPath = path.join(dataDir, 'resort_kb.backup.json');
    this.backupDir = path.join(dataDir, 'backups');

    // In-memory cache
    this.cache = null;
    this.cacheTime = null;
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Load Resort data from file
   */
  async loadResortData() {
    // Use cache if available and fresh
    if (this.cache && this.cacheTime && (Date.now() - this.cacheTime) < this.cacheDuration) {
      return this.cache;
    }

    try {
      const content = await fs.readFile(this.dataPath, 'utf-8');
      this.cache = JSON.parse(content);
      this.cacheTime = Date.now();

      // Validate structure
      if (!this.cache.resorts || !Array.isArray(this.cache.resorts)) {
        throw new Error('Invalid resort data structure: missing resorts array');
      }

      console.log(`[Resort Service] Loaded ${this.cache.resorts.length} resorts`);
      return this.cache;
    } catch (error) {
      console.error('[Resort Service] Failed to load resort data:', error);
      throw new AppError('RESORT_LOAD_ERROR', '無法載入雪場資料', 500);
    }
  }

  /**
   * Save Resort data to file
   */
  async saveResortData(data) {
    try {
      const content = JSON.stringify(data, null, 2);
      await fs.writeFile(this.dataPath, content, 'utf-8');

      // Update cache
      this.cache = data;
      this.cacheTime = Date.now();

      console.log(`[Resort Service] Saved ${data.resorts.length} resorts`);
      return true;
    } catch (error) {
      console.error('[Resort Service] Failed to save resort data:', error);
      throw new AppError('RESORT_SAVE_ERROR', '無法儲存雪場資料', 500);
    }
  }

  /**
   * Create full database backup
   */
  async createFullBackup() {
    try {
      const data = await this.loadResortData();
      const content = JSON.stringify(data, null, 2);
      await fs.writeFile(this.backupPath, content, 'utf-8');
      console.log('[Resort Service] Created full backup');
      return true;
    } catch (error) {
      console.error('[Resort Service] Failed to create full backup:', error);
      return false;
    }
  }

  /**
   * List Resorts with pagination, search, and filters
   */
  async listResorts(options = {}) {
    const {
      page = 1,
      limit = 20,
      search = null,
      region = null,
      prefecture = null,
      night_ski = null,
      sort = 'resort_id',
      order = 'asc'
    } = options;

    const data = await this.loadResortData();
    let resorts = [...data.resorts];

    // Apply search filter
    if (search && search.trim().length > 0) {
      const searchLower = search.toLowerCase().trim();
      resorts = resorts.filter(resort => {
        const nameMatch = resort.names?.zh?.toLowerCase().includes(searchLower) ||
                         resort.names?.en?.toLowerCase().includes(searchLower) ||
                         resort.names?.ja?.toLowerCase().includes(searchLower);
        const idMatch = resort.resort_id?.toLowerCase().includes(searchLower);
        const regionMatch = resort.region?.toLowerCase().includes(searchLower);
        return nameMatch || idMatch || regionMatch;
      });
    }

    // Apply region filter (from _metadata)
    if (region && Array.isArray(region) && region.length > 0) {
      resorts = resorts.filter(resort => region.includes(resort._metadata?.region));
    }

    // Apply prefecture filter
    if (prefecture) {
      resorts = resorts.filter(resort => resort.region === prefecture);
    }

    // Apply night ski filter
    if (night_ski !== null) {
      resorts = resorts.filter(resort => resort.snow_stats?.night_ski === night_ski);
    }

    // Sort resorts
    resorts.sort((a, b) => {
      let aVal, bVal;

      switch (sort) {
        case 'name':
          aVal = a.names?.zh || a.resort_id;
          bVal = b.names?.zh || b.resort_id;
          break;
        case 'lifts':
          aVal = a.snow_stats?.lifts || 0;
          bVal = b.snow_stats?.lifts || 0;
          break;
        case 'courses':
          aVal = a.snow_stats?.courses_total || 0;
          bVal = b.snow_stats?.courses_total || 0;
          break;
        default:
          aVal = a[sort] || '';
          bVal = b[sort] || '';
      }

      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Calculate pagination
    const total = resorts.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    // Get page items with summary data
    const pageItems = resorts.slice(offset, offset + limit).map(resort => ({
      resort_id: resort.resort_id,
      names: resort.names,
      region: resort.region,
      area: resort._metadata?.area,
      snow_stats: {
        lifts: resort.snow_stats?.lifts,
        courses_total: resort.snow_stats?.courses_total,
        night_ski: resort.snow_stats?.night_ski
      },
      season: resort.season,
      amenities: resort.amenities?.slice(0, 3), // First 3 amenities only
      coordinates: resort.coordinates
    }));

    return {
      resorts: pageItems,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1
      },
      filters: {
        search,
        region,
        prefecture,
        night_ski
      }
    };
  }

  /**
   * Get single Resort by ID
   */
  async getResortById(resortId) {
    const data = await this.loadResortData();
    const resort = data.resorts.find(r => r.resort_id === resortId);
    return resort || null;
  }

  /**
   * Validate Resort data
   */
  validateResortData(resortData) {
    const errors = [];

    // Required fields
    if (!resortData.resort_id) {
      errors.push({ field: 'resort_id', message: 'Resort ID 為必填欄位' });
    }

    if (!resortData.names || !resortData.names.zh) {
      errors.push({ field: 'names.zh', message: '中文名稱為必填欄位' });
    }

    if (!resortData.region) {
      errors.push({ field: 'region', message: '地區為必填欄位' });
    }

    // Validate coordinates if present
    if (resortData.coordinates) {
      if (typeof resortData.coordinates.lat !== 'number' ||
          resortData.coordinates.lat < -90 ||
          resortData.coordinates.lat > 90) {
        errors.push({ field: 'coordinates.lat', message: '緯度必須在 -90 到 90 之間' });
      }
      if (typeof resortData.coordinates.lng !== 'number' ||
          resortData.coordinates.lng < -180 ||
          resortData.coordinates.lng > 180) {
        errors.push({ field: 'coordinates.lng', message: '經度必須在 -180 到 180 之間' });
      }
    }

    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', '資料驗證失敗', 400, { errors });
    }

    return true;
  }

  /**
   * Update existing Resort
   */
  async updateResort(resortId, resortData) {
    const data = await this.loadResortData();

    // Find resort index
    const index = data.resorts.findIndex(r => r.resort_id === resortId);
    if (index === -1) {
      throw new AppError('RESORT_NOT_FOUND', '找不到指定的雪場', 404);
    }

    // Update resort (preserve _metadata)
    const updatedResort = {
      ...resortData,
      resort_id: resortId, // Ensure ID doesn't change
      _metadata: {
        ...data.resorts[index]._metadata,
        last_updated: new Date().toISOString()
      }
    };

    data.resorts[index] = updatedResort;

    // Update meta
    data.meta.generated_at = new Date().toISOString();

    // Save data
    await this.saveResortData(data);

    // Create full backup
    await this.createFullBackup();

    return {
      resort_id: resortId,
      message: '雪場資料已更新',
      updated_at: updatedResort._metadata.last_updated
    };
  }

  /**
   * Get statistics
   */
  async getStatistics() {
    const data = await this.loadResortData();
    return data.meta.statistics;
  }

  /**
   * Get unique regions
   */
  async getRegions() {
    const data = await this.loadResortData();
    const regions = new Set();

    data.resorts.forEach(resort => {
      if (resort._metadata?.region) {
        regions.add(resort._metadata.region);
      }
    });

    return Array.from(regions).sort();
  }

  /**
   * Get unique prefectures
   */
  async getPrefectures() {
    const data = await this.loadResortData();
    const prefectures = new Set();

    data.resorts.forEach(resort => {
      if (resort.region) {
        prefectures.add(resort.region);
      }
    });

    return Array.from(prefectures).sort();
  }
}

module.exports = ResortService;
