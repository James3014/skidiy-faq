# FAQ API 文章整合指南

**最後更新**: 2025-11-14
**版本**: 1.0

## 概述

本文檔說明目前 FAQ API 的最新功能，以及如何通過 FAQ 的標籤和分類系統來優化文章的讀取和推薦。

---

## 1. FAQ API 的最新結構

### API 端點

#### 1.1 取得所有 FAQ 資料
```bash
GET /api/v1/faq/all?lang=zh
```

**響應格式** (Phase 4.1+):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "faq.itinerary.001",
        "content": {
          "question": "應該先訂好機票住宿，還是先預約滑雪教練？",
          "answer": "...",
          "tip": "...",
          "postscript": ""
        },
        "metadata": {
          "intent": "ITINERARY",
          "section": "行程規劃與周邊",
          "section_en": "Itinerary Planning and Surroundings",
          "section_th": "การวางแผนการเดินทางและพื้นที่ใกล้เคียง",
          "crm_tags": ["booking", "planning"],
          "keywords": ["預約教練", "行程規劃", "訂機票", "訂住宿", "旺季"],
          "hot": false
        }
      }
    ],
    "metadata": {...},
    "total": 71
  },
  "meta": {
    "timestamp": "2025-11-14T...",
    "Cache-Control": "public, max-age=300"
  }
}
```

#### 1.2 搜尋 FAQ
```bash
POST /api/v1/faq/search
Content-Type: application/json

{
  "query": "教練",
  "language": "zh",
  "limit": 5,
  "threshold": 0.6
}
```

**響應格式**:
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "faq.booking.001",
        "content": {...},
        "metadata": {...},
        "score": 0.85,
        "confidence": 85,
        "answer_preview": "..."
      }
    ],
    "total": 5,
    "query": "教練",
    "language": "zh"
  },
  "meta": {
    "timestamp": "...",
    "query_id": "q_...",
    "response_time_ms": 14
  }
}
```

#### 1.3 取得單一 FAQ
```bash
GET /api/v1/faq/:faq_id?language=zh
```

#### 1.4 過濾 FAQ (用於文章推薦)
```bash
GET /api/v1/faq?intent=BOOKING&section=預約系統&limit=10
```

---

## 2. FAQ 資料結構詳解

### 2.1 FAQ 項目的完整欄位

```javascript
{
  // 基本識別
  "id": "faq.booking.001",                          // 唯一 ID
  "intent": "BOOKING",                              // Intent 類型

  // 分類
  "section": "預約系統",                            // 中文分類
  "section_translations": {
    "en": "Booking System",
    "th": "ระบบจองหนังสือ"
  },

  // 問題 (支援多語言)
  "canonical_question": "怎樣預約教練？",
  "canonical_question_translations": {
    "en": "How to book an instructor?",
    "th": "วิธีการจองครูสอน"
  },

  // 關鍵字 (多語言)
  "keywords": ["預約教練", "線上預約", "系統", ...],
  "keywords_translations": {
    "en": ["Book instructor", "Online booking", "System", ...],
    "th": ["จองครูสอน", "การจองออนไลน์", ...]
  },

  // 常見用語模式 (用於 Intent Detection)
  "utterance_patterns": ["怎樣預約教練", "如何預約教練", ...],
  "utterance_patterns_translations": {
    "en": ["How to book coach?", "Book instructor?", ...],
    "th": [...]
  },

  // CRM 標籤 (最重要：用於文章推薦)
  "crm_tags": ["booking", "instructor", "system"],
  "crm_tags_translations": {
    "en": ["booking", "instructor", "system"],
    "th": ["การจอง", "ครูสอน", "ระบบ"]
  },

  // 答案內容
  "answer_template": {
    "summary": "短摘要",
    "text": "完整答案",
    "text_translations": {
      "en": "English full answer",
      "th": "Thai full answer"
    },
    "tip": "提示",
    "tip_translations": {
      "en": "English tip",
      "th": "Thai tip"
    },
    "postscript": "備註",
    "postscript_translations": {...}
  },

  // API 返回的簡化格式 (Phase 4.1+)
  // 由 API 自動組合，前端無需處理
  "content": {
    "question": "怎樣預約教練？",
    "answer": "完整答案文本（已選擇對應語言）",
    "tip": "提示（如有）",
    "postscript": "備註（如有）"
  }
}
```

### 2.2 關鍵欄位說明

