# FAQ 系統優化計劃 (Linus 原則指導)

**日期**: 2025-11-13  
**目標**: 簡化架構，消除複雜性，提升可維護性  
**指導原則**: Linus Torvalds 的 Good Taste 設計哲學

---

## 核心問題

### 現狀（當前複雜性）
```
架構層級: 4 層
┌─────────────────────────────────────┐
│ 前端 (HTML/CSS/JS)                   │  
│ - displayFAQs() vs showFAQDetail()   │  ← 兩個不同的渲染邏輯
│ - FAQEngine.getLocalizedContent()   │  ← 複雜的本地化邏輯
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ FAQEngine (331 行)                    │
│ - 25+ 個方法                          │  ← 職責過多
│ - Fuse.js 搜尋邏輯                   │
│ - 本地化快取                          │  ← 層級 3 快取
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ 後端 API (Express)                    │
│ - /faq/all - 轉換邏輯                 │  ← 層級 2 快取
│ - /faq/search - 搜尋端點              │
│ - /faq/:id - 單個查詢                 │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ 數據源 (faq_kb.phase0a.json)         │
│ - 71 個 FAQ 項目                      │
│ - 混合格式 (text + summary/details)  │
└─────────────────────────────────────┘

快取層: 4 層 (造成同步複雜性)
├── HTTP 快取 (5 分鐘 max-age)
├── FAQEngine.faqData (記憶體)
├── FAQEngine.localized (屬性快取)
└── Fuse.js 索引 (終身快取)
```

### Linus 的問題
> "如果代碼中有特殊情況，這說明抽象不夠好。好的代碼應該消除這些特殊情況，而不是用條件語句去處理它們。"

**我們的特殊情況：**
1. ❌ 兩種不同的 FAQ 渲染函數 (`displayFAQs` vs `showFAQDetail`)
2. ❌ 混合的答案格式 (`text` vs `summary/details`)
3. ❌ 複雜的多層快取同步
4. ❌ FAQEngine 的過度職責設計

---

## 優化計劃 (遵循 Linus 原則)

### 階段 1: 數據層統一 (消除格式特殊情況)
**Linus 原則**: "Good Taste - 消除特殊情況"

#### 當前問題
- 6 個 FAQ 用 `summary/details`，65 個用 `text`
- 代碼中有 `if (text) else` 來處理兩種格式

#### 目標
```json
統一格式 - 所有 FAQ 都用 text 欄位:
{
  "id": "faq.xxx.001",
  "canonical_question": "...",
  "answer_template": {
    "text": "完整答案",           // ← 統一欄位
    "postscript": "備註"
  },
  "crm_tags": [...]
}
```

#### 執行步驟
```
Task 1.1: 分析當前 6 個 summary/details FAQ
  - 目標: 手動或腳本將 summary+details 合併成 text
  - 時間估計: 0.5 小時

Task 1.2: 更新 faq_kb.phase0a.json
  - 目標: 所有 FAQ 統一為 text 格式
  - 驗證: 全部 71 個 FAQ 都有 text 欄位
  - 時間估計: 0.5 小時

Task 1.3: 簡化 API 轉換邏輯
  - 移除: baseTemplate.summary + details 的組合邏輯
  - 新邏輯: 直接返回 baseTemplate.text
  - 檔案: zeabur_backend/backend/src/routes/faq.js
  - 時間估計: 0.25 小時
```

**益處**:
- 🎯 消除 if/else 特殊情況
- 📉 減少代碼行數: ~10-15 行
- 🚀 提升性能: 轉換時間 -50%

---

### 階段 2: 前端渲染統一 (消除雙重邏輯)
**Linus 原則**: "Never Break Userspace - 向後相容 + Good Taste"

#### 當前問題
```javascript
// 問題: 兩個不同的渲染函數
displayFAQs(faqs) {          // 搜尋結果用這個
  // 200+ 行 HTML 生成邏輯
}

showFAQDetail(faqId) {       // 熱門問題用這個
  // 30 行 HTML 生成邏輯
  // 但邏輯不一致 ← 造成 bug
}
```

