# 管理員密碼設定快速指南

## 📋 現況

所有管理頁面已配置訪問控制，使用前端 JavaScript 密碼驗證：

### 🔒 受保護的頁面

| 頁面 | 說明 | URL |
|------|------|-----|
| `menu.html` | 管理選單 | https://faq.diy.ski/menu.html |
| `analytics.html` | 分析統計 | https://faq.diy.ski/analytics.html |
| `admin.html` | 系統管理 | https://faq.diy.ski/admin.html |
| `docs.html` | 系統文檔 | https://faq.diy.ski/docs.html |
| `faq-admin.html` | FAQ 管理 | https://faq.diy.ski/faq-admin.html |
| `resort-admin.html` | 雪場管理 | https://faq.diy.ski/resort-admin.html |

---

## 🔑 初始設定

⚠️ **重要安全提示**:
- 系統已配置密碼雜湊值，但**您必須立即設定自己的密碼**！
- **切勿在文檔或程式碼中寫入明文密碼**
- 請聯繫系統管理員獲取初始密碼，或使用以下步驟設定新密碼

---

## 🛠️ 更改管理員密碼

### 步驟 1: 生成新的密碼雜湊

```bash
# 互動式輸入（推薦）
node scripts/generate-admin-password.js

# 或直接指定密碼
node scripts/generate-admin-password.js "YourNewPassword123!"
```

