# 管理頁面訪問控制配置指南

## 📋 概述

本指南說明如何使用 **Zeabur HTTP Basic Auth** 保護管理頁面，防止一般使用者誤入或未授權訪問。

## 🔒 受保護的管理頁面

以下頁面需要進行訪問控制：

| 頁面 | 用途 | URL |
|------|------|-----|
| `menu.html` | 管理頁面導航選單 | https://faq.diy.ski/menu.html |
| `analytics.html` | 分析統計儀表板 | https://faq.diy.ski/analytics.html |
| `admin.html` | 系統管理面板 | https://faq.diy.ski/admin.html |
| `docs.html` | 系統文檔 | https://faq.diy.ski/docs.html |
| `faq-admin.html` | FAQ 管理後台 | https://faq.diy.ski/faq-admin.html |
| `resort-admin.html` | 雪場資料管理 | https://faq.diy.ski/resort-admin.html |

**一般使用者頁面**（不需保護）:
- `index.html` - 主頁面（FAQ 搜尋）
- 其他公開頁面

---

## ✅ 方案選擇：Zeabur HTTP Basic Auth

**優點**:
- ✅ **無需寫程式碼** - Zeabur 平台級別保護
- ✅ **瀏覽器原生支援** - 彈出標準登入對話框
- ✅ **設定簡單** - 5 分鐘內完成
- ✅ **安全可靠** - 使用標準 HTTP 認證機制
- ✅ **統一管理** - 所有管理頁面共用一組帳密

**運作方式**:
1. 使用者訪問管理頁面（例如 `/analytics.html`）
2. Zeabur 攔截請求，彈出 HTTP Basic Auth 登入框
3. 輸入正確帳號密碼後才能訪問
4. 憑證會保存在瀏覽器中，不需重複登入

---

## 🛠️ Zeabur 配置步驟

### 方法 1: 使用 Zeabur Dashboard（推薦）

#### 步驟 1: 進入 Frontend 服務設定

