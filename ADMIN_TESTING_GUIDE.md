# SKIDIY 後台測試指南

## 📋 系統變更摘要

### 認證系統升級
- ✅ **移除**: HTTP Basic Authentication (.htaccess)
- ✅ **新增**: PHP Session 登入系統
- ✅ **保護**: 所有後台頁面都需要登入才能存取
- ✅ **功能**: 登出功能、Session 逾時 (30 分鐘)

### 修復項目
1. **認證中介層** (`includes/auth.php`)
   - 所有後台 PHP 檔案都加上了 `require('../includes/auth.php')`
   - 自動檢查登入狀態
   - 未登入自動導向登入頁面

2. **PARKS::update() 方法** (`includes/mj.class.php:142`)
   - 修正欄位映射問題
   - Section 名稱正確對應到資料庫欄位名稱
   - 例如: `photo` → `photo_section`, `location` → `location_section`

3. **post-cgi.php**
   - 補上缺少的 `$PARK_SECTION_HEADER` 陣列定義

4. **管理選單** (`bkAdmin/menu.php`)
   - 新增登出按鈕
   - 確認提示對話框

---

## 🔐 登入資訊

### 測試帳號
```
URL: https://skidiyog.zeabur.app/bkAdmin/login.php
Username: admin
Password: skidiy2024
```

⚠️ **安全提醒**: 這是測試密碼，生產環境請務必更換！

---

## 🧪 測試步驟

### 1. 登入測試

1. 訪問: `https://skidiyog.zeabur.app/bkAdmin/login.php`
2. 輸入帳號密碼
3. 點擊「登入」按鈕

**預期結果**:
- ✅ 成功登入後跳轉到 `index.php`
- ✅ 可以看到管理員後台選單
- ✅ 右上角有「登出」按鈕

**錯誤處理**:
- ❌ 密碼錯誤: 顯示「帳號或密碼錯誤」
- ❌ 未登入存取 `parks.php`: 自動導回登入頁面

---

### 2. 雪場編輯測試 ❄️

1. 點擊選單「❄ 雪場資訊」或訪問 `parks.php`
2. 在下拉選單選擇一個雪場 (例如: NOZAWA)
3. 等待頁面載入雪場資訊
4. 修改任一區塊內容 (例如「介紹」區塊)
5. 點擊「修改」按鈕

**測試用文字**:
```
【測試編輯功能】野澤溫泉滑雪場是日本長野縣知名的滑雪勝地，
擁有豐富的雪道選擇和天然溫泉。
測試時間: 2025-11-07
```

**預期結果**:
- ✅ 點擊「修改」後顯示「修改成功」對話框
- ✅ 重新整理頁面，內容有正確儲存
- ✅ 前台 `park.php?name=NOZAWA` 可以看到更新內容

**檢查項目**:
```bash
# 在伺服器端檢查資料庫
sqlite3 skidiyog/data/skidiyog.db "SELECT name, about FROM parks WHERE name='NOZAWA';"
```

---

### 3. 文章編輯測試 📗

1. 點擊選單「📗 相關文章」或訪問 `articles.php`
2. 選擇一篇現有文章進行編輯
3. 修改文章內容、標題或標籤
4. 點擊「儲存」按鈕

**測試用資料**:
```
標題: 野澤溫泉滑雪攻略 (測試編輯)
內容: 本文介紹野澤溫泉滑雪場的基本資訊...
關鍵字: 野澤, 滑雪, 溫泉
標籤: 滑雪場, 攻略
```

**預期結果**:
- ✅ 儲存成功顯示確認訊息
- ✅ 文章列表中可以看到更新
- ✅ 前台可以正常顯示文章

**新增文章測試**:
1. 在文章管理頁面找到「新增文章」功能
2. 填寫標題和內容
3. 點擊「新增」按鈕

---

### 4. 登出測試

1. 點擊右上角「登出」按鈕
2. 確認提示對話框中點擊「確定」

**預期結果**:
- ✅ 跳轉回登入頁面
- ✅ 再次訪問 `parks.php` 會自動導回登入頁面
- ✅ Session 已清除

---

### 5. Session 逾時測試

1. 登入後台
2. 等待 30 分鐘不操作
3. 嘗試執行任何操作 (例如編輯雪場)

**預期結果**:
- ✅ 自動導回登入頁面
- ✅ URL 參數帶有 `?error=timeout`

---

## 🐛 已知問題與注意事項

### 資料庫相關

1. **SQLite 檔案位置**:
   ```
   skidiyog/data/skidiyog.db
   ```
   確保此目錄有寫入權限

2. **自動建表**:
   - 首次執行時會自動建立 `parks`, `instructors`, `articles` 表
   - 如果資料庫不存在會自動建立

3. **資料初始化**:
   如果雪場資料是空的，可能需要執行資料匯入腳本：
   ```bash
   php scripts/import-parks-data.php
   ```

### 前後台分離

- **前台**: `https://skidiyog.zeabur.app/parkList.php` (無需認證)
- **後台**: `https://skidiyog.zeabur.app/bkAdmin/` (需要登入)

### 環境變數 (生產環境)

在 Zeabur Dashboard 設定:
```
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD_HASH=$2y$10$...  # 使用 password_hash() 生成
```

生成密碼 Hash:
```php
<?php
echo password_hash('your_secure_password', PASSWORD_DEFAULT);
?>
```

---

## 📊 測試檢查表

請在測試時勾選:

### 基礎功能
- [ ] 能夠訪問登入頁面
- [ ] 能夠成功登入
- [ ] 登入後顯示後台選單
- [ ] 未登入時無法存取後台頁面

### 雪場管理
- [ ] 能夠選擇雪場
- [ ] 能夠查看雪場資訊
- [ ] 能夠編輯雪場內容 (測試至少 2 個區塊)
- [ ] 儲存後資料正確更新
- [ ] 前台可以看到更新內容

### 文章管理
- [ ] 能夠查看文章列表
- [ ] 能夠編輯現有文章
- [ ] 能夠新增文章
- [ ] 文章儲存成功
- [ ] 前台可以顯示文章

### 安全性
- [ ] 登出功能正常
- [ ] 登出後無法存取後台
- [ ] Session 逾時機制運作
- [ ] 無法使用錯誤密碼登入

---

## 🆘 故障排除

### 問題 1: 無法登入
**可能原因**:
- Session 功能未啟用
- 密碼不正確

**解決方法**:
1. 檢查 `php.ini` 中 `session.save_path` 設定
2. 確認密碼是 `skidiy2024`
3. 檢查瀏覽器 Cookie 是否啟用

### 問題 2: 雪場編輯無效
**可能原因**:
- 資料庫寫入權限問題
- PARKS 類別方法錯誤

**解決方法**:
1. 檢查資料庫檔案權限: `ls -la skidiyog/data/`
2. 查看 PHP 錯誤日誌
3. 開啟瀏覽器開發者工具 → Network 檢查 API 回應

### 問題 3: 登出後仍可存取
**可能原因**:
- 瀏覽器快取
- Session 未正確清除

**解決方法**:
1. 清除瀏覽器快取
2. 使用無痕模式測試
3. 檢查 `auth.php` 是否正確載入

---

## 📞 技術支援

如有問題請提供以下資訊:
1. 問題描述
2. 操作步驟
3. 瀏覽器 Console 錯誤訊息
4. Network 面板的 API 回應

---

**測試完成後請回報結果！** ✅
