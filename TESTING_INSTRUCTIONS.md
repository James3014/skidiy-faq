# FAQ 元件測試指南

## 🎯 測試目標

驗證 FAQ Proxy 元件是否能成功從 https://faq.diy.ski/ 載入內容並保留 SEO 優化。

---

## 📋 準備工作

### 環境需求
- PHP 7.4+ 或 8.0+
- cURL 擴充功能（通常已內建）
- 網路連線（需訪問 faq.diy.ski）

### 檢查 PHP 環境
```bash
# 檢查 PHP 版本
php --version

# 檢查 cURL 是否可用
php -m | grep curl

# 如果沒有 cURL，需要安裝
# macOS: brew install php
# Ubuntu: sudo apt-get install php-curl
```

---

## 🚀 測試步驟

### 方法一：本地 PHP 伺服器（推薦）

```bash
# 1. 進入專案目錄
cd /Users/jameschen/Downloads/diyski/crm/03_FAQ與知識庫/zeabur/skidiyog

# 2. 啟動 PHP 內建伺服器
php -S localhost:8080

# 3. 在瀏覽器開啟
open http://localhost:8080/test_faq_proxy.php

# 或使用 curl 測試
curl http://localhost:8080/test_faq_proxy.php | head -50
```

### 方法二：部署到 Zeabur

```bash
# 1. 推送到 Git
git add .
git commit -m "feat: add FAQ proxy component"
git push

# 2. Zeabur 會自動部署

# 3. 訪問測試頁面
open https://skidiyog.zeabur.app/test_faq_proxy.php
```

### 方法三：使用現有網站伺服器

如果你的網站已經在運行（例如 Apache、Nginx + PHP-FPM）：

```bash
# 1. 將檔案複製到網站目錄
cp -r includes /var/www/html/
cp test_faq_proxy.php /var/www/html/

# 2. 在瀏覽器訪問
open http://yourdomain.com/test_faq_proxy.php
```

---

## ✅ 驗證檢查清單

### 1. 視覺檢查

打開 `http://localhost:8080/test_faq_proxy.php`，應該看到：

- [x] 頁面標題「FAQ Proxy 伺服器代理測試」
- [x] 3 個 FAQ 區塊正常顯示：
  - 幾歲可以開始學滑雪？
  - 第一次滑雪需要上課嗎？
  - 需要自備裝備嗎？
- [x] 點擊問題可以展開/收合答案
- [x] 「查看完整說明 →」連結指向 faq.diy.ski
- [x] 載入時間顯示（通常 < 2000ms）
- [x] Booking CTA 區塊正常顯示

### 2. 功能測試

**測試手風琴效果**：
1. 點擊第一個問題
2. 答案應該平滑展開
3. 箭頭圖示旋轉 180°
4. 再次點擊，答案收合

**測試連結**：
1. 點擊「查看完整說明 →」
2. 應該在新分頁開啟 faq.diy.ski 的完整頁面

### 3. SEO 驗證

**檢查 Schema.org 資料注入**：

1. 在測試頁面按 F12 開啟開發者工具
2. 切換到 Console 標籤
3. 執行以下指令：

```javascript
// 檢查 Schema.org script 是否存在
document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
  console.log(JSON.parse(script.textContent));
});
```

**預期輸出**：
```javascript
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "幾歲可以開始學滑雪？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "建議從3歲以上開始，5歲以下的兒童建議安排一對一教學，提升安全與專注力。"
      }
    },
    // ... 更多 FAQ
  ]
}
```

### 4. Google Rich Results Test

1. 訪問：https://search.google.com/test/rich-results
2. 輸入你的測試頁面 URL
3. 點擊「測試 URL」
4. 應該看到：
   - ✅ 偵測到「FAQPage」
   - ✅ 顯示所有 FAQ 問題列表
   - ✅ 無錯誤或警告

---

## 🐛 常見問題排查

### 問題 1：頁面顯示「無法載入 FAQ 內容」

**可能原因**：
- cURL 擴充功能未啟用
- 網路無法連線到 faq.diy.ski
- PHP 執行逾時

**解決方法**：
```bash
# 檢查 cURL
php -m | grep curl

# 檢查網路連線
curl https://faq.diy.ski/faq/faq.general.009-zh.html

# 增加 PHP 逾時設定（在 php.ini 或程式碼中）
max_execution_time = 60
```

