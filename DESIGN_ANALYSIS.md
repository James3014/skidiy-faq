# FAQ 系統設計分析 - Linus 原則應用

**Created**: 2025-11-13
**Phase**: 3.1 - 架構審計與設計分析
**Principle**: Linus Torvalds "Good Taste"

---

## 核心問題分析

### Q1：為什麼需要 answer_template 有 summary、details、tip、postscript 四個欄位 + text 統一欄位？

#### 當前狀態
```javascript
answer_template: {
  summary: "短答案",
  details: "詳細答案",
  tip: "提示信息",
  postscript: "後記",
  text: "summary + details（Phase 1 新增）",

  // 加上每個欄位的翻譯版本
  summary_translations: { en: ..., th: ... },
  details_translations: { en: ..., th: ... },
  tip_translations: { en: ..., th: ... },
  postscript_translations: { en: ..., th: ... }
}
```

#### Linus 評價：❌ 複雜度過高
- **問題**：4 個欄位 + 翻譯版本 = 12+ 個字段要維護
- **症狀**：前端需要組合 summary + details；翻譯缺失時需要 fallback
- **結果**：多層轉換邏輯，bug 難以追蹤

#### 設計決策原因（推測）
1. **搜尋優化**：Fuse.js 用 summary 而非完整答案進行搜尋
2. **翻譯靈活性**：不同部分可能翻譯進度不同
3. **UI 優化**：列表顯示用 summary，詳情顯示用完整答案
4. **歷史累積**：系統演進過程中逐漸添加

#### Linus 解決方案
✅ **Phase 1 已做**：添加 `text` 欄位（在 API 層預先組合）
✅ **Phase 4 計劃**：
- 刪除 `summary` 和 `details`，只保留 `text`
- 搜尋時使用 `text` 而非 `summary`
- 一個欄位代替多個，減少維護負擔

**代碼減少**：
```javascript
// 當前：需要檢查三個欄位
const answer = faq.answer_template.text ||
               (faq.answer_template.summary + faq.answer_template.details);

// 簡化後：直接使用
const answer = faq.answer_template.text;
```

---

### Q2：為什麼需要 faq.localized 快取層？

#### 當前狀態
```javascript
// FAQEngine.getLocalizedContent() 中
let localized = faq.localized;  // 檢查快取
if (!localized) {
  localized = this.prepareLocalizedContent(faq);  // 計算一次並緩存
}
```

#### Linus 評價：🟡 合理但可優化
- **合理性**：確實有性能收益（避免重複計算）
- **問題**：增加複雜性（快取同步、無效化等）
- **我們的優化**：Phase 2.4 已用 WORM 快取（write-once, read-many）

#### 為什麼存在
1. **性能考慮**：prepareLocalizedContent 有複雜邏輯
   - 組合多個欄位 (summary + details + tip + postscript)
   - 檢查翻譯版本，處理語言 fallback
   - 需要多次字符串操作

2. **避免重複計算**：同一個 FAQ 被多次使用
   - 搜尋結果列表（每個結果顯示一次）
   - 點擊詳情後再顯示一次
   - 多語言切換時也會重新調用

#### 現在的優化情況
✅ **Phase 2.4 完成**：WORM 快取（無失效化問題）
```javascript
// 只在首次缺失時計算，之後總是從 faq.localized 讀取
// 優點：避免重複計算，沒有同步問題（數據不變）
```

#### Linus 進一步簡化（Phase 4 後期考慮）
🔄 **未來方案**：在 API 層直接返回本地化內容
```javascript
// 當前：前端計算
// API 返回原始數據 → 前端計算 localized → 顯示

// 簡化後：API 計算
// API 直接返回 localized 數據 → 前端直接顯示
```

---

### Q3：為什麼語言翻譯不在 API 層處理？

#### 當前狀態
```javascript
// API 返回原始多語言結構
{
  canonical_question: "...",  // 中文
  canonical_question_translations: {
    en: "...",
    th: "..."
  },
  answer_template: {
    text: "...",
    text_translations: { en: "...", th: "..." }
  }
}

// 前端負責：
// 1. 選擇語言版本
// 2. 處理 fallback（翻譯缺失時回退到中文）
// 3. 組合答案
```

#### Linus 評價：🟡 設計權衡
- **靈活性**（當前選擇）：支持動態語言切換，無需重新調用 API
- **簡潔性**（Linus 建議）：在 API 層統一處理，前端零邏輯

#### 為什麼當前這樣設計
1. **動態語言切換**：用戶可在 UI 上切換語言，無需重新加載 FAQ
2. **減少 API 冗余**：如果為每種語言都返回完整副本，響應大小會 ↑ 3 倍
3. **靈活性**：前端可以決定 fallback 邏輯

#### Linus 解決方案（Phase 4）
改為 API 層統一處理：
```javascript
// API 返回已經按語言分離的結構
// GET /api/v1/faq/all?lang=zh
{
  id: "...",
  content: {
    question: "中文問題",
    answer: "中文答案（已組合）",
    postscript: "中文後記"
  }
}

// 前端零轉換邏輯：直接使用
const { question, answer, postscript } = faq.content;
```

