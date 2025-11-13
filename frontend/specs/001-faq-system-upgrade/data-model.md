# Data Model Specification: FAQ System Upgrade

**Version**: 1.0.0
**Created**: 2025-10-13
**Status**: Draft
**Related Spec**: [spec.md](./spec.md) | [plan.md](./plan.md) | [research.md](./research.md)

## Overview

本文檔定義 FAQ 系統升級專案中所有資料結構的詳細規格，包含：
- **前端資料模型**：FAQ 項目、搜尋結果、使用者互動
- **後端資料模型**：分析記錄、Intent 偵測、Slot 擷取
- **整合資料模型**：CRM 標籤、JSONL 日誌格式

所有資料模型遵循憲章原則 II（資料驅動設計）和原則 III（多語言支援優先）。

---

## 1. Frontend Data Models

### 1.1 FAQ Item（FAQ 項目）

**用途**：faq_kb.phase0a.json 的核心資料結構，表示單一 FAQ 條目

**JSON Schema 路徑**：`contracts/faq-schema.json#/definitions/FAQItem`

```typescript
interface FAQItem {
  // 唯一識別碼
  id: string;  // 格式：faq.{category}.{序號}，例如 "faq.itinerary.001"

  // Intent 分類
  intent: IntentType;  // 枚舉值見 1.2 節

  // 多語言問題陳述（中文為必填）
  canonical_question: string;              // 中文標準問題
  canonical_question_en?: string;          // 英文標準問題（選填）
  canonical_question_th?: string;          // 泰文標準問題（選填）
  canonical_question_ja?: string;          // 日文標準問題（保留欄位）

  // 問題變體（用於搜尋匹配）
  utterance_patterns: string[];            // 至少 3 個變體，例如 ["怎麼訂教練", "如何預約", "預約流程"]

  // 多語言回答模板
  answer_template: {
    text: string;                          // 中文主要回答（必填，支援 Markdown）
    text_en?: string;                      // 英文回答（選填）
    text_th?: string;                      // 泰文回答（選填）
    postscript?: string;                   // 補充說明（中文）
    postscript_en?: string;                // 補充說明（英文）
    postscript_th?: string;                // 補充說明（泰文）
    links_inline?: LinkToken[];            // 內嵌連結，例如 ["LINK_SCHEDULE", "LINK_BOOKING"]
  };

  // 搜尋與匹配
  keywords: string[];                      // 關鍵字清單，例如 ["教練", "預約", "行程"]
  related_faq_ids?: string[];              // 相關 FAQ ID，例如 ["faq.itinerary.002", "faq.booking.001"]

  // CRM 整合
  crm_tags: string[];                      // CRM 標籤，例如 ["#行程規劃", "#教練預約"]

  // 元數據
  metadata: {
    created_at: string;                    // ISO 8601 格式，例如 "2025-01-15T10:30:00Z"
    updated_at: string;                    // 最後更新時間
    version: number;                       // 版本號（從 1 開始）
    status: "active" | "draft" | "archived";  // 狀態
    priority?: number;                     // 顯示優先級（1-10，數字越大優先級越高）
  };
}
```

**欄位驗證規則**：
- `id`：必須符合正則表達式 `^faq\.[a-z_]+\.\d{3}$`
- `canonical_question`：長度 5-200 字元
- `utterance_patterns`：至少 3 個，每個 3-100 字元
- `keywords`：至少 2 個，每個 2-20 字元
- `crm_tags`：每個必須以 `#` 開頭

