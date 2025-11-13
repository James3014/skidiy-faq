# FAQ System Simplification Plan

**Created**: 2025-11-13
**Status**: Planning Phase
**Priority**: Medium (after current bug fixes are stable)

---

## 問題陳述

FAQ 系統當前設計過度複雜：

- 多個數據層（JSON 文件、API、快取、localized 屬性）
- 複雜的數據轉換流程
- 快取同步問題導致難以追蹤的 bug
- 維護成本高

**根本原因**：系統在演進過程中逐漸疊加功能，但沒有定期重構以簡化架構。

---

## 目標

應用 **Linus Torvalds 原則**：

1. **簡潔優於抽象** - 移除不必要的中間層
2. **數據結構優先** - 清晰的 API 契約，直接映射到前端需求
3. **單一真實來源** - 統一的數據流，不複製也不轉換

**預期成果**：
- 代碼可讀性 ↑ 50%
- Bug 難度 ↓ 60%
- 維護時間 ↓ 40%

---

## Phase 1: 架構審計

**時間估計**: 4 小時
**負責**: 前後端開發

### 1.1 識別所有數據層

```
用戶查看答案
    ↓
index.html displayFAQs()
    ↓
faqEngine.getLocalizedContent()
    ↓
faq.localized (快取)
    ↓
faq.answer_template.text (原始數據)
    ↓
API 或 JSON 文件
```

**任務**：
- [ ] 繪製完整的數據流圖
- [ ] 標記每一層的轉換邏輯
- [ ] 標記每一層的快取機制
- [ ] 識別所有冗餘層

### 1.2 文檔所有転換

**問題清單**：
- [ ] 為什麼 `answer_template.summary` + `answer_template.details` 需要組合？
- [ ] 為什麼需要 `faq.localized` 快取層？
- [ ] 為什麼 i18n 翻譯不能在 API 層處理？
- [ ] 為什麼 FAQ 數據有本地 JSON 和遠端 API 兩份來源？

### 1.3 識別關鍵設計決策

- [ ] 多語言支援的必要性
- [ ] CRM 標籤系統的整合需求
- [ ] Intent 偵測的數據依賴
- [ ] 分析統計的數據收集需求

---

## Phase 2: API 層簡化

**時間估計**: 8 小時
**負責**: 後端開發

### 2.1 統一 FAQ 回應格式

**當前**（複雜）：
```javascript
{
  id: "faq.itinerary.001",
  canonical_question: "應該先訂...",
  canonical_question_en: "Should I...",
  canonical_question_th: "ควร...",
  answer_template: {
    summary: "...",
    details: "...",
    tip: "...",
    postscript: "...",
    summary_translations: {...},
    details_translations: {...},
    // 等等 15+ 個字段
  }
}
```

**目標**（簡化）：
```javascript
{
  id: "faq.itinerary.001",
  content: {
    zh: {
      question: "應該先訂...",
      answer: "我們強烈建議...（組合好的完整答案）",
      postscript: "更多資訊..."
    },
    en: {
      question: "Should I...",
      answer: "We strongly recommend...",
      postscript: "For more information..."
    },
    th: {
      question: "ควร...",
      answer: "เราขอแนะนำ...",
      postscript: "สำหรับข้อมูล..."
    }
  },
  metadata: {
    intent: "ITINERARY",
    section: "行程規劃與周邊",
    crm_tags: ["#行程規劃", "#教練預約"],
    keywords: ["預約教練", "機票住宿"]
  }
}
```

**優點**：
- ✅ API 回應中已經是顯示格式，不需要前端組合
- ✅ 明確的語言分離，不需要 fallback 邏輯
- ✅ 元數據分離，關注點清晰
- ✅ 減少 API 字段 70%

### 2.2 API 端點重新設計

**當前**：
```
GET /api/v1/faq/all          - 返回原始數據結構
GET /api/v1/faq/:id          - 返回單個 FAQ
POST /api/v1/faq/search      - 返回搜尋結果
```

