# 📋 FAQ JSON 標準格式指南

**版本**: v1.0
**日期**: 2025-11-05
**用途**: 規定新增 FAQ 的 JSON 格式標準

---

## 🎯 核心原則

### 為什麼採用此格式？

1. ✅ **準確性優先** - 英泰文翻譯由人工審核，不用機器自動生成
2. ✅ **性能最優** - 前端初始化時一次載入，後續零延遲切換語言
3. ✅ **成本最低** - 無需每次都調用翻譯 API
4. ✅ **易於維護** - 翻譯版本清晰，版本控制簡單

### 多語言翻譯策略（方案 B）

```
中文原文（source language）
    ↓
人工翻譯成英文（reviewed）
    ↓
人工翻譯成泰文（reviewed）
    ↓
存入 JSON 的 `*_translations` 欄位
    ↓
前端初始化時快取所有翻譯
    ↓
用戶切換語言時直接從快取讀取（零延遲）
```

---

## 📝 完整 FAQ JSON 格式

以 `faq.itinerary.001` 為例：

```json
{
  "id": "faq.itinerary.001",
  "intent": "ITINERARY",
  "section": "行程規劃與周邊",
  "canonical_question": "應該先訂好機票住宿，還是先預約滑雪教練？",
  "canonical_question_translations": {
    "en": "Should I book flights and accommodation first, or should I book a ski instructor first?",
    "th": "ควรจองตั๋วเครื่องบินและที่พักก่อน หรือจองครูสอนสกีล่วงหน้าก่อน?"
  },

  "utterance_patterns": [
    "應該先訂好機票住宿，還是先預約滑雪教練",
    "先訂教練還是先訂機票",
    "先訂教練還是先訂住宿",
    "要先預約教練嗎",
    "機票住宿要先訂嗎",
    "先訂教練比較保險嗎",
    "要先預約教練",
    "機票住宿要先訂",
    "先訂教練比較保險"
  ],

  "utterance_patterns_translations": {
    "en": [
      "Should I book flights and accommodation first, or book a ski instructor first?",
      "Should I book a coach first or a flight first?",
      "Should I book a coach first or accommodation first?",
      "Do I need to book a coach in advance?",
      "Should I book flights and accommodation first?",
      "Is it safer to book a coach first?",
      "I need to book a coach in advance.",
      "Flights and accommodation should be booked first.",
      "It's safer to book a coach first."
    ],
    "th": [
      "ควรจองตั๋วเครื่องบินกับที่พักก่อน หรือจองครูสอนสกีดี",
      "จองโค้ชก่อนหรือจองตั๋วเครื่องบินก่อน",
      "จองโค้ชก่อนหรือจองที่พักก่อน",
      "จำเป็นต้องจองโค้ชล่วงหน้าหรือไม่",
      "ควรจองตั๋วเครื่องบินและที่พักล่วงหน้าหรือไม่",
      "จองโค้ชก่อนจะชัวร์กว่าไหม",
      "ต้องจองโค้ชก่อน",
      "ต้องจองตั๋วเครื่องบินและที่พักล่วงหน้า",
      "จองโค้ชล่วงหน้าจะปลอดภัยกว่า"
    ]
  },

  "keywords": [
    "預約教練",
    "行程規劃",
    "訂機票",
    "訂住宿",
    "旺季"
  ],

  "keywords_translations": {
    "en": [
      "Book instructor",
      "Itinerary planning",
      "Book flights",
      "Book accommodation",
      "Peak season"
    ],
    "th": [
      "จองครูสอน",
      "วางแผนการเดินทาง",
      "จองตั๋วเครื่องบิน",
      "จองที่พัก",
      "ฤดูท่องเที่ยว"
    ]
  },

  "answer_template": {
    "summary": "我們強烈建議您「先預約教練，再訂機票住宿」。尤其是在旺季，優質的中文教練非常搶手，時常比機票或住宿更早被預約一空。",
    "details": "先確認預約到您想要的教練與時段後，再進行後續的旅遊安排，行程會比較有保障。",
    "tip": "旺季期間建議提早 2-3 個月預約，以確保能選擇理想的教練與時段。",
    "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
    "text_translations": {
      "en": "We strongly recommend that you \"book your coach first, then your flights and accommodation.\" Especially during peak season, high-quality Chinese-speaking coaches are in high demand and are often fully booked even before flights or accommodation. Please confirm that you have booked your desired coach and time slot before making further travel arrangements; this will better secure your itinerary.",
      "th": "เราขอแนะนำอย่างยิ่งให้คุณ \"จองโค้ชก่อน แล้วค่อยจองตั๋วเครื่องบินและที่พัก\" โดยเฉพาะอย่างยิ่งในช่วงฤดูท่องเที่ยว โค้ชภาษาจีนที่มีคุณภาพเป็นที่ต้องการอย่างมาก และมักจะถูกจองเต็มเร็วกว่าตั๋วเครื่องบินหรือที่พัก โปรดยืนยันการจองโค้ชและช่วงเวลาที่คุณต้องการก่อน จากนั้นจึงค่อยจัดเตรียมการเดินทางในภายหลัง เพื่อให้แผนการเดินทางของคุณมีความปลอดภัยมากขึ้น"
    },
    "postscript_translations": {
      "en": "For more information and the latest availability, please refer to the reservation system.",
      "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดอ้างอิงจากระบบการจอง"
    }
  },

  "crm_tags": [
    "#行程規劃",
    "#預約"
  ],

  "crm_tags_translations": {
    "en": [
      "#Itinerary Planning",
      "#Booking"
    ],
    "th": [
      "#วางแผนการเดินทาง",
      "#การจอง"
    ]
  },

  "hot": true,
  "required_slots": [],
  "policy_flags": ["NO_MANUAL_MATCH"],
  "links": ["{{LINK_SCHEDULE}}", "{{LINK_ARTICLES}}"],

  "metadata": {
    "content_version": 1,
    "source_language": "zh",
    "last_updated": "2025-11-05T00:00:00.000Z"
  },

  "translation_status": {
    "zh": {
      "status": "source",
      "last_synced_version": 1,
      "last_updated": "2025-11-05T00:00:00.000Z"
    },
    "en": {
      "status": "complete",
      "translator": "human_reviewed",
      "last_synced_version": 1,
      "last_updated": "2025-11-05T00:00:00.000Z"
    },
    "th": {
      "status": "complete",
      "translator": "human_reviewed",
      "last_synced_version": 1,
      "last_updated": "2025-11-05T00:00:00.000Z"
    }
  }
}
```