#### 目標
```javascript
// 統一的渲染函數
renderFAQCards(faqs, container, options = {}) {
  // 單一職責：生成 FAQ 卡片 HTML
  // 支援所有場景：搜尋、熱門、單個
}
```

#### 執行步驟
```
Task 2.1: 提取公共 FAQ 卡片生成邏輯
  - 分析: displayFAQs vs showFAQDetail
  - 目標: 提取重複代碼到 generateFAQCard() 函數
  - 時間估計: 1 小時

Task 2.2: 統一所有 FAQ 渲染點
  - 搜尋結果: displayFAQs() → renderFAQCards()
  - 熱門問題: showFAQDetail() → renderFAQCards()
  - 側邊欄: renderHotFAQs() → 只生成列表，點擊時用 renderFAQCards()
  - 時間估計: 1 小時

Task 2.3: 移除 FAQEngine 過度職責
  - 當前: FAQEngine 負責初始化、搜尋、本地化、快取、Fuse 管理
  - 目標: 只負責初始化 + Fuse 搜尋
  - 時間估計: 1 小時
```

**益處**:
- 🎯 代碼復用率 +40%
- 📉 FAQEngine 從 331 行 → 150 行
- 🐛 減少 bug（一致的渲染邏輯）

---

### 階段 3: 快取策略簡化 (消除同步複雜性)
**Linus 原則**: "Pragmatism - 實用性優於完美"

#### 當前問題
```
4 層快取造成的問題:
1. HTTP 快取 (5 分鐘)
2. FAQEngine.faqData (5 分鐘)
3. FAQEngine.localized (永遠)
4. Fuse.js 索引 (終身)

當一層更新時，需要級聯更新所有層
→ 複雜的同步邏輯
→ 容易出 bug（如我們遇到的舊數據問題）
```

#### 目標
```
2 層快取（簡單清晰）:
1. HTTP 快取 (5 分鐘，由 Browser/CDN 自動管理)
2. 記憶體變數 (loadFAQData 函數內的 faqData)

特色:
- 自動過期（5 分鐘後由 HTTP 層處理）
- 無需手動同步
- 實時性好（最多延遲 5 分鐘）
```

#### 執行步驟
```
Task 3.1: 分析快取依賴關係
  - 目標: 識別哪些功能依賴 FAQEngine.localized
  - 時間估計: 0.5 小時

Task 3.2: 移除本地化快取層
  - 當前: item.localized = {} (永遠快取)
  - 新方案: 每次需要時調用 faqEngine.getLocalizedContent()
  - 檔案: frontend/lib/faq-engine.js
  - 時間估計: 1 小時

Task 3.3: 簡化 FAQEngine 初始化
  - 移除: prepareLocalizedContent() 的預處理
  - 新邏輯: 延遲本地化（按需計算）
  - 時間估計: 0.5 小時

Task 3.4: 驗證性能
  - 測試: 搜尋、熱門問題、側邊欄渲染性能
  - 目標: 保持 <100ms 搜尋時間
  - 時間估計: 1 小時
```

**益處**:
- 🎯 快取複雜度 -50%
- 🔄 自動同步（無需手動管理）
- 🐛 消除舊數據問題

---

### 階段 4: API 層簡化 (消除轉換邏輯)
**Linus 原則**: "Single Source of Truth"

#### 當前問題
```javascript
// 複雜的轉換邏輯出現在 3 個不同地方
GET /api/v1/faq/all {
  // 轉換: summary + details → text
}

POST /api/v1/faq/search {
  // 轉換: summary + details → text (多語言版)
}

GET /api/v1/faq/:id {
  // 轉換: summary + details → text (多語言版)
}
```

#### 目標 (完成階段 1 後)
```javascript
// 直接返回，無需轉換
GET /api/v1/faq/all {
  return { items: faqData.items }; // 完了！
}
```

#### 執行步驟
```
Task 4.1: 完成階段 1 (數據格式統一)
  - 依賴: 所有 FAQ 都有 text 欄位

Task 4.2: 簡化 faq.js 轉換邏輯
  - 移除: baseTemplate.summary + details 的組合邏輯
  - 保留: 多語言翻譯優先級（text_translations → summary_translations）
  - 時間估計: 0.25 小時

Task 4.3: 驗證 API 響應
  - 測試: 所有 FAQ 返回都是一致的結構
  - 時間估計: 0.5 小時
```