**範例**：
```json
{
  "id": "faq.itinerary.001",
  "intent": "ITINERARY",
  "canonical_question": "應該先訂好機票住宿，還是先預約滑雪教練？",
  "canonical_question_en": "Should I book flights and accommodation first, or reserve a ski instructor first?",
  "canonical_question_th": "ควรจองตั๋วเครื่องบินและที่พักก่อน หรือจองโค้ชสกีก่อน?",
  "utterance_patterns": [
    "要先訂機票還是教練",
    "預約教練的時機",
    "什麼時候訂教練比較好"
  ],
  "answer_template": {
    "text": "建議先確認教練檔期，因為熱門時段（如春節）教練很快滿檔。確認教練後再訂機票住宿，可避免行程衝突。",
    "text_en": "We recommend checking coach availability first, as popular periods (like Lunar New Year) fill up quickly. Book flights and accommodation after confirming your coach to avoid schedule conflicts.",
    "text_th": "แนะนำให้ตรวจสอบความว่างของโค้ชก่อน เพราะช่วงยอดนิยม (เช่น ตรุษจีน) เต็มเร็วมาก จองตั๋วและที่พักหลังจากยืนยันโค้ชเพื่อหลีกเลี่ยงตารางเวลาที่ขัดแย้ง",
    "links_inline": ["LINK_SCHEDULE"]
  },
  "keywords": ["機票", "住宿", "教練", "預約", "行程"],
  "related_faq_ids": ["faq.booking.001", "faq.itinerary.005"],
  "crm_tags": ["#行程規劃", "#教練問題"],
  "metadata": {
    "created_at": "2025-01-10T08:00:00Z",
    "updated_at": "2025-01-15T14:30:00Z",
    "version": 2,
    "status": "active",
    "priority": 8
  }
}
```

---

### 1.2 Intent Type（意圖類型）

**用途**：分類 FAQ 和使用者查詢的意圖

```typescript
enum IntentType {
  ITINERARY = "ITINERARY",           // 行程規劃
  BOOKING = "BOOKING",               // 預約流程
  COURSE = "COURSE",                 // 課程內容
  INSTRUCTOR = "INSTRUCTOR",         // 教練問題
  KIDS_SAFETY = "KIDS_SAFETY",       // 兒童與安全
  PAYMENT = "PAYMENT",               // 付款與退款
  GEAR = "GEAR",                     // 裝備租借
  SERVICE = "SERVICE",               // 服務與政策
  GENERAL = "GENERAL"                // 一般詢問
}
```

**與 CRM 標籤對應關係**：
| Intent Type | CRM 標籤 |
|------------|---------|
| ITINERARY | #行程規劃 |
| BOOKING | #預約諮詢, #改期問題 |
| COURSE | #課程問題 |
| INSTRUCTOR | #教練問題 |
| KIDS_SAFETY | #兒童相關, #安全性 |
| PAYMENT | #付款問題, #退款申請 |
| GEAR | #裝備租借 |
| SERVICE | #服務品質, #政策說明 |
| GENERAL | #一般諮詢 |

---

### 1.3 Search Result（搜尋結果）

**用途**：前端顯示搜尋結果的資料結構

```typescript
interface SearchResult {
  // Fuse.js 搜尋結果
  item: FAQItem;                      // 匹配的 FAQ 項目
  score: number;                      // Fuse.js 評分（0-1，越小越好）
  matches?: FuseMatch[];              // 匹配的欄位和位置

  // 增強資訊
  confidence: number;                 // 信心度（0-100，經過轉換的評分）
  highlight_text?: string;            // 高亮顯示的匹配文字
  display_rank: number;               // 顯示排名（1, 2, 3...）
}

interface FuseMatch {
  key: string;                        // 匹配的欄位，例如 "canonical_question"
  value: string;                      // 匹配的文字
  indices: [number, number][];        // 匹配的字元位置
}
```

**信心度計算公式**：
```javascript
confidence = Math.round((1 - score) * 100)
```

**範例**：
```json
{
  "item": { /* FAQItem 物件 */ },
  "score": 0.23,
  "confidence": 77,
  "highlight_text": "預約<mark>教練</mark>的時機",
  "display_rank": 1,
  "matches": [{
    "key": "utterance_patterns",
    "value": "預約教練的時機",
    "indices": [[2, 3]]
  }]
}
```

---

### 1.4 User Interaction Event（使用者互動事件）

**用途**：追蹤使用者在前端的互動行為，用於分析和優化

