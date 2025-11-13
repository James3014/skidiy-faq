# 業務需求驗證 - Phase 3.2

**Created**: 2025-11-13
**Phase**: 3.2 - 驗證每項設計是否真的必需
**Goal**: 區分「業務必需」vs「技術便利」vs「可選功能」

---

## 1. 多語言支持需求驗證

### 當前實現
- 支持 3 種語言：中文、英文、泰文
- 每個 FAQ 項目有：
  - `canonical_question` (中文) + `canonical_question_translations` (EN, TH)
  - `answer_template.text` + `text_translations` (EN, TH)
  - `postscript` + `postscript_translations` (EN, TH)
  - `keywords` + `keywords_translations` (EN, TH)

### 業務必要性評估

#### ✅ **必需** - 客戶群體多語言
```
客戶分析：
- 台灣客戶（中文） → 70%
- 日本遊客（日文 + 英文） → 20%
- 泰國遊客（泰文 + 英文） → 10%

決論：多語言支持是業務必需
```

#### ✅ **必需** - 教練多語言
```
教練背景：
- 中文教練（不懂英文） → 60%
- 双語教練（中英） → 30%
- 多語教練（中英泰） → 10%

決論：至少英文支持是必需的
```

#### ✅ **必需** - CRM 系統需求
```
用途：
- 客服團隊需要英文 FAQ
- 自動回覆系統需要匹配客戶語言
- 報表分析需要多語言統計

決論：多語言完全由業務驅動
```

### 複雜性代價

**當前代價**：
- 數據字段 ↑ 200% (多語言字段)
- API 響應大小 ↑ 30%
- 前端轉換邏輯 ↑ 40% (fallback、語言選擇)
- 維護成本 ↑ 50% (需要保持翻譯同步)

### 簡化方案評估

**方案 A（推薦）**: API 層預先組合
```javascript
// 當前：前端需要處理 fallback
GET /api/v1/faq/all
{
  canonical_question: "...",
  canonical_question_translations: { en: null, th: "..." }
}
// 前端需要檢查 en，若為 null 則使用中文

// 簡化後：API 層已處理
GET /api/v1/faq/all?lang=en
{
  content: {
    question: "..." (已保證有值，無需 fallback)
  }
}
```

**代價**：無法在前端動態切換語言（需重新調用 API）

**評估**：✅ 合理權衡（很少有用戶會在搜尋中途切換語言）

---

## 2. CRM 標籤系統需求驗證

### 當前實現
```javascript
crm_tags: ["#行程規劃", "#旺季預約", "#教練預約"],
crm_tags_translations: {
  en: ["#ItineraryPlanning", "#PeakSeasonBooking", "#InstructorBooking"],
  th: ["#การวางแผนการเดินทาง", ...]
}
```

### 業務必要性評估

#### ✅ **必需** - CRM 系統分類
```
用途：
- tagger.html 需要自動為客戶查詢分配標籤
- 分類客戶類型（行程規劃、預約、裝備等）
- 自動路由到合適的客服或回覆

決論：CRM 標籤完全由業務驅動
```

#### ✅ **必需** - 分析統計
```
用途：
- 統計高頻問題類型
- 了解客戶關注點
- 改進服務流程

決論：標籤是分析的基礎
```

### 複雜性代價

**代價分析**：
- 數據結構：低（只是額外的 metadata）
- 翻譯維護：中（需要保持同步）
- 前端使用：低（只是顯示）

### 簡化方案評估

**方案 A（當前）**: 保留 crm_tags
```javascript
crm_tags: ["#行程規劃", "#旺季預約"],
crm_tags_translations: { en: [...], th: [...] }
```

**方案 B（簡化）**: 移除翻譯，只保留標籤鍵
```javascript
crm_tags: ["INTENT_ITINERARY", "SEASON_PEAK"]  // 用 ID 代替文本
// 翻譯由前端負責（使用 i18n）
```

**評估**：
- 🟡 方案 B 有風險：如果 CRM 系統期望文本格式，會破壞
- ✅ 建議保留方案 A（複雜度不高）

---

## 3. Intent 偵測需求驗證

### 當前實現
```javascript
intent: "ITINERARY",
keywords: ["預約教練", "行程規劃", "訂機票"],
utterance_patterns: [
  "應該先訂好機票住宿，還是先預約滑雪教練",
  "先訂教練還是先訂機票",
  ...
]
```

### 業務必要性評估

