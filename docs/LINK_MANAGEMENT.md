# 連結管理系統 (Link Registry)

## 概述

統一的連結管理系統，支持 FAQ 和雪場資訊的所有超連結。單一資料來源（Single Source of Truth），確保 URL 變更時只需修改一個地方。

**檔案位置**：`zeabur_backend/data/link_registry.json`

---

## 1. 系統架構

### 三層設計

```
┌─────────────────────────────────────┐
│      Frontend (index.html)          │
│  - parseLinksInText()               │
│  - resolveLink(name, context)       │
│  - getResortLinksHTML()             │
└──────────────┬──────────────────────┘
               │ 加載、解析
               ▼
┌─────────────────────────────────────┐
│     Link Registry (JSON)            │
│  - FAQ 連結 (LINK_SCHEDULE 等)      │
│  - 雪場連結 (official_site 等)      │
│  - 多語言標籤                       │
│  - 連結分類                         │
└──────────────┬──────────────────────┘
               │ 來源
               ▼
┌─────────────────────────────────────┐
│    Data Sources                     │
│  - faq_kb.phase0a.json (FAQ 資料)           │
│  - resort_kb.json (雪場資料)        │
└─────────────────────────────────────┘
```

### 層級關係

1. **Legacy Layer** (向後相容)：
   - `faq_kb.phase0a.json` 的 `meta.link_tokens`
   - `resort_kb.json` 的 `official_site` 欄位

2. **Registry Layer** (新方案)：
   - `link_registry.json` 集中管理所有連結

3. **Resolution Layer** (前端)：
   - `resolveLink()` 優先查詢 registry，再 fallback 到 legacy

---

## 2. FAQ 連結管理

### 結構

```json
{
  "faq": {
    "LINK_SCHEDULE": {
      "name": "LINK_SCHEDULE",
      "labels": {
        "zh": "預約系統",
        "en": "Schedule",
        "th": "ตารางเวลา"
      },
      "url": "https://booking.diy.ski/schedule",
      "type": "booking",
      "icon": "📅",
      "description": "官方滑雪課程預約系統"
    }
  }
}
```

### 使用方式

**在 FAQ 答案中使用**：

```json
{
  "answer_template": {
    "details": "更多資訊請參考 [LINK:LINK_SCHEDULE|預約系統] 或 [LINK:LINK_INSTRUCTORS|教練介紹]"
  }
}
```

**前端自動解析**：
```html
<!-- 自動轉換為 -->
更多資訊請參考 <a href="https://booking.diy.ski/schedule" target="_blank">預約系統</a> 或 <a href="https://diy.ski/instructorList.php" target="_blank">教練介紹</a>
```

### 當前 FAQ 連結清單

| Token | 標籤 | URL | 類型 | 說明 |
|-------|------|-----|------|------|
| LINK_SCHEDULE | 預約系統 | https://booking.diy.ski/schedule | booking | 官方課程預約系統 |
| LINK_INSTRUCTORS | 教練介紹 | https://diy.ski/instructorList.php | reference | 所有認證教練資訊 |
| LINK_APPLY_SCHEDULE | 申請課程 | https://booking.diy.ski/apply-schedule | booking | 申請自訂課程 |
| LINK_INSURANCE | 保險資訊 | https://diy.ski/insurance_s.php | reference | 旅遊保險方案 |
| LINK_ARTICLES | 文章資源 | https://diy.ski/articleList.php | content | 滑雪知識與指南 |
| LINK_ORDER_LIST | 訂單查詢 | https://booking.diy.ski/order/list | account | 查詢與管理訂單 |
| LINK_SERVICE_EMAIL | 客服信箱 | mailto:service@diy.ski | contact | 聯繫客服支援 |
| LINK_FACEBOOK | Facebook | https://www.facebook.com/skidiy | social | 官方 Facebook 粉絲頁 |

---

## 3. 雪場連結管理

### 結構（動態 URL 模板）

```json
{
  "resort": {
    "official_site": {
      "name": "official_site",
      "labels": {
        "zh": "官方網站",
        "en": "Official Website",
        "th": "เว็บไซต์อย่างเป็นทางการ"
      },
      "url_template": "{resort.official_site}",
      "type": "website",
      "icon": "🌐",
      "description": "雪場官方網站",
      "dynamic": true,
      "variable": "resort.official_site"
    }
  }
}
```

### 使用方式

**前端調用**：

```javascript
// 基本用法 - 取得單一連結 URL
const url = resolveLink('official_site', resort);
// 輸出: https://www.nekoma.co.jp/

// 高級用法 - 取得多個連結的 HTML
const html = getResortLinksHTML(resortCard, ['official_site', 'google_maps']);
// 輸出: <a href="...">🌐 官方網站</a> | <a href="...">📍 Google 地圖</a>
```