```typescript
interface UserInteractionEvent {
  event_type: InteractionType;
  timestamp: string;                  // ISO 8601 格式
  session_id: string;                 // 會話 ID（瀏覽器生成的 UUID）

  // 搜尋相關
  query_text?: string;                // 使用者輸入的查詢文字
  query_id?: string;                  // 查詢 ID（後端分配）

  // FAQ 相關
  faq_id?: string;                    // 互動的 FAQ ID
  result_position?: number;           // FAQ 在搜尋結果中的位置（1, 2, 3...）

  // 語言相關
  language: "zh" | "en" | "th";       // 當前界面語言

  // 頁面相關
  page_url: string;                   // 當前頁面 URL
}

enum InteractionType {
  SEARCH = "SEARCH",                  // 執行搜尋
  FAQ_VIEW = "FAQ_VIEW",              // 查看 FAQ 詳情
  FAQ_CLICK = "FAQ_CLICK",            // 點擊 FAQ 卡片
  LINK_CLICK = "LINK_CLICK",          // 點擊內嵌連結
  LANGUAGE_SWITCH = "LANGUAGE_SWITCH", // 切換語言
  COPY_ANSWER = "COPY_ANSWER"         // 複製答案
}
```

**範例**：
```json
{
  "event_type": "FAQ_CLICK",
  "timestamp": "2025-01-15T14:25:30.123Z",
  "session_id": "a7f3d2e1-8c4b-4a9e-b2d1-3f5e6a7b8c9d",
  "query_text": "怎麼預約教練",
  "query_id": "q_20250115_001234",
  "faq_id": "faq.booking.001",
  "result_position": 1,
  "language": "zh",
  "page_url": "https://diy.ski/faq-search.html"
}
```

---

## 2. Backend Data Models

### 2.1 Search Query（搜尋查詢記錄）

**用途**：後端 SQLite 資料庫記錄搜尋查詢的詳細資訊

**資料庫表格**：`search_queries`

```sql
CREATE TABLE search_queries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query_id TEXT UNIQUE NOT NULL,          -- 查詢 ID（格式：q_YYYYMMDD_HHMMSS）
  query_text TEXT NOT NULL,               -- 使用者輸入的查詢文字
  query_language TEXT,                    -- 查詢語言（zh/en/th）

  -- Intent 偵測結果
  detected_intent TEXT,                   -- 偵測到的意圖（IntentType）
  intent_confidence REAL,                 -- Intent 信心度（0-100）

  -- Slot 擷取結果（JSON 字串）
  extracted_slots TEXT,                   -- JSON 格式，例如 '{"resort":"NOZAWA","date":"2025-02-15"}'

  -- 搜尋結果
  results_count INTEGER NOT NULL,         -- 搜尋結果數量
  top_result_id TEXT,                     -- 第一名結果的 FAQ ID
  top_result_score REAL,                  -- 第一名結果的評分

  -- 效能指標
  response_time_ms INTEGER NOT NULL,      -- 回應時間（毫秒）

  -- LLM 增強（若有使用）
  llm_used BOOLEAN DEFAULT 0,             -- 是否使用 LLM 增強
  llm_cost REAL,                          -- LLM API 成本（美元）

  -- 元數據
  session_id TEXT,                        -- 會話 ID
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_agent TEXT                         -- 使用者瀏覽器 UA
);

CREATE INDEX idx_query_timestamp ON search_queries(timestamp);
CREATE INDEX idx_query_intent ON search_queries(detected_intent);
CREATE INDEX idx_query_session ON search_queries(session_id);
```

**TypeScript 對應介面**：
```typescript
interface SearchQuery {
  id: number;
  query_id: string;
  query_text: string;
  query_language: "zh" | "en" | "th";
  detected_intent: IntentType | null;
  intent_confidence: number | null;
  extracted_slots: Record<string, string> | null;
  results_count: number;
  top_result_id: string | null;
  top_result_score: number | null;
  response_time_ms: number;
  llm_used: boolean;
  llm_cost: number | null;
  session_id: string;
  timestamp: string;
  user_agent: string;
}
```

---

### 2.2 FAQ View（FAQ 查看記錄）

