# 🚀 部署前檢查清單

## 檔案變更摘要

### 新增檔案
- ✅ `skidiyog/bkAdmin/login.php` - 登入頁面
- ✅ `skidiyog/check_database.php` - 資料庫健康檢查腳本
- ✅ `deploy.sh` - 自動化部署腳本
- ✅ `ADMIN_TESTING_GUIDE.md` - 測試指南
- ✅ `PRE_DEPLOYMENT_CHECKLIST.md` - 本檔案

### 修改檔案
- ✅ `skidiyog/includes/auth.php` - 改為 Session 認證系統
- ✅ `skidiyog/includes/mj.class.php` - 修復 PARKS::update() 方法
- ✅ `skidiyog/bkAdmin/menu.php` - 新增登出按鈕
- ✅ `skidiyog/bkAdmin/post-cgi.php` - 補上 $PARK_SECTION_HEADER 定義
- ✅ `skidiyog/bkAdmin/*.php` (21 個檔案) - 加上認證檢查

### 停用檔案
- ✅ `skidiyog/bkAdmin/.htaccess` → `.htaccess.disabled`

---

## 📋 部署前檢查

### 1. 本地測試 (可選)

如果有本地 PHP 環境:
```bash
cd skidiyog
php check_database.php
```

預期輸出:
```
✅ Database connection successful
✅ 23 records found in parks
✅ All checks passed!
```

### 2. Git 狀態檢查

```bash
cd /Users/jameschen/Downloads/diyski/crm/03_FAQ與知識庫/zeabur
git status
```

應該看到:
- Modified: 多個 `skidiyog/bkAdmin/*.php` 檔案
- Modified: `skidiyog/includes/auth.php`
- Modified: `skidiyog/includes/mj.class.php`
- Modified: `skidiyog/bkAdmin/menu.php`
- New files: `login.php`, `deploy.sh`, 文檔檔案

### 3. 部署執行

```bash
./deploy.sh
```

腳本會自動:
1. 檢查是否有未提交的變更
2. Commit 所有變更
3. Push 到 remote repository
4. Zeabur 自動部署

---

## ✅ 部署後驗證

### 步驟 1: 等待 Zeabur 完成部署

1. 訪問 Zeabur Dashboard
2. 查看 Deployment 狀態
3. 等待狀態變為 "Running" (約 1-2 分鐘)

### 步驟 2: 測試登入功能

訪問: https://skidiyog.zeabur.app/bkAdmin/login.php

**測試帳號**:
- Username: `admin`
- Password: `skidiy2024`

預期結果:
- ✅ 看到登入表單
- ✅ 輸入正確帳密後成功登入
- ✅ 跳轉到後台首頁

### 步驟 3: 測試雪場編輯

1. 點擊「❄ 雪場資訊」
2. 選擇「苗場 (naeba)」
3. 在「介紹」欄位加上測試文字:
   ```
   【測試 2025-11-07】苗場滑雪場測試編輯功能。
   ```
4. 點擊「修改」按鈕
5. 應該看到「修改成功」訊息

### 步驟 4: 驗證前台顯示

訪問: https://skidiyog.zeabur.app/park.php?name=naeba

預期結果:
- ✅ 可以看到剛才新增的測試文字
- ✅ 頁面正常顯示，沒有錯誤

### 步驟 5: 測試登出

1. 點擊右上角「登出」
2. 確認對話框點「確定」
3. 應該跳回登入頁面

### 步驟 6: 測試認證保護

直接訪問: https://skidiyog.zeabur.app/bkAdmin/parks.php

預期結果:
- ✅ 自動跳轉到登入頁面 (因為未登入)

---

## 🐛 常見問題排除

### 問題 1: Zeabur 部署失敗

**檢查項目**:
1. Git push 是否成功?
2. Zeabur Dashboard 是否顯示錯誤訊息?
3. 是否有 syntax error?

**解決方法**:
```bash
# 檢查 PHP 語法
cd skidiyog
find . -name "*.php" -exec php -l {} \; | grep -v "No syntax errors"
```

### 問題 2: 登入頁面 404

**可能原因**:
- 檔案未正確上傳
- 路徑不正確

**檢查方法**:
訪問: https://skidiyog.zeabur.app/bkAdmin/
應該會自動跳轉到 login.php

### 問題 3: 登入後白頁

**可能原因**:
- PHP 錯誤
- Session 無法建立

**檢查方法**:
1. 打開瀏覽器開發者工具
2. 查看 Console 是否有錯誤
3. 檢查 Network 面板的 HTTP 回應

### 問題 4: 雪場編輯無效

**可能原因**:
- 資料庫寫入權限問題
- PARKS 類別錯誤

**檢查方法**:
```bash
# 在 Zeabur 伺服器上
ls -la skidiyog/data/
# 確認 skidiyog.db 可寫入
```

---

## 🔒 安全性檢查

- [ ] `.htaccess` 已停用 (改名為 `.htaccess.disabled`)
- [ ] 所有後台頁面都有 `require('../includes/auth.php')`
- [ ] 登入頁面有密碼保護
- [ ] Session timeout 設定為 30 分鐘
- [ ] 沒有在程式碼中硬編碼敏感資訊

---

## 📝 生產環境建議

### 1. 更改預設密碼

在 Zeabur Dashboard 設定環境變數:
```
ADMIN_USERNAME=your_secure_username
ADMIN_PASSWORD_HASH=$2y$10$...  # 使用下方指令生成
```

生成密碼 Hash:
```php
<?php
// 執行此腳本生成密碼 hash
$password = 'your_secure_password_here';
echo password_hash($password, PASSWORD_DEFAULT);
?>
```

### 2. 資料庫備份

定期備份 SQLite 資料庫:
```bash
cp skidiyog/data/skidiyog.db backups/skidiyog-$(date +%Y%m%d).db
```

### 3. 監控日誌

檢查 PHP 錯誤日誌:
- Zeabur Dashboard → Logs
- 查看是否有異常錯誤

### 4. HTTPS 確認

確保所有連線都使用 HTTPS:
- ✅ https://skidiyog.zeabur.app (前台)
- ✅ https://skidiyog.zeabur.app/bkAdmin/ (後台)

---

## 📊 效能檢查

- [ ] 登入頁面載入時間 < 2 秒
- [ ] 雪場列表載入時間 < 3 秒
- [ ] 編輯儲存回應時間 < 1 秒
- [ ] 前台頁面載入時間 < 2 秒

---

## ✅ 最終確認

部署完成後，請確認以下項目:

### 功能測試
- [ ] 能夠登入後台
- [ ] 能夠編輯雪場資訊
- [ ] 能夠編輯文章
- [ ] 能夠登出
- [ ] 前台正常顯示更新內容

### 安全性
- [ ] 未登入無法存取後台
- [ ] 登出後無法存取後台
- [ ] Session timeout 正常運作

### 效能
- [ ] 頁面載入速度正常
- [ ] 沒有明顯延遲
- [ ] 資料庫回應快速

---

## 🎉 完成部署

如果所有檢查項目都通過，恭喜您成功部署了新的認證系統！

**下一步**:
1. 將測試結果記錄在 `ADMIN_TESTING_GUIDE.md`
2. 通知團隊成員新的登入資訊
3. 定期檢查系統日誌

---

**部署時間**: `date`
**部署人員**: Claude Code
**版本**: v1.0 - Session Authentication System
