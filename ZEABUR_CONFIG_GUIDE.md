# Zeabur Volume 永久儲存配置指南

## 📋 配置步驟總覽

本指南將協助您在 Zeabur 上配置永久儲存，確保 SQLite 資料庫在重新部署後不會遺失。

**預估時間**: 5-10 分鐘
**需求**: Zeabur 帳號並已部署 Backend 服務

---

## 🎯 步驟 1：登入 Zeabur Dashboard

1. 訪問 https://dash.zeabur.com
2. 使用您的帳號登入
3. 選擇您的專案（包含 `zeabur_backend` 服務的專案）

---

## 📦 步驟 2：新增 Volume

### 2.1 進入 Backend 服務設定

1. 在專案頁面中，點擊 **Backend 服務**（zeabur_backend）
2. 點擊上方的 **Settings** 標籤
3. 在左側選單選擇 **Volumes**

### 2.2 建立新 Volume

點擊 **Add Volume** 或 **Create Volume** 按鈕，填寫以下資訊：

```
Mount Path: /data
Size: 1 GB
```

**重要提示**:
- ✅ Mount Path 必須是 `/data`（不要有結尾的 `/`）
- ✅ 1GB 是免費方案可用的大小
- ✅ SQLite 資料庫通常 < 100MB，1GB 足夠使用

### 2.3 儲存 Volume 設定

點擊 **Save** 或 **Create** 按鈕完成建立。

---

## ⚙️ 步驟 3：設定環境變數

### 3.1 進入環境變數設定

1. 仍在 Backend 服務的 **Settings** 頁面
2. 在左側選單選擇 **Environment Variables**（或 **Variables**）

### 3.2 新增 SQLITE_DB_PATH 變數

點擊 **Add Variable** 或直接在列表中新增：

```bash
Key:   SQLITE_DB_PATH
Value: /data/analytics.db
```

**重要提示**:
- ✅ Key 必須完全符合 `SQLITE_DB_PATH`（區分大小寫）
- ✅ Value 必須是 `/data/analytics.db`（與 Volume Mount Path 一致）

### 3.3 檢查其他環境變數（選用）

確認以下環境變數已設定（如果需要的話）：

```bash
NODE_ENV=production
PORT=3000
GEMINI_API_KEY=your-actual-key  # 如果使用 LLM 功能
```

### 3.4 儲存環境變數

點擊 **Save** 按鈕保存變更。

---

## 🔄 步驟 4：重新部署

### 4.1 觸發重新部署

Zeabur 會在環境變數變更後自動重新部署。如果沒有：

**方法 1: 手動重新部署**
1. 在 Backend 服務頁面
2. 點擊右上角的 **Redeploy** 或 **Deploy** 按鈕

**方法 2: 推送 Git 更新**
```bash
git add .
git commit -m "chore: update env.example with SQLITE_DB_PATH"
git push origin main
```

### 4.2 監控部署進度

在 Zeabur Dashboard 查看：
- **Deployment** 標籤可看到部署日誌
- 等待狀態變為 **Running**（通常 1-3 分鐘）

---

## ✅ 步驟 5：驗證配置

### 5.1 檢查後端日誌

1. 在 Backend 服務頁面點擊 **Logs** 標籤
2. 查找以下日誌訊息：

```
[Analytics Service] Using database path: /data/analytics.db
[Analytics Service] Tables initialized
```

✅ 如果看到 `/data/analytics.db`，表示配置成功！
❌ 如果看到 `/data/analytics.db`，表示環境變數未生效，請重新檢查步驟 3。

### 5.2 測試 API 連接

在終端機執行以下命令：

```bash
# 測試健康檢查
curl https://faq-api-v1.zeabur.app/health

# 測試統計 API（會觸發資料庫讀取）
curl "https://faq-api-v1.zeabur.app/api/v1/analytics/stats"
```