**用途**：記錄 FAQ 在搜尋結果中的曝光和點擊行為

**資料庫表格**：`faq_views`

```sql
CREATE TABLE faq_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  view_id TEXT UNIQUE,                    -- 事件 ID（可選）
  faq_id TEXT NOT NULL,                   -- FAQ ID
  query_id TEXT,                          -- 關聯查詢 ID（可為 UUID）
  query_text TEXT,                        -- 使用者原始查詢文字
  position INTEGER DEFAULT 0,             -- 在搜尋結果中的位置（1, 2, 3...）
  source TEXT,                            -- 來源（search_results/hot_list/...）
  clicked BOOLEAN DEFAULT 0,              -- 是否被點擊
  time_to_click_ms INTEGER,               -- 從顯示到點擊的時間
  language TEXT DEFAULT 'zh',             -- 語系
  session_id TEXT,                        -- 前端 session
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_faq_views_faq_id ON faq_views(faq_id);
CREATE INDEX idx_faq_views_language ON faq_views(language);
CREATE INDEX idx_faq_views_source ON faq_views(source);
```

**用途範例**：
- 計算 FAQ 的點擊率（CTR）
- 分析搜尋結果排名對點擊的影響
- 優化搜尋排序演算法

---

### 2.3 Intent Detection Result（Intent 偵測結果）

**用途**：Rule Engine 和 LLM 的 Intent 偵測結果

```typescript
interface IntentDetectionResult {
  // 基本資訊
  query_text: string;
  detected_intent: IntentType;
  confidence: number;                     // 0-100

  // Rule Engine 結果
  rule_engine: {
    intent: IntentType;
    score: number;                        // 總分（0-100）
    breakdown: {
      intent_match: number;               // Intent 匹配度（0-40）
      keyword_match: number;              // 關鍵字匹配度（0-30）
      slot_match: number;                 // Slot 匹配度（0-20）
      historical_ctr: number;             // 歷史點擊率（0-10）
    };
    matched_keywords: string[];           // 匹配到的關鍵字
  };

  // LLM 增強結果（若有使用）
  llm_enhancement?: {
    intent: IntentType;
    confidence: number;
    reasoning: string;                    // LLM 推理過程
    model: string;                        // 使用的模型，例如 "claude-3-5-sonnet-20241022"
    token_usage: {
      input: number;
      output: number;
    };
    latency_ms: number;
  };

  // 最終決策
  final_decision: {
    method: "rule_engine" | "llm" | "hybrid";
    intent: IntentType;
    confidence: number;
  };
}
```

**決策邏輯**：
```javascript
if (rule_engine.score >= 75) {
  // 高信心度，使用 Rule Engine 結果
  final_decision = { method: "rule_engine", intent: rule_engine.intent, confidence: rule_engine.score };
} else {
  // 低信心度，使用 LLM 增強
  llm_result = await callLLMAPI(query_text, topFAQs);
  final_decision = { method: "llm", intent: llm_result.intent, confidence: llm_result.confidence };
}
```

---

### 2.4 Slot Extraction Result（Slot 擷取結果）

**用途**：從查詢文字中擷取結構化資訊

```typescript
interface SlotExtractionResult {
  query_text: string;

  // 擷取的 Slots
  slots: {
    resort?: ResortSlot;                  // 雪場資訊
    date?: DateSlot;                      // 日期資訊
    people?: PeopleSlot;                  // 人數資訊
    board_type?: "SKI" | "SNOWBOARD";     // 板型
    child_age?: number[];                 // 兒童年齡
  };

  // 信心度
  confidence: Record<string, number>;     // 每個 Slot 的信心度（0-100）

  // 擷取方法
  extraction_method: Record<string, string>; // 例如 { "resort": "regex", "date": "fuzzy_match" }
}

interface ResortSlot {
  code: string;                           // 雪場代碼，例如 "NOZAWA"
  name_cn: string;                        // 中文名稱
  name_en: string;                        // 英文名稱
  name_jp: string;                        // 日文名稱
  matched_text: string;                   // 原始匹配文字，例如 "野澤"
}

interface DateSlot {
  date: string;                           // ISO 8601 格式，例如 "2025-02-15"
  date_range?: {
    start: string;
    end: string;
  };
  matched_text: string;                   // 原始匹配文字，例如 "2月15日"
}

interface PeopleSlot {
  adults: number;
  children: number;
  matched_text: string;                   // 原始匹配文字，例如 "2大1小"
}
```