| 欄位 | 用途 | 類型 | 範例 |
|------|------|------|------|
| `id` | 唯一識別符 | String | `faq.booking.001` |
| `intent` | Intent 分類 | String | `BOOKING`, `INSTRUCTOR` |
| `section` | 分類名稱 | String | `預約系統`, `行程規劃` |
| `crm_tags` | **文章推薦關鍵** | Array | `["booking", "instructor"]` |
| `keywords` | 搜尋關鍵字 | Array | `["預約教練", "線上預約"]` |
| `hot` | 熱門標記 | Boolean | `true/false` |
| `content` | API 返回的內容 | Object | `{question, answer, tip, postscript}` |

---

## 3. 用於文章讀取的推薦流程

### 3.1 基於 FAQ 標籤的文章推薦 (推薦方案)

**目標**: 每篇文章可以根據其內容及 FAQ 的 `crm_tags` 來準確抓取相關 FAQ

**實現步驟**:

```javascript
// 1. 文章物件結構 (建議)
class Article {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.content = data.content;
    this.tags = data.tags;              // 文章標籤
    this.relatedFaqIds = [];
  }

  // 2. 根據文章標籤查找相關 FAQ
  async getRelatedFaqs(language = 'zh') {
    const API_BASE = 'https://faq-api-v1.zeabur.app/api/v1';

    try {
      // 取得所有 FAQ
      const response = await fetch(`${API_BASE}/faq/all?lang=${language}`);
      const result = await response.json();

      // 3. 過濾 FAQ：根據標籤匹配
      const relatedFaqs = result.data.items.filter(faq => {
        // 檢查 FAQ 的 crm_tags 是否與文章標籤有重疊
        return faq.metadata.crm_tags.some(tag =>
          this.tags.includes(tag)
        );
      });

      // 4. 按相關性排序 (可選)
      const scored = relatedFaqs.map(faq => ({
        ...faq,
        relevanceScore: this.calculateRelevance(faq)
      })).sort((a, b) => b.relevanceScore - a.relevanceScore);

      return scored;
    } catch (error) {
      console.error('Failed to fetch related FAQs:', error);
      return [];
    }
  }

  // 計算相關性分數
  calculateRelevance(faq) {
    let score = 0;

    // 標籤匹配
    const matchedTags = faq.metadata.crm_tags.filter(tag =>
      this.tags.includes(tag)
    );
    score += matchedTags.length * 0.3;

    // 關鍵字匹配
    const hasKeywordMatch = faq.metadata.keywords.some(keyword =>
      this.content.toLowerCase().includes(keyword.toLowerCase())
    );
    if (hasKeywordMatch) score += 0.2;

    // 熱門 FAQ 加分
    if (faq.metadata.hot) score += 0.1;

    // 相同 Intent 加分
    if (faq.metadata.intent === this.articleIntent) score += 0.15;

    return score;
  }
}
```

### 3.2 文章標籤與 FAQ 標籤的對應關係

**建議的標籤映射表**:

| 文章類型 | 推薦標籤 | 對應 FAQ Intent | 對應 crm_tags |
|--------|--------|---------------|-------------|
| 新手入門指南 | beginner, tutorial | COURSE, GEAR | instructor, beginner, gear |
| 教練預約教學 | booking, instructor | BOOKING, INSTRUCTOR | booking, instructor, system |
| 行程規劃 | itinerary, planning | ITINERARY | planning, booking, resort |
| 保險說明 | insurance, payment | PAYMENT, INSURANCE | insurance, payment, policy |
| 雪具準備 | gear, equipment | GEAR, COURSE | gear, equipment, course |
| 家庭/兒童 | kids, family | KIDS_SAFETY, COURSE | kids, family, safety |
| 度假村信息 | resort, destination | SERVICE, GENERAL | resort, service, location |

---

## 4. 實現方案與優化

### 4.1 前端實現 (JavaScript)

