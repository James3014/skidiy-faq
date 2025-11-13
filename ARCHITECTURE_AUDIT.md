# FAQ 系統架構審計 (Phase 1)

**日期**: 2025-11-13
**狀態**: 進行中
**目標**: 完整記錄當前架構，為簡化做準備

---

## 1. 數據流分析

### 1.1 生產環境數據流（用戶訪問 https://faq.diy.ski/）

```
用戶在 faq.diy.ski 搜尋 FAQ
         ↓
frontend/faq-search.html 頁面加載
         ↓
window.ENV_API_BASE 初始化 → /api/v1
window.API_BASE 初始化 → /api/v1
         ↓
frontend/lib/faq-engine.js 初始化 FAQEngine 實例
         ↓
FAQEngine.initialize() 調用
         ↓
fetch(`${API_BASE}/faq/all?v=${cacheBuster}`)
         ↓
後端 API: GET /api/v1/faq/all
         ↓
backend/src/routes/faq.js:loadFAQData()
         ↓
優先順序 1: require('/backend/src/data/faq_kb.js')
優先順序 2: 讀取 /data/faq_kb.phase0a.json
         ↓
數據變換: 組合 answer_template.summary + details → text
         ↓
API 返回 JSON (71 個 FAQ 項目)
         ↓
FAQEngine.faqData = 接收的 JSON 數據
         ↓
FAQEngine.fuseInstance = new Fuse(items, config)
         ↓
前端頁面加載完成 ✅
         ↓
用戶輸入搜尋詞（如 "教練"）
         ↓
FAQEngine.search(query) 調用
         ↓
Fuse.js 模糊搜尋執行
         ↓
前端將結果渲染到 DOM
         ↓
displayFAQs() 執行
  - 迴圈遍歷結果
  - 調用 getLocalizedContent(faq, currentLanguage)
  - 組合: summary + details → answer 顯示
  - parseLinksInText() 處理連結
         ↓
用戶看到 FAQ 答案 ✅
```

---

## 2. 數據層分析

### 2.1 數據來源（5 個來源）

| # | 來源 | 路徑 | 大小 | 完整性 | 使用場景 |
|---|------|------|------|--------|---------|
| 1 | faq_kb.js (bundled) | `/backend/src/data/faq_kb.js` | 497KB | ❌ 只有 6 個有內容 | 後端 fallback |
| 2 | faq_kb.phase0a.json | `/data/faq_kb.phase0a.json` | 497KB | ❌ 只有 6 個有內容 | 後端優先 |
| 3 | faq_kb.json (legacy) | `/backend/data/faq_kb.json` | 260KB | ❌ 只有 6 個有內容 | 備份 |
| 4 | faq_kb.json (archive) | `/_archive/test-files/faq_kb.json` | 101KB | ❌ 只有 6 個有內容 | 歷史備份 |
| 5 | browser cache | 瀏覽器 HTTP 快取 | 動態 | ✅ 最新 | 減少 API 調用 |

**核心問題**: 所有源文件都只有 6 個 FAQ 有實際答案內容，其他 65 個是空骨架

### 2.2 數據轉換層（4 層）

#### 層 1：後端 API 層（faq.js:234-270）
```javascript
// 加載原始數據
const data = loadFAQData()  // 71 個項目，但 65 個無內容

// 轉換：組合 summary + details → text
const transformedItems = data.items.map(item => ({
  ...item,
  answer_template: {
    ...item.answer_template,
    text: [summary, details].join('\n\n') || ''  // 問題：空值組合後還是空
  }
}))

// 返回給前端
sendSuccess(res, { items: transformedItems, ... })
```

**問題**: 轉換本身沒問題，但輸入數據本身就是空的

#### 層 2：前端初始化層（faq-engine.js:27-65）
```javascript
FAQEngine.initialize() {
  // 取得 API 數據
  const response = await fetch(`/api/v1/faq/all`)
  this.faqData = response.json()

  // 初始化 Fuse 搜尋引擎
  this.fuseInstance = new Fuse(this.faqData.items, config)
}
```

**層級數據**: 71 個項目

#### 層 3：搜尋結果層（faq-engine.js:197-225）
```javascript
FAQEngine.search(query) {
  const results = this.fuseInstance.search(query, { limit: 5 })
  // 返回 Fuse 結果，包含得分和索引
  return results  // 例如 [{item: {...}, score: 0.15}, ...]
}
```