**範例**：
```json
{
  "query_text": "2月15日去野澤，2大1小需要什麼裝備",
  "slots": {
    "resort": {
      "code": "NOZAWA",
      "name_cn": "野澤溫泉",
      "name_en": "Nozawa Onsen",
      "name_jp": "野沢温泉",
      "matched_text": "野澤"
    },
    "date": {
      "date": "2025-02-15",
      "matched_text": "2月15日"
    },
    "people": {
      "adults": 2,
      "children": 1,
      "matched_text": "2大1小"
    }
  },
  "confidence": {
    "resort": 95,
    "date": 88,
    "people": 100
  },
  "extraction_method": {
    "resort": "regex",
    "date": "regex",
    "people": "regex"
  }
}
```

---

## 3. Integration Data Models

### 3.1 CRM Inquiry Log（CRM 客戶詢問日誌）

**用途**：JSONL 格式的日誌，用於與現有 CRM 系統整合

**檔案路徑**：`crm/04_郵件系統與客戶數據/customer_inquiries.jsonl`

**格式**：每行一個 JSON 物件

```typescript
interface CRMInquiryLog {
  // 查詢基本資訊
  timestamp: string;                      // ISO 8601 格式
  query_id: string;                       // 查詢 ID
  query_text: string;                     // 使用者查詢文字
  query_source: "faq_search" | "tagger"; // 查詢來源

  // Intent 和 Slot
  detected_intent: IntentType;
  intent_confidence: number;
  extracted_slots: Record<string, any>;

  // FAQ 推薦結果
  recommended_faqs: Array<{
    faq_id: string;
    confidence: number;
    rank: number;
  }>;

  // CRM 標籤
  generated_tags: string[];               // 自動生成的 CRM 標籤

  // 使用者反饋（若有）
  user_feedback?: {
    helpful: boolean;                     // 是否有幫助
    selected_faq_id?: string;             // 使用者選擇的 FAQ
    comment?: string;                     // 使用者評論
  };
}
```

**範例（JSONL 行）**：
```json
{"timestamp":"2025-01-15T14:30:00Z","query_id":"q_20250115_001234","query_text":"去野澤要準備什麼裝備","query_source":"faq_search","detected_intent":"GEAR","intent_confidence":92,"extracted_slots":{"resort":"NOZAWA"},"recommended_faqs":[{"faq_id":"faq.gear.001","confidence":88,"rank":1}],"generated_tags":["#裝備租借","#野澤溫泉"]}
```

---

### 3.2 CRM Tag Rule（CRM 標籤規則）

**用途**：定義 Intent 和關鍵字如何對應到 CRM 標籤

**檔案路徑**：`crm/05_行銷與AI工具/crm_tag_rules.json`

```typescript
interface CRMTagRule {
  version: string;                        // 規則版本，例如 "2.0.0"
  last_updated: string;                   // 最後更新時間

  // Intent 對應規則
  intent_tag_mapping: Record<IntentType, string[]>;

  // 關鍵字對應規則
  keyword_tag_rules: Array<{
    keywords: string[];                   // 關鍵字清單
    tag: string;                          // 對應的標籤
    priority: number;                     // 優先級（1-10）
  }>;

  // 條件標籤規則（基於 Slot 組合）
  conditional_tag_rules: Array<{
    condition: string;                    // JavaScript 表達式，例如 "slots.people.children > 0"
    tag: string;
    description: string;
  }>;
}
```

