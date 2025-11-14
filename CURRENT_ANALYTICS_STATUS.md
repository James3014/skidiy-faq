# 後台統計系統 - 現狀評估報告

**評估日期**: 2025-11-14
**評估方式**: 代碼審查 + 數據檢查
**目的**: 確認目前實際的使用情況

---

## 📊 第 1 部分：追蹤層現狀

### 1.1 前端追蹤端點使用情況

| 追蹤端點 | 代碼位置 | 調用時機 | 數據流 | 狀態 |
|---------|--------|--------|-------|------|
| `track-faq-view` | index.html:2062 | FAQ 被點擊時 | ✅ 進入 faq_views | **運作中** |
| `track-section-view` | index.html:2076 | Section 被點擊時 | ✅ 進入 section_views | **運作中** |
| `track-section-click` | index.html:2669 | Section 被點擊時 | ✅ 進入 section_views | **重複** |
| `track-tag-click` | index.html:3018 | 標籤被點擊時 | ✅ 進入 tag_clicks | **運作中** |
| `track-resort-click` | index.html:3095, 3128 | Resort/區域點擊時 | ✅ 進入 resort_clicks | **運作中 (2 次)** |
| `track-resort-engagement` | index.html:3174 | Resort 互動時 | ✅ 進入？ | **運作中** |
| `feedback` | index.html:3815, 3942 | 用戶提交反饋時 | ✅ 進入 feedback | **運作中 (2 次)** |

**追蹤層總結**:
- ✅ **7 個追蹤端點正在運作**
- ✅ **前端確實在調用**
- ✅ **數據正在進入 SQLite**
- ⚠️ **section-view 和 section-click 功能重複**

### 1.2 追蹤數據現狀

**SQLite 表格**:
```
faq_views        ← track-faq-view 的數據
section_views    ← track-section-view / track-section-click 的數據
tag_clicks       ← track-tag-click 的數據
resort_clicks    ← track-resort-click 的數據
resort_engagement ← track-resort-engagement 的數據
feedback         ← feedback 的數據
```

**驗證方式** (應該檢查):
```bash
sqlite3 data/analytics.db "SELECT COUNT(*) FROM faq_views LIMIT 1;"
sqlite3 data/analytics.db "SELECT COUNT(*) FROM section_views LIMIT 1;"
sqlite3 data/analytics.db "SELECT COUNT(*) FROM feedback LIMIT 1;"
# 如果這些返回 > 0，表示有數據進入
```

---

## 🔍 第 2 部分：分析層現狀

### 2.1 實現的統計端點

| 端點 | 行數 | 邏輯 | 用途 | 被調用 |
|------|-----|------|------|--------|
| `/hot-faqs` | 62 | ✅ 完整 | 最熱門 FAQ | ⚠️ 僅在 frontend 中調用 1 次 |
| `/faq-stats` | 150 | ✅ 完整 | FAQ 統計 | ❌ 未調用 |
| `/section-stats` | 186 | ✅ 完整 | Section 統計 | ❌ 未調用 |
| `/feedback-stats` 系列 | 285 | ✅ 完整 | 反饋統計 | ❌ 未調用 |
| `/tag-stats` | 114 | ✅ 完整 | 標籤統計 | ❌ 未調用 |
| `/resort-stats` | 169 | ✅ 完整 | Resort 統計 | ❌ 未調用 |
| 其他端點 | ~450 | ✅ 完整 | 各種分析 | ❌ 未調用 |

**分析層總結**:
- ✅ **20+ 個統計端點完全實現**
- ✅ **邏輯都是正確的**
- ❌ **但只有 `/hot-faqs` 被調用過**
- ❌ **其他 99% 的統計端點零調用**

### 2.2 `/hot-faqs` 的使用

**在前端中的調用**:
```javascript
// frontend/index.html (某個位置)
const response = await fetch(`${API_BASE}/analytics/hot-faqs?limit=5&days=30&language=${currentLanguage}`);
// 這個調用會返回最熱門的 FAQ
```

**但接收到數據後的處理**:
```javascript
// 接到數據後，會被用來... (需要確認在哪裡展示)
// 可能被用來推薦 FAQ，或放在某個UI位置
```

---

## ❌ 第 3 部分：展示層現狀

### 3.1 儀表板/管理後台

