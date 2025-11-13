# FAQ & Resort Tag Tracking System - 完整指南

## 📋 目錄
- [功能概覽](#功能概覽)
- [已完成功能](#已完成功能)
- [使用指南](#使用指南)
- [FAQ Tag 分析](#faq-tag-分析)
- [重新標記 FAQ](#重新標記-faq)
- [後端 API](#後端-api)
- [前端實作](#前端實作)
- [測試流程](#測試流程)
- [常見問題](#常見問題)

---

## 功能概覽

### 🎯 核心功能

1. **雪場搜尋功能**
   - 修復靜態部署的雪場搜尋
   - 支援中文/英文/日文名稱搜尋
   - 支援設施 (amenities) 搜尋
   - 支援地區 (region) 搜尋

2. **FAQ Tag 顯示與追蹤**
   - 在 FAQ 卡片上顯示 crm_tags
   - 點擊 tag 自動篩選相關 FAQ
   - 本地追蹤 (localStorage)
   - 後端 API 追蹤

3. **Resort Amenity Tag 追蹤**
   - 雪場設施 tags 可點擊
   - 點擊後篩選相關雪場
   - 追蹤點擊行為

4. **後端 Analytics API**
   - 新增 tag_clicks 資料表
   - POST /api/v1/analytics/track-tag-click
   - GET /api/v1/analytics/tag-stats

5. **Admin Dashboard Tag 分析**
   - 新增 "🏷️ Tag 點擊分析" tab
   - 統計數據視覺化
   - 熱門 tags 排行
   - 每日趨勢圖表
   - 本地記錄顯示

6. **FAQ 重新標記工具**
   - 自動替換 #一般查詢 為具體 tags
   - Dry-run 模式預覽變更
   - 自動備份

---

## 已完成功能

### ✅ 前端 (index.html)

#### 1. 雪場搜尋修復 (lines 1840-1869)
```javascript
// 改用本地 resort_kb.json 搜尋
const resortResponse = await fetch('resort_kb.json');
const resortData = await resortResponse.json();
const queryLower = query.toLowerCase();
resortResults = resortData.resorts.filter(resort => {
  const nameMatch =
    resort.names.zh.toLowerCase().includes(queryLower) ||
    resort.names.en.toLowerCase().includes(queryLower) ||
    resort.names.ja.toLowerCase().includes(queryLower);
  const amenityMatch = resort.amenities &&
    resort.amenities.some(a => a.toLowerCase().includes(queryLower));
  const regionMatch = resort.region.toLowerCase().includes(queryLower);
  return nameMatch || amenityMatch || regionMatch;
});
```

#### 2. FAQ Tag CSS (lines 694-719)
```css
.faq-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.faq-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #e8eaf6;
  color: #4A5F8C;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.faq-tag:hover {
  background: #4A5F8C;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(74, 95, 140, 0.3);
}
```

#### 3. FAQ Tag 渲染 (lines 2013-2020)
```javascript
const tagsHTML = faq.crm_tags && faq.crm_tags.length > 0
  ? `<div class="faq-tags">
      ${faq.crm_tags.map(tag =>
        `<span class="faq-tag" onclick="trackTagClick(event, 'faq', '${DOMPurify.sanitize(tag)}', '${faq.id}')">${DOMPurify.sanitize(tag)}</span>`
      ).join('')}
    </div>`
  : '';
```

#### 4. Tag 追蹤函數 (lines 2052-2123)
```javascript
window.trackTagClick = async function(event, tagType, tagName, itemId) {
  event.stopPropagation();

  const tagClick = {
    timestamp: new Date().toISOString(),
    tag_type: tagType,  // 'faq' or 'resort'
    tag_name: tagName,
    item_id: itemId,
    language: currentLanguage
  };

  // Store in localStorage (last 100 clicks)
  const tagClicks = JSON.parse(localStorage.getItem('tagClicks') || '[]');
  tagClicks.push(tagClick);
  if (tagClicks.length > 100) tagClicks.shift();
  localStorage.setItem('tagClicks', JSON.stringify(tagClicks));

  // Try to send to backend
  try {
    await fetch(`${API_BASE}/analytics/track-tag-click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tagClick)
    });
  } catch (err) {
    console.warn('[Tag Click] Backend tracking unavailable');
  }

  // Filter by tag
  if (tagType === 'faq') {
    filterFAQsByTag(tagName);
  } else if (tagType === 'resort') {
    filterResortsByAmenity(tagName);
  }
};
```

#### 5. Resort Amenity Tag 更新 (lines 1475-1497, 1562-1571)
```javascript
// 初始渲染時使用 onclick
${amenities.slice(0, 15).map(a =>
  `<span class="resort-amenity clickable" onclick="trackTagClick(event, 'resort', '${DOMPurify.sanitize(a)}', '${resort.resort_id}')">${DOMPurify.sanitize(a)}</span>`
).join('')}

// 展開/收合時也使用 onclick
container.innerHTML = allAmenities.map(a =>
  `<span class="resort-amenity clickable" onclick="trackTagClick(event, 'resort', '${DOMPurify.sanitize(a)}', '${resortId}')">${DOMPurify.sanitize(a)}</span>`
).join('');
```

### ✅ 後端 API

#### 1. 資料庫 Schema (analytics-service.js: 105-116)
```sql
CREATE TABLE IF NOT EXISTS tag_clicks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag_type TEXT NOT NULL,      -- 'faq' or 'resort'
  tag_name TEXT NOT NULL,      -- '#課程預約', '夜滑', etc
  item_id TEXT NOT NULL,        -- 'faq.booking.001' or resort_id
  language TEXT DEFAULT 'zh',
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tag_clicks_tag_name ON tag_clicks(tag_name);
CREATE INDEX IF NOT EXISTS idx_tag_clicks_tag_type ON tag_clicks(tag_type);
CREATE INDEX IF NOT EXISTS idx_tag_clicks_timestamp ON tag_clicks(timestamp);
```

#### 2. POST /api/v1/analytics/track-tag-click (analytics.js: 932-974)
```javascript
// Request Body
{
  "tag_type": "faq" | "resort",
  "tag_name": "#課程預約",
  "item_id": "faq.booking.001",
  "language": "zh"
}

// Response
{
  "success": true,
  "data": {
    "tracked": true,
    "tag_type": "faq",
    "tag_name": "#課程預約",
    "item_id": "faq.booking.001"
  }
}
```

#### 3. GET /api/v1/analytics/tag-stats (analytics.js: 1007-1086)
```javascript
// Query Parameters
?tag_type=faq&days=30&limit=20

// Response
{
  "success": true,
  "data": {
    "by_tag": [
      {
        "tag_name": "#課程預約",
        "tag_type": "faq",
        "clicks": 45,
        "unique_items": 12
      }
    ],
    "by_type": [
      { "tag_type": "faq", "total_clicks": 150, "unique_tags": 15 },
      { "tag_type": "resort", "total_clicks": 80, "unique_tags": 25 }
    ],
    "daily": [
      { "date": "2025-11-02", "tag_type": "faq", "clicks": 25 }
    ],
    "period_days": 30
  }
}
```

### ✅ Admin Dashboard (analytics.html)

#### 新增 Tag 分析 Tab (lines 690-757)
- 總 Tag 點擊數統計
- FAQ Tags vs Resort Tags 分類統計
- 最熱門 Tag 顯示
- Tag 類型過濾器
- 時間範圍選擇器 (7/14/30/90 天)
- 🏆 熱門 Tags 排行榜
- 📈 每日趨勢圖表
- 🗂️ 本地記錄顯示

#### JavaScript 函數 (lines 1146-1308)
- `loadTagData()` - 載入 tag 統計數據
- `displayTagStats()` - 顯示 API 數據
- `renderTagDailyChart()` - 渲染每日趨勢圖
- `displayLocalTagData()` - 顯示本地記錄

---

## FAQ Tag 分析

### 目前狀況

**總共 71 個 FAQs**
- 所有 FAQ 都有 tags (0 個沒有 tags)
- 15 種不同的 tags
- **問題**: `#一般查詢` 佔 73.2% (52個)，過於泛用

### Tag 使用頻率

| 排名 | Tag | 數量 | 佔比 | 評價 |
|------|-----|------|------|------|
| 1 | #一般查詢 | 52 | 73.2% | ⚠️ 過於泛用 |
| 2 | #親子同堂詢問 | 6 | 8.5% | ✅ 明確 |
| 3 | #退費規則 | 5 | 7.0% | ✅ 明確 |
| 4 | #改人數 | 4 | 5.6% | ✅ 明確 |
| 5 | #指定教練 | 3 | 4.2% | ✅ 明確 |
| 6-15 | 其他 10 個 | 1-2 | <3% | ✅ 明確但使用較少 |

### 建議的 Tag 系統 (26 個 tags)

#### 🎯 核心業務類 (8 個)
1. `#課程預約` - 預約相關
2. `#時段查詢` - 查詢空檔
3. `#費用計算` - 費用相關
4. `#付款方式` - 付款流程
5. `#預約變更` - 改期改人數
6. `#預約取消` - 取消退費
7. `#退費規則` - 退費政策
8. `#保險詢問` - 保險相關

#### 👨‍🏫 教練與課程類 (7 個)
9. `#指定教練` - 指定特定教練
10. `#教練資訊` - 教練背景語言
11. `#課程內容` - 課程安排內容
12. `#課程選擇` - 選擇適合的課程
13. `#教學方式` - 教學方法
14. `#初學者` - 初學者課程
15. `#進階課程` - 進階者課程

#### 👶 親子與團體類 (4 個)
16. `#親子課程` - 親子同堂
17. `#兒童安全` - 小朋友安全
18. `#同堂安排` - 多人一起上課
19. `#團體預約` - 團體預約

#### 🏔️ 雪場與旅遊類 (4 個)
20. `#雪場推薦` - 雪場推薦
21. `#雪場設施` - 雪場設施
22. `#行程規劃` - 旅遊規劃
23. `#交通資訊` - 交通集合

#### 🎒 裝備與其他 (3 個)
24. `#裝備租借` - 裝備準備
25. `#平台操作` - 平台使用
26. `#服務範圍` - 服務地區

---

## 重新標記 FAQ

### 使用 retag-faqs.js 腳本

#### 1. Dry-run 模式 (預覽變更)
```bash
node retag-faqs.js --dry-run
```

**輸出範例**:
```
==============================================================
FAQ Re-tagging Script
==============================================================
Input:  zeabur_backend/data/faq_kb.phase0a.json
Output: zeabur_backend/data/faq_kb.phase0a.json
Mode:   DRY RUN (no changes)
==============================================================

📄 Loaded 71 FAQs

📊 Summary:
   Total FAQs:              71
   Had "#一般查詢":          52 (73.2%)
   Changed:                 48
   Unchanged:               23

🔄 Changes:

1. faq.booking.001
   Question: 如何預約教練？...
   Section:  📅 一般課程預約與安排
   Intent:   BOOKING
   Before:   #一般查詢
   After:    #課程預約, #時段查詢

2. faq.payment.001
   Question: 費用如何計算？...
   Section:  💰 費用與支付方式
   Intent:   PAYMENT
   Before:   #一般查詢
   After:    #費用計算, #付款方式

...

ℹ️  DRY RUN MODE: No files were modified
   Run without --dry-run to apply changes

==============================================================
Done!
==============================================================
```

#### 2. 實際執行 (修改檔案)
```bash
node retag-faqs.js
```

**會自動**:
1. 創建備份 `faq_kb.backup.{timestamp}.json`
2. 更新 `zeabur_backend/data/faq_kb.phase0a.json`
3. 顯示變更摘要

#### 3. 指定輸入/輸出檔案
```bash
node retag-faqs.js --input path/to/input.json --output path/to/output.json
```

### Tag 規則映射

腳本使用兩層規則：

#### Layer 1: Section-based (優先)
```javascript
const TAG_RULES = {
  '📅 一般課程預約與安排': ['#課程預約', '#時段查詢'],
  '💰 費用與支付方式': ['#費用計算', '#付款方式'],
  '🧑‍🏫 教練資訊與教學語言': ['#教練資訊', '#教練語言'],
  // ...
};
```

#### Layer 2: Intent-based (次要)
```javascript
const INTENT_TAGS = {
  'BOOKING': ['#課程預約'],
  'INSTRUCTOR': ['#指定教練', '#教練資訊'],
  'PAYMENT': ['#費用計算', '#付款方式'],
  // ...
};
```

#### 處理邏輯
1. 保留非 `#一般查詢` 的 tags
2. 根據 section 添加新 tags
3. 如果沒有匹配，根據 intent 添加
4. 如果完全沒有匹配，保留 `#一般查詢`

---

## 後端 API

### 啟動後端

```bash
cd zeabur_backend/backend
npm install  # 如果尚未安裝
npm start    # 或 node src/server.js
```

**預設端口**: 3000
**API Base**: `http://localhost:3000/api/v1`

### API 端點

#### 1. 追蹤 Tag 點擊

**POST** `/api/v1/analytics/track-tag-click`

```bash
curl -X POST http://localhost:3000/api/v1/analytics/track-tag-click \
  -H "Content-Type: application/json" \
  -d '{
    "tag_type": "faq",
    "tag_name": "#課程預約",
    "item_id": "faq.booking.001",
    "language": "zh"
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "tracked": true,
    "tag_type": "faq",
    "tag_name": "#課程預約",
    "item_id": "faq.booking.001"
  },
  "meta": {
    "timestamp": "2025-11-02T13:54:00.000Z"
  }
}
```

#### 2. 取得 Tag 統計

**GET** `/api/v1/analytics/tag-stats`

**Query Parameters**:
- `tag_type` (optional): "faq" | "resort" | ""
- `days` (optional): 7 | 14 | 30 | 90 (default: 7)
- `limit` (optional): 1-100 (default: 20)

```bash
# 全部 tags，最近 30 天，前 50 名
curl "http://localhost:3000/api/v1/analytics/tag-stats?days=30&limit=50"

# 只看 FAQ tags
curl "http://localhost:3000/api/v1/analytics/tag-stats?tag_type=faq&days=7"

# 只看 Resort tags
curl "http://localhost:3000/api/v1/analytics/tag-stats?tag_type=resort&days=14"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "by_tag": [
      {
        "tag_name": "#課程預約",
        "tag_type": "faq",
        "clicks": 145,
        "unique_items": 28
      },
      {
        "tag_name": "夜滑",
        "tag_type": "resort",
        "clicks": 98,
        "unique_items": 8
      }
    ],
    "by_type": [
      {
        "tag_type": "faq",
        "total_clicks": 856,
        "unique_tags": 15,
        "unique_items": 71
      },
      {
        "tag_type": "resort",
        "total_clicks": 423,
        "unique_tags": 32,
        "unique_items": 42
      }
    ],
    "daily": [
      {
        "date": "2025-11-02",
        "tag_type": "faq",
        "clicks": 45
      },
      {
        "date": "2025-11-02",
        "tag_type": "resort",
        "clicks": 23
      }
    ],
    "period_days": 30
  }
}
```

### 資料庫查詢

```bash
# 進入 SQLite
cd zeabur_backend/backend
sqlite3 data/analytics.db

# 查詢 tag clicks
SELECT * FROM tag_clicks ORDER BY timestamp DESC LIMIT 10;

# 統計各 tag 點擊數
SELECT tag_name, tag_type, COUNT(*) as clicks
FROM tag_clicks
GROUP BY tag_name, tag_type
ORDER BY clicks DESC
LIMIT 20;

# 查詢特定 tag
SELECT * FROM tag_clicks
WHERE tag_name = '#課程預約'
ORDER BY timestamp DESC;

# 離開
.exit
```

---

## 前端實作

### 本地儲存結構

**localStorage key**: `tagClicks`

**資料格式**:
```javascript
[
  {
    "timestamp": "2025-11-02T13:54:12.345Z",
    "tag_type": "faq",
    "tag_name": "#課程預約",
    "item_id": "faq.booking.001",
    "language": "zh"
  },
  // ... 最多 100 筆
]
```

### 讀取本地記錄

```javascript
// 在瀏覽器 Console
const tagClicks = JSON.parse(localStorage.getItem('tagClicks') || '[]');
console.log(`Total clicks: ${tagClicks.length}`);
console.log('Recent 5:', tagClicks.slice(-5));

// 統計各 tag 點擊數
const counts = {};
tagClicks.forEach(click => {
  counts[click.tag_name] = (counts[click.tag_name] || 0) + 1;
});
console.table(counts);
```

### 清空本地記錄

```javascript
localStorage.removeItem('tagClicks');
console.log('Tag clicks cleared');
```

---

## 測試流程

### 1. 測試前端 Tag 點擊

#### 步驟：
1. 訪問 https://faq.diy.ski/
2. 搜尋任何內容 (例如: "教練")
3. 查看 FAQ 卡片下方的 tags
4. 點擊任一 tag (例如: "#課程預約")
5. 檢查是否自動篩選相關 FAQs
6. 開啟 DevTools > Console，查看日誌：
   ```
   [Tag Click] Type: faq, Tag: #課程預約, Item: faq.booking.001
   [Tag Click] Tracked successfully: {timestamp, tag_type, ...}
   ```

#### 檢查 localStorage：
```javascript
// 在 Console 執行
localStorage.getItem('tagClicks')
```

### 2. 測試 Resort Amenity Tags

#### 步驟：
1. 在首頁向下滾動到 "🏔️ 雪場資訊" 區域
2. 點擊任一雪場卡片
3. 查看雪場設施 tags (如: "夜滑", "溫泉")
4. 點擊任一 tag
5. 檢查是否篩選出相同設施的雪場
6. 查看 Console 日誌：
   ```
   [Tag Click] Type: resort, Tag: 夜滑, Item: fukushima_nekoma_mountain
   ```

### 3. 測試後端 API

#### 先啟動後端：
```bash
cd zeabur_backend/backend
npm start
```

#### 測試追蹤：
```bash
curl -X POST http://localhost:3000/api/v1/analytics/track-tag-click \
  -H "Content-Type: application/json" \
  -d '{
    "tag_type": "faq",
    "tag_name": "#課程預約",
    "item_id": "faq.booking.001",
    "language": "zh"
  }'
```

#### 測試統計：
```bash
curl "http://localhost:3000/api/v1/analytics/tag-stats?days=7"
```

#### 查看資料庫：
```bash
sqlite3 zeabur_backend/backend/data/analytics.db
SELECT * FROM tag_clicks ORDER BY timestamp DESC LIMIT 10;
.exit
```

### 4. 測試 Admin Dashboard

#### 步驟：
1. 先點擊一些 tags (前端或 curl)
2. 訪問 https://faq.diy.ski/analytics.html
3. 點擊 "🏷️ Tag 點擊分析" tab
4. 檢查統計數據是否正確顯示
5. 測試過濾器:
   - Tag 類型: 全部 / FAQ Tags / Resort Tags
   - 時間範圍: 7天 / 14天 / 30天 / 90天
6. 查看熱門 Tags 排行
7. 查看每日趨勢圖表
8. 查看本地記錄 (最後 20 筆)

### 5. 測試 Re-tagging Script

#### 步驟：
1. Dry-run 預覽:
   ```bash
   cd zeabur
   node retag-faqs.js --dry-run
   ```
2. 檢查輸出的變更是否合理
3. 實際執行:
   ```bash
   node retag-faqs.js
   ```
4. 檢查是否創建備份檔案
5. 檢查 `zeabur_backend/data/faq_kb.phase0a.json` 是否更新
6. 重新載入前端，檢查 tags 是否變更
7. 如需回復，使用備份檔案:
   ```bash
   # 備份輸出於 zeabur_backend/data/backups
   cp zeabur_backend/data/backups/backup_*.json zeabur_backend/data/faq_kb.phase0a.json
   ```

---

## 常見問題

### Q1: Tag 點擊沒有被追蹤到後端？

**A**: 檢查以下幾點：
1. 後端是否啟動？`npm start` in `zeabur_backend/backend`
2. API_BASE 是否正確？檢查 Console 中的錯誤訊息
3. 網路請求是否成功？查看 DevTools > Network tab
4. 即使後端失敗，本地 localStorage 仍會記錄

### Q2: Analytics Dashboard 顯示 "暫無數據"？

**A**: 可能原因：
1. 後端 API 無法連接 → 會自動降級顯示本地數據
2. 資料庫中確實沒有數據 → 先點擊一些 tags
3. 時間範圍過短 → 嘗試增加天數 (30天或90天)

### Q3: Re-tagging 腳本沒有變更任何 FAQ？

**A**: 檢查：
1. FAQs 是否已經有具體的 tags (不是 #一般查詢)？
2. Section 或 Intent 是否在規則映射中？
3. 使用 `--dry-run` 查看詳細輸出

### Q4: 點擊 Tag 後篩選結果為空？

**A**: 可能原因：
1. FAQ tags 拼寫錯誤 (多餘空格、全形/半形符號)
2. Tag 大小寫不一致
3. 資料格式問題 → 檢查 `faq_kb.phase0a.json` 的 `crm_tags` 欄位

### Q5: localStorage 儲存滿了？

**A**: 腳本自動限制 100 筆，如需清空：
```javascript
localStorage.removeItem('tagClicks');
```

### Q6: 如何恢復舊的 FAQ tags？

**A**: 使用自動備份：
```bash
# 找到最近的備份
ls -lt zeabur_backend/data/backups/ | head -1

# 恢復
cp zeabur_backend/data/backups/backup_1730556840123_faq.booking.001.json \
   zeabur_backend/data/faq_kb.phase0a.json
```

### Q7: 後端資料庫損壞？

**A**: 重建資料庫：
```bash
cd zeabur_backend/backend
rm data/analytics.db
npm start  # 會自動重建 schema
```

---

## 附錄

### 檔案清單

#### 前端
- `frontend/index.html` - 主頁面 (雪場搜尋、FAQ Tag 顯示與追蹤)
- `frontend/analytics.html` - Admin Dashboard (Tag 分析 tab)
- `zeabur_backend/data/faq_kb.phase0a.json` - FAQ 資料 (含 crm_tags)
- `frontend/resort_kb.json` - 雪場資料 (含 amenities)

#### 後端
- `zeabur_backend/backend/src/services/analytics-service.js` - Analytics Service (tag_clicks 表)
- `zeabur_backend/backend/src/routes/analytics.js` - Analytics API (tag endpoints)
- `zeabur_backend/backend/data/analytics.db` - SQLite 資料庫

#### 工具
- `retag-faqs.js` - FAQ 重新標記腳本
- `TAG_TRACKING_GUIDE.md` - 本文檔

### 相關連結

- **前端**: https://faq.diy.ski/
- **Admin**: https://faq.diy.ski/analytics.html
- **功能入口**: https://faq.diy.ski/menu.html
- **API Docs**: (待補充)

### 技術棧

- **Frontend**: Vanilla JavaScript ES6+, DOMPurify, Fuse.js
- **Backend**: Node.js 18+, Express 4.18+, better-sqlite3
- **Database**: SQLite (analytics.db)
- **Deployment**: Zeabur Static (frontend) + Zeabur Service (backend)

---

**更新日期**: 2025-11-02
**版本**: 1.0.0
**作者**: Claude Code Assistant