### 問題 2：FAQ 內容顯示亂碼

**可能原因**：
- 字元編碼問題

**解決方法**：
在 `faq_proxy.php` 的 `loadHTML` 前加上 UTF-8 聲明（已包含）：
```php
@$dom->loadHTML('<?xml encoding="UTF-8">' . $html);
```

### 問題 3：載入時間過長（> 5 秒）

**可能原因**：
- 網路速度慢
- 未啟用快取

**解決方法**：
```bash
# 安裝 APCu 擴充功能以啟用快取
# macOS
pecl install apcu

# Ubuntu
sudo apt-get install php-apcu

# 重啟 PHP 伺服器
```

### 問題 4：Schema.org 資料未注入

**檢查步驟**：
1. 查看頁面原始碼（右鍵 → 檢視網頁原始碼）
2. 搜尋 `application/ld+json`
3. 應該看到一個或多個 JSON-LD script 標籤

**如果沒有**：
- 檢查 PHP 錯誤日誌
- 確認 faq.diy.ski 的頁面結構沒有改變

---

## 📊 效能基準

### 預期載入時間
- **首次載入**（無快取）：500-2000ms
- **後續載入**（有快取）：< 50ms
- **3 個 FAQ**：~1000ms

### 快取測試
```bash
# 第一次載入（會較慢）
time curl http://localhost:8080/test_faq_proxy.php > /dev/null

# 第二次載入（應該更快，如果有 APCu）
time curl http://localhost:8080/test_faq_proxy.php > /dev/null
```

---

## 🎨 客製化範例

### 在雪場頁面使用

創建檔案：`park_naeba.php`

```php
<?php
require_once 'includes/faq_proxy.php';
require_once 'includes/booking_cta.php';
?>
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <title>苗場雪場 - SkiDIY</title>
</head>
<body>
    <h1>苗場雪場介紹</h1>

    <!-- 雪場內容 -->
    <section>
        <h2>雪場特色</h2>
        <p>苗場雪場是日本最受歡迎的滑雪勝地之一...</p>
    </section>

    <!-- 嵌入相關 FAQ -->
    <?php
    $naeba_faqs = [
        'faq.general.009', // 年齡限制
        'faq.general.010', // 需要上課嗎
        'faq.general.011', // 裝備準備
    ];
    renderFAQProxy($naeba_faqs, 'zh');
    ?>

    <!-- Booking CTA -->
    <?php
    renderBookingCTA('park', [
        'park_name' => 'naeba',
        'park_cname' => '苗場'
    ]);
    ?>
</body>
</html>
```

### 在文章頁面使用

```php
<?php
// 根據文章主題推薦相關 FAQ
$article_topic = 'kids'; // 文章主題：兒童滑雪

renderRecommendedFAQsProxy($article_topic, 5, 'zh');
?>
```

---

## 📝 測試報告模板

測試完成後，填寫以下報告：

```markdown
## FAQ Proxy 測試報告

**測試日期**: YYYY-MM-DD
**測試環境**:
- PHP 版本:
- 伺服器: localhost / Zeabur / 其他
- 瀏覽器: Chrome / Safari / Firefox

### 功能測試
- [ ] FAQ 正常載入
- [ ] 手風琴效果正常
- [ ] 連結正常運作
- [ ] Booking CTA 顯示正常

### SEO 驗證
- [ ] Schema.org 資料成功注入
- [ ] Google Rich Results Test 通過
- [ ] 無 Console 錯誤

### 效能測試
- 首次載入時間: ____ms
- 快取載入時間: ____ms
- 記憶體使用: ____MB

### 問題回報
- 問題描述:
- 錯誤訊息:
- 解決方法:

### 總評
- [ ] 通過測試，可部署至生產環境
- [ ] 需要修正後再測試
```

---

## 🚀 部署檢查清單

部署到生產環境前，確認：

- [ ] PHP 版本 >= 7.4
- [ ] cURL 擴充功能已啟用
- [ ] APCu 快取已啟用（可選，但推薦）
- [ ] 測試頁面功能正常
- [ ] Schema.org 資料正確注入
- [ ] Google Rich Results Test 通過
- [ ] 載入時間 < 3 秒
- [ ] 移除或隱藏測試頁面（test_*.php）

---

**文件版本**: 1.0
**最後更新**: 2025-11-08
**維護者**: Claude Code
