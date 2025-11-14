# 📊 FAQ 後台追蹤系統 - 目前數據清單

**日期**: 2025-11-14
**狀態**: 分析中

---

## 🗂️ 第 1 部分：資料庫現狀

### SQLite 表格清單

| 表名 | 記錄數 | 欄位數 | 狀態 | 說明 |
|------|--------|--------|------|------|
| **faq_views** | 2 | 11 | ✅ 有數據 | 追蹤 FAQ 點擊 |
| **section_views** | 0 | 3 | ⚠️ 空 | 應追蹤分類點擊 |
| **resort_clicks** | 0 | 5 | ⚠️ 空 | 應追蹤雪場點擊 |
| **tag_clicks** | 0 | 5 | ⚠️ 空 | 應追蹤標籤點擊 |
| **llm_usage** | 0 | 13 | ⚠️ 空 | 應追蹤 LLM 使用 |
| **provider_stats** | 0 | 8 | ⚠️ 空 | 應追蹤供應商統計 |
| **feedback** | - | - | ❌ 不存在 | 應追蹤用戶反饋 |

---

## 📋 第 2 部分：前端追蹤實現

### 前端調用的追蹤端點 (9 個)

#### 1️⃣ **trackFAQInteraction()**
- **位置**: `index.html:2047-2071`
- **何時調用**: 用戶點擊搜尋結果或側邊欄 FAQ
- **終點**: `POST /api/v1/analytics/track-faq-view`
- **Payload**:
  ```json
  {
    "faq_id": "faq.instructor.001",
    "clicked": true,
    "language": "zh",
    "source": "search_results",
    "position": 1,
    "query_text": "搜尋文本",
    "session_id": "sess_...",
    "timestamp": "ISO8601"
  }
  ```
- **現狀**: ✅ 工作正常（有 2 筆數據）

---

#### 2️⃣ **trackSectionClick()** (重複實現)
- **位置 A**: `index.html:2074-2090`
- **位置 B**: `index.html:2652-2665`
- **何時調用**: 用戶點擊左側分類或側邊欄分類
- **終點 A**: `POST /api/v1/analytics/track-section-view`
- **終點 B**: `POST /api/v1/analytics/track-section-click`
- **Payload**:
  ```json
  {
    "section": "預約與變更",
    "language": "zh",
    "timestamp": "ISO8601"
  }
  ```
- **現狀**: ⚠️ 兩個函數做相同事情，可能造成重複或混亂
- **問題**: 不清楚 `track-section-view` 和 `track-section-click` 的區別

---

#### 3️⃣ **track-tag-click**
- **位置**: `index.html:3018`
- **何時調用**: 用戶點擊某個標籤（需確認）
- **終點**: `POST /api/v1/analytics/track-tag-click`
- **Payload**:
  ```json
  {
    "tag_type": "...",
    "tag_name": "...",
    "item_id": "...",
    "language": "zh",
    "timestamp": "ISO8601"
  }
  ```
- **現狀**: ❌ 無數據（表為空）
- **原因**: 不清楚前端是否真的發送此請求

---

#### 4️⃣ **track-resort-click** (呼叫 2 次)
- **位置 A**: `index.html:3095` - 雪場列表點擊
- **位置 B**: `index.html:3128` - 雪場詳情點擊
- **何時調用**: 用戶點擊雪場名稱或雪場連結
- **終點**: `POST /api/v1/analytics/track-resort-click`
- **Payload**:
  ```json
  {
    "click_type": "list" | "detail",
    "resort_id": "nozawa",
    "region": "North Honshu",
    "language": "zh",
    "timestamp": "ISO8601"
  }
  ```
- **現狀**: ❌ 無數據（表為空）
- **原因**: 不清楚前端是否真的執行到這些代碼

---

#### 5️⃣ **track-resort-engagement**
- **位置**: `index.html:3174`
- **何時調用**: 用戶與雪場區塊互動（需確認）
- **終點**: `POST /api/v1/analytics/track-resort-engagement`
- **Payload**: (需檢查前端代碼)
- **現狀**: ❌ 無數據（表為空）
- **原因**: 不清楚觸發條件

---

#### 6️⃣ **feedback** (呼叫 2 次)
- **位置 A**: `index.html:3815`
- **位置 B**: `index.html:3942`
- **何時調用**: 用戶提交反饋
- **終點**: `POST /api/v1/analytics/feedback`
- **Payload**:
  ```json
  {
    "faq_id": "...",
    "sentiment": "helpful" | "not_helpful",
    "message": "...",
    "timestamp": "ISO8601"
  }
  ```