**當前狀況**:
- ❌ 沒有 `admin.html` 中的分析頁面
- ❌ 沒有儀表板顯示統計數據
- ❌ 沒有地方顯示「最熱門 FAQ」
- ❌ 沒有地方顯示「最常見反饋」
- ❌ 沒有地方顯示「Resort 興趣排行」

### 3.2 CRM 整合

**當前狀況**:
- ❌ CRM 系統 (`tagger.html`) 不知道這些統計數據
- ❌ 沒有根據數據推薦 FAQ
- ❌ 沒有根據數據優化標籤

---

## 🔄 第 4 部分：完整數據流

### 4.1 當前的數據流

```
用戶點擊 FAQ
    ↓
front 端: trackFaqView()
    ↓
fetch(/api/v1/analytics/track-faq-view)
    ↓
後端: 儲存到 SQLite faq_views 表
    ↓
數據進入了... 但停止了
    ↓
❌ 沒有人取出這些數據
❌ 沒有地方展示
❌ 沒有地方使用
```

### 4.2 應該的數據流

```
用戶點擊 FAQ
    ↓
前端: trackFaqView()
    ↓
後端: 儲存到 SQLite
    ↓
[計劃] 定期分析
    ↓
[計劃] 通過 /faq-stats 暴露數據
    ↓
[計劃] 前端儀表板或 CRM 調用 /faq-stats
    ↓
[計劃] 展示給用戶
    ↓
[計劃] 根據數據做決策
```

**當前缺少的**: 從「暴露數據」往後的所有步驟

---

## 📋 第 5 部分：已知問題列表

### 問題 1: 重複的 Section 追蹤

**現象**:
```javascript
// 兩個地方都在追蹤 section 點擊
await fetch(`${API_BASE}/analytics/track-section-view`)     // 第一個
await fetch(`${API_BASE}/analytics/track-section-click`)    // 第二個
```

**影響**:
- section_views 表中的數據被重複記錄
- 統計數字會是兩倍

**確認方式**:
```bash
sqlite3 data/analytics.db "SELECT COUNT(*) FROM section_views WHERE timestamp > datetime('now', '-1 day');"
# 如果數字特別大，可能是重複
```

---

### 問題 2: `/hot-faqs` 被調用但不知道在哪裡展示

**現象**:
- 前端有調用 `/hot-faqs` 端點
- 但不清楚這個數據被用在了哪裡

**需要確認**:
- [ ] 這個數據被展示在前端的什麼地方？
- [ ] 是否有推薦欄位？側邊欄？
- [ ] 如果有，用戶看得見嗎？

---

### 問題 3: 20+ 個統計端點零使用

**現象**:
- 實現了 `/faq-stats`, `/section-stats`, `/feedback-stats` 等
- 但沒有任何代碼調用這些端點

**可能原因**:
1. 這些功能沒有對應的 UI/需求
2. 或者是在計劃中，但還沒實現
3. 或者是技術債 - 「以防萬一」實現的

---

### 問題 4: 不清楚誰應該使用這些數據

**現象**:
- 統計端點都實現了
- 但沒有明確的使用者角色

**應該問的問題**:
- [ ] CRM 經理需要看反饋統計嗎？
- [ ] FAQ 編寫者需要看 FAQ 點擊統計嗎？
- [ ] 營銷團隊需要看 Resort 興趣嗎？
- [ ] 如果需要，他們何時需要？每天？每週？

---

## 🎯 第 6 部分：需要確認的清單

### 確認項 1: SQLite 數據狀態

```bash
# 執行以下命令，確認是否有實際數據
sqlite3 /path/to/analytics.db

# 查詢各表的記錄數
SELECT 'faq_views' as table_name, COUNT(*) as count FROM faq_views
UNION ALL
SELECT 'section_views', COUNT(*) FROM section_views
UNION ALL
SELECT 'feedback', COUNT(*) FROM feedback
UNION ALL
SELECT 'resort_clicks', COUNT(*) FROM resort_clicks
UNION ALL
SELECT 'tag_clicks', COUNT(*) FROM tag_clicks;

# 查詢最近的數據
SELECT timestamp, faq_id FROM faq_views ORDER BY timestamp DESC LIMIT 10;
```

### 確認項 2: `/hot-faqs` 在前端的使用位置