**輸出範例**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
生成的 SHA-256 雜湊值：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  e26586c5e5322452d4878df93f91c49a0946cabdd3805fbdc6c813f49ee1a255
```

### 步驟 2: 更新配置檔

打開 `frontend/assets/admin-auth.js`，找到 `PASSWORD_HASH` 配置：

```javascript
const CONFIG = {
  // 管理員密碼（SHA-256 雜湊值）
  PASSWORD_HASH: 'e26586c5e5322452d4878df93f91c49a0946cabdd3805fbdc6c813f49ee1a255',
  ...
};
```

將雜湊值替換為步驟 1 生成的新雜湊值。

### 步驟 3: 部署更新

```bash
git add frontend/assets/admin-auth.js
git commit -m "chore: update admin password hash"
git push origin main
```

Zeabur 會自動重新部署 Frontend 服務。

### 步驟 4: 驗證

1. 清除瀏覽器快取（或使用無痕模式）
2. 訪問任一管理頁面（例如 https://faq.diy.ski/analytics.html）
3. 輸入新密碼
4. 確認可成功登入

---

## 🔐 使用者體驗

### 首次訪問管理頁面

1. 使用者訪問管理頁面（例如 `/analytics.html`）
2. 頁面顯示登入對話框：

```
┌─────────────────────────────────┐
│      🔒 管理員登入               │
│  請輸入管理員密碼以繼續          │
│                                 │
│  [      輸入密碼     ]          │
│                                 │
│  [取消]          [登入]         │
└─────────────────────────────────┘
```

3. 輸入正確密碼後進入頁面
4. 登入狀態保持 8 小時

### Session 管理

- **有效期限**: 8 小時
- **儲存方式**: localStorage
- **自動延長**: 每次訪問自動延長
- **跨頁面**: 登入一次，所有管理頁面通用

### 登出

```javascript
// 在瀏覽器 Console 執行
AdminAuth.logout();
```

或重新整理頁面並取消登入對話框。

---

## 🔧 進階配置

### 調整 Session 有效期限

編輯 `frontend/assets/admin-auth.js`:

```javascript
const CONFIG = {
  // Session 有效期限（毫秒）
  SESSION_DURATION: 24 * 60 * 60 * 1000, // 改為 24 小時
  ...
};
```

### 在瀏覽器 Console 測試密碼雜湊

```javascript
// 生成密碼雜湊（開發用）
AdminAuth.generatePasswordHash('MyPassword123').then(hash => {
  console.log('Hash:', hash);
});
```

### 檢查登入狀態

```javascript
// 檢查是否已登入
if (AdminAuth.isAuthenticated()) {
  console.log('已登入');
} else {
  console.log('未登入');
}
```

### 手動觸發登入對話框

```javascript
AdminAuth.showLogin().then(() => {
  console.log('登入成功');
}).catch(() => {
  console.log('登入取消');
});
```

---

## 🛡️ 安全性說明

### ✅ 優點

1. **阻擋一般使用者**: 有效防止誤入管理頁面
2. **無需後端修改**: 純前端實現，快速部署
3. **使用者友善**: 登入一次，8 小時內無需重複輸入
4. **跨頁面通用**: 所有管理頁面共用 Session

### ⚠️ 限制

1. **前端驗證**: 密碼雜湊儲存在前端 JavaScript 中
2. **技術使用者可繞過**: 懂 JavaScript 的人可修改程式碼
3. **不適合高安全性需求**: 如需高安全性，建議使用後端 JWT 認證

### 🔒 建議安全措施

1. **定期更換密碼** (3-6 個月)
2. **使用強密碼** (至少 12 字元，包含大小寫、數字、符號)
3. **限制密碼分享** (僅分享給必要人員)
4. **監控異常訪問** (查看 analytics 日誌)

### 📊 適用場景

✅ **適合**:
- 防止一般使用者誤入管理頁面
- 內部團隊使用
- 快速實現訪問控制
- 低至中等安全性需求

❌ **不適合**:
- 高安全性需求（建議使用後端 JWT）
- 公開 API 保護（必須使用後端認證）
- 多使用者權限分級（需要後端 RBAC）

---

## 🚀 升級到後端認證（可選）

如需更高安全性，可升級到後端 JWT 認證：

### 優點
- ✅ 密碼不暴露在前端
- ✅ Token 可設定過期時間
- ✅ 支援多使用者權限分級
- ✅ 可記錄登入日誌

### 實作概要
1. 後端新增 `/api/v1/admin/login` 端點
2. 驗證帳密，發放 JWT Token
3. 前端儲存 Token，每次 API 請求帶上
4. 後端中介層驗證 Token

詳見 `ADMIN_ACCESS_CONTROL.md` 方案 2。

---

## 📝 疑難排解

### 問題 1: 無法登入（密碼正確）

**可能原因**: 瀏覽器快取舊的 admin-auth.js

**解決方法**:
1. 清除瀏覽器快取
2. 使用無痕模式測試
3. 確認 Zeabur 已部署最新版本

---

### 問題 2: 登入後立即跳出

**可能原因**: PASSWORD_HASH 設定錯誤

**解決方法**:
1. 檢查 admin-auth.js 中的 PASSWORD_HASH
2. 重新生成密碼雜湊
3. 確認雜湊值無多餘空格或換行

---

### 問題 3: 頁面完全空白

**可能原因**: admin-auth.js 載入失敗或有 JavaScript 錯誤

**解決方法**:
1. 打開瀏覽器開發工具 (F12)
2. 查看 Console 錯誤訊息
3. 確認 `assets/admin-auth.js` 路徑正確
4. 檢查 Network 標籤確認檔案載入成功

---

### 問題 4: 忘記密碼

**解決方法**:
1. 生成新的密碼雜湊：
   ```bash
   node scripts/generate-admin-password.js "YourNewPassword"
   ```
2. 更新 `frontend/assets/admin-auth.js` 中的 PASSWORD_HASH
3. 提交並推送到 GitHub
4. Zeabur 會自動重新部署

⚠️ **安全提醒**: 請勿在文檔或程式碼註解中寫入明文密碼

---

## 📚 相關文檔

- [ADMIN_ACCESS_CONTROL.md](./ADMIN_ACCESS_CONTROL.md) - 完整訪問控制方案比較
- [admin-auth.js](./frontend/assets/admin-auth.js) - 認證腳本原始碼
- [generate-admin-password.js](./scripts/generate-admin-password.js) - 密碼雜湊生成工具

---

**最後更新**: 2025-11-03
**維護者**: DIY Ski CRM Team
**初始密碼**: 請聯繫系統管理員獲取