**目標**：
```
GET /api/v1/faq/all?lang=zh         - 返回指定語言的完整 FAQ
GET /api/v1/faq/:id?lang=zh         - 返回單個 FAQ（指定語言）
POST /api/v1/faq/search?lang=zh     - 返回搜尋結果（指定語言）
```

**所有端點都返回統一格式**，不需要前端轉換。

### 2.3 數據遷移策略

- [ ] 創建 FAQ 數據轉換腳本
- [ ] 驗證轉換後的數據完整性
- [ ] 準備 rollback 方案
- [ ] 測試 API 向後兼容性

---

## Phase 3: 前端架構簡化

**時間估計**: 6 小時
**負責**: 前端開發

### 3.1 移除 FAQEngine 複雜性

**當前 FAQEngine**：
```javascript
class FAQEngine {
  prepareLocalizedContent(faq) {
    // 25 行代碼，複雜邏輯
  }
  getLocalizedContent(faq, language) {
    // 15 行代碼，快取檢查
  }
  // ... 還有 10+ 個方法
}
```

**簡化後**：
```javascript
class FAQEngine {
  // 只需要 3 個方法

  async initialize() {
    // 加載 FAQ 數據，完成
  }

  search(query) {
    // 使用 Fuse.js 搜尋，完成
  }

  getById(faqId, language='zh') {
    // 返回單個 FAQ，完成
  }
}
```

所有轉換都由 API 完成，前端只負責**顯示**。

### 3.2 簡化顯示邏輯

**當前**（複雜）：
```javascript
function displayFAQs(faqs, title) {
  const resultsHTML = faqs.map((faq, index) => {
    const localized = faqEngine.getLocalizedContent(faq, currentLanguage);
    const answer = parseLinksInText(localized.answer || '無答案內容');
    // ... 還有 20+ 行其他處理
    return `<div>${answer}</div>`;
  }).join('');
}
```

**簡化後**：
```javascript
function displayFAQs(faqs, title) {
  const resultsHTML = faqs.map((faq, index) => {
    const content = faq.content[currentLanguage];  // 直接從 API 獲得
    const answer = parseLinksInText(content.answer);
    return `<div>${answer}</div>`;
  }).join('');
}
```

### 3.3 統一語言管理

**當前**：
- i18n 系統管理 UI 翻譯
- 多個地方有語言 fallback 邏輯
- 前後端語言處理不一致

**目標**：
- API 決定語言版本
- 前端只負責顯示 API 返回的內容
- 統一的語言列表和驗證

---

## Phase 4: 快取策略重新設計

**時間估計**: 4 小時
**負責**: 前後端開發

### 4.1 移除不必要的快取

**刪除的快取**：
- ❌ `faq.localized` 屬性（原因：API 已返回本地化內容）
- ❌ FAQEngine 的 `prepareLocalizedContent` 快取（原因：不需要計算）
- ❌ 多個 API 轉換層（原因：統一格式，一次完成）

**保留的快取**：
- ✅ 瀏覽器 HTTP 快取（5 分鐘）- 減少 API 調用
- ✅ IndexedDB 離線快取（可選）- 用於離線功能
- ✅ 搜尋索引快取（記憶體）- Fuse.js 需要

### 4.2 快取失效策略

```javascript
// 簡單策略：版本號
GET /api/v1/faq/all?v=20251113

// 前端檢查版本更新
const currentVersion = localStorage.getItem('faqVersion');
if (response.headers['x-faq-version'] !== currentVersion) {
  // 清除所有快取，重新加載
  localStorage.clear();
}
```

---

## Phase 5: 測試和驗證

**時間估計**: 8 小時
**負責**: QA + 開發

### 5.1 單元測試

- [ ] FAQEngine 搜尋功能
- [ ] API 響應格式驗證
- [ ] 語言 fallback 邏輯
- [ ] 答案顯示正確性

### 5.2 集成測試