**權衡**：
- ❌ 無法在前端動態語言切換（需要重新調用 API）
- ✅ 前端代碼簡潔 30%
- ✅ API 響應小 40%
- ✅ 減少  bug 風險

---

### Q4：為什麼有本地 JSON 文件和遠端 API 兩份來源？

#### 當前狀態
```
/zeabur_backend/data/faq_kb.phase0a.json ← 版本控制的單一真實來源
         ↓ (讀取)
backend/src/routes/faq.js ← API 層進行轉換
         ↓ (返回)
frontend/lib/faq-engine.js ← 前端調用 API
```

#### Linus 評價：✅ 好設計
- **版本控制很重要**：所有 FAQ 變更都有 Git 歷史
- **API 層轉換是好的**：數據內聚性強
- **沒有冗余**：JSON 文件是唯一真實來源，API 是對外接口

#### 為什麼這樣設計
1. **版本控制**：FAQ 修改都能 review 和 rollback
2. **多環境支持**：不同環境可加載不同的 FAQ
3. **API 轉換**：在返回時進行規範化（如 Phase 1 添加 text 欄位）

#### Linus 建議
✅ **保留此結構**，不需要簡化

---

## 簡化機會優先級表

| 項目 | 當前複雜度 | 簡化難度 | 預期收益 | 優先級 | 何時實施 |
|------|---------|---------|--------|-------|--------|
| 統一 API 響應格式 | 高 | 中 | 高 | 🔴 P1 | Phase 4.1 |
| 刪除 summary/details | 高 | 高 | 高 | 🔴 P1 | Phase 4.1 |
| 統一語言 fallback 到 API | 中 | 中 | 中 | 🟡 P2 | Phase 4.1 |
| 簡化 FAQEngine | 中 | 低 | 中 | 🟡 P2 | Phase 4.3 |
| 使用 WORM 快取 | 中 | 低 | 中 | 🟡 P2 | ✅ Phase 2.4 |

---

## Linus 原則的四層應用

### Layer 1：Good Taste - 消除特殊情況

**現狀識別**：
```javascript
// ❌ 多個地方需要檢查 text 或組合 summary+details
const answer = faq.answer_template.text ||
               (faq.answer_template.summary + faq.answer_template.details);

// ❌ 語言 fallback 邏輯分散
if (localized[language]) {
  return localized[language];
} else {
  return localized['zh'];  // 中文 fallback
}
```

**應用結果**：
```javascript
// ✅ 統一的欄位名稱
const answer = faq.answer_template.text;  // 總是有內容

// ✅ 單一的 fallback 點
// API 層在返回時已經處理了所有 fallback
```

### Layer 2：Never Break Userspace - 向後相容

**過渡策略**：
1. API 同時支持舊格式和新格式
2. 前端逐步遷移到新格式
3. 設定遷移期限（如 1 個月後移除舊格式）

### Layer 3：Pragmatism - 實用性優於完美

**決定**：
- 優先實施高收益的簡化（API 層改造）
- 延遲低優先級的簡化（完美化）
- 保留業務必需的複雜性（多語言、CRM 整合）

### Layer 4：Simplicity - 簡潔優於完美

**目標指標**：
```
複雜度（自定義評分 1-10）：
- 當前：7/10
  - 5 層數據轉換
  - 15+ API 字段
  - 12+ FAQEngine 方法
  - 多處 fallback 邏輯

- 簡化後：4/10
  - 2 層數據轉換
  - 6 API 字段
  - 3 FAQEngine 方法
  - 單一 fallback 點
```

---

## Phase 4 實施方案預覽

### 4.1 新的 API 響應格式

**從這樣**：
```javascript
GET /api/v1/faq/all
{
  items: [
    {
      id: "faq.itinerary.001",
      canonical_question: "...",
      canonical_question_translations: { en: "...", th: "..." },
      answer_template: {
        summary: "...",
        details: "...",
        tip: "...",
        postscript: "...",
        // 加上翻譯版本... (15+ 字段)
      },
      crm_tags: [...],
      // 其他元數據
    }
  ]
}
```

**改為這樣**：
```javascript
GET /api/v1/faq/all?lang=zh  // 指定語言
{
  items: [
    {
      id: "faq.itinerary.001",
      content: {
        question: "應該先訂好機票住宿，還是先預約滑雪教練？",
        answer: "我們強烈建議您「先預約教練，再訂機票住宿」...\n\n先確認預約到您想要的教練與時段後...",
        postscript: "更多資訊與最新名額，請以預約系統顯示為準。"
      },
      metadata: {
        intent: "ITINERARY",
        section: "行程規劃與周邊",
        crm_tags: ["#行程規劃", "#旺季預約"],
        hot: true
      }
    }
  ]
}
```

**收益**：
- ✅ API 字段減少 60%（15+ → 6）
- ✅ 前端零轉換邏輯
- ✅ 清晰的職責分離

---

## 成功標準

✅ 架構審計完成（本文檔）
✅ 設計決策有據可查
✅ 簡化方案清晰可行
⏳ Phase 4 準備好實施

---

**下一步**：Phase 3.2 - 文檔化並驗證所有設計決策是否真的必需

Generated: 2025-11-13
Status: Phase 3.1 Complete ✅