#### 層 4：顯示層（index.html:displayFAQs）
```javascript
function displayFAQs(faqs, title) {
  const resultsHTML = faqs.map((faq, index) => {
    const localized = faqEngine.getLocalizedContent(faq, currentLanguage)
    const answer = parseLinksInText(localized.answer || '無答案內容')
    // 問題發現點：localized.answer 經常是空字符串
    return `<div>${answer}</div>`
  })
}
```

---

## 3. 快取機制分析

### 3.1 快取層（4 層）

| 層級 | 位置 | 機制 | TTL | 問題 |
|-----|------|------|-----|-----|
| **L1** | 瀏覽器 HTTP | Cache-Control: max-age=300 | 5 分鐘 | 舊數據持久化 |
| **L2** | FAQEngine.faqData | 記憶體變數 | 5 分鐘 (後端檢查) | 初始化時已是過時 |
| **L3** | FAQEngine.localized | 每個 FAQ 的 .localized 屬性 | 永遠 | **本質問題**: 緩存舊空值 |
| **L4** | Fuse.js 索引 | 記憶體中的 Fuse 實例 | 終身 | 初始化後不更新 |

### 3.2 快取流程

```
API 返回舊數據（65 個空）
  ↓
FAQEngine.faqData = 舊數據
  ↓
prepareLocalizedContent(item) 執行
  ↓
item.localized = {
  zh: { answer: '' },  ← 快取空值
  en: { answer: '' },
  ...
}
  ↓
Fuse.js 索引建立（基於空數據）
  ↓
用戶後來搜尋
  ↓
getLocalizedContent() 讀取 item.localized
  ↓
顯示空答案 ❌
```

---

## 4. 複雜性評估

### 4.1 代碼複雜度

| 模塊 | 行數 | 複雜度 | 問題 |
|------|------|--------|------|
| faq-engine.js | 331 | 中 | 多個轉換邏輯，快取機制複雜 |
| faq.js (API) | 400+ | 高 | 多個數據源，優先順序判斷，轉換邏輯 |
| index.html (前端) | 500+ | 中 | displayFAQs 函數有 20+ 行特殊邏輯 |

### 4.2 數據流複雜度

- **層級數**: 4 層（API → FAQEngine → Fuse → DOM）
- **轉換次數**: 每個 FAQ 被轉換 2+ 次
- **快取點**: 4 個獨立快取層
- **依賴關係**: 8+ 個全局變量依賴

---

## 5. 當前系統痛點總結

| 痛點 | 根因 | 影響 | 優先級 |
|-----|------|------|--------|
| FAQ 無答案顯示 | 數據本身為空 | 用戶看不到答案 | 🔴 P0 |
| 多層快取同步困難 | 4 個獨立快取層 | Bug 難以追蹤 | 🔴 P0 |
| 複雜的轉換邏輯 | summary + details 需要組合 | 維護成本高 | 🟡 P1 |
| 多個數據源 | JSON 和 JS 文件重複 | 版本管理困難 | 🟡 P1 |
| FAQEngine 臃腫 | 25+ 個方法 | 代碼難以理解 | 🟡 P2 |

---

## 6. 簡化目標

根據 Linus 原則：

### 目標架構（簡化後）

```
API 層：直接返回完整 FAQ（question + answer + metadata）
   ↓
前端記憶體快取：簡單 Map<id, faq>
   ↓
Fuse.js：直接搜尋
   ↓
DOM 渲染：直接使用 faq.answer，無需轉換
```

### 預期改進

| 指標 | 當前 | 目標 | 改善 |
|------|------|------|------|
| FAQEngine 行數 | 331 | 100 | ⬇️ 70% |
| 快取層數 | 4 | 1 | ⬇️ 75% |
| 數據轉換次數 | 2+ | 0 | ⬇️ 100% |
| displayFAQs 行數 | 20+ | 5 | ⬇️ 75% |
| 代碼可讀性 | 中 | 高 | ⬆️ 50% |

---

## 7. 後續行動

✅ **已完成**: Phase 1 架構審計
⏳ **下一步**: Phase 2 API 層簡化
- 修改 API 返回格式
- 確保每個 FAQ 都有 `answer` 字段
- 移除 summary + details 組合邏輯