1. 登入 [Zeabur Dashboard](https://dash.zeabur.com)
2. 選擇專案（skidiy-faq）
3. 點擊 **Frontend** 服務（或 `frontend` deployment）
4. 進入 **Settings** 標籤

#### 步驟 2: 建立 HTTP Basic Auth 規則

在 **Settings** → **HTTP** → **Basic Auth** 區域：

1. 點擊 **Add Rule** 或 **Enable Basic Auth**
2. 填寫以下資訊：

```yaml
Path Pattern: /admin/*
Username: admin
Password: <your-secure-password>
```

**重要**: 請將 `<your-secure-password>` 替換為您的強密碼

3. 新增更多規則以保護其他頁面：

```yaml
# 保護 analytics 頁面
Path Pattern: /analytics.html
Username: admin
Password: <same-password>

# 保護 admin 頁面
Path Pattern: /admin.html
Username: admin
Password: <same-password>

# 保護 menu 頁面
Path Pattern: /menu.html
Username: admin
Password: <same-password>

# 保護 docs 頁面
Path Pattern: /docs.html
Username: admin
Password: <same-password>

# 保護 faq-admin 頁面
Path Pattern: /faq-admin.html
Username: admin
Password: <same-password>

# 保護 resort-admin 頁面
Path Pattern: /resort-admin.html
Username: admin
Password: <same-password>
```

#### 步驟 3: 儲存並重新部署

1. 點擊 **Save** 儲存設定
2. Zeabur 會自動重新部署 Frontend 服務
3. 等待部署完成（約 1-2 分鐘）

---

### 方法 2: 使用 `zeabur.json` 配置檔（進階）

如果 Zeabur Dashboard 不支援 Basic Auth UI，可以使用配置檔。

#### 建立 `zeabur.json`

在 `frontend/` 目錄下建立 `zeabur.json`：

```json
{
  "routes": [
    {
      "path": "/analytics.html",
      "basicAuth": {
        "username": "admin",
        "password": "$2a$10$YOUR_BCRYPT_HASH_HERE"
      }
    },
    {
      "path": "/admin.html",
      "basicAuth": {
        "username": "admin",
        "password": "$2a$10$YOUR_BCRYPT_HASH_HERE"
      }
    },
    {
      "path": "/menu.html",
      "basicAuth": {
        "username": "admin",
        "password": "$2a$10$YOUR_BCRYPT_HASH_HERE"
      }
    },
    {
      "path": "/docs.html",
      "basicAuth": {
        "username": "admin",
        "password": "$2a$10$YOUR_BCRYPT_HASH_HERE"
      }
    },
    {
      "path": "/faq-admin.html",
      "basicAuth": {
        "username": "admin",
        "password": "$2a$10$YOUR_BCRYPT_HASH_HERE"
      }
    },
    {
      "path": "/resort-admin.html",
      "basicAuth": {
        "username": "admin",
        "password": "$2a$10$YOUR_BCRYPT_HASH_HERE"
      }
    }
  ]
}
```

**生成 Bcrypt 密碼雜湊**:
```bash
# 使用 Node.js
npx bcryptjs-cli hash <your-password> 10

# 或使用 Python
python3 -c "import bcrypt; print(bcrypt.hashpw(b'your-password', bcrypt.gensalt(10)).decode())"
```

---

### 方法 3: 使用 Nginx 配置（替代方案）

如果 Zeabur 不支援 Basic Auth，可以建立自訂 Nginx 配置。

#### 建立 `nginx.conf`

```nginx
server {
    listen 80;
    server_name _;

    root /app;
    index index.html;

    # 公開頁面（不需認證）
    location / {
        try_files $uri $uri/ =404;
    }

    # 保護管理頁面
    location ~ ^/(analytics|admin|menu|docs|faq-admin|resort-admin)\.html$ {
        auth_basic "Admin Area";
        auth_basic_user_file /etc/nginx/.htpasswd;
        try_files $uri =404;
    }
}
```

#### 建立 `.htpasswd` 檔案

```bash
# 使用 htpasswd 工具生成
htpasswd -c .htpasswd admin
# 輸入密碼

# 或使用線上工具生成
# https://www.web2generators.com/apache-tools/htpasswd-generator
```

#### 更新 `Dockerfile`（如果使用自訂 Docker）

```dockerfile
FROM nginx:alpine

# 複製檔案
COPY frontend/ /app
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY .htpasswd /etc/nginx/.htpasswd

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## ✅ 驗證配置

### 測試步驟

1. **清除瀏覽器快取**
   - Chrome: Cmd+Shift+Delete → 清除快取
   - 或使用無痕模式測試

2. **訪問管理頁面**
   ```
   https://faq.diy.ski/analytics.html
   ```

3. **預期行為**
   - ✅ 瀏覽器彈出登入對話框
   - ✅ 輸入正確帳密後可進入頁面
   - ✅ 輸入錯誤帳密顯示 401 Unauthorized

4. **訪問公開頁面**
   ```
   https://faq.diy.ski/
   https://faq.diy.ski/index.html
   ```

5. **預期行為**
   - ✅ 直接訪問，無需登入

---

## 🔐 密碼管理建議

### 生成強密碼

```bash
# 使用 openssl 生成隨機密碼
openssl rand -base64 24

# 範例輸出: X9k2pL7mQ3vR8nF1zY6wH4sA
```

### 密碼儲存

**推薦方式**:
1. 使用密碼管理器（1Password, Bitwarden）
2. 記錄在安全的文檔中（加密儲存）
3. 分享給需要的團隊成員

**不推薦**:
- ❌ 直接寫在程式碼中
- ❌ 明文儲存在 Git repository
- ❌ 使用簡單密碼（例如 `admin123`）

### 定期更換

建議每 3-6 個月更換一次管理密碼。

---

## 🚨 疑難排解

### 問題 1: 無法看到 Basic Auth 設定選項

**原因**: Zeabur Dashboard 可能尚未支援 UI 設定

**解決方法**:
1. 使用 `zeabur.json` 配置檔（方法 2）
2. 或聯繫 Zeabur 技術支援確認功能可用性
3. 或採用方法 3（Nginx 配置）

---

### 問題 2: 設定後仍可直接訪問

**可能原因**:
1. 瀏覽器快取未清除
2. Path Pattern 設定錯誤
3. 配置未生效

**解決方法**:
1. 使用無痕模式測試
2. 檢查 Path Pattern 是否完全符合（區分大小寫）
3. 重新部署 Frontend 服務
4. 檢查 Zeabur Logs 確認配置是否載入

---

### 問題 3: 登入後立即跳回登入框

**原因**: 密碼雜湊或格式錯誤

**解決方法**:
1. 確認 Bcrypt 雜湊正確生成
2. 檢查 `zeabur.json` JSON 格式是否正確
3. 確認 username/password 無額外空格

---

### 問題 4: 手機端無法登入

**原因**: 某些行動瀏覽器 Basic Auth 支援問題

**解決方法**:
1. 使用 Chrome/Safari 最新版本
2. 或改用 JWT Token 方案（需修改前端代碼）

---

## 📊 使用者體驗優化

### 1. 新增登入提示頁面

建立 `login-required.html` 作為友善提示：

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <title>需要登入 - SkiDIY FAQ 管理</title>
  <style>
    body {
      font-family: 'Roboto', sans-serif;
      background: linear-gradient(135deg, #619AEC 0%, #4A7BC8 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .card {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      text-align: center;
      max-width: 400px;
    }
    h1 { color: #619AEC; margin-bottom: 20px; }
    p { color: #666; line-height: 1.6; }
    .btn {
      background: #619AEC;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      margin-top: 20px;
    }
    .btn:hover { background: #4A7BC8; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🔒 需要登入</h1>
    <p>此頁面為管理功能，需要管理員權限才能訪問。</p>
    <p>請輸入您的管理員帳號密碼。</p>
    <button class="btn" onclick="location.reload()">重新登入</button>
    <br><br>
    <a href="/" style="color: #619AEC; text-decoration: none;">← 返回首頁</a>
  </div>
</body>
</html>
```

### 2. 在 menu.html 新增登出功能

```javascript
// 登出功能（清除瀏覽器儲存的認證）
function logout() {
  // HTTP Basic Auth 無法直接登出，需要傳送錯誤憑證
  fetch('/analytics.html', {
    headers: {
      'Authorization': 'Basic ' + btoa('logout:logout')
    }
  }).then(() => {
    alert('已登出，請重新整理頁面');
    location.reload();
  });
}
```

---

## 🔗 相關文檔

- [Zeabur 官方文檔](https://zeabur.com/docs)
- [HTTP Basic Authentication RFC](https://datatracker.ietf.org/doc/html/rfc7617)
- [Nginx Basic Auth 設定](https://nginx.org/en/docs/http/ngx_http_auth_basic_module.html)

---

## 📋 配置檢查清單

完成以下步驟以確保訪問控制正確設定：

- [ ] 確認需要保護的管理頁面清單
- [ ] 生成強密碼（至少 16 字元）
- [ ] 在 Zeabur Dashboard 設定 Basic Auth 規則
- [ ] 或建立 `zeabur.json` 配置檔
- [ ] 重新部署 Frontend 服務
- [ ] 清除瀏覽器快取測試
- [ ] 確認管理頁面需要登入
- [ ] 確認公開頁面可直接訪問
- [ ] 將帳號密碼儲存在密碼管理器
- [ ] 通知團隊成員管理頁面訪問方式

---

**最後更新**: 2025-11-03
**維護者**: DIY Ski CRM Team