**益處**:
- 📉 代碼行數 -30%
- 🚀 API 性能 +10%
- 🎯 數據流清晰

---

### 階段 5: 性能優化 (可選但推薦)
**Linus 原則**: "Pragmatism"

#### 潛在優化點
```
1. Fuse.js 索引預熱
   - 當前: FAQEngine.initialize() 時建立
   - 問題: 首次搜尋可能有延遲
   - 優化: 預先計算索引，存儲到 localStorage
   - 收益: 首頁加載 -30%

2. Bundle 大小優化
   - 移除: 未使用的 FAQEngine 方法
   - 目標: 從 331 行 → 100 行
   - 收益: JavaScript 體積 -20%

3. 搜尋性能
   - 當前: P95 < 100ms (已優秀)
   - 可選: 添加結果分頁（減少 DOM 元素）

4. 多語言 CDN 緩存
   - 當前: 單一語言 API 端點
   - 優化: /api/v1/faq/all?lang=en 分別快取
```

---

## 優先順序排列

### 🔴 P0 - 必做 (影響用戶體驗)
1. **階段 2.2**: 修復熱門問題渲染 ← **已完成**
2. **階段 1**: 數據格式統一 (消除特殊情況)
3. **階段 2**: 前端渲染統一

### 🟡 P1 - 應做 (提升可維護性)
4. **階段 3**: 簡化快取策略
5. **階段 4**: 簡化 API 層

### 🟢 P2 - 可做 (性能優化)
6. **階段 5**: 性能優化

---

## 實施時間表

```
Week 1:
  ✅ 修復熱門問題 (已完成)
  📋 準備階段 1 (數據格式統一)
  
Week 2:
  🔨 執行階段 1
  🔨 執行階段 2 (前端統一)
  
Week 3:
  🔨 執行階段 3 (快取簡化)
  🔨 執行階段 4 (API 簡化)
  
Week 4:
  ✅ 完整測試
  ✅ 部署上線
  🎉 優化完成
```

**預估總工時**: 16-20 小時 (分佈在 4 週)

---

## 預期效果

### 代碼質量
| 指標 | 當前 | 目標 | 改善 |
|------|------|------|------|
| FAQEngine 行數 | 331 | 100 | ⬇️ 70% |
| 快取層數 | 4 | 2 | ⬇️ 50% |
| 數據轉換點 | 3 | 1 | ⬇️ 67% |
| 渲染函數數量 | 3+ | 1 | ⬇️ 75% |
| 可維護性得分 | 6/10 | 9/10 | ⬆️ 50% |

### 性能
| 指標 | 當前 | 目標 |
|------|------|------|
| 搜尋延遲 | <100ms | <100ms |
| 頁面加載 | ~2s | ~1.5s |
| Bundle 大小 | ~50KB | ~40KB |

### 用戶體驗
✅ 一致的 FAQ 顯示 (所有場景)
✅ 更快的頁面加載
✅ 無 bug 的快取策略

---

## Linus 原則應用總結

| 原則 | 當前問題 | 優化方案 |
|------|---------|---------|
| **Good Taste** | 混合答案格式，特殊情況多 | 統一格式，消除特殊情況 |
| **Never Break Userspace** | 無向後相容問題 | 保持 API 兼容，漸進式優化 |
| **Pragmatism** | 過度設計（4 層快取）| 實用的 2 層快取 |
| **Simplicity** | FAQEngine 過度複雜 | 單一職責，簡化邏輯 |
| **Single Source of Truth** | 數據轉換出現 3 次 | 統一在 API 層 |

---

## 檢查清單

- [ ] 階段 1：數據格式統一
- [ ] 階段 2：前端渲染統一
- [ ] 階段 3：快取策略簡化
- [ ] 階段 4：API 層簡化
- [ ] 階段 5：性能優化 (可選)
- [ ] 完整測試和驗證
- [ ] 部署上線