```javascript
/**
 * 文章 FAQ 推薦引擎
 *
 * 功能：
 * 1. 載入文章內容
 * 2. 分析文章標籤
 * 3. 查詢相關 FAQ
 * 4. 智能推薦
 */
class ArticleFaqRecommender {
  constructor() {
    this.faqEngine = null;
    this.faqData = null;
    this.language = 'zh';
  }

  // 初始化
  async initialize() {
    try {
      const API_BASE = 'https://faq-api-v1.zeabur.app/api/v1';
      const response = await fetch(`${API_BASE}/faq/all?lang=${this.language}`);
      const result = await response.json();
      this.faqData = result.data.items;
      console.log('[ArticleFaqRecommender] Initialized with', this.faqData.length, 'FAQs');
    } catch (error) {
      console.error('[ArticleFaqRecommender] Init failed:', error);
    }
  }

  /**
   * 推薦相關 FAQ
   * @param {Array} articleTags - 文章標籤陣列
   * @param {number} limit - 最多推薦數量
   * @returns {Array} 推薦的 FAQ 清單
   */
  recommend(articleTags, limit = 5) {
    if (!this.faqData) {
      console.warn('[ArticleFaqRecommender] FAQ data not loaded');
      return [];
    }

    // 計算每個 FAQ 的相關性分數
    const scored = this.faqData.map(faq => {
      let score = 0;

      // 標籤匹配 (權重: 0.6)
      const matchedTags = faq.metadata.crm_tags.filter(tag =>
        articleTags.includes(tag)
      );
      score += matchedTags.length * 0.6;

      // 熱門 FAQ 加分 (權重: 0.2)
      if (faq.metadata.hot) score += 0.2;

      return { faq, score };
    }).filter(item => item.score > 0);

    // 排序並限制數量
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => ({
        ...item.faq,
        relevanceScore: item.score
      }));
  }

  /**
   * 搜尋與文章內容相關的 FAQ
   * @param {string} articleContent - 文章內容
   * @param {number} limit - 結果數量
   * @returns {Array} 搜尋結果
   */
  searchByContent(articleContent, limit = 5) {
    if (!this.faqData) return [];

    // 簡單的內容匹配（前端版本）
    const scored = this.faqData.map(faq => {
      let score = 0;

      // 問題匹配
      if (articleContent.includes(faq.content.question)) score += 1;

      // 關鍵字匹配
      faq.metadata.keywords.forEach(keyword => {
        if (articleContent.includes(keyword)) score += 0.3;
      });

      return { faq, score };
    }).filter(item => item.score > 0);

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

// 使用範例
const recommender = new ArticleFaqRecommender();
await recommender.initialize();

// 根據標籤推薦
const faqsForArticle = recommender.recommend(['booking', 'instructor'], 5);

// 根據內容搜尋
const faqsByContent = recommender.searchByContent(articleContent, 3);
```

### 4.2 後端實現 (Node.js)

```javascript
/**
 * 文章 FAQ 推薦 API 端點
 * 路由: POST /api/v1/article/recommend-faqs
 */
router.post('/recommend-faqs', async (req, res, next) => {
  try {
    const { articleTags, articleContent, limit = 5, language = 'zh' } = req.body;

    // 驗證輸入
    if (!Array.isArray(articleTags) || articleTags.length === 0) {
      throw new AppError('INVALID_TAGS', '文章標籤不能為空', 400);
    }

    // 載入 FAQ 資料
    const data = await loadFAQData();

    // 過濾相關 FAQ
    const relatedFaqs = data.items
      .filter(item => {
        // 標籤匹配
        return item.crm_tags.some(tag => articleTags.includes(tag));
      })
      .map(item => {
        const simplified = transformToSimplifiedFormat(item, language);

        // 計算相關性分數
        let score = 0;

        // 標籤匹配分數
        const matchedTags = item.crm_tags.filter(tag =>
          articleTags.includes(tag)
        );
        score += matchedTags.length * 0.6;

        // 內容匹配分數（如果提供）
        if (articleContent) {
          if (articleContent.includes(item.canonical_question)) score += 0.3;

          item.keywords.forEach(keyword => {
            if (articleContent.includes(keyword)) score += 0.1;
          });
        }

        // 熱門加分
        if (item.hot) score += 0.2;

        return {
          ...simplified,
          relevanceScore: Math.min(score, 1.0)  // 歸一化到 0-1
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, Math.min(limit, 10));

    sendSuccess(res, {
      faqs: relatedFaqs,
      total: relatedFaqs.length,
      articleTags,
      language
    }, 200, {
      timestamp: new Date().toISOString(),
      response_time_ms: Date.now() - startTime
    });

  } catch (error) {
    next(error);
  }
});
```

---

## 5. 目前 FAQ 的 Intent 和 CRM Tags

### 5.1 Intent 分類

根據 `faq_kb.phase0a.json` 的分析，目前支援的 Intent 包括：