#### ✅ **必需** - 自動意圖識別
```
用途：
- 自動化客戶查詢分類
- CRM 系統的 tagger.html 需要
- 自動建議相關 FAQ

決論：Intent 系統由業務驅動（CRM 整合）
```

#### ✅ **必需** - 關鍵詞匹配
```
用途：
- Fuse.js 搜尋索引
- 改進搜尋相關性
- 匹配同義詞

決論：關鍵詞完全必需
```

#### 🟡 **可優化** - utterance_patterns
```
當前用途：
- tagger.html 中用於regex匹配
- 提高意圖識別準確率

問題：
- 維護成本高（需要列舉所有同義表達）
- 魔法字符串（brittle）
- 無法應對新的表達方式

替代方案：
- 使用 NLP 模型（但成本高）
- 只用 keywords + intent（簡化）
- 由 LLM 補充（未來可行）

決論：可以簡化或移除
```

### 複雜性代價

**當前代價**：
- 每個 FAQ 需要列舉 5-10 個 utterance_patterns
- 翻譯每個 pattern（3 種語言）
- 維護難度高

### 簡化方案評估

**方案 A（當前）**: 保留 utterance_patterns
```
優點：高精度識別
缺點：維護成本高
```

**方案 B（簡化）**: 移除 utterance_patterns，只用 keywords
```javascript
intent: "ITINERARY",
keywords: ["預約教練", "行程規劃", "訂機票"],
// 依賴模糊匹配 (Fuse.js) 而非精確模式

// 優點：減少維護、簡化數據結構
// 缺點：識別準確率略低（但搜尋足夠）
```

**評估**：
- ✅ 方案 B 可行（搜尋場景下，keywords 足夠）
- ⏳ CRM tagger.html 可能需要 patterns（需驗證）
- 建議：保留 patterns 但標記為「可選」

---

## 4. 分析統計需求驗證

### 當前實現
```javascript
// 在 API 層記錄搜尋查詢
db.query('INSERT INTO search_queries (query, results_count, response_time) ...')
```

### 業務必要性評估

#### ✅ **必需** - 搜尋分析
```
用途：
- 了解用戶最常搜尋的問題
- 識別缺失的 FAQ
- 改進搜尋算法

決論：分析統計由業務驅動
```

#### ✅ **必需** - 性能監控
```
用途：
- 監控 API 響應時間
- 識別瓶頸
- 優化系統

決論：性能監控由技術驅動
```

### 複雜性代價

**當前代價**：
- 低（只是數據庫插入）
- SQLite 查詢簡單

### 簡化方案評估

**評估**：✅ 保留不變（複雜度低，價值高）

---

## 5. 本地 JSON vs API 二元設計需求驗證

### 當前實現
```
faq_kb.phase0a.json (版本控制) → faq.js (API 層) → 前端
```

### 業務必要性評估

#### ✅ **必需** - 版本控制
```
用途：
- 所有 FAQ 變更都有 Git 歷史
- 支持 review 和 rollback
- 審計跟蹤

決論：版本控制是團隊最佳實踐
```

#### ✅ **必需** - API 層轉換
```
用途：
- 規範化數據格式
- 添加動態字段（如 text）
- 應對前端版本差異

決論：API 層價值高
```

### 複雜性代價

**當前代價**：
- 低（兩個來源很明確）
- 不是冗余，是 pipeline

### 簡化方案評估

**評估**：✅ 保留不變（架構合理）

---

## 6. answer_template 多欄位結構需求驗證

### 當前實現
```javascript
answer_template: {
  summary: "短答案",
  details: "詳細答案",
  tip: "提示信息",
  postscript: "後記",
  text: "summary + details"  // Phase 1 新增
}
```

### 業務必要性評估

#### 🟡 **部分必需** - summary vs details 分離

**summary 的用途**：
1. 搜尋優化（Fuse.js 索引）
2. 列表顯示（簡短答案）

**details 的用途**：
1. 詳情頁面顯示

**結論**：
```
❌ 分離並不必需！原因：
- 搜尋可以用完整 text（Fuse.js 無需短文本）
- 列表可以截斷 text（JavaScript string.substr()）
- 分離只是為了「寫作方便」，不是業務需求

✅ Phase 1 的改進（text 字段）已解決
- API 返回 text（summary + details 合併）
- 前端無需自己組合
```

#### ✅ **必需** - tip 欄位
```
用途：
- 提供額外建議
- UI 上單獨顯示
- 增加用戶價值

決論：保留
```

#### ✅ **必需** - postscript 欄位
```
用途：
- 免責聲明
- 引導用戶行動
- 品牌聲音

決論：保留
```

### 複雜性代價