### 當前雪場連結清單

| 名稱 | 標籤 | URL 模板 | 類型 | 說明 | 狀態 |
|------|------|----------|------|------|------|
| official_site | 官方網站 | {resort.official_site} | website | 雪場官方網站 | ✅ 顯示中 |
| booking_page | 線上訂票 | https://booking.diy.ski/schedule?resort={resort.resort_id} | booking | 透過系統預訂課程 | ⏸️ 已準備 |
| google_maps | Google 地圖 | https://maps.google.com/?q={resort.coordinates.lat},{resort.coordinates.lng} | maps | 查看雪場位置 | ⏸️ 已準備 |
| snow_report | 積雪情況 | {resort.snow_report_url} | info | 實時積雪與天氣 | ⏸️ 已準備 |

### 啟用隱藏連結

當雪場資料補充完整後，只需一行代碼就能顯示其他連結：

```javascript
// 在 createResortCard() 中修改
const html = getResortLinksHTML(resortCard, [
  'official_site',
  'booking_page',
  'google_maps'
]);
// 結果: 🌐 官方網站 | 🎫 線上訂票 | 📍 Google 地圖
```

---

## 4. 連結分類系統

系統支持分類，便於未來擴展：

```json
{
  "categories": {
    "booking": {
      "label_zh": "預訂相關",
      "label_en": "Booking",
      "description": "課程與票券預訂"
    },
    "contact": {
      "label_zh": "聯繫方式",
      "label_en": "Contact",
      "description": "客服與聯絡資訊"
    }
  }
}
```

---

## 5. 前端 API

### resolveLink(linkName, context)

**功能**：解析連結 Token 或名稱，取得實際 URL

**參數**：
- `linkName` (string): 連結名稱或 Token（如 `LINK_SCHEDULE`、`official_site`）
- `context` (object, optional): 上下文物件（雪場物件用於動態 URL）

**返回值**：URL 字符串，或 `null` 若連結不存在

**範例**：
```javascript
// FAQ 連結
const url1 = resolveLink('LINK_SCHEDULE');
// 輸出: 'https://booking.diy.ski/schedule'

// 雪場動態連結
const url2 = resolveLink('official_site', resort);
// 輸出: 'https://www.nekoma.co.jp/'

const url3 = resolveLink('google_maps', resort);
// 輸出: 'https://maps.google.com/?q=37.6,140.04'
```

### parseLinksInText(text)

**功能**：在文字中自動解析 [LINK:TOKEN|標籤] 格式並轉換為超連結

**參數**：
- `text` (string): 包含 [LINK:...] 標籤的文字

**返回值**：包含 HTML `<a>` 標籤的 HTML 字符串

**範例**：
```javascript
const text = "請參考 [LINK:LINK_SCHEDULE|預約系統] 和 [LINK:LINK_SERVICE_EMAIL|客服信箱]";
const html = parseLinksInText(text);
// 輸出: 請參考 <a href="..." target="_blank" class="faq-link faq-link-external">預約系統</a> 和 <a href="mailto:..." class="faq-link faq-link-email">✉️ 客服信箱</a>
```

### getResortLinksHTML(resortCard, linkNames)

**功能**：為雪場卡片生成多個連結的 HTML（用於未來顯示）

**參數**：
- `resortCard` (DOM element): 雪場卡片 DOM 元素
- `linkNames` (array): 要顯示的連結名稱陣列

**返回值**：HTML 字符串

**範例**：
```javascript
const card = document.querySelector('.resort-card');
const html = getResortLinksHTML(card, ['official_site', 'google_maps', 'booking_page']);
// 輸出: <a href="..." class="resort-link">🌐 官方網站</a> | <a href="..." class="resort-link">📍 Google 地圖</a> | <a href="..." class="resort-link">🎫 線上訂票</a>
```

---

## 6. 後端 API（如有需要）

### GET /api/v1/links/registry

取得完整的連結 registry

**回應**：
```json
{
  "success": true,
  "data": {
    "faq": { ... },
    "resort": { ... },
    "categories": { ... }
  }
}
```

### GET /api/v1/links/resolve?name=LINK_SCHEDULE&context=resort_id

解析特定連結（伺服器端）

**查詢參數**：
- `name`: 連結名稱
- `context`: 上下文（可選，JSON 字符串）

**回應**：
```json
{
  "success": true,
  "link_name": "LINK_SCHEDULE",
  "url": "https://booking.diy.ski/schedule",
  "labels": { "zh": "預約系統", "en": "Schedule", "th": "ตารางเวลา" }
}
```

---

## 7. 遷移路線

### Phase 1：當前狀態（已完成）