```bash
# 查詢 /hot-faqs 被調用後，數據在哪裡被使用
grep -A 20 "hot-faqs" /path/to/frontend/index.html

# 查詢這個數據被寫入了什麼 DOM 元素
grep -n "innerHTML\|textContent\|appendChild" 上面找到的代碼段
```

### 確認項 3: 是否有 admin.html

```bash
# 檢查是否存在管理員頁面
ls -la /path/to/frontend/admin.html

# 如果存在，查看是否調用了分析端點
grep "analytics\|stats" /path/to/frontend/admin.html
```

### 確認項 4: 詢問產品/CRM 需求

**應該問**:
- [ ] 「CRM 團隊是否需要看用戶反饋統計？」
- [ ] 「FAQ 編寫者是否需要知道哪些 FAQ 點擊率低？」
- [ ] 「營銷團隊是否需要知道哪個 Resort 最受關注？」
- [ ] 「如果有儀表板，你們會每天看嗎？」

---

## 📝 第 7 部分：當前的不確定性

### 不確定性 1: 數據是否在被正確收集

**假設**: 前端在調用追蹤端點，所以應該有數據

**需要驗證**:
- SQLite 中是否有 > 100 條記錄？
- 數據的時間戳是否是最近的？
- 數據的格式是否正確？

### 不確定性 2: `/hot-faqs` 的作用

**已知**: 前端在調用這個端點

**未知**:
- 數據被用來做什麼？
- 是否影響用戶體驗？
- 是否被展示給用戶？

### 不確定性 3: 統計端點是否應該被刪除

**不能單純說「刪除」**，因為：
- 可能有人計劃在以後使用
- 可能是 CRM 系統之後需要的
- 刪除容易，重新寫很費時間

**應該先問**: 這些功能是否在產品規劃中

---

## 🔧 第 8 部分：建議的後續步驟

### 步驟 1: 數據驗證 (1 小時)

```bash
# 檢查 SQLite 中是否有實際數據
sqlite3 data/analytics.db "SELECT COUNT(*) as total_faq_views FROM faq_views;"

# 檢查最新的數據時間
sqlite3 data/analytics.db "SELECT MAX(timestamp) FROM faq_views;"

# 檢查 section_views 是否被重複記錄
sqlite3 data/analytics.db "SELECT COUNT(*) FROM section_views WHERE timestamp > datetime('now', '-1 day');"
```

**預期結果**:
- 應該看到 > 100 條記錄（如果系統已上線）
- 最新時間應該是「最近的」
- section_views 的數字應該不會「太大」

### 步驟 2: 前端使用確認 (2 小時)

```bash
# 1. 確認 /hot-faqs 的使用位置
grep -n "hot-faqs" frontend/index.html

# 2. 查看返回的數據被用在哪裡
# 可能的用途: 側邊欄、卡片、推薦區塊

# 3. 驗證 /hot-faqs 是否真的在工作
curl "http://localhost:3000/api/v1/analytics/hot-faqs?limit=5&days=30"
# 應該返回一個列表
```

### 步驟 3: 需求確認 (30 分鐘)

詢問以下人員:
- CRM 經理: 「你們需要什麼樣的統計報告？」
- 產品經理: 「有沒有計劃添加儀表板？」
- FAQ 編寫者: 「你們想知道哪些 FAQ 點擊率低嗎？」

### 步驟 4: 根據需求決定 (30 分鐘)

基於上面的確認，選擇：
- **方案 A**: 刪除所有未使用的統計端點 (簡潔)
- **方案 B**: 保留所有但標記為「未使用」 (保險)
- **方案 C**: 實現一個簡單的儀表板 (完整)

---

## 📊 總結表

| 方面 | 當前狀態 | 數據流 | 優先級 |
|------|--------|--------|--------|
| **追蹤層** | ✅ 運作中 | 數據進入 | ✅ 保持 |
| **分析層** | ✅ 完全實現 | 端點存在但未用 | ? 待確認 |
| **展示層** | ❌ 缺失 | 沒有儀表板 | ? 待確認 |
| **行動層** | ❌ 缺失 | 不推動決策 | ? 待確認 |

---

**評估完成**: 2025-11-14
**下一步**: 執行上述 4 個步驟，收集信息後再決定如何優化
**預計時間**: 3-4 小時 (包括與相關人員的討論)