- **現狀**: ❓ 未知（feedback 表不存在）
- **問題**: **關鍵缺陷** - 前端發送數據卻無表存儲

---

### 追蹤端點調用位置地圖

```
前端代碼位置          → 後端終點                     → 資料庫表          → 現狀
───────────────────────────────────────────────────────────────────────
trackFAQInteraction   → track-faq-view              → faq_views         ✅ 有數據
trackSectionClick (A) → track-section-view         → section_views      ❌ 無數據
trackSectionClick (B) → track-section-click        → (不清楚)           ❌ 無數據
track-tag-click       → track-tag-click            → tag_clicks        ❌ 無數據
track-resort-click    → track-resort-click         → resort_clicks     ❌ 無數據
track-resort-engage   → track-resort-engagement    → (無表)            ❌ 無數據
feedback              → feedback                   → (表不存在)        ❌ 關鍵問題
```

---

## 🔍 第 3 部分：後端統計端點

### 後端實現的統計端點 (28 個)

#### 追蹤端點 (7 個)
| 端點 | 實現 | 被調用 | 數據 | 備註 |
|------|------|--------|------|------|
| `POST /track-faq-view` | ✅ | ✅ | ✅ 2筆 | 工作正常 |
| `POST /track-section-view` | ✅ | ✅ | ❌ 0筆 | 無數據 |
| `POST /track-section-click` | ✅ | ✅ | ❌ 0筆 | 無數據 |
| `POST /track-tag-click` | ✅ | ❓ | ❌ 0筆 | 不清楚 |
| `POST /track-resort-click` | ✅ | ✅ | ❌ 0筆 | 無數據 |
| `POST /track-resort-engagement` | ✅ | ❓ | ❌ 0筆 | 不清楚 |
| `POST /feedback` | ✅ | ✅ | ❓ | 表不存在 |

#### 統計端點 (20+ 個)
| 類別 | 端點數 | 被調用 | 備註 |
|------|--------|--------|------|
| FAQ 相關 | 3 | ❌ 僅 hot-faqs | `/faq-stats`, `/faq-insights` 未使用 |
| Section 相關 | 2 | ❌ 都未使用 | `/section-stats` x 2 (重複實現) |
| Tag 相關 | 1 | ❌ 未使用 | `/tag-stats` |
| Resort 相關 | 2 | ❌ 未使用 | `/resort-stats`, `/resort-engagement-stats` |
| Feedback 相關 | 6 | ❌ 都未使用 | `/feedback-stats`, `/feedback-top-items` 等 |
| LLM 相關 | 2 | ❌ 都未使用 | `/llm-stats`, `/provider-comparison` |
| 通用統計 | 4 | ❌ 都未使用 | `/popular-queries`, `/hourly-trends` 等 |

**總結**: **20+ 個統計端點實現但完全未使用**

---

## 📊 第 4 部分：實際使用的功能

### 唯一被使用的統計功能

**`GET /api/v1/analytics/hot-faqs`**
- **位置**: `index.html:2584`
- **用途**: 載入「熱門常見問題」列表
- **顯示位置**: 右側邊欄「熱門常見問題」區塊
- **參數**: `?limit=5&days=30&language=zh`
- **降級策略**:
  - 若 API 失敗 → 使用手動標記的 `hot: true` FAQ
  - 若沒有手動標記 → 使用前 5 個 FAQ
- **現狀**: ✅ **完全實現且有降級邏輯**

**結論**: 這是系統中**唯一被前端使用的統計功能**

---

## 🎯 第 5 部分：真實數據一覽

### 目前實際存儲的數據

```
faq_views 表 (2 筆記錄):
┌─────────┬──────────────────┬──────────┬────────────┬───────────┬──────────┐
│ faq_id  │ source           │ language │ timestamp  │ clicked   │ position │
├─────────┼──────────────────┼──────────┼────────────┼───────────┼──────────┤
│ faq.ins │ search_results   │ zh       │ 2025-11... │ 1         │ 0        │
│ faq.gen │ search_results   │ zh       │ 2025-11... │ 1         │ 0        │
└─────────┴──────────────────┴──────────┴────────────┴───────────┴──────────┘

其他所有表: 都是空的 (0 筆記錄)
```

---

## 🤔 第 6 部分：問題診斷

### 為什麼某些追蹤無數據？

