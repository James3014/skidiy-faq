/**
 * Slot Extraction Service
 *
 * Extracts structured information from user queries using regex patterns:
 * - resort: 雪場名稱 (野澤、藏王、GALA等40+雪場)
 * - date: 日期 (2024-02-15, 2月15日, MM/DD)
 * - people_total: 人數 (2大1小, 4人)
 * - board_type: 板型 (SKI, SNOWBOARD)
 * - children_ages: 小孩年齡 (3歲, 五歲)
 */

class SlotExtractor {
  constructor() {
    this.resorts = {};
    this.patterns = {};
    this.isInitialized = false;
  }

  /**
   * Initialize slot extractor with patterns
   */
  async initialize() {
    try {
      // Resort names dictionary (CN/JP/EN aliases)
      this.resorts = {
        // Japan - Nagano
        '野澤溫泉': ['野澤', 'nozawa', '野沢', 'Nozawa Onsen'],
        '白馬': ['hakuba', '白马', 'Hakuba', '白馬村'],
        '志賀高原': ['志賀', 'shiga', 'Shiga Kogen'],
        '輕井澤': ['軽井沢', 'karuizawa', 'Karuizawa', '輕井澤王子'],

        // Japan - Niigata
        'GALA湯澤': ['GALA', 'gala', '湯澤', '汤泽', 'Gala Yuzawa'],
        '苗場': ['naeba', '苗场', 'Naeba'],
        '妙高': ['myoko', 'Myoko', '妙高高原'],

        // Japan - Hokkaido
        '二世谷': ['niseko', '二世古', 'Niseko', '新雪谷'],
        '留壽都': ['rusutsu', 'Rusutsu', '留寿都'],
        'Kiroro': ['kiroro', 'キロロ', '喜樂樂'],
        'Furano': ['furano', '富良野', 'フラノ'],
        'Tomamu': ['tomamu', '星野', 'トマム'],

        // Japan - Tohoku
        '藏王': ['zao', '蔵王', 'Zao', '藏王温泉'],
        '安比高原': ['appi', 'Appi', 'アッピ'],

        // Japan - Other
        '白山': ['hakusan', 'Hakusan'],
        '神樂': ['kagura', 'Kagura', '神乐'],

        // South Korea
        '龍平': ['yongpyong', 'Yongpyong', '龙平'],
        '鳳凰城': ['phoenix', 'Phoenix Park'],
        'High1': ['high1', 'High One'],

        // China
        '萬龍': ['wanlong', 'Wanlong', '万龙'],
        '太舞': ['thaiwoo', 'Thaiwoo'],
        '雲頂': ['genting', 'Genting', '云顶']
      };

      // Regex patterns for slot extraction
      this.patterns = {
        // Date patterns (multiple formats)
        date: [
          // ISO format: 2024-02-15, 2024/02/15
          /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/,
          // Compact format: 20240215
          /(\d{4})(\d{2})(\d{2})/,
          // Month/Day: 2月15日, 2/15
          /(\d{1,2})[月\/](\d{1,2})[日]?/,
          // Relative: 下週, 下个月, 3天後
          /(下週|下周|下個月|下个月|這週|这周)/,
          /(明天|後天|大後天)/,
          /(\d+)(天|週|周|個月)[後后]/
        ],

        // People count: 2大1小, 4人, 兩位大人一個小孩
        people: [
          /(\d+)[大](\d+)[小]/,  // 2大1小
          /(\d+)人/,              // 4人
          /([一二三四五六七八九十]+)位/,  // 兩位
          /([一二三四五六七八九十]+)[個个]大人/,
          /([一二三四五六七八九十]+)[個个]小[孩朋友]/
        ],

        // Board type: SKI, SNOWBOARD, 滑雪, 單板
        boardType: [
          /(ski|skii|雙板|双板|滑雪)/i,
          /(snowboard|sb|單板|单板|滑板)/i
        ],

        // Children ages: 3歲, 五歲, 三岁
        childAge: [
          /(\d+)[歲岁]/,
          /([一二三四五六七八九十]+)[歲岁]/
        ]
      };

      this.isInitialized = true;
      console.log(`[Slot Extractor] Initialized with ${Object.keys(this.resorts).length} resorts`);
    } catch (error) {
      console.error('[Slot Extractor] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Extract all slots from query
   *
   * @param {string} query - User query text
   * @returns {Object} Extracted slots
   */
  async extract(query) {
    if (!this.isInitialized) {
      throw new Error('Slot Extractor not initialized');
    }

    if (!query || query.trim().length === 0) {
      return {};
    }

    const slots = {};

    // Extract resort
    const resort = this.extractResort(query);
    if (resort) slots.resort = resort;

    // Extract date
    const date = this.extractDate(query);
    if (date) slots.date = date;

    // Extract people count
    const people = this.extractPeople(query);
    if (people) slots.people_total = people;

    // Extract board type
    const boardType = this.extractBoardType(query);
    if (boardType) slots.board_type = boardType;

    // Extract children ages
    const childrenAges = this.extractChildrenAges(query);
    if (childrenAges.length > 0) slots.children_ages = childrenAges;

    return slots;
  }

  /**
   * Extract resort name from query
   *
   * @param {string} query - User query
   * @returns {string|null} Resort canonical name
   */
  extractResort(query) {
    const queryLower = query.toLowerCase();

    for (const [canonical, aliases] of Object.entries(this.resorts)) {
      for (const alias of aliases) {
        if (queryLower.includes(alias.toLowerCase())) {
          return canonical;
        }
      }
      // Also check canonical name itself
      if (queryLower.includes(canonical.toLowerCase())) {
        return canonical;
      }
    }

    return null;
  }

  /**
   * Extract date from query
   *
   * @param {string} query - User query
   * @returns {string|null} Parsed date (YYYY-MM-DD or relative)
   */
  extractDate(query) {
    // Try ISO format first: 2024-02-15
    const isoMatch = query.match(this.patterns.date[0]);
    if (isoMatch) {
      const [_, year, month, day] = isoMatch;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Try compact format: 20240215
    const compactMatch = query.match(this.patterns.date[1]);
    if (compactMatch) {
      const [_, year, month, day] = compactMatch;
      return `${year}-${month}-${day}`;
    }

    // Try month/day format: 2月15日
    const monthDayMatch = query.match(this.patterns.date[2]);
    if (monthDayMatch) {
      const [_, month, day] = monthDayMatch;
      const currentYear = new Date().getFullYear();
      return `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Try relative dates
    const relativeMatch = query.match(this.patterns.date[3]);
    if (relativeMatch) {
      return relativeMatch[1]; // Return as-is for now (e.g., "下週")
    }

    const dayMatch = query.match(this.patterns.date[4]);
    if (dayMatch) {
      return dayMatch[1]; // "明天", "後天"
    }

    return null;
  }

  /**
   * Extract people count from query
   *
   * @param {string} query - User query
   * @returns {number|null} Total number of people
   */
  extractPeople(query) {
    // Pattern 1: 2大1小 (2 adults + 1 child = 3 total)
    const adultsKidsMatch = query.match(this.patterns.people[0]);
    if (adultsKidsMatch) {
      const [_, adults, kids] = adultsKidsMatch;
      return parseInt(adults) + parseInt(kids);
    }

    // Pattern 2: 4人
    const peopleMatch = query.match(this.patterns.people[1]);
    if (peopleMatch) {
      return parseInt(peopleMatch[1]);
    }

    // Pattern 3: 兩位 (Chinese numerals)
    const chineseMatch = query.match(this.patterns.people[2]);
    if (chineseMatch) {
      return this.chineseToNumber(chineseMatch[1]);
    }

    return null;
  }

  /**
   * Extract board type from query
   *
   * @param {string} query - User query
   * @returns {string|null} 'SKI' or 'SNOWBOARD'
   */
  extractBoardType(query) {
    // Check for SKI keywords
    if (this.patterns.boardType[0].test(query)) {
      return 'SKI';
    }

    // Check for SNOWBOARD keywords
    if (this.patterns.boardType[1].test(query)) {
      return 'SNOWBOARD';
    }

    return null;
  }

  /**
   * Extract children ages from query
   *
   * @param {string} query - User query
   * @returns {Array<number>} Array of ages
   */
  extractChildrenAges(query) {
    const ages = [];

    // Find all age mentions
    const matches = [...query.matchAll(/(\d+|[一二三四五六七八九十]+)[歲岁]/g)];

    for (const match of matches) {
      const ageStr = match[1];
      let age;

      if (/^\d+$/.test(ageStr)) {
        age = parseInt(ageStr);
      } else {
        age = this.chineseToNumber(ageStr);
      }

      if (age >= 0 && age <= 18) {
        ages.push(age);
      }
    }

    return ages;
  }

  /**
   * Convert Chinese numerals to numbers
   *
   * @param {string} chinese - Chinese numeral string
   * @returns {number} Numeric value
   */
  chineseToNumber(chinese) {
    const map = {
      '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
      '六': 6, '七': 7, '八': 8, '九': 9, '十': 10
    };

    // Simple cases: 一, 二, 三...
    if (map[chinese]) {
      return map[chinese];
    }

    // 十一, 十二... (11, 12...)
    if (chinese.startsWith('十')) {
      const remainder = chinese.slice(1);
      return 10 + (map[remainder] || 0);
    }

    // 二十, 三十... (20, 30...)
    if (chinese.endsWith('十')) {
      const tens = chinese.slice(0, -1);
      return (map[tens] || 1) * 10;
    }

    // 二十一, 三十五... (21, 35...)
    const tensMatch = chinese.match(/([一二三四五六七八九])十([一二三四五六七八九])?/);
    if (tensMatch) {
      const tens = map[tensMatch[1]];
      const ones = tensMatch[2] ? map[tensMatch[2]] : 0;
      return tens * 10 + ones;
    }

    return 0;
  }

  /**
   * Get all supported resorts
   *
   * @returns {Array<string>} Canonical resort names
   */
  getAllResorts() {
    return Object.keys(this.resorts);
  }

  /**
   * Get resort aliases
   *
   * @param {string} canonical - Canonical resort name
   * @returns {Array<string>} Aliases for the resort
   */
  getResortAliases(canonical) {
    return this.resorts[canonical] || [];
  }

  /**
   * Validate extracted slots
   *
   * @param {Object} slots - Extracted slots
   * @returns {Object} Validation result with errors
   */
  validateSlots(slots) {
    const errors = [];

    if (slots.date) {
      // Validate date format if it's YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(slots.date)) {
        const date = new Date(slots.date);
        if (isNaN(date.getTime())) {
          errors.push('Invalid date format');
        }
      }
    }

    if (slots.people_total !== undefined) {
      if (slots.people_total < 1 || slots.people_total > 50) {
        errors.push('People count must be between 1 and 50');
      }
    }

    if (slots.board_type) {
      if (!['SKI', 'SNOWBOARD'].includes(slots.board_type)) {
        errors.push('Board type must be SKI or SNOWBOARD');
      }
    }

    if (slots.children_ages) {
      for (const age of slots.children_ages) {
        if (age < 0 || age > 18) {
          errors.push(`Invalid child age: ${age}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
module.exports = SlotExtractor;
