# Zeabur Volume 配置清單 ✓

快速檢查清單，確保 Zeabur Volume 永久儲存已正確配置。

---

## 📋 配置前檢查

- [ ] 已有 Zeabur 帳號並登入
- [ ] Backend 服務（zeabur_backend）已部署並運行
- [ ] 可訪問 Zeabur Dashboard: https://dash.zeabur.com

---

## 🔧 配置步驟清單

### ✅ 步驟 1: 建立 Volume

- [ ] 進入 Backend 服務 → Settings → Volumes
- [ ] 點擊 **Add Volume**
- [ ] 設定 Mount Path: `/data`（無結尾 `/`）
- [ ] 設定 Size: `1` GB
- [ ] 點擊 **Save** 儲存

**驗證方式**: 在 Volumes 列表中看到新建立的 Volume

---

### ✅ 步驟 2: 設定環境變數

- [ ] 進入 Backend 服務 → Settings → Environment Variables
- [ ] 新增變數：
  - Key: `SQLITE_DB_PATH`
  - Value: `/data/analytics.db`
- [ ] 點擊 **Save** 儲存

**驗證方式**: 在環境變數列表中看到 `SQLITE_DB_PATH=/data/analytics.db`

---

### ✅ 步驟 3: 重新部署

- [ ] 方法 1: Zeabur 自動重新部署（設定變更後）
- [ ] 方法 2: 手動點擊 **Redeploy** 按鈕
- [ ] 方法 3: 推送 Git 更新觸發部署

**驗證方式**: 部署狀態變為 **Running**

---

### ✅ 步驟 4: 驗證配置

#### 4.1 檢查後端日誌

- [ ] 進入 Backend 服務 → Logs
- [ ] 查找日誌訊息：
  - ✅ `[Analytics Service] Using database path: /data/analytics.db`
  - ✅ `[Analytics Service] Tables initialized`
- [ ] **不應該**看到：`/tmp/analytics.db`

#### 4.2 測試 API 連接

在終端執行：
```bash
# 健康檢查
curl https://faq-api-v1.zeabur.app/health

# 統計 API
curl -G "https://faq-api-v1.zeabur.app/api/v1/analytics/section-stats" --data-urlencode "days=7"
```

- [ ] 健康檢查回應 `"status": "healthy"`
- [ ] 統計 API 回應 `"success": true`

#### 4.3 測試資料持久性（最終驗證）

- [ ] 訪問 https://faq.diy.ski/
- [ ] 點擊 2-3 個 FAQ 項目
- [ ] 點擊 2-3 個 Tags
- [ ] 點擊 2-3 個雪場地區
- [ ] 訪問 https://faq.diy.ski/analytics.html
- [ ] 確認所有分頁（LLM、FAQ、Tag、Section、Resort）顯示數據
- [ ] 在 Zeabur Dashboard 手動重新部署 Backend
- [ ] 等待部署完成（1-3 分鐘）
- [ ] **重新訪問** https://faq.diy.ski/analytics.html
- [ ] ✅ **確認數據仍然存在**（表示持久化成功！）

---

## 🚨 疑難排解

### ❌ 日誌顯示 `/tmp/analytics.db`

**原因**: 環境變數未生效

**解決方法**:
1. 檢查環境變數名稱：`SQLITE_DB_PATH`（區分大小寫）
2. 檢查 Value：`/data/analytics.db`
3. 點擊 Save 按鈕
4. 手動重新部署

---

### ❌ 資料在重新部署後消失

**原因**: Volume 未正確掛載

**解決方法**:
1. 確認 Volume Mount Path 為 `/data`（無結尾 `/`）
2. 確認 Volume 狀態為 **Active**
3. 確認環境變數 `SQLITE_DB_PATH=/data/analytics.db`
4. 重新部署

---

### ❌ API 回應錯誤

**原因**: 後端服務未正常運行

**解決方法**:
1. 檢查 Backend 服務狀態（應為 **Running**）
2. 查看 Logs 尋找錯誤訊息
3. 確認 PORT 和 NODE_ENV 環境變數正確
4. 重新部署

---

## 📊 配置完成確認

所有項目打勾後，表示配置成功！

- [ ] Volume 已建立（Mount Path: `/data`）
- [ ] 環境變數 `SQLITE_DB_PATH=/data/analytics.db` 已設定
- [ ] Backend 已重新部署並運行
- [ ] 日誌顯示 `/data/analytics.db`
- [ ] API 健康檢查通過
- [ ] Analytics 數據在重新部署後仍保留

---

## 🛠️ 自動驗證腳本

執行以下命令進行自動驗證：

```bash
./scripts/verify-zeabur-volume.sh
```

---

## 📚 延伸閱讀

- [ZEABUR_CONFIG_GUIDE.md](./ZEABUR_CONFIG_GUIDE.md) - 詳細配置指南
- [ZEABUR_VOLUME_SETUP.md](./ZEABUR_VOLUME_SETUP.md) - 快速設定指南
- [Zeabur Volumes 官方文檔](https://zeabur.com/docs/deploy/volumes)

---

**最後更新**: 2025-11-03
