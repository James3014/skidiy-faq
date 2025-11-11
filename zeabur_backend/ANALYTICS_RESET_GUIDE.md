# Analytics Database Reset Guide

> 📖 **分析資料庫遠端清除完整指南**

## 📋 目錄

- [概述](#概述)
- [何時需要清除](#何時需要清除)
- [API 端點說明](#api-端點說明)
- [使用方式](#使用方式)
- [安全性設定](#安全性設定)
- [常見問題](#常見問題)

---

## 概述

當 FAQ 系統更新資料結構（如 tag 系統、分類名稱）時，舊的分析資料可能與新結構不相容。此工具提供遠端清除分析資料的功能，讓統計從新結構重新開始。

### 📊 **影響範圍**

清除操作會影響以下資料表：
- `search_queries` - 搜尋記錄
- `faq_views` - FAQ 點擊記錄
- `feedback` - 使用者反饋

### ⚠️ **重要提醒**

- **不可逆操作**：資料刪除後無法恢復
- **建議先備份**：重要資料請先匯出
- **使用預覽模式**：先用 `dryRun: true` 確認影響範圍

---

## 何時需要清除

### ✅ **建議清除的情況**

1. **FAQ Tag 系統更新**
   - 舊版：17 個 tag
   - 新版：57 個 tag
   - 原因：tag 結構完全不同，統計數據不可比較

2. **FAQ 分類重構**
   - 舊版：「行程與費用」
   - 新版：「行程規劃與周邊」
   - 原因：分類名稱改變會導致統計分散

3. **FAQ 問題內容更新**
   - 舊版：「請問滑雪行程費用包含哪些項目？」
   - 新版：「應該先訂好機票住宿，還是先預約滑雪教練？」
   - 原因：問題 ID 不變但內容改變，會造成統計混亂

### ❌ **不建議清除的情況**

- 只是修正錯字或小幅調整
- FAQ 新增/刪除但結構不變
- 需要保留歷史趨勢數據

---

## API 端點說明

### 1️⃣ **清除分析資料** `POST /api/v1/admin/reset-analytics`

清除或保留部分分析資料。

**請求**

```bash
POST https://faq-api-v1.zeabur.app/api/v1/admin/reset-analytics
Content-Type: application/json
X-Admin-Token: <你的管理員 token>

{
  "mode": "all",          // 或 "keep-days"
  "keepDays": 7,          // mode=keep-days 時必填
  "dryRun": false         // true=預覽，false=實際執行
}
```

**參數說明**

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `mode` | string | ❌ | 清除模式：`all`（全部清除，預設）或 `keep-days`（保留最近 N 天） |
| `keepDays` | number | ❌ | 保留天數（當 mode=keep-days 時必填） |
| `dryRun` | boolean | ❌ | 預覽模式（預設 false） |

**回應**

```json
{
  "success": true,
  "data": {
    "mode": "all",
    "keepDays": null,
    "cutoffDate": null,
    "dryRun": false,
    "before": {
      "search_queries": 100,
      "faq_views": 250,
      "feedback": 10
    },
    "deleted": {
      "search_queries": 100,
      "faq_views": 250,
      "feedback": 10
    },
    "after": {
      "search_queries": 0,
      "faq_views": 0,
      "feedback": 0
    }
  }
}
```

### 2️⃣ **查詢資料庫狀態** `GET /api/v1/admin/analytics-stats`

查看當前資料庫統計資訊。

**請求**

```bash
GET https://faq-api-v1.zeabur.app/api/v1/admin/analytics-stats
X-Admin-Token: <你的管理員 token>
```

**回應**

```json
{
  "success": true,
  "data": {
    "dbPath": "/data/analytics.db",
    "dbSize": 102400,
    "dbSizeHuman": "100.00 KB",
    "tables": {
      "search_queries": {
        "count": 100,
        "oldest": "2025-01-01T00:00:00.000Z",
        "newest": "2025-11-11T12:00:00.000Z"
      },
      "faq_views": {
        "count": 250,
        "oldest": "2025-01-01T00:00:00.000Z",
        "newest": "2025-11-11T12:00:00.000Z"
      },
      "feedback": {
        "count": 10,
        "oldest": "2025-11-01T00:00:00.000Z",
        "newest": "2025-11-10T10:00:00.000Z"
      }
    }
  }
}
```

### 3️⃣ **健康檢查** `GET /api/v1/admin/health`

測試管理員認證是否正常。

**請求**

```bash
GET https://faq-api-v1.zeabur.app/api/v1/admin/health
X-Admin-Token: <你的管理員 token>
```

**回應**

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-11-11T12:00:00.000Z",
    "environment": "production"
  }
}
```

---

## 使用方式

### 🔍 **步驟 1：查詢當前狀態**

先查看資料庫有多少資料：

```bash
curl -X GET https://faq-api-v1.zeabur.app/api/v1/admin/analytics-stats \
  -H "X-Admin-Token: YOUR_ADMIN_TOKEN"
```

### 🧪 **步驟 2：預覽模式測試**

使用 `dryRun: true` 預覽會刪除什麼：

```bash
curl -X POST https://faq-api-v1.zeabur.app/api/v1/admin/reset-analytics \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: YOUR_ADMIN_TOKEN" \
  -d '{
    "mode": "all",
    "dryRun": true
  }'
```

### ⚡ **步驟 3：實際執行**

確認無誤後，執行實際清除：

```bash
curl -X POST https://faq-api-v1.zeabur.app/api/v1/admin/reset-analytics \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: YOUR_ADMIN_TOKEN" \
  -d '{
    "mode": "all",
    "dryRun": false
  }'
```

### 📅 **選項：保留最近資料**

只刪除 7 天前的舊資料：

```bash
curl -X POST https://faq-api-v1.zeabur.app/api/v1/admin/reset-analytics \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: YOUR_ADMIN_TOKEN" \
  -d '{
    "mode": "keep-days",
    "keepDays": 7,
    "dryRun": false
  }'
```

---

## 安全性設定

### 🔐 **設定 Admin Token**

Admin Token 預設值：`admin-secret-token-change-me`

⚠️ **重要**：生產環境必須修改！

**方法 1：Zeabur 環境變數（推薦）**

1. 登入 Zeabur Dashboard
2. 選擇 Backend 服務
3. 進入「Settings」→「Environment Variables」
4. 新增變數：
   ```
   ADMIN_TOKEN=your-secure-random-token-here
   ```
5. 重新部署服務

**方法 2：本地 .env 檔案**

```bash
# backend/.env
ADMIN_TOKEN=your-secure-random-token-here
```

### 🔑 **生成安全 Token**

```bash
# 方法 1：使用 openssl
openssl rand -hex 32

# 方法 2：使用 node
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 輸出範例：
# 8f7d6e5c4b3a2918e7f6d5c4b3a29180f7e6d5c4b3a29180f7e6d5c4b3a2918
```

### 🛡️ **認證方式**

API 支援兩種認證方式：

**方式 1：HTTP Header（推薦）**
```bash
curl -H "X-Admin-Token: YOUR_TOKEN" ...
```

**方式 2：Query Parameter**
```bash
curl "https://faq-api-v1.zeabur.app/api/v1/admin/health?token=YOUR_TOKEN"
```

---

## 常見問題

### Q1: 清除後可以恢復嗎？

❌ **不行**。刪除操作是永久的，無法復原。

**建議**：
- 先用 `dryRun: true` 預覽
- 重要資料先匯出備份
- 小規模測試（如 `keepDays: 1`）

### Q2: 清除需要多久時間？

⏱️ 通常在 **1-5 秒**內完成，取決於資料量：
- 1,000 筆：< 1 秒
- 10,000 筆：1-2 秒
- 100,000 筆：3-5 秒

操作期間 API 仍可正常運作（使用事務處理）。

### Q3: 如何備份資料？

**方法 1：匯出 CSV（推薦）**

使用現有的分析 API 匯出資料：
```bash
# 匯出搜尋記錄
curl "https://faq-api-v1.zeabur.app/api/v1/analytics/export?type=searches" > searches.csv

# 匯出 FAQ 點擊
curl "https://faq-api-v1.zeabur.app/api/v1/analytics/export?type=faq_views" > faq_views.csv
```

**方法 2：直接複製資料庫檔案**

從 Zeabur Volume 下載 `/data/analytics.db`

### Q4: 清除後統計圖表會怎樣？

📉 **會顯示空白或從新資料開始**：
- 歷史趨勢圖：顯示為空或從清除後開始
- 熱門 FAQ：重新計算
- 搜尋關鍵字：重新統計

### Q5: 可以只清除特定類型的資料嗎？

❌ **目前不行**。API 會同時清除三個表的資料。

如需自訂清除，請使用本地腳本：
```bash
cd zeabur_backend/backend
node scripts/reset-analytics.js --help
```

### Q6: 清除後對前端有影響嗎？

✅ **沒有影響**。清除的是分析資料，不影響：
- FAQ 內容
- 搜尋功能
- 使用者介面
- 系統運作

### Q7: 清除失敗怎麼辦？

檢查以下項目：
1. Admin Token 是否正確
2. 網路連線是否正常
3. 查看後端日誌（Zeabur Dashboard → Runtime Logs）
4. 確認資料庫檔案權限

**常見錯誤**：
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing admin token"
  }
}
```
→ Admin Token 錯誤，檢查環境變數

### Q8: 多久清除一次比較好？

**建議**：
- 🔄 **定期清除**：每季清除一次舊資料（保留 90 天）
- 🆕 **系統更新**：FAQ 結構變更時全部清除
- 🧪 **測試環境**：隨時清除

---

## 📝 **執行記錄範本**

建議每次清除都記錄：

```
清除日期：2025-11-11
執行人員：James
清除原因：更新 FAQ Tag 系統（17→57 個）
清除模式：全部清除
資料量：
  - search_queries: 1,234 筆
  - faq_views: 5,678 筆
  - feedback: 89 筆
執行結果：成功
備註：已備份至 analytics_backup_20251111.db
```

---

## 🔗 **相關文件**

- [FAQ 維護工作流程](./FAQ_MAINTENANCE_GUIDE.md)
- [Analytics API 文件](./backend/src/routes/analytics.js)
- [Zeabur 部署指南](./ZEABUR_CONFIG_GUIDE.md)

---

## 💡 **最佳實踐**

1. ✅ **先預覽後執行**：永遠使用 `dryRun: true` 先測試
2. ✅ **記錄操作**：保留清除記錄以便追蹤
3. ✅ **定期維護**：建立清除排程（如每季一次）
4. ✅ **監控資料量**：資料庫檔案 > 100MB 時考慮清除
5. ✅ **更新文檔**：清除後更新相關文件的統計基準日期

---

**最後更新**：2025-11-11
**版本**：1.0.0
**維護者**：Backend Team