#### 問題 1: Section 追蹤
```
❓ 不清楚原因為何：
  1. 是否用戶根本沒有點擊分類？
  2. 是否前端代碼沒有執行到 trackSectionClick()？
  3. 是否 API 請求被發送但後端拒絕了？
  4. 是否 track-section-view 和 track-section-click 應該各自做不同的事？
```

#### 問題 2: Resort/Tag 追蹤
```
❓ 不清楚原因：
  1. 前端代碼是否真的執行？
  2. 用戶是否真的點擊了雪場或標籤？
  3. 是否有 JavaScript 錯誤導致請求失敗？
  4. 後端是否正確接收並儲存？
```

#### 問題 3: Feedback 表缺失
```
🔴 明確問題：
  ✅ 前端有發送 /feedback 請求的代碼
  ❌ 但 SQLite 中沒有 feedback 表
  ❌ 所有用戶反饋數據都丟失了
```

---

## 📝 第 7 部分：需要確認的問題

### 給開發團隊的問題清單

#### 關於 Section 追蹤的兩個函數
```javascript
位置 A (2074): trackSectionClick(section) → track-section-view
位置 B (2652): trackSectionClick(section) → track-section-click
```
- **Q1**: 這兩個端點應該做相同的事嗎？
- **Q2**: 還是各自有不同的用途？
- **Q3**: 應該合併還是保留？

#### 關於追蹤數據為什麼是空的
- **Q1**: 用戶是否真的在點擊這些按鈕？
- **Q2**: 前端代碼是否確實執行了？
- **Q3**: 是否有 JavaScript 錯誤？

---

## 🎯 第 8 部分：業務需求分析

### 根據實際使用，系統真正需要的數據

#### ✅ 高優先級（明確在使用）
1. **FAQ 熱度排行**
   - 需要: `faq_views` 表中的點擊數據
   - 用途: 顯示「熱門常見問題」
   - 現狀: ✅ 已實現且運作

#### ⚠️ 中優先級（可能需要，需確認）
2. **分類流量統計**
   - 需要: 用戶在各分類中的活動
   - 用途: 優化分類結構？改進 CRM？
   - 現狀: 追蹤代碼存在但無數據

3. **雪場興趣排行**
   - 需要: 用戶對各雪場的點擊數
   - 用途: 了解用戶偏好？推薦行程？
   - 現狀: 追蹤代碼存在但無數據

4. **用戶反饋**
   - 需要: 用戶對 FAQ 的滿意度反饋
   - 用途: 改進 FAQ 內容？識別問題答案？
   - 現狀: 追蹤代碼存在但表不存在（數據丟失）

5. **LLM 使用成本**
   - 需要: LLM 調用的 token 和成本統計
   - 用途: 成本控制？優化提示詞？
   - 現狀: 表存在但無數據

#### ❓ 低優先級（需要決策）
6. **標籤點擊統計**
   - 需要: 用戶對標籤的互動
   - 用途: 不清楚
   - 現狀: 追蹤代碼存在但無數據

---

## 📌 第 9 部分：建議的下一步

### 立即 (1-2 天)
1. **診斷追蹤數據為什麼是空的**
   ```bash
   # 用 Chrome DevTools 檢查:
   # 1. Network 標籤: 是否發送了 API 請求？
   # 2. Console: 是否有 JavaScript 錯誤？
   # 3. 後端日誌: 是否收到請求？
   ```

2. **修復 feedback 表缺失**
   ```javascript
   // 在 AnalyticsService 初始化中添加 feedback 表
   CREATE TABLE IF NOT EXISTS feedback (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     faq_id TEXT,
     sentiment TEXT,
     message TEXT,
     timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
   );
   ```

3. **澄清 Section 追蹤的兩個函數**
   - 確認是否應該合併或保留

### 短期 (本週)
4. **根據業務需求決定保留/刪除哪些追蹤**
   - 如果不需要: 刪除相關代碼
   - 如果需要: 確保數據真的被收集

### 中期 (本月)
5. **考慮是否需要分析儀表板**
   - 如果需要: 設計儀表板
   - 如果不需要: 保留或刪除統計端點

---

## ✅ 驗證清單

- [x] 列出所有資料庫表及其狀態
- [x] 列出所有前端追蹤調用
- [x] 列出所有後端統計端點
- [x] 識別實際使用的功能
- [x] 診斷為什麼某些表為空
- [ ] 收集業務方對需求的反饋
- [ ] 決定保留/刪除哪些功能

---

**生成日期**: 2025-11-14
**狀態**: 等待您的需求確認