---

## 📋 欄位說明

### 基礎欄位

| 欄位 | 型態 | 必需 | 說明 |
|------|------|------|------|
| `id` | String | ✅ | FAQ 唯一識別碼，格式: `faq.{category}.{number}` |
| `intent` | String | ✅ | 意圖分類（ITINERARY, INSTRUCTOR, BOOKING 等） |
| `section` | String | ✅ | 分類名稱（中文） |
| `section_translations` | Object | ✅ | 分類名稱翻譯 `{en, th}` |
| `hot` | Boolean | ❌ | 是否為熱門問題（預設 false） |

### 問題欄位

| 欄位 | 型態 | 必需 | 說明 |
|------|------|------|------|
| `canonical_question` | String | ✅ | 標準問題（中文，長度 10-30 字） |
| `canonical_question_translations` | Object | ✅ | 問題翻譯 `{en, th}` |
| `utterance_patterns` | Array | ✅ | 變體問法（中文，5-10 個） |
| `utterance_patterns_translations` | Object | ✅ | **變體問法翻譯** `{en: [...], th: [...]}` |

### 關鍵字與變體欄位

| 欄位 | 型態 | 必需 | 說明 |
|------|------|------|------|
| `utterance_patterns` | Array | ✅ | 變體問法（中文，5-10 個） |
| `utterance_patterns_translations` | Object | ✅ | **變體問法翻譯** `{en: [...], th: [...]}` (數量必須與 utterance_patterns 相同) |
| `keywords` | Array | ✅ | 關鍵字（中文，3-5 個） |
| `keywords_translations` | Object | ✅ | 關鍵字翻譯 `{en: [...], th: [...]}` (數量必須與 keywords 相同) |

### CRM 標籤欄位

| 欄位 | 型態 | 必需 | 說明 |
|------|------|------|------|
| `crm_tags` | Array | ✅ | CRM 標籤（中文，如 `#行程規劃` `#預約`） |
| `crm_tags_translations` | Object | ✅ | **CRM 標籤翻譯** `{en: [...], th: [...]}` (數量必須與 crm_tags 相同) |

### 答案欄位

| 欄位 | 型態 | 必需 | 說明 |
|------|------|------|------|
| `answer_template.summary` | String | ✅ | 答案摘要（40-80 字，核心內容） |
| `answer_template.details` | String | ✅ | 詳細說明（補充資訊） |
| `answer_template.tip` | String | ❌ | 貼心提示 |
| `answer_template.postscript` | String | ❌ | 後記/免責聲明 |
| `answer_template.*_translations` | Object | ✅ | 所有答案部分的翻譯 `{en, th}` |

