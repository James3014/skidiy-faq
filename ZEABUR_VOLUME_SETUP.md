# Zeabur Volume 永久儲存設定指南

> 📖 **完整配置指南**: 請參閱 [ZEABUR_CONFIG_GUIDE.md](./ZEABUR_CONFIG_GUIDE.md) 獲取詳細步驟、截圖說明和疑難排解

## ⚠️ 目前問題

後端 SQLite 資料庫目前儲存在 `/data/analytics.db`，這會導致：
- ❌ Zeabur 重新部署後資料消失
- ❌ 容器重啟後資料消失
- ❌ 所有歷史統計資料無法保留

## ✅ 解決方案：設定 Zeabur Volume

### 步驟 1：在 Zeabur 後台添加 Volume

1. 登入 Zeabur Dashboard: https://dash.zeabur.com
2. 選擇你的專案
3. 點擊 Backend 服務 (zeabur_backend)
4. 進入「Settings」→「Volumes」
5. 點擊「Add Volume」
6. 設定：
   ```
   Mount Path: /data
   Size: 1GB (免費方案可用)
   ```
7. 儲存設定

### 步驟 2：設定環境變數

在 Zeabur Backend 服務的環境變數中添加：

```bash
SQLITE_DB_PATH=/data/analytics.db
```

設定路徑：
1. Backend 服務 → 「Settings」→「Environment Variables」
2. 添加新變數：
   - Key: `SQLITE_DB_PATH`
   - Value: `/data/analytics.db`
3. 儲存

### 步驟 3：重新部署

1. 觸發重新部署（可以推送一個小更新到 GitHub）
2. 或在 Zeabur Dashboard 手動重新部署

### 步驟 4：驗證

部署完成後，檢查後端日誌：

```bash
# 應該看到類似的日誌
[Analytics Service] Using database path: /data/analytics.db
[Analytics Service] Tables initialized
```

## 📊 資料庫路徑優先順序

後端會依照以下順序選擇資料庫路徑：

1. **環境變數** `SQLITE_DB_PATH` (最優先)
2. **生產環境** `/data/analytics.db` (Zeabur，會消失)
3. **開發環境** `../data/analytics.db` (本地開發)

設定 `SQLITE_DB_PATH=/data/analytics.db` 後，會使用 Volume 永久儲存。

## 📁 Volume 內容說明

設定完成後，`/data` 目錄會包含：

```
/data/
└── analytics.db       # SQLite 資料庫
```

資料庫包含以下資料表：
- `llm_usage` - LLM 使用記錄
- `provider_stats` - LLM 提供者統計
- `faq_views` - FAQ 點擊記錄
- `section_views` - 分類點擊記錄
- `tag_clicks` - Tag 點擊記錄
- `resort_clicks` - 雪場點擊記錄

## 🔄 資料遷移（選用）

如果你想保留舊的 localStorage 資料到新的資料庫：

1. 在前端打開 Browser DevTools
2. Console 執行：
   ```javascript
   // 查看 localStorage 中的資料
   console.log('Tag Clicks:', localStorage.getItem('tagClicks'));
   console.log('Section Clicks:', localStorage.getItem('sectionClicks'));
   console.log('Resort Clicks:', localStorage.getItem('resortClicks'));
   ```
3. 資料會在下次點擊時自動同步到後端

## 💾 備份建議

定期備份資料庫：

```bash
# 在 Zeabur 容器內執行（或透過 API 匯出）
sqlite3 /data/analytics.db .dump > backup.sql
```

## 🆘 疑難排解

### Volume 沒有生效

1. 檢查環境變數是否正確設定
2. 確認 Volume Mount Path 是 `/data` 而不是 `/data/`
3. 檢查後端日誌確認使用的資料庫路徑

### 資料消失

1. 確認 Volume 已正確掛載（Zeabur Dashboard → Volumes）
2. 檢查 `SQLITE_DB_PATH` 環境變數
3. 查看後端啟動日誌中的資料庫路徑

### 空間不足

1. Zeabur 免費方案提供 1GB Volume
2. SQLite 資料庫通常很小（< 100MB）
3. 可以定期清理舊資料：
   ```sql
   DELETE FROM faq_views WHERE timestamp < datetime('now', '-90 days');
   DELETE FROM section_views WHERE timestamp < datetime('now', '-90 days');
   DELETE FROM tag_clicks WHERE timestamp < datetime('now', '-90 days');
   DELETE FROM resort_clicks WHERE timestamp < datetime('now', '-90 days');
   ```

## 📚 相關檔案

- Backend 資料庫設定：`zeabur_backend/backend/src/services/analytics-service.js:12-33`
- 環境變數範例：`zeabur_backend/backend/.env.example:11`

## 🔗 參考資源

- [Zeabur Volumes 文檔](https://zeabur.com/docs/deploy/volumes)
- [SQLite 資料庫管理](https://www.sqlite.org/cli.html)
