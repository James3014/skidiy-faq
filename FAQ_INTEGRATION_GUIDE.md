# FAQ 整合指南 - 從 faq.diy.ski 嵌入 FAQ 區塊

## 問題分析

在測試時發現 CORS 問題：
```
Access to fetch at 'https://faq.diy.ski/faq/...' from origin 'null'
has been blocked by CORS policy
```

這是因為 faq.diy.ski 沒有設置 `Access-Control-Allow-Origin` header，無法從其他域名跨域請求。

---

## 解決方案

### ✅ 方案一：iframe 嵌入（最簡單，推薦用於快速整合）

**優點**：
- ✅ 無需處理 CORS
- ✅ 自動保留 Schema.org 結構化資料
- ✅ 內容與 faq.diy.ski 完全同步
- ✅ 實作簡單，5 分鐘完成

**缺點**：
- ❌ 樣式需要調整以融入主網站
- ❌ SEO 效果較弱（Schema.org 在 iframe 內）

**使用方式**：

```php
<?php
/**
 * 使用 iframe 嵌入 FAQ 頁面
 */
function renderFAQiframe($faqId, $lang = 'zh') {
    $url = "https://faq.diy.ski/faq/{$faqId}-{$lang}.html";
    ?>
    <iframe
        src="<?= $url ?>"
        width="100%"
        height="600"
        frameborder="0"
        style="border: none; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);"
        title="FAQ"
    ></iframe>
    <?php
}

// 使用範例
renderFAQiframe('faq.general.009', 'zh');
?>
```

---

### ✅ 方案二：伺服器端代理（推薦用於 SEO 優化）

**優點**：
- ✅ 完美的 SEO 優化（Schema.org 在主頁面）
- ✅ 無 CORS 問題
- ✅ 可以客製化樣式
- ✅ 內容與 faq.diy.ski 同步

**缺點**：
- ⚠️ 需要後端 PHP 支援
- ⚠️ 伺服器會產生額外請求

**實作方式**：

已創建 `includes/faq_proxy.php`，透過 PHP 的 cURL 抓取 FAQ 內容，繞過 CORS 限制。

```php
<?php
require_once 'includes/faq_proxy.php';

// 方法 1: 指定 FAQ ID 列表
$faqIds = [
    'faq.general.009',
    'faq.general.010',
    'faq.general.011',
];
renderFAQProxy($faqIds, 'zh');

// 方法 2: 根據分類推薦
renderRecommendedFAQsProxy('kids', 5, 'zh');

// 方法 3: 雪場專屬
renderParkFAQsProxy('naeba', 'zh');
?>
```

**工作原理**：
1. PHP 伺服器使用 cURL 請求 faq.diy.ski
2. 提取 FAQ 內容和 Schema.org 資料
3. 渲染到當前頁面
4. Schema.org 資料注入到 `<head>`，利於 SEO

---

### ✅ 方案三：設定 CORS Header（需要 faq.diy.ski 配合）

**最理想方案**，但需要在 faq.diy.ski 加上 CORS header：

在 faq.diy.ski 的伺服器設定中加入：

```nginx
# Nginx 設定
location /faq/ {
    add_header Access-Control-Allow-Origin "https://skidiyog.zeabur.app";
    add_header Access-Control-Allow-Methods "GET, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type";
}
```

或在 Zeabur 設定環境變數：
```
ACCESS_CONTROL_ALLOW_ORIGIN=https://skidiyog.zeabur.app
```

設定完成後，原本的 `includes/faq_embed.php` 即可正常運作。

---

## 推薦整合流程

### 階段一：快速驗證（使用 iframe）
1. 使用 iframe 方式快速整合 2-3 個 FAQ
2. 測試使用者體驗和視覺效果
3. 確認 FAQ 內容是否符合需求

### 階段二：SEO 優化（使用伺服器代理）
1. 部署 `includes/faq_proxy.php`
2. 替換 iframe 為代理方式
3. 驗證 Schema.org 資料正確注入

### 階段三：長期方案（設定 CORS）
1. 在 faq.diy.ski 設定 CORS header
2. 改用輕量級的 `includes/faq_embed.php`
3. 減少伺服器負擔

---

## 檔案清單

```
skidiyog/
├── includes/
│   ├── faq_component.php    # 原始方案（獨立 FAQ，無連動）
│   ├── faq_embed.php         # 方案三：Fetch API（需 CORS）
│   ├── faq_proxy.php         # 方案二：伺服器代理（推薦）★
│   └── booking_cta.php       # Booking CTA 元件
├── test_faq_iframe.php       # 方案一測試頁面
├── test_faq_proxy.php        # 方案二測試頁面 ★
└── test_faq_embed.php        # 方案三測試頁面
```

---

## 效能比較

| 方案 | 首次載入 | SEO 效果 | 維護成本 | 推薦度 |
|------|---------|---------|---------|--------|
| iframe | 快 | ⭐⭐ | 低 | ⭐⭐⭐ |
| 伺服器代理 | 中 | ⭐⭐⭐⭐⭐ | 中 | ⭐⭐⭐⭐⭐ |
| CORS 設定 | 快 | ⭐⭐⭐⭐⭐ | 低 | ⭐⭐⭐⭐ |

---

## 測試步驟

### 測試方案一（iframe）
```bash
# 無需伺服器，直接在瀏覽器開啟
open test_faq_iframe.php
```

### 測試方案二（伺服器代理）
```bash
# 啟動 PHP 伺服器
cd /path/to/skidiyog
php -S localhost:8080

# 瀏覽器訪問
open http://localhost:8080/test_faq_proxy.php
```

### 測試方案三（CORS 設定）
```bash
# 需先在 faq.diy.ski 設定 CORS
# 然後啟動伺服器測試
php -S localhost:8080
open http://localhost:8080/test_faq_embed.php
```

---

## SEO 驗證

### 檢查 Schema.org 資料是否正確注入

**方法 1：瀏覽器開發者工具**
```javascript
// 在 Console 執行
document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
  console.log(JSON.parse(script.textContent));
});
```

**方法 2：Google Rich Results Test**
1. 訪問：https://search.google.com/test/rich-results
2. 貼上頁面 URL 或 HTML
3. 檢查是否偵測到 FAQPage

**預期結果**：
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "幾歲可以開始學滑雪？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "建議從3歲以上開始..."
      }
    }
  ]
}
```

---

## 常見問題

### Q: 為什麼 iframe 方案的 SEO 效果較差？
A: 因為 Schema.org 資料在 iframe 內部，Google 不一定會索引。建議用於非核心 SEO 頁面。

### Q: 伺服器代理會不會增加太多負擔？
A: 可以加上快取機制：
```php
// 快取 FAQ 內容 1 小時
$cacheKey = "faq_{$faqId}_{$lang}";
$cached = apcu_fetch($cacheKey);
if ($cached) return $cached;

$content = fetchFAQFromProxy($faqId, $lang);
apcu_store($cacheKey, $content, 3600);
```

### Q: 如何確認 CORS 設定成功？
A: 在瀏覽器開發者工具的 Network 分頁檢查 Response Headers，應該看到：
```
Access-Control-Allow-Origin: https://skidiyog.zeabur.app
```

---

## 下一步行動

1. ✅ **立即可用**：部署 `faq_proxy.php`（方案二）
2. ⏳ **中期優化**：聯繫 faq.diy.ski 管理員設定 CORS
3. 🚀 **長期計劃**：建立 FAQ Widget API，統一所有網站整合

---

**更新時間**: 2025-11-08
**維護者**: Claude Code
**相關文件**: [TEST_RESULTS.md](TEST_RESULTS.md)