### 元數據欄位

| 欄位 | 型態 | 必需 | 說明 |
|------|------|------|------|
| `metadata.content_version` | Number | ✅ | 內容版本（從 1 開始） |
| `metadata.source_language` | String | ✅ | 源語言（固定 "zh"） |
| `metadata.last_updated` | String | ✅ | 最後更新時間（ISO 8601） |
| `translation_status` | Object | ✅ | 翻譯狀態（`{zh, en, th}` 各含 status, translator） |

### 其他欄位

| 欄位 | 型態 | 必需 | 說明 |
|------|------|------|------|
| `required_slots` | Array | ✅ | 必需的 NER slot（通常為空） |
| `policy_flags` | Array | ❌ | 政策標記（如 NO_MANUAL_MATCH） |
| `crm_tags` | Array | ❌ | CRM 標籤（以 # 開頭） |
| `links` | Array | ❌ | 動態連結（如 `{{LINK_SCHEDULE}}`） |

---

## ✅ 檢查清單

建立新 FAQ 時，請確保：

- [ ] **id**: 格式正確 (`faq.{category}.{number}`)
- [ ] **中文內容**:
  - [ ] 問題是完整問句（不是單詞）
  - [ ] 長度 10-30 字
  - [ ] 有 3-5 個關鍵字
  - [ ] 答案摘要 40-80 字
  - [ ] 有至少 5 個變體問法

- [ ] **變體問法翻譯**:
  - [ ] utterance_patterns 有對應的 utterance_patterns_translations
  - [ ] 英文翻譯自然（非逐字翻譯）
  - [ ] 泰文翻譯正確
  - [ ] 數量完全相同（逐一對應）

- [ ] **關鍵字翻譯**:
  - [ ] keywords 有對應的 keywords_translations
  - [ ] 英文翻譯自然（非逐字翻譯）
  - [ ] 泰文翻譯正確
  - [ ] 數量完全相同

- [ ] **CRM 標籤翻譯**:
  - [ ] crm_tags 有對應的 crm_tags_translations
  - [ ] 英文標籤自然（保留 # 符號）
  - [ ] 泰文標籤正確（保留 # 符號）
  - [ ] 數量完全相同

- [ ] **英文翻譯**:
  - [ ] 由人工審核（不是機器翻譯）
  - [ ] 語法自然
  - [ ] utterance_patterns_translations 對應個數

- [ ] **泰文翻譯**:
  - [ ] 由人工審核（最好是泰文母語者）
  - [ ] 語法自然
  - [ ] utterance_patterns_translations 對應個數

- [ ] **metadata**:
  - [ ] content_version 從 1 開始
  - [ ] last_updated 是當前日期
  - [ ] translation_status 標記為 "complete" 並註明 "human_reviewed"

---

## 🔗 超連結使用指南

### 什麼是超連結？

在 FAQ 答案中引用系統內的重要連結（預約系統、教練介紹、客服信箱等），幫助用戶快速找到相關資訊。

### 語法

使用 `[LINK:TOKEN|標籤]` 格式：

```
[LINK:LINK_SCHEDULE|預約系統]
[LINK:LINK_SERVICE_EMAIL|客服信箱]
[LINK:LINK_INSTRUCTORS|教練介紹]
```

### 前端自動轉換

前端會自動將上述語法轉換為 HTML 超連結：

```html
<!-- 在 FAQ 答案中 -->
"更多資訊請參考 [LINK:LINK_SCHEDULE|預約系統]"

<!-- 前端會自動轉換為 -->
更多資訊請參考 <a href="https://booking.diy.ski/schedule" target="_blank">預約系統 🔗</a>
```

### 可用的連結 Token

| Token | 中文標籤 | 連結目標 | 用途 |
|-------|---------|---------|------|
| LINK_SCHEDULE | 預約系統 | https://booking.diy.ski/schedule | 課程預約 |
| LINK_INSTRUCTORS | 教練介紹 | https://diy.ski/instructorList.php | 查詢教練 |
| LINK_APPLY_SCHEDULE | 申請課程 | https://booking.diy.ski/apply-schedule | 申請自訂課程 |
| LINK_INSURANCE | 保險資訊 | https://diy.ski/insurance_s.php | 保險方案 |
| LINK_ARTICLES | 文章資源 | https://diy.ski/articleList.php | 知識文章 |
| LINK_ORDER_LIST | 訂單查詢 | https://booking.diy.ski/order/list | 查詢訂單 |
| LINK_SERVICE_EMAIL | 客服信箱 | mailto:service@diy.ski | 聯繫客服 |
| LINK_FACEBOOK | Facebook | https://www.facebook.com/skidiy | 社群媒體 |

