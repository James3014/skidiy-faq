# SkiDIY FAQ 系統更新日誌

**最後更新**: 2025-11-03
**版本**: v2.1.0

---

## 📋 目錄

- [中文更新](#中文更新)
- [English Updates](#english-updates)
- [ภาษาไทย อัพเดต](#ภาษาไทย-อัพเดต)

---

## 中文更新

### 🔒 新增功能：管理頁面訪問控制

#### 功能說明
所有敏感管理頁面現已受到密碼保護，防止未授權使用者訪問。

#### 受保護的頁面
- `menu.html` - 管理選單
- `analytics.html` - 分析統計儀表板
- `admin.html` - 系統管理面板
- `docs.html` - 系統文檔
- `faq-admin.html` - FAQ 管理後台
- `resort-admin.html` - 雪場資料管理

#### 登入方式
1. 訪問任何管理頁面
2. 會自動彈出登入對話框（半透明黑色背景，白色對話框）
3. 輸入管理員密碼
4. 點擊「登入」按鈕
5. Session 有效期 8 小時，期間無需重複登入

#### 初始密碼
- 請聯繫系統管理員獲取初始密碼
- 密碼已以 SHA-256 雜湊形式儲存，不以明文存在於文檔或 Git

#### 更改密碼步驟
```bash
# 1. 生成新密碼雜湊
node scripts/generate-admin-password.js "YourSecurePassword123!"

# 2. 複製生成的雜湊值

# 3. 編輯 frontend/assets/admin-auth.js
#    找到 PASSWORD_HASH 並替換

# 4. 提交並推送
git add frontend/assets/admin-auth.js
git commit -m "chore: update admin password hash"
git push origin main

# 5. Zeabur 會自動重新部署（約 1-2 分鐘）
```

#### 故障排除

**問題 1: 看不到登入對話框**
- 解決方案：
  1. 按 `Cmd+Shift+R` (Mac) 或 `Ctrl+Shift+R` (Windows) 強制重新整理
  2. 使用無痕模式測試
  3. 清除瀏覽器快取

**問題 2: 無法輸入密碼**
- 解決方案：
  1. 檢查瀏覽器擴充套件是否衝突（嘗試無痕模式）
  2. 更新瀏覽器到最新版本
  3. 在 Console 執行：`window.AdminAuth.showLogin()` 手動觸發

**問題 3: 登入失敗**
- 解決方案：
  1. 檢查 Console 是否有錯誤訊息
  2. 確認輸入的密碼正確
  3. 聯繫系統管理員確認密碼

**問題 4: 忘記密碼**
- 解決方案：
  1. 生成新的密碼雜湊（見更改密碼步驟）
  2. 更新密碼雜湊值
  3. 重新部署

---

### 📊 後台分析功能增強

#### 新增 5 個分析標籤

1. **📊 LLM 使用統計**
   - 總請求數、成功率、總成本、平均回應時間
   - 總 Token 數、平均 FAQ 項目
   - 提供者效能比較、每日使用趨勢、最近查詢記錄

2. **❓ FAQ 點擊分析**
   - FAQ 熱門排行
   - 語言分布分析
   - 每日點擊趨勢

3. **🏷️ Tag 點擊分析**
   - Tag 熱門排行
   - 標籤使用分布
   - 語言版本統計

4. **📂 分類點擊分析** (新增)
   - 分類/課程點擊統計
   - 各分類熱度分析
   - 語言版本對比

5. **🏔️ 雪場點擊分析** (新增)
   - 雪場地區點擊統計
   - 雪場排行榜
   - 地區熱度分析

#### 數據過濾選項
所有分析頁面支援：
- **時間範圍**: 7天、30天、90天、全部
- **語言篩選**: 全部、中文、英文、泰文
- **排序方式**: 按點擊數排序

#### 數據持久化
- 所有數據儲存在 SQLite 資料庫（`/data/analytics.db` 使用 Zeabur Volume）
- localStorage 備份（最近 100 筆）
- 支援 CSV 匯出

#### API 端點
```
GET /api/v1/analytics/stats?days=7
GET /api/v1/analytics/faq-stats?days=7&language=zh
GET /api/v1/analytics/tag-stats?days=7
GET /api/v1/analytics/section-stats?days=7
GET /api/v1/analytics/resort-stats?days=7&click_type=all
POST /api/v1/analytics/track-faq-view
POST /api/v1/analytics/track-tag-click
POST /api/v1/analytics/track-section-click
POST /api/v1/analytics/track-resort-click
```

---

### 🔐 安全改善

#### 密碼安全
- ✅ 密碼以 SHA-256 雜湊形式儲存
- ✅ 明文密碼不儲存在 Git repository
- ✅ Session 儲存在 localStorage，有效期 8 小時
- ✅ 支援手動登出

#### 推薦安全措施
1. 定期更換管理員密碼（建議每 3-6 個月）
2. 使用強密碼（至少 12 字元，包含大小寫、數字、特殊符號）
3. 限制密碼分享範圍（僅分享給必要人員）
4. 監控異常訪問（查看 analytics 日誌）

---

### 📁 相關文檔

- [ADMIN_PASSWORD_SETUP.md](./ADMIN_PASSWORD_SETUP.md) - 密碼設定快速指南
- [ADMIN_ACCESS_CONTROL.md](./ADMIN_ACCESS_CONTROL.md) - 完整訪問控制方案
- [ZEABUR_CONFIG_GUIDE.md](./ZEABUR_CONFIG_GUIDE.md) - Zeabur Volume 配置指南
- [ZEABUR_CHECKLIST.md](./ZEABUR_CHECKLIST.md) - Zeabur 配置檢查清單

---

---

## English Updates

### 🔒 New Feature: Admin Page Access Control

#### Feature Description
All sensitive admin pages are now protected with password authentication to prevent unauthorized access.

#### Protected Pages
- `menu.html` - Admin Menu
- `analytics.html` - Analytics Dashboard
- `admin.html` - System Admin Panel
- `docs.html` - System Documentation
- `faq-admin.html` - FAQ Management
- `resort-admin.html` - Resort Data Management

#### Login Process
1. Visit any admin page
2. A login dialog automatically appears (semi-transparent black background, white box)
3. Enter the admin password
4. Click "Login" button
5. Session is valid for 8 hours without re-login needed

#### Initial Password
- Contact the system administrator to get the initial password
- Password is stored as SHA-256 hash, not in plaintext in documents or Git

#### Change Password Steps
```bash
# 1. Generate new password hash
node scripts/generate-admin-password.js "YourSecurePassword123!"

# 2. Copy the generated hash value

# 3. Edit frontend/assets/admin-auth.js
#    Find PASSWORD_HASH and replace it

# 4. Commit and push
git add frontend/assets/admin-auth.js
git commit -m "chore: update admin password hash"
git push origin main

# 5. Zeabur will auto-redeploy (approx 1-2 minutes)
```

#### Troubleshooting

**Issue 1: Cannot see login dialog**
- Solutions:
  1. Press `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows) to force refresh
  2. Test in incognito mode
  3. Clear browser cache

**Issue 2: Cannot type password**
- Solutions:
  1. Check if browser extensions conflict (try incognito mode)
  2. Update browser to latest version
  3. Run in Console: `window.AdminAuth.showLogin()` to trigger manually

**Issue 3: Login fails**
- Solutions:
  1. Check Console for error messages
  2. Verify password is correct
  3. Contact administrator to confirm password

**Issue 4: Forgot password**
- Solutions:
  1. Generate new password hash (see Change Password section)
  2. Update hash value
  3. Redeploy

---

### 📊 Analytics Dashboard Enhancements

#### New 5 Analytics Tabs

1. **📊 LLM Usage Stats**
   - Total requests, success rate, total cost, average response time
   - Total tokens, average FAQ items
   - Provider performance, daily trends, recent queries

2. **❓ FAQ Click Analytics**
   - Popular FAQ ranking
   - Language distribution
   - Daily click trends

3. **🏷️ Tag Click Analytics**
   - Popular tags ranking
   - Tag usage distribution
   - Language version statistics

4. **📂 Section Click Analytics** (New)
   - Section/Category click statistics
   - Section popularity analysis
   - Language version comparison

5. **🏔️ Resort Click Analytics** (New)
   - Resort region click statistics
   - Resort ranking
   - Regional popularity analysis

#### Data Filter Options
All analytics pages support:
- **Time Range**: 7 days, 30 days, 90 days, all
- **Language Filter**: All, Chinese, English, Thai
- **Sort Order**: By click count

#### Data Persistence
- All data stored in SQLite database (`/data/analytics.db` using Zeabur Volume)
- localStorage backup (last 100 records)
- CSV export support

#### API Endpoints
```
GET /api/v1/analytics/stats?days=7
GET /api/v1/analytics/faq-stats?days=7&language=en
GET /api/v1/analytics/tag-stats?days=7
GET /api/v1/analytics/section-stats?days=7
GET /api/v1/analytics/resort-stats?days=7&click_type=all
POST /api/v1/analytics/track-faq-view
POST /api/v1/analytics/track-tag-click
POST /api/v1/analytics/track-section-click
POST /api/v1/analytics/track-resort-click
```

---

### 🔐 Security Improvements

#### Password Security
- ✅ Passwords stored as SHA-256 hash
- ✅ Plaintext passwords not stored in Git
- ✅ Session stored in localStorage with 8-hour validity
- ✅ Manual logout support

#### Recommended Security Measures
1. Change admin password regularly (every 3-6 months recommended)
2. Use strong passwords (min 12 chars, uppercase, lowercase, numbers, symbols)
3. Limit password sharing (only to necessary staff)
4. Monitor suspicious access (check analytics logs)

---

### 📁 Related Documentation

- [ADMIN_PASSWORD_SETUP.md](./ADMIN_PASSWORD_SETUP.md) - Quick Password Setup Guide
- [ADMIN_ACCESS_CONTROL.md](./ADMIN_ACCESS_CONTROL.md) - Complete Access Control Solutions
- [ZEABUR_CONFIG_GUIDE.md](./ZEABUR_CONFIG_GUIDE.md) - Zeabur Volume Configuration Guide
- [ZEABUR_CHECKLIST.md](./ZEABUR_CHECKLIST.md) - Zeabur Configuration Checklist

---

---

## ภาษาไทย อัพเดต

### 🔒 คุณสมบัติใหม่: การควบคุมการเข้าถึงหน้าแอดมิน

#### คำอธิบายคุณสมบัติ
หน้าแอดมินที่ไวต่อต่อการเข้าถึงทั้งหมดมีการป้องกันด้วยการยืนยันรหัสผ่านแล้ว เพื่อป้องกันการเข้าถึงโดยไม่ได้รับอนุญาต

#### หน้าที่ได้รับการป้องกัน
- `menu.html` - เมนูแอดมิน
- `analytics.html` - แดชบอร์ดการวิเคราะห์
- `admin.html` - แผงควบคุมระบบ
- `docs.html` - เอกสารระบบ
- `faq-admin.html` - การจัดการ FAQ
- `resort-admin.html` - การจัดการข้อมูลรีสอร์ท

#### ขั้นตอนการเข้าสู่ระบบ
1. เข้าชมหน้าแอดมินใด ๆ
2. กล่องโต้ตอบการเข้าสู่ระบบจะปรากฏขึ้นโดยอัตโนมัติ (พื้นหลังสีดำแบบกึ่งโปร่งใส, กล่องสีขาว)
3. ป้อนรหัสผ่านแอดมิน
4. คลิกปุ่ม "เข้าสู่ระบบ"
5. เซสชันใช้ได้ 8 ชั่วโมง ไม่จำเป็นต้องเข้าสู่ระบบซ้ำ

#### รหัสผ่านเริ่มต้น
- ติดต่อผู้ดูแลระบบเพื่อรับรหัสผ่านเริ่มต้น
- รหัสผ่านจัดเก็บเป็นแฮช SHA-256 ไม่เป็นข้อความธรรมชาติในเอกสารหรือ Git

#### ขั้นตอนเปลี่ยนรหัสผ่าน
```bash
# 1. สร้างแฮชรหัสผ่านใหม่
node scripts/generate-admin-password.js "YourSecurePassword123!"

# 2. คัดลอกค่าแฮชที่สร้าง

# 3. แก้ไข frontend/assets/admin-auth.js
#    ค้นหา PASSWORD_HASH และแทนที่

# 4. ยืนยันและดันขึ้น
git add frontend/assets/admin-auth.js
git commit -m "chore: update admin password hash"
git push origin main

# 5. Zeabur จะปรับใช้ใหม่โดยอัตโนมัติ (ประมาณ 1-2 นาที)
```

#### การแก้ไขปัญหา

**ปัญหาที่ 1: ไม่สามารถมองเห็นกล่องโต้ตอบการเข้าสู่ระบบ**
- วิธีแก้ไข:
  1. กด `Cmd+Shift+R` (Mac) หรือ `Ctrl+Shift+R` (Windows) เพื่อบังคับรีเฟรช
  2. ทดสอบในโหมดไม่ระบุตัวตน
  3. ล้างแคช เบราว์เซอร์

**ปัญหาที่ 2: ไม่สามารถพิมพ์รหัสผ่าน**
- วิธีแก้ไข:
  1. ตรวจสอบว่าส่วนขยายของเบราว์เซอร์ไม่ขัดแย้ง (ลองใช้โหมดไม่ระบุตัวตน)
  2. อัปเดตเบราว์เซอร์เป็นเวอร์ชันล่าสุด
  3. รันในคอนโซล: `window.AdminAuth.showLogin()` เพื่อเรียกใช้ด้วยตนเอง

**ปัญหาที่ 3: การเข้าสู่ระบบล้มเหลว**
- วิธีแก้ไข:
  1. ตรวจสอบข้อความแสดงข้อผิดพลาดในคอนโซล
  2. ตรวจสอบว่ารหัสผ่านถูกต้อง
  3. ติดต่อผู้ดูแลระบบเพื่อยืนยันรหัสผ่าน

**ปัญหาที่ 4: ลืมรหัสผ่าน**
- วิธีแก้ไข:
  1. สร้างแฮชรหัสผ่านใหม่ (ดูส่วนเปลี่ยนรหัสผ่าน)
  2. อัปเดตค่าแฮช
  3. ปรับใช้ใหม่

---

### 📊 การปรับปรุงแดชบอร์ดการวิเคราะห์

#### แท็บการวิเคราะห์ 5 แท็บใหม่

1. **📊 สถิติการใช้ LLM**
   - จำนวนคำขอทั้งหมด, อัตราความสำเร็จ, ต้นทุนทั้งหมด, เวลาตอบสนองเฉลี่ย
   - โทเค็นทั้งหมด, รายการ FAQ เฉลี่ย
   - การเปรียบเทียบประสิทธิภาพผู้ให้บริการ, แนวโน้มรายวัน, แบบสอบถามล่าสุด

2. **❓ การวิเคราะห์คลิก FAQ**
   - การจัดอันดับ FAQ ยอดนิยม
   - การกระจายภาษา
   - แนวโน้มคลิกรายวัน

3. **🏷️ การวิเคราะห์คลิก Tag**
   - การจัดอันดับแท็กยอดนิยม
   - การกระจายการใช้แท็ก
   - สถิติเวอร์ชันภาษา

4. **📂 การวิเคราะห์คลิกหมวดหมู่** (ใหม่)
   - สถิติคลิกหมวดหมู่
   - การวิเคราะห์ความนิยมหมวดหมู่
   - การเปรียบเทียบเวอร์ชันภาษา

5. **🏔️ การวิเคราะห์คลิก Resort** (ใหม่)
   - สถิติคลิกภูมิภาครีสอร์ท
   - การจัดอันดับรีสอร์ท
   - การวิเคราะห์ความนิยมภูมิภาค

#### ตัวเลือกตัวกรองข้อมูล
หน้าการวิเคราะห์ทั้งหมดรองรับ:
- **ช่วงเวลา**: 7 วัน, 30 วัน, 90 วัน, ทั้งหมด
- **ตัวกรองภาษา**: ทั้งหมด, จีน, อังกฤษ, ไทย
- **ลำดับการจัดเรียง**: ตามจำนวนคลิก

#### ความคงอยู่ของข้อมูล
- ข้อมูลทั้งหมดจัดเก็บในฐานข้อมูล SQLite (`/data/analytics.db` โดยใช้ Zeabur Volume)
- การสำรอง localStorage (100 บันทึกล่าสุด)
- รองรับการส่งออก CSV

#### จุดสิ้นสุด API
```
GET /api/v1/analytics/stats?days=7
GET /api/v1/analytics/faq-stats?days=7&language=th
GET /api/v1/analytics/tag-stats?days=7
GET /api/v1/analytics/section-stats?days=7
GET /api/v1/analytics/resort-stats?days=7&click_type=all
POST /api/v1/analytics/track-faq-view
POST /api/v1/analytics/track-tag-click
POST /api/v1/analytics/track-section-click
POST /api/v1/analytics/track-resort-click
```

---

### 🔐 การปรับปรุงด้านความปลอดภัย

#### ความปลอดภัยของรหัสผ่าน
- ✅ รหัสผ่านจัดเก็บเป็นแฮช SHA-256
- ✅ รหัสผ่านข้อความธรรมชาติไม่จัดเก็บใน Git
- ✅ เซสชันจัดเก็บใน localStorage โดยมีความถูกต้อง 8 ชั่วโมง
- ✅ รองรับการออกจากระบบด้วยตนเอง

#### มาตรการความปลอดภัยที่แนะนำ
1. เปลี่ยนรหัสผ่านแอดมินเป็นประจำ (ทุก 3-6 เดือน)
2. ใช้รหัสผ่านที่แข็งแกร่ง (อักขระขั้นต่ำ 12 ตัว เพิ่มเติม ตัวอักษรตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข สัญลักษณ์)
3. จำกัดการแบ่งปันรหัสผ่าน (เฉพาะเจ้าหน้าที่ที่จำเป็น)
4. ตรวจสอบการเข้าถึงที่น่าสงสัย (ตรวจสอบบันทึก analytics)

---

### 📁 เอกสารที่เกี่ยวข้อง

- [ADMIN_PASSWORD_SETUP.md](./ADMIN_PASSWORD_SETUP.md) - คำแนะนำการตั้งค่ารหัสผ่านด่วน
- [ADMIN_ACCESS_CONTROL.md](./ADMIN_ACCESS_CONTROL.md) - วิธีแก้ปัญหาการควบคุมการเข้าถึงที่สมบูรณ์
- [ZEABUR_CONFIG_GUIDE.md](./ZEABUR_CONFIG_GUIDE.md) - คำแนะนำการกำหนดค่า Zeabur Volume
- [ZEABUR_CHECKLIST.md](./ZEABUR_CHECKLIST.md) - รายการตรวจสอบการกำหนดค่า Zeabur

---

## 📈 系統架構摘要

### 前端
- ✅ 管理頁面訪問控制（admin-auth.js）
- ✅ 5 個分析分頁
- ✅ 多語言支援（中文、英文、泰文）
- ✅ 密碼生成工具

### 後端 API
- ✅ LLM 使用統計端點
- ✅ FAQ 點擊分析端點
- ✅ Tag 點擊分析端點
- ✅ **新增** Section 點擊分析端點
- ✅ **新增** Resort 點擊分析端點

### 數據存儲
- ✅ SQLite 資料庫（Zeabur Volume）
- ✅ localStorage 備份
- ✅ CSV 匯出功能
- ✅ 8 小時 Session 管理

---

## 🎯 下一步行動

1. ✅ **部署完成** - 所有功能已推送到 GitHub
2. ⚠️ **立即更改密碼** - 生成您自己的強密碼
3. 📊 **測試分析功能** - 訪問 analytics.html 確認各個分頁正常
4. 📝 **更新內部文檔** - 通知團隊新增的訪問控制措施
5. 🔄 **定期更新密碼** - 建議每 3-6 個月更換一次

---

**版本歷史**:
- v2.1.0 (2025-11-03) - 新增管理頁面訪問控制 + 分析功能增強
- v2.0.0 (2025-10-13) - 多語言支援完成
- v1.0.0 (2025-09-01) - 初始版本