**範例**：
```json
{
  "version": "2.0.0",
  "last_updated": "2025-01-15",
  "intent_tag_mapping": {
    "ITINERARY": ["#行程規劃"],
    "BOOKING": ["#預約諮詢"],
    "KIDS_SAFETY": ["#兒童相關", "#安全性"]
  },
  "keyword_tag_rules": [
    {
      "keywords": ["野澤", "野沢", "nozawa"],
      "tag": "#野澤溫泉",
      "priority": 8
    },
    {
      "keywords": ["輕井澤", "karuizawa"],
      "tag": "#輕井澤",
      "priority": 8
    }
  ],
  "conditional_tag_rules": [
    {
      "condition": "slots.people?.children > 0",
      "tag": "#兒童相關",
      "description": "有兒童時自動加上兒童相關標籤"
    },
    {
      "condition": "slots.date && isWithinDays(slots.date, 7)",
      "tag": "#急件",
      "description": "7 天內的行程標記為急件"
    }
  ]
}
```

---

### 3.3 FAQ Analytics Event（FAQ 分析事件）

**用途**：傳送到後端 API 的分析事件格式

**API 端點**：`POST /api/v1/analytics/events`

```typescript
interface FAQAnalyticsEvent {
  event_type: AnalyticsEventType;
  timestamp: string;                      // ISO 8601 格式（前端生成）
  session_id: string;                     // 會話 ID

  // 事件詳情（根據 event_type 不同而不同）
  event_data: Record<string, any>;

  // 使用者環境
  user_context: {
    language: "zh" | "en" | "th";
    user_agent: string;
    screen_width: number;
    screen_height: number;
    referrer?: string;
  };
}

enum AnalyticsEventType {
  SEARCH_EXECUTED = "SEARCH_EXECUTED",
  FAQ_VIEWED = "FAQ_VIEWED",
  FAQ_CLICKED = "FAQ_CLICKED",
  LINK_CLICKED = "LINK_CLICKED",
  COPY_PERFORMED = "COPY_PERFORMED",
  LANGUAGE_SWITCHED = "LANGUAGE_SWITCHED",
  ERROR_OCCURRED = "ERROR_OCCURRED"
}
```

**範例（SEARCH_EXECUTED 事件）**：
```json
{
  "event_type": "SEARCH_EXECUTED",
  "timestamp": "2025-01-15T14:30:15.234Z",
  "session_id": "a7f3d2e1-8c4b-4a9e-b2d1-3f5e6a7b8c9d",
  "event_data": {
    "query_text": "去野澤要準備什麼",
    "results_count": 5,
    "search_time_ms": 45,
    "top_result_confidence": 88
  },
  "user_context": {
    "language": "zh",
    "user_agent": "Mozilla/5.0 ...",
    "screen_width": 1920,
    "screen_height": 1080,
    "referrer": "https://diy.ski/"
  }
}
```

---

## 4. Validation Rules（驗證規則）

### 4.1 FAQ Item 驗證規則

**JSON Schema 路徑**：`contracts/faq-schema.json`

**必填欄位**：
- `id`, `intent`, `canonical_question`, `utterance_patterns`, `answer_template.text`, `keywords`, `crm_tags`, `metadata`

**資料完整性檢查**：
1. **唯一性檢查**：
   - 所有 FAQ ID 必須唯一
   - 不得有重複的 canonical_question

2. **參照完整性**：
   - `related_faq_ids` 中的 ID 必須存在於 FAQ 資料庫中
   - `links_inline` 中的 token 必須在 `meta.link_tokens` 中定義

3. **語言一致性**：
   - 若提供 `canonical_question_en`，則 `answer_template.text_en` 也應提供
   - 語言欄位不得為空字串

4. **CRM 標籤格式**：
   - 所有標籤必須以 `#` 開頭
   - 標籤應在 CRM 標籤規則中有定義

### 4.2 Slot 擷取驗證規則

**日期格式**：
- 必須為 ISO 8601 格式 (`YYYY-MM-DD`)
- 日期不得早於今天
- 日期不得晚於今天 + 365 天

**雪場代碼**：
- 必須在支援的雪場清單中（40+ 個雪場）
- 大寫字母，例如 "NOZAWA", "KARUIZAWA"

**人數**：
- 成人數：1-20
- 兒童數：0-10
- 總人數不得超過 20