💡 **詳細資訊**：查看 `docs/LINK_MANAGEMENT.md`

### 使用範例

**範例 1：基本連結**

```json
{
  "answer_template": {
    "summary": "我們提供多名認證教練。",
    "details": "如需了解教練資訊，請參考 [LINK:LINK_INSTRUCTORS|教練介紹頁面]。"
  }
}
```

輸出：
```
如需了解教練資訊，請參考 <a href="https://diy.ski/instructorList.php" target="_blank">教練介紹頁面 🔗</a>。
```

**範例 2：多個連結**

```json
{
  "answer_template": {
    "summary": "預約流程分三步。",
    "details": "1. 前往 [LINK:LINK_SCHEDULE|預約系統]\n2. 選擇教練和日期\n3. 按 [LINK:LINK_SERVICE_EMAIL|聯繫客服] 確認細節"
  }
}
```

輸出：
```
1. 前往 <a href="...">預約系統 🔗</a>
2. 選擇教練和日期
3. 按 <a href="mailto:...">✉️ 聯繫客服</a> 確認細節
```

**範例 3：郵件連結**

```json
{
  "answer_template": {
    "details": "如有任何問題，歡迎 [LINK:LINK_SERVICE_EMAIL|聯繫我們]。"
  }
}
```

### 最佳實踐

✅ **做**：
- ✅ 在答案中使用超連結引導用戶
- ✅ 使用簡潔、有意義的標籤（如「預約系統」而非「點擊這裡」）
- ✅ 限制每個答案最多 3-4 個連結
- ✅ 確保連結與答案內容相關

❌ **不做**：
- ❌ 手動輸入 URL（應使用 TOKEN）
- ❌ 使用模糊的標籤（「更多資訊」）
- ❌ 過多連結導致答案混亂
- ❌ 新增連結而不在 link_registry.json 中定義

### 新增自訂連結

如需新增連結，請：

1. 編輯 `zeabur_backend/data/link_registry.json`
2. 在 `faq` 物件中添加新項目
3. 在 FAQ 答案中使用新的 TOKEN

詳見 `docs/LINK_MANAGEMENT.md` 第 8 節「維護指南」

---

## 📋 常見錯誤與修正

### ❌ 錯誤 1: utterance_patterns_translations 數量不符

```json
// ❌ 錯誤
"utterance_patterns": [
  "問題 1", "問題 2", "問題 3"  // 3 個
],
"utterance_patterns_translations": {
  "en": ["Answer 1", "Answer 2"],  // 只有 2 個！
  "th": [...]
}

// ✅ 正確
"utterance_patterns": [
  "問題 1", "問題 2", "問題 3"  // 3 個
],
"utterance_patterns_translations": {
  "en": ["Answer 1", "Answer 2", "Answer 3"],  // 3 個
  "th": [...]
}
```

### ❌ 錯誤 2: 泰文有打字錯誤

```json
// ❌ 錯誤
"th": [
  "จองโค้ช,",  // ⚠️ 有逗號！
  "วางแผนการ เดินทาง"  // ⚠️ 中間有空格
]

// ✅ 正確
"th": [
  "จองโค้ช",
  "วางแผนการเดินทาง"
]
```

### ❌ 錯誤 3: 機器翻譯品質

```json
// ❌ 低質量
"en": "Should I book a flight before a coach or a coach before a flight?"
// 這改變了原意，變成了 "or" 而非 "vs"

// ✅ 高質量
"en": "Should I book flights and accommodation first, or should I book a ski instructor first?"
// 保留了原文的結構和意思
```

### ❌ 錯誤 4: 遺漏 keywords_translations（我之前的錯誤！）

```json
// ❌ 錯誤 (不完整)
{
  "keywords": [
    "預約教練",
    "行程規劃",
    "訂機票"
  ]
  // keywords_translations 遺漏了！
}

// ✅ 正確
{
  "keywords": [
    "預約教練",
    "行程規劃",
    "訂機票"
  ],
  "keywords_translations": {
    "en": [
      "Book instructor",
      "Itinerary planning",
      "Book flights"
    ],
    "th": [
      "จองครูสอน",
      "วางแผนการเดินทาง",
      "จองตั๋วเครื่องบิน"
    ]
  }
}
```

**為什麼重要**：
- 關鍵字也是搜尋的重要指標
- 三語都需要翻譯（SEO、AI 引擎都會看）
- 數量必須完全相同