```
faq_kb.phase0a.json (link_tokens) ────┐
                              ├─→ FAQ 顯示
link_registry.json ────────────┘

resort_kb.json (official_site) ─→ 雪場 official_site 顯示
link_registry.json ─────────────→ 雪場其他連結（已準備，未顯示）
```

**特點**：
- ✅ 雙軌並行，向後相容
- ✅ 新連結優先查詢 registry
- ✅ 舊資料仍可直接使用

### Phase 2：FAQ 遷移（規劃中）

```
link_registry.json ────┐
                       ├─→ FAQ 顯示
                       │
                       ├─→ 雪場顯示
                       │
                       └─→ 其他應用
```

**步驟**：
1. 將 `faq_kb.phase0a.json` 的 `meta.link_tokens` 複製到 `link_registry.json`
2. 測試 FAQ 頁面，確認所有連結正常
3. 更新文檔，說明遷移完成
4. 刪除 `faq_kb.phase0a.json` 的 `link_tokens`（保留向後相容代碼）

**預計時間**：Phase 2 結束後 1-2 週

### Phase 3：擴展應用（未來）

```
link_registry.json
├─→ FAQ 系統
├─→ 雪場卡片
├─→ 郵件範本
├─→ 行銷頁面
└─→ 其他系統
```

**可能新增連結**：
- 行銷連結（discount codes、campaigns）
- 社群連結（Instagram、YouTube、TikTok）
- 分析連結（UTM 追蹤參數）
- 地區性連結（各國官網）

---

## 8. 維護指南

### 新增連結

**FAQ 連結**：

1. 編輯 `link_registry.json`
2. 在 `faq` 物件中添加新項目

```json
{
  "LINK_MY_NEW_LINK": {
    "name": "LINK_MY_NEW_LINK",
    "labels": {
      "zh": "新連結",
      "en": "New Link",
      "th": "ลิงค์ใหม่"
    },
    "url": "https://example.com/new",
    "type": "reference",
    "icon": "🆕",
    "description": "新增連結的說明"
  }
}
```

3. 在 FAQ 答案中使用：`[LINK:LINK_MY_NEW_LINK|新連結]`

**雪場連結**：

1. 編輯 `link_registry.json`
2. 在 `resort` 物件中添加新項目

```json
{
  "my_new_link": {
    "name": "my_new_link",
    "labels": { "zh": "新連結", ... },
    "url_template": "https://example.com/{resort.resort_id}",
    "type": "reference",
    "dynamic": true
  }
}
```

3. 在前端啟用顯示：`getResortLinksHTML(card, ['official_site', 'my_new_link'])`

### 變更連結 URL

只需編輯 `link_registry.json` 的 `url` 或 `url_template` 欄位，所有地方自動更新。

### 新增語言

1. 編輯所有連結的 `labels` 物件
2. 添加新語言代碼（如 `"ja": "..."`）

例如添加日文：
```json
"labels": {
  "zh": "預約系統",
  "en": "Schedule",
  "th": "ตารางเวลา",
  "ja": "予約システム"
}
```

---

## 9. 故障排查

### 連結在頁面上未顯示

**檢查清單**：
1. ✅ `link_registry.json` 是否存在於 `zeabur_backend/data/`
2. ✅ 前端是否成功加載 registry（查看瀏覽器控制台：`[Init] Link registry loaded`）
3. ✅ 連結名稱是否正確（區分大小寫）
4. ✅ 語言設定是否正確

**調試方法**：
```javascript
// 瀏覽器控制台測試
console.log(linkRegistry);  // 查看 registry 內容
console.log(resolveLink('LINK_SCHEDULE'));  // 測試連結解析
```

### 動態 URL 變數未替換

**檢查清單**：
1. ✅ 變數名稱是否正確（如 `{resort.official_site}`）
2. ✅ 上下文物件是否包含該欄位
3. ✅ 嵌套路徑是否正確（如 `{resort.coordinates.lat}`）

**調試方法**：
```javascript
console.log(resolveLink('google_maps', resort));  // 查看替換結果
console.log(resort);  // 查看上下文物件
```

---

## 10. 相關檔案

- **主檔案**：`zeabur_backend/data/link_registry.json`
- **前端實現**：`frontend/index.html`（resolveLink, parseLinksInText, getResortLinksHTML）
- **FAQ 資料**：`zeabur_backend/data/faq_kb.phase0a.json`（使用連結）
- **雪場資料**：`zeabur_backend/data/resort_kb.json`（dynamic URL 來源）
- **文檔**：`docs/LINK_MANAGEMENT.md`（此檔案）
- **使用示例**：`docs/FAQ_JSON_STANDARD.md`

---

## 11. 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2025-11-06 | 初始版本，支持 FAQ 和雪場連結管理 |

---

**最後更新**：2025-11-06