### 4.3 API 回應驗證規則

**成功回應格式**：
```typescript
interface APISuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    query_id?: string;
    response_time_ms?: number;
  };
}
```

**錯誤回應格式**：
```typescript
interface APIErrorResponse {
  success: false;
  error: {
    code: string;                       // 錯誤代碼，例如 "INVALID_QUERY"
    message: string;                    // 使用者友善的錯誤訊息
    details?: any;                      // 詳細錯誤資訊（開發模式）
  };
  meta: {
    timestamp: string;
    query_id?: string;
  };
}
```

---

## 5. Data Migration（資料遷移）

### 5.1 從現有 faq_kb.phase0a.json 遷移

**步驟**：
1. **備份現有資料**：
   ```bash
   cp faq_kb.phase0a.json faq_kb.backup.$(date +%Y%m%d).json
   ```

2. **執行結構驗證**：
   ```bash
   cd crm/06_測試與開發工具
   make validate
   ```

3. **新增多語言欄位**（手動或腳本）：
   - 為每個 FAQ 新增 `canonical_question_en`, `canonical_question_th`
   - 新增 `answer_template.text_en`, `answer_template.text_th`

4. **新增元數據欄位**：
   - 為每個 FAQ 新增 `metadata` 物件（自動生成 `created_at`, `updated_at`, `version`）

5. **驗證遷移結果**：
   ```bash
   node scripts/validate-faq-schema.js data/faq_kb.phase0a.json contracts/faq-schema.json
   ```

### 5.2 從現有 CRM 日誌遷移

**現有格式**：`customer_inquiries.jsonl`（可能缺少某些欄位）

**遷移腳本**：`scripts/migrate-crm-logs.js`

**遷移邏輯**：
- 補充缺少的 `query_id`（自動生成）
- 補充缺少的 `intent_confidence`（設為預設值 0）
- 保留所有現有欄位（向後相容）

---

## 6. Performance Considerations（效能考量）

### 6.1 資料大小估算

**單一 FAQ 項目**：~2KB（含多語言）
**127 個 FAQ**：~254KB（未壓縮）
**500 個 FAQ**：~1MB（未壓縮）
**Gzip 壓縮後**：~30%（500 個 FAQ ~300KB）

**建議**：
- 使用 HTTP 壓縮（gzip）傳輸 faq_kb.phase0a.json
- 前端使用 sessionStorage 快取（5MB 限制足夠）

### 6.2 搜尋效能

**Fuse.js 效能基準**：
- 127 個 FAQ：<10ms（現有規模）
- 500 個 FAQ：<50ms（未來規模）
- 1000 個 FAQ：~100ms（極限情況）

**優化策略**：
- 前端防抖（300ms）減少搜尋頻率
- 限制查詢長度（最多 30 字元）
- 使用 Web Worker 進行搜尋（若 FAQ > 500）

### 6.3 SQLite 資料庫大小估算

**查詢記錄**：~500 bytes/筆
**FAQ 查看記錄**：~200 bytes/筆
**每日估算**（假設 100 次查詢/日）：
- 查詢記錄：100 × 500 bytes = 50KB/日
- FAQ 查看：100 × 5 × 200 bytes = 100KB/日
- **總計**：~150KB/日 ≈ 4.5MB/月 ≈ 54MB/年

**建議**：
- 定期歸檔舊資料（>90 天）
- 使用 SQLite VACUUM 優化資料庫大小

---

## 7. Schema Versioning（結構版本控制）

### 7.1 版本策略

**語義化版本控制**：`MAJOR.MINOR.PATCH`

- **MAJOR**：破壞性變更（不相容的欄位移除或型別變更）
- **MINOR**：新增欄位（向後相容）
- **PATCH**：文件修正、驗證規則調整（不影響資料結構）

**當前版本**：`1.0.0`

### 7.2 變更管理

**Schema 變更流程**：
1. 更新 `contracts/faq-schema.json`
2. 更新 `data-model.md`（本文檔）
3. 更新驗證腳本 `scripts/validate-faq-schema.js`
4. 撰寫遷移腳本（若需要）
5. 更新 CHANGELOG