### ❌ 錯誤 5: 變體問法翻譯數量不符

```json
// ❌ 錯誤
"utterance_patterns": [
  "問題變體1",
  "問題變體2",
  "問題變體3"  // 3 個
],
"utterance_patterns_translations": {
  "en": [
    "Variant 1",
    "Variant 2"  // 只有 2 個！
  ],
  "th": [...]
}

// ✅ 正確
"utterance_patterns": [
  "問題變體1",
  "問題變體2",
  "問題變體3"  // 3 個
],
"utterance_patterns_translations": {
  "en": [
    "Variant 1",
    "Variant 2",
    "Variant 3"  // 3 個
  ],
  "th": [...]
}
```

**為什麼重要**：
- 搜尋變體是 SEO 的關鍵
- 泰文、英文用戶用自己語言搜尋時需要相同數量的變體
- 不符合會導致某些語言無法搜尋到

### ❌ 錯誤 6: CRM 標籤翻譯遺漏

```json
// ❌ 錯誤
"crm_tags": ["#行程規劃", "#預約"]
// crm_tags_translations 遺漏！

// ✅ 正確
"crm_tags": ["#行程規劃", "#預約"],
"crm_tags_translations": {
  "en": ["#Itinerary Planning", "#Booking"],
  "th": ["#วางแผนการเดินทาง", "#การจอง"]
}
```

**為什麼重要**：
- Tag 也會在 analytics 中顯示（tag 點擊分析）
- 多語言用戶需要看懂標籤的意思
- AI 引擎需要理解標籤的含義

---

## 🔄 前端如何使用（方案 B 實作）

```javascript
// faq-engine.js 初始化時
async initialize() {
  // 1. 載入 FAQ 資料
  const response = await fetch('/api/v1/faq/all');
  this.faqData = response.data.items;

  // 2. 建立翻譯快取
  this.translationCache = this.buildTranslationCache();

  // 3. 初始化 Fuse.js（包含所有語言 patterns）
  this.initializeFuse();
}

buildTranslationCache() {
  const cache = {
    'zh': [],
    'en': [],
    'th': []
  };

  // 從 JSON 中讀取預先翻譯的 patterns
  for (const faq of this.faqData) {
    cache['zh'].push(...faq.utterance_patterns);
    cache['en'].push(...(faq.utterance_patterns_translations?.en || []));
    cache['th'].push(...(faq.utterance_patterns_translations?.th || []));
  }

  console.log('✅ Translation cache built');
  return cache;
}

// 搜尋時使用快取（零延遲）
search(query, language = 'zh') {
  // 使用快取的翻譯進行搜尋
  const patterns = this.translationCache[language];
  return this.fuseIndex.search(query);
}

// 語言切換時直接使用快取（無需重新翻譯）
setLanguage(language) {
  if (this.translationCache[language]) {
    this.currentLanguage = language;
    // ✅ 零延遲切換
  }
}
```

---

## 📝 建立新 FAQ 的步驟

### Step 1: 準備中文內容

```
想要優化的 FAQ:
- 問題: "應該先訂好機票住宿，還是先預約滑雪教練？"
- 答案摘要: "我們強烈建議您「先預約教練，再訂機票住宿」..."
- 變體問法: 5-10 個不同的問法方式
```

### Step 2: 翻譯成英文和泰文

**英文翻譯原則**:
- 保留原意（不改變句子結構）
- 自然的英文表達
- 避免生硬直譯

**泰文翻譯原則**:
- 請泰語母語者翻譯
- 確保語法和文化適切
- 檢查特殊字符和發音

### Step 3: 填入 JSON 格式

使用上面的完整 FAQ JSON 格式作為模板

### Step 4: 驗證

運行驗證腳本：
```bash
node scripts/validate-faq-schema.js faq.itinerary.001.json
```

### Step 5: 提交

提交給技術團隊審核和部署

---

## 💾 檔案位置

所有 FAQ JSON 應存放在：
```
zeabur_backend/data/faq_kb.phase0a.json
```

作為 FAQ 陣列的一部分：
```json
{
  "version": "1.0.0",
  "items": [
    { // faq.itinerary.001
      "id": "faq.itinerary.001",
      ...
    },
    { // faq.itinerary.002
      "id": "faq.itinerary.002",
      ...
    }
  ]
}
```

---

## 🚀 下一步

1. 根據此格式建立新的 FAQ
2. 運行驗證腳本檢查格式
3. 提交給技術團隊審核
4. 批准後合併到 faq_kb.phase0a.json

祝你製作順利！ 🎉