預期回應：
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    ...
  }
}
```

### 5.3 測試資料持久性（最終驗證）

**步驟**:
1. 在前端點擊一些 FAQ、Tags、Sections 或 Resorts
2. 訪問 https://faq.diy.ski/analytics.html 確認數據有記錄
3. 在 Zeabur Dashboard 手動重新部署 Backend
4. 重新訪問 analytics.html
5. ✅ 如果數據仍然存在，表示永久儲存配置成功！

---

## 📊 資料庫路徑優先順序

後端會依照以下順序選擇資料庫路徑：

1. **環境變數 `SQLITE_DB_PATH`**（最優先）
   - 用於 Zeabur Volume: `/data/analytics.db`

2. **生產環境預設路徑**（`NODE_ENV=production`）
   - `/data/analytics.db`（❌ 重啟後會遺失）

3. **開發環境預設路徑**
   - `../data/analytics.db`（本地開發用）

**配置完成後**: 系統會使用 `/data/analytics.db`，資料永久保存在 Volume 中。

---

## 📁 Volume 檔案結構

配置完成後，Zeabur Volume 會包含：

```
/data/
└── analytics.db       # SQLite 資料庫檔案
```

**資料庫內容**（6 個資料表）:
- `llm_usage` - LLM API 使用記錄（request_id, query_text, tokens, cost）
- `provider_stats` - LLM 提供者統計（provider, model, total_requests）
- `faq_views` - FAQ 點擊記錄（faq_id, language, timestamp）
- `section_views` - 分類點擊記錄（section, language, timestamp）
- `tag_clicks` - Tag 點擊記錄（tag, language, timestamp）
- `resort_clicks` - 雪場點擊記錄（resort, click_type, language, timestamp）

---

## 🔧 疑難排解

### 問題 1: 日誌顯示 `/data/analytics.db`

**原因**: 環境變數 `SQLITE_DB_PATH` 未生效

**解決方法**:
1. 檢查環境變數名稱是否完全符合（區分大小寫）
2. 檢查 Value 是否為 `/data/analytics.db`
3. 確認已點擊 **Save** 按鈕
4. 手動觸發重新部署

### 問題 2: Volume Mount Path 錯誤

**原因**: Mount Path 設定錯誤（例如 `/data/` 或 `data`）

**解決方法**:
1. 刪除舊的 Volume
2. 重新建立 Volume，確認 Mount Path 為 `/data`（無結尾 `/`）
3. 重新部署

### 問題 3: 資料在重新部署後仍然遺失

**檢查清單**:
- [ ] Volume 已正確建立（Dashboard → Volumes 可查看）
- [ ] Mount Path 為 `/data`
- [ ] 環境變數 `SQLITE_DB_PATH=/data/analytics.db` 已設定
- [ ] 後端日誌顯示 `/data/analytics.db`
- [ ] Volume Size > 0（未超過配額）

**進階除錯**:
```bash
# 使用 Zeabur CLI 進入容器檢查
zeabur exec -s zeabur_backend -- ls -lah /data
zeabur exec -s zeabur_backend -- cat /proc/mounts | grep data
```

### 問題 4: 空間不足

**檢查空間使用**:
- Zeabur 免費方案提供 1GB Volume
- SQLite 資料庫通常 < 100MB
- 可在 Dashboard → Volumes 查看使用量

**清理舊資料**（如有需要）:
```sql
-- 刪除 90 天前的舊資料
DELETE FROM faq_views WHERE timestamp < datetime('now', '-90 days');
DELETE FROM section_views WHERE timestamp < datetime('now', '-90 days');
DELETE FROM tag_clicks WHERE timestamp < datetime('now', '-90 days');
DELETE FROM resort_clicks WHERE timestamp < datetime('now', '-90 days');

-- 壓縮資料庫
VACUUM;
```

---

## 💾 備份建議

### 自動備份策略

建議設定定期備份以防萬一：

**方法 1: 使用 API 匯出**（推薦）
```bash
# 每週執行一次
curl "https://faq-api-v1.zeabur.app/api/v1/analytics/stats?days=365" > backup-$(date +%Y%m%d).json
```

**方法 2: 使用 Zeabur CLI 直接備份**
```bash
# 使用 Zeabur CLI 連接容器
zeabur exec -s zeabur_backend -- sqlite3 /data/analytics.db .dump > backup.sql
```

**方法 3: 設定 Cron Job**（進階）
在後端新增定期備份腳本，將資料庫 dump 上傳至 S3 或其他雲端儲存。

### 還原備份

```bash
# 從 SQL dump 還原
zeabur exec -s zeabur_backend -- sqlite3 /data/analytics.db < backup.sql

# 或上傳整個 .db 檔案
zeabur cp backup.db zeabur_backend:/data/analytics.db
```

---

## 📚 相關檔案

**後端代碼**:
- `zeabur_backend/backend/src/services/analytics-service.js:12-33` - 資料庫路徑選擇邏輯
- `zeabur_backend/backend/.env.example:11-14` - 環境變數範例

**文檔**:
- `ZEABUR_VOLUME_SETUP.md` - 快速設定指南（本文件的簡化版本）
- `README.md` - 專案整體說明

---

## 🔗 參考資源

- [Zeabur Volumes 官方文檔](https://zeabur.com/docs/deploy/volumes)
- [Zeabur Environment Variables 文檔](https://zeabur.com/docs/deploy/variables)
- [SQLite 資料庫管理](https://www.sqlite.org/cli.html)
- [better-sqlite3 文檔](https://github.com/WiseLibs/better-sqlite3)

---

## ✨ 配置完成檢查清單

在完成所有步驟後，請確認：

- [x] Volume 已建立（Mount Path: `/data`, Size: 1GB）
- [x] 環境變數 `SQLITE_DB_PATH=/data/analytics.db` 已設定
- [x] Backend 已重新部署
- [x] 後端日誌顯示 `Using database path: /data/analytics.db`
- [x] API 健康檢查回應正常
- [x] 資料在重新部署後仍然保留

🎉 恭喜！您的 Zeabur Volume 永久儲存已配置完成！

---

**最後更新**: 2025-11-03
**維護者**: DIY Ski CRM Team