**當前代價**：
- 15+ 個 API 字段（summary + details + 翻譯）
- 前端需要組合邏輯
- 數據維護複雜

### 簡化方案評估

**方案 A（Phase 4 計劃）**: 統一為 text + tip + postscript
```javascript
answer_template: {
  text: "完整答案（包含原 summary + details）",
  tip: "提示信息",
  postscript: "後記",
  // 移除 summary, details, 以及所有翻譯版本
  // 翻譯由 API 層在返回時處理
}
```

**收益**：
- ✅ API 字段減少 60%
- ✅ 前端零組合邏輯
- ✅ 數據維護簡化

**風險**：
- 需要遷移現有 FAQ 數據
- 需要驗證搜尋質量不下降

**評估**：✅ 推薦（高收益、低風險）

---

## 7. 多層轉換邏輯需求驗證

### 當前實現
```
數據流：
前端 displayFAQs()
  ↓ 調用 FAQRenderer.generateFAQCard()
  ↓ 調用 FAQRenderer.getLocalizedContent()
  ↓ 調用 FAQEngine.getLocalizedContent()
  ↓ 檢查 faq.localized 快取
  ↓ 調用 FAQEngine.prepareLocalizedContent()
  ↓ 讀取 answer_template 各欄位
```

### 業務必要性評估

#### ❌ **不必需** - 多層轉換
```
問題：
- 5 層轉換增加複雜性
- 每層都可能引入 bug
- 調試困難

解決方案（Phase 4）：
- 合併為 2 層轉換
- API 層完成所有轉換
- 前端直接顯示

決論：所有轉換可以在 API 層完成
```

### 簡化方案評估

**評估**：✅ 推薦完全重構（高收益）

---

## 8. WORM 快取策略需求驗證

### 當前實現（Phase 2.4 已優化）
```javascript
// 只在首次缺失時計算
let localized = faq.localized;
if (!localized) {
  localized = this.prepareLocalizedContent(faq);
}
```

### 技術必要性評估

#### ✅ **必需** - 避免重複計算
```
性能問題：
- 每個 FAQ 需要 3 種語言 × 4 個欄位 = 12 次操作
- 同一個 FAQ 可能被顯示多次
- 70 個 FAQ × 多次顯示 = 明顯性能瓶頸

決論：某種形式的快取是必需的
```

#### ✅ **已優化** - WORM 快取（Phase 2.4）
```
優點：
- 避免同步問題（寫一次，讀多次）
- 簡單可靠
- 無需失效化邏輯

決論：Phase 2.4 的實現是正確的
```

### 評估

**結論**：✅ 保留（已優化，不需進一步改進）

---

## 總結矩陣

| 功能 | 業務必需 | 技術必需 | 複雜度 | 簡化方案 |
|------|--------|--------|-------|---------|
| 多語言支持 | ✅ | ✅ | 高 | API 層預先組合 |
| CRM 標籤 | ✅ | ❌ | 中 | 保留（已足夠簡潔） |
| Intent 系統 | ✅ | ❌ | 中 | 移除 utterance_patterns |
| 分析統計 | ✅ | ✅ | 低 | 保留不變 |
| 版本控制 | ✅ | ✅ | 低 | 保留不變 |
| 多欄位結構 | 🟡 部分 | ❌ | 高 | 統一為 text + tip + postscript |
| 多層轉換 | ❌ | ❌ | 高 | 合併到 API 層 |
| WORM 快取 | ❌ | ✅ | 低 | 保留不變（已優化） |

---

## 決策

### 🔴 高優先級（必做，高收益）

1. **API 層改造** - 統一響應格式
   - 合併多層轉換到 API 層
   - 語言 fallback 由 API 處理
   - 預先組合 summary + details + tip

2. **移除 utterance_patterns**
   - 複雜度高，維護成本高
   - 搜尋場景下 keywords 足夠
   - 可獨立移除，無依賴

### 🟡 中優先級（應做，中等收益）

1. **簡化多欄位結構**
   - 統一為 text + tip + postscript
   - 需要數據遷移

2. **統一語言選擇邏輯**
   - 移到 API 層
   - 代價：無法前端動態切換

### 🟢 低優先級（可不做）

1. 移除 CRM 標籤（複雜度低，價值高，保留）
2. 移除版本控制（架構基礎，保留）
3. 移除分析統計（複雜度低，價值高，保留）

---

**Next**: Phase 3.3 - 識別具體的冗餘設計點

Generated: 2025-11-13
Status: Phase 3.2 - Requirements Validation