- [ ] 端到端搜尋流程
- [ ] 多語言切換
- [ ] 快取更新機制
- [ ] 離線功能（如有）

### 5.3 性能測試

- [ ] API 響應時間（目標：< 100ms）
- [ ] 前端渲染時間（目標：< 200ms）
- [ ] 搜尋性能（目標：< 50ms）
- [ ] 內存使用（目標：< 5MB）

---

## Phase 6: 部署和監控

**時間估計**: 4 小時
**負責**: 後端 + DevOps

### 6.1 漸進式部署

```
Week 1: 內部測試環境 (dev branch)
         ↓
Week 2: Staging 環境 (staging branch)
         ↓
Week 3: 生產環境 10% 流量 (canary)
         ↓
Week 4: 生產環境 100% 流量 (main)
```

### 6.2 監控指標

- [ ] API 錯誤率
- [ ] FAQ 顯示失敗率
- [ ] 用戶搜尋成功率
- [ ] 性能指標（P50、P95、P99）

### 6.3 Rollback 計劃

如果出現問題：
1. 立即回滾到舊版本
2. 通知用戶
3. 調查問題
4. 準備修復版本

---

## 預期時間表

| Phase | 任務 | 時間 | 負責 | 狀態 |
|-------|------|------|------|------|
| 1 | 架構審計 | 4h | 全隊 | ⏳ 計劃中 |
| 2 | API 簡化 | 8h | 後端 | ⏳ 計劃中 |
| 3 | 前端簡化 | 6h | 前端 | ⏳ 計劃中 |
| 4 | 快取重設 | 4h | 全隊 | ⏳ 計劃中 |
| 5 | 測試驗證 | 8h | QA + 開發 | ⏳ 計劃中 |
| 6 | 部署監控 | 4h | 後端 + DevOps | ⏳ 計劃中 |
| | **總計** | **34h** | | |

---

## 風險評估

### 風險 1：用戶可見的變化

**可能性**：低
**影響**：中

**緩解**：
- 功能保持不變，只改變內部實現
- 先在 staging 環境充分測試
- 準備快速 rollback 方案

### 風險 2：多語言翻譯遺漏

**可能性**：中
**影響**：中

**緩解**：
- 自動化驗證：所有語言完整性檢查
- 測試用例覆蓋所有支援語言
- 允許語言部分缺失時的安全 fallback

### 風險 3：性能下降

**可能性**：低
**影響**：高

**緩解**：
- 性能測試貫穿整個開發過程
- 對比優化前後的指標
- 若性能下降 >10%，停止部署

---

## 成功標準

✅ **功能完整性**：所有 FAQ 功能保持不變
✅ **性能提升**：前端渲染時間減少 20%+
✅ **代碼簡潔性**：代碼行數減少 30%+
✅ **維護成本**：新 bug 減少 50%+
✅ **團隊滿意度**：代碼易理解，願意維護

---

## 下一步

1. **評審此計劃**（1h）
   - 與團隊討論
   - 調整時間表
   - 獲得批准

2. **啟動 Phase 1**（開始日期待定）
   - 分配任務
   - 開始架構審計
   - 記錄發現

3. **每周進度報告**
   - 完成情況
   - 遇到的問題
   - 調整計劃

---

## 附注：為什麼現在不做

雖然簡化很重要，但**目前優先級**應該是：

1. ✅ **已完成**：修復「無答案」bug（Commits 2078a58-4c9e48c）
2. ⏳ **進行中**：驗證修復有效性
3. ✅ **準備**：文檔化現有架構
4. 📋 **計劃中**：漸進式簡化

不應該立即重構的原因：
- 需要充分測試修復
- 簡化涉及面廣，需要謹慎規劃
- 團隊應先了解當前架構為何如此複雜

但做好**計劃和文檔**現在就應該開始，這樣：
- 新人上手更快
- 未來重構有清晰方向
- 避免繼續疊加複雜性

---

**Created by**: Claude Code
**Last Updated**: 2025-11-13