**向後相容性承諾**：
- MINOR 版本變更保證向後相容
- MAJOR 版本變更提供遷移腳本和至少 30 天過渡期

---

## Appendix A: 完整範例資料

### A.1 完整 faq_kb.phase0a.json 範例（簡化版）

```json
{
  "meta": {
    "version": "1.0.0",
    "last_updated": "2025-01-15T10:00:00Z",
    "total_items": 127,
    "link_tokens": {
      "LINK_SCHEDULE": "https://diy.ski/schedule",
      "LINK_BOOKING": "https://diy.ski/booking",
      "LINK_POLICY": "https://diy.ski/policy"
    },
    "policy_notes": [
      "NO_QUOTE",
      "NO_MANUAL_MATCH"
    ]
  },
  "items": [
    {
      "id": "faq.itinerary.001",
      "intent": "ITINERARY",
      "canonical_question": "應該先訂好機票住宿，還是先預約滑雪教練？",
      "canonical_question_en": "Should I book flights and accommodation first, or reserve a ski instructor first?",
      "canonical_question_th": "ควรจองตั๋วเครื่องบินและที่พักก่อน หรือจองโค้ชสกีก่อน?",
      "utterance_patterns": [
        "要先訂機票還是教練",
        "預約教練的時機",
        "什麼時候訂教練比較好",
        "機票和教練哪個先訂"
      ],
      "answer_template": {
        "text": "建議先確認教練檔期，因為熱門時段（如春節）教練很快滿檔。確認教練後再訂機票住宿，可避免行程衝突。詳情請參考 [教練檔期查詢](LINK_SCHEDULE)。",
        "text_en": "We recommend checking coach availability first, as popular periods (like Lunar New Year) fill up quickly. Book flights and accommodation after confirming your coach to avoid schedule conflicts. See [Coach Schedule](LINK_SCHEDULE).",
        "text_th": "แนะนำให้ตรวจสอบความว่างของโค้ชก่อน เพราะช่วงยอดนิยม (เช่น ตรุษจีน) เต็มเร็วมาก จองตั๋วและที่พักหลังจากยืนยันโค้ชเพื่อหลีกเลี่ยงตารางเวลาที่ขัดแย้ง ดู [ตารางเวลาโค้ช](LINK_SCHEDULE)",
        "postscript": "提醒：春節期間建議提前 2-3 個月預約。",
        "postscript_en": "Reminder: For Lunar New Year, book 2-3 months in advance.",
        "postscript_th": "เตือน: สำหรับตรุษจีน ควรจอง 2-3 เดือนล่วงหน้า",
        "links_inline": ["LINK_SCHEDULE"]
      },
      "keywords": ["機票", "住宿", "教練", "預約", "行程", "檔期"],
      "related_faq_ids": ["faq.booking.001", "faq.itinerary.005"],
      "crm_tags": ["#行程規劃", "#教練問題"],
      "metadata": {
        "created_at": "2025-01-10T08:00:00Z",
        "updated_at": "2025-01-15T14:30:00Z",
        "version": 2,
        "status": "active",
        "priority": 8
      }
    }
  ]
}
```

### A.2 完整 search_queries 表格範例資料

```sql
INSERT INTO search_queries VALUES (
  1,
  'q_20250115_143000',
  '去野澤要準備什麼裝備',
  'zh',
  'GEAR',
  92.5,
  '{"resort":"NOZAWA"}',
  5,
  'faq.gear.001',
  0.12,
  45,
  0,
  NULL,
  'a7f3d2e1-8c4b-4a9e-b2d1-3f5e6a7b8c9d',
  '2025-01-15 14:30:00',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
);
```

---

**文檔版本**：1.0.0
**最後更新**：2025-10-13
**維護者**：DIY Ski CRM Team
**相關文檔**：[spec.md](./spec.md) | [plan.md](./plan.md) | [research.md](./research.md) | [contracts/faq-schema.json](./contracts/faq-schema.json)