- **ITINERARY** - 行程規劃與周邊
- **BOOKING** - 預約系統
- **INSTRUCTOR** - 教練相關
- **COURSE** - 課程資訊
- **PAYMENT** - 付款與保險
- **GEAR** - 雪具與裝備
- **KIDS_SAFETY** - 兒童安全與課程
- **SERVICE** - 度假村服務
- **GENERAL** - 一般常見問題

### 5.2 常見 CRM Tags (基於現有資料)

```
booking, instructor, course, payment, insurance, gear,
equipment, safety, kids, family, resort, location,
beginner, group, private, rental, discount, policy,
transportation, accommodation, resort, skiing, snowboarding,
lesson, schedule, instructor, coach, guide, experience
```

---

## 6. API 性能特性

### 6.1 響應時間

| 端點 | 平均時間 | P95 | 備註 |
|------|--------|-----|------|
| GET /api/v1/faq/all | 14-15ms | <50ms | 快取 5 分鐘 |
| POST /api/v1/faq/search | 14-15ms | <50ms | 簡單文本匹配 |
| GET /api/v1/faq/:id | <10ms | <20ms | 直接查詢 |
| GET /api/v1/faq (過濾) | 10-20ms | <50ms | 基於條件 |

### 6.2 快取策略

- **API 快取**: 5 分鐘 (`Cache-Control: public, max-age=300`)
- **前端快取**: 客戶端決定（推薦 30 分鐘）
- **資料重新載入**: FAQ 資料若有更新，後端自動重新載入

---

## 7. 推薦的文章集成流程

### 7.1 文章頁面流程

```
1. 文章載入
   ↓
2. 從文章 metadata 提取標籤
   ↓
3. 調用 /api/v1/article/recommend-faqs (後端)
   或 frontend recommender.recommend() (前端)
   ↓
4. 展示推薦的 FAQ
   ↓
5. 用戶可點擊查看完整 FAQ
```

### 7.2 資料流

```
Article Page
    ├── Article Tags: ["booking", "instructor"]
    │
    ├─→ API: POST /api/v1/article/recommend-faqs
    │   └─→ Server: Filter FAQs by crm_tags
    │       └─→ Response: [FAQ items with scores]
    │
    └─→ Display: Recommended FAQs Section
        └─→ FAQ Cards with links to /faq/:id
```

---

## 8. 多語言支援

### 8.1 語言參數

所有 API 端點都支援 `lang` 或 `language` 參數：

```bash
# 英文
GET /api/v1/faq/all?lang=en

# 泰文
GET /api/v1/faq/all?lang=th

# 中文（預設）
GET /api/v1/faq/all?lang=zh
```

### 8.2 前端多語言

```javascript
// 使用 FAQEngine
const engine = new FAQEngine();
await engine.initialize();
engine.setLanguage('en');  // 切換為英文
```

---

## 9. 常見問題與排查

### Q1: 為什麼文章推薦不準確？

**答**: 檢查以下項目：
1. 文章標籤是否與 crm_tags 匹配
2. FAQ 資料是否正確載入
3. 是否有網絡延遲導致資料過時

### Q2: 如何添加新的標籤對應？

**答**: 編輯 `/data/faq_kb.phase0a.json` 中的 FAQ 項目，更新 `crm_tags` 欄位。

### Q3: 前端和後端推薦演算法有何區別？

**答**:
- **前端**: 簡單快速，但僅支援標籤匹配
- **後端**: 支援內容匹配和更複雜的評分

---

## 10. 實施檢查清單

- [ ] API 後端已啟動
- [ ] FAQ 資料已載入 (71+ 項目)
- [ ] 文章結構已定義 (包含 tags 欄位)
- [ ] 前端推薦元件已實裝
- [ ] 多語言標籤對應已建立
- [ ] 測試推薦準確率 (>80%)
- [ ] 性能測試通過 (<200ms)
- [ ] 快取策略已應用

---

**開發參考**:
- API Spec: `zeabur_backend/src/routes/faq.js`
- 前端引擎: `frontend/lib/faq-engine.js`
- FAQ 資料: `zeabur_backend/data/faq_kb.phase0a.json`
- CLAUDE.md: `zeabur/CLAUDE.md`

**更多信息**: 查看 `PHASE4_OPTIMIZATION_SUMMARY.md` 和 `PERFORMANCE_BENCHMARK.md`
