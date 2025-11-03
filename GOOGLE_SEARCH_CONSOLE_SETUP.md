# Google Search Console 設置指南

**文件版本**: v1.0
**最後更新**: 2025-11-03
**網站**: https://faq.diy.ski/

---

## 📋 目錄

1. [前置條件](#前置條件)
2. [步驟 1: 驗證網站所有權](#步驟-1-驗證網站所有權)
3. [步驟 2: 提交 Sitemap](#步驟-2-提交-sitemap)
4. [步驟 3: 驗證 FAQ Schema](#步驟-3-驗證-faq-schema)
5. [步驟 4: 設置多語言標籤](#步驟-4-設置多語言標籤)
6. [步驟 5: 監控和優化](#步驟-5-監控和優化)
7. [常見問題](#常見問題)

---

## 前置條件

在開始前，請確保您有：

- [ ] Google 帳戶
- [ ] 網站管理員身分（可訪問 DNS 或網站伺服器）
- [ ] 至少 5-10 分鐘的設置時間
- [ ] 基本的 SEO 知識（推薦）

---

## 步驟 1: 驗證網站所有權

Google Search Console 需要驗證您是網站的所有者。有多種驗證方法可選。

### 方法 A: 域名提供商驗證（推薦 ⭐⭐⭐）

**優點**: 最快、最可靠
**所需時間**: 5 分鐘
**適用場景**: 您控制域名的 DNS 記錄

#### 步驟:

1. 訪問 [Google Search Console](https://search.google.com/search-console)
2. 點擊「+新增資源」(Add Property)
3. 選擇「網域」(Domain) 而非「URL 前綴」
4. 輸入: `faq.diy.ski`
5. 點擊「繼續」(Continue)

   ![GSC Domain Entry](./docs/gsc-domain-entry.png)

6. Google 會顯示 DNS TXT 記錄:
   ```
   名稱: faq.diy.ski
   類型: TXT
   值: google-site-verification=xxxxxxxxxxxxxxxxxxxxx
   ```

7. 登入您的域名提供商 (例如: NameCheap, GoDaddy, HiNet 等)
8. 找到 DNS 管理頁面
9. 添加新的 TXT 記錄:
   - **主機名**: @ (或留空)
   - **類型**: TXT
   - **值**: 複製上面的驗證碼
   - **TTL**: 3600 (預設)

10. 保存並等待 DNS 生效（通常 5-30 分鐘）

11. 回到 Google Search Console，點擊「驗證」(Verify)

   ✅ 若收到「驗證成功」訊息，您已完成!

#### 疑難排解:

**問題**: DNS 驗證超時
**解決**:
- 確認 TXT 記錄已正確添加
- 等待至少 30 分鐘讓 DNS 生效
- 使用線上工具驗證: https://mxtoolbox.com/

### 方法 B: HTML 檔案驗證

**優點**: 無需訪問 DNS
**所需時間**: 10 分鐘
**適用場景**: DNS 提供商不支持或無法訪問

#### 步驟:

1. 在 Search Console 中選擇「HTML 檔案」驗證方式
2. 下載驗證檔案 (通常名為 `google_xxx.html`)
3. 上傳到網站根目錄:
   ```
   https://faq.diy.ski/google_xxx.html
   ```
4. 在 Search Console 中點擊「驗證」

#### 疑難排解:

**問題**: 檔案無法上傳
**解決**:
- 確認您有伺服器的上傳權限
- 檢查檔案名稱是否正確
- 驗證檔案是否可通過 URL 訪問 (在瀏覽器中打開)

### 方法 C: Google Analytics 驗證

**優點**: 若已使用 GA4
**所需時間**: 2 分鐘

#### 步驟:

1. 在 Search Console 中選擇「Google Analytics」驗證
2. 確認 GA4 帳戶登入
3. 自動驗證完成

---

## 步驟 2: 提交 Sitemap

Sitemap 幫助 Google 發現您網站上的所有頁面。

### 提交 Sitemap

1. 登入 [Google Search Console](https://search.google.com/search-console/)
2. 選擇您的資源 (faq.diy.ski)
3. 左側菜單 → 「Sitemap」

   ![GSC Sitemap Menu](./docs/gsc-sitemap-menu.png)

4. 點擊「新增 Sitemap」(Add Sitemap)
5. 輸入完整 URL:
   ```
   https://faq.diy.ski/sitemap.xml
   ```
6. 點擊「提交」(Submit)

   ✅ 您應該看到「提交成功」訊息

### 驗證 Sitemap

- **發現的 URL**: 應該顯示 267 個 URL
- **成功**: 綠色勾選標記
- **索引狀態**: 顯示已索引的 URL 數量

**預期結果**:
```
狀態: 成功
已索引: ~100-150 (初期，會逐漸增加)
發現的 URL: 267
已排除: ~117 (尚未索引的新頁面)
```

---

## 步驟 3: 驗證 FAQ Schema

Rich Result (結構化數據) 幫助 Google 理解您的 FAQ 內容，並在搜尋結果中顯示為特殊格式。

### 檢查 FAQ Schema 有效性

#### 使用 Rich Result Test

1. 訪問 [Google Rich Result Test](https://search.google.com/test/rich-results)
2. 輸入頁面 URL:
   ```
   https://faq.diy.ski/
   ```
3. 點擊「測試 URL」(Test URL)

#### 預期結果

```
✅ 頁面沒有错誤
✅ 已偵測的項目:
   - FAQPage (主頁)
   - Organization (公司資訊)
```

#### 常見問題

**❌ 沒有偵測到 FAQ Schema**
- 原因: JavaScript 尚未執行
- 解決: 等待 30 秒，重新測試
- 或使用 URL Inspector 檢查已呈現的版本

**⚠️ 警告: 缺少某些欄位**
- 可能警告: `acceptedAnswer.text` 過長
- 解決: 檢查 seo-meta.js 中的答案截斷邏輯

### 在 Search Console 中監控

1. 在 Search Console 中，左側菜單 → 「外觀」→「常見問題」
2. 檢查 FAQ Rich Results 狀態:
   - 有效項目: 應該逐漸增加
   - 有問題的項目: 列出任何錯誤
   - 除外項目: 不符合 FAQ Schema 要求的項目

**典型的增長曲線**:
- 第 1 週: 0-10 個有效項目
- 第 2 週: 10-30 個
- 第 1 個月: 30-50+ 個
- 第 3 個月: 50-71 個（所有 FAQ）

---

## 步驟 4: 設置多語言標籤

### 驗證 hreflang 設置

1. 在 Search Console 中，左側菜單 → 「設定」→「國際瞄準」

   ![GSC International Targeting](./docs/gsc-international.png)

2. 檢查語言配置:
   - **語言**: 應顯示 zh-TW, en-US, th-TH
   - **區域**: 可選（推薦設置針對台灣、英語國家、泰國）

### 驗證 hreflang 標籤

使用 URL Inspector 檢查 hreflang 設置:

1. 在 Search Console 中，頂部搜尋框輸入:
   ```
   https://faq.diy.ski/
   ```

2. 在 URL Inspector 中查看「涵蓋範圍」標籤
3. 向下滾動到「hreflang」部分
4. 驗證列出的替代 URL:
   ```
   URL: https://faq.diy.ski/
   hreflang: zh-TW

   URL: https://faq.diy.ski/?lang=en
   hreflang: en-US

   URL: https://faq.diy.ski/?lang=th
   hreflang: th-TH
   ```

**常見問題**:

❌ **No hreflang tags detected**
- 原因: JavaScript 動態注入時 Google 未執行
- 解決: 檢查 HTML 原始碼中的靜態 hreflang 標籤
- 更新: 在 index.html 的 `<head>` 中添加靜態 hreflang

❌ **Hreflang pointing to non-existent URL**
- 原因: URL 生成邏輯錯誤
- 解決: 檢查 seo-hreflang.js 中的 URL 構建邏輯

### 配置國際瞄準設定

1. 導航到 Search Console → 設定 → 國際瞄準
2. 設置目標區域:
   - **語言**: 繁體中文 (zh-TW)
   - **其他語言地區**:
     - English (en-US, en-GB, 等)
     - Thai (th-TH)

---

## 步驟 5: 監控和優化

### 每周檢查清單

**星期一**:
- [ ] 檢查搜尋表現 (排名、點擊、展示)
- [ ] 審查任何新的索引錯誤

**星期三**:
- [ ] 檢查 Coverage 狀態 (已索引/排除 URL)
- [ ] 驗證沒有新的爬蟲錯誤

**星期五**:
- [ ] 分析熱門查詢和頁面
- [ ] 識別需要改進的內容

### 重要指標

| 指標 | 正常範圍 | 警告值 |
|------|--------|--------|
| **索引頁面** | >100 | <50 |
| **搜尋展示** | >1000/月 | <500/月 |
| **平均點擊率** | >3% | <1% |
| **爬蟲錯誤** | 0 | >5 |
| **覆蓋率** | >80% | <60% |

### 常見錯誤和解決方案

#### 1. 「軟錯誤」(Soft 404)

**症狀**: 許多頁面顯示「軟錯誤」

**原因**: 頁面返回 200 狀態碼但內容不適當

**解決**:
- 檢查 FAQ 資料是否正確載入
- 驗證沒有 JavaScript 錯誤
- 確保所有 FAQ 項目都有中文標題

#### 2. 「無法獲取」(Couldn't Fetch)

**症狀**: Search Console 無法爬蟲某些 URL

**原因**:
- robots.txt 阻擋
- 伺服器 500 錯誤
- 重定向循環

**解決**:
- 驗證 robots.txt 允許爬蟲
- 檢查伺服器日誌尋找 500 錯誤
- 測試 URL 是否可手動訪問

#### 3. 「重複內容」(Duplicate Content)

**症狀**: Google 識別重複頁面

**原因**: 多語言版本或多個 URL 指向相同內容

**解決**:
- 確認 hreflang 標籤正確指向規範版本
- 檢查是否有 HTTP/HTTPS 混合
- 驗證沒有尾部斜杠問題 (/ vs 無斜杠)

### 優化建議

#### A/B 測試 Title 和 Description

基於搜尋表現，測試不同的 title 和 description:

**原始版本**:
```
Title: 滑雪教練預約、課程費用、安全須知 | DIY Ski FAQ
Description: SkiDIY FAQ 系統提供滑雪課程、教練預約、保險、裝備等常見問題解答...
CTR: 2.5%
```

**測試版本 A** (更直接):
```
Title: DIY Ski - 滑雪教練預約與課程指南
Description: 找滑雪教練、預約課程、瞭解費用與安全 - 一次解答所有問題
CTR: 3.2% ✅ 更好
```

**測試版本 B** (關鍵字優先):
```
Title: 日本滑雪教練課程預約 - SkiDIY 常見問題解答
Description: 日本滑雪教練預約指南。費用、時間、安全須知一應俱全
CTR: 2.8%
```

#### 內容優化

根據搜尋數據識別優化機會:

1. **高展示、低點擊**: 改進 Title 和 Description
2. **高點擊、低排名**: 改進內容質量和 E-E-A-T 信號
3. **未索引**: 檢查技術 SEO 問題

---

## 常見問題

### Q: 多久後才能在搜尋結果中看到我的網站？

**A**: 通常 2-4 週。步驟:
1. 提交後 1-2 週: Google 爬蟲發現您的網站
2. 2-4 週: 開始在搜尋結果中出現
3. 1-3 個月: 排名逐漸改善

### Q: 為什麼 Sitemap 中的 267 個 URL，但只有 100 個被索引？

**A**: 這是正常的。原因:
- 新頁面 Google 需要時間索引
- 某些低優先級頁面可能不被索引
- 預期 3-6 個月內索引率會達到 80-90%

### Q: hreflang 有錯誤，會影響排名嗎？

**A**: 會有輕微影響。Google 可能:
- 為錯誤的語言版本索引
- 降低排名可信度
- 混淆替代語言版本

**修復方法**:
1. 修復 seo-hreflang.js 中的邏輯
2. 提交修復的 Sitemap
3. 在 Search Console 中手動重新爬蟲

### Q: 我應該多久檢查一次 Search Console？

**A**: 建議:
- **新網站** (首 3 個月): 每天
- **成長階段** (3-6 個月): 每周 2 次
- **成熟網站** (6 個月+): 每周 1 次

### Q: 如何改進 FAQ Rich Snippet 展示率？

**A**: 最佳實踐:
1. ✅ 確保 FAQ 答案清晰、簡潔 (<500 字)
2. ✅ 使用常見問題短語 (如「為什麼」、「如何」)
3. ✅ 避免在答案中有過多 HTML 標籤
4. ✅ 定期更新 FAQ 內容
5. ✅ 增加內部連結指向熱門 FAQ

---

## 後續步驟

### 第一個月
- [ ] 完成網站驗證
- [ ] 提交 Sitemap
- [ ] 驗證 FAQ Schema
- [ ] 設置多語言標籤
- [ ] 建立基線報告 (impressions, clicks, ranking)

### 第三個月
- [ ] 分析搜尋查詢數據
- [ ] 識別表現不佳的頁面
- [ ] 開始 A/B 測試 Title/Description
- [ ] 添加新 FAQ 基於搜尋缺口

### 第六個月
- [ ] 回顧 SEO 目標達成情況
- [ ] 制定第二階段優化計劃
- [ ] 考慮反向連結策略
- [ ] 擴展到其他搜尋引擎 (Bing, Baidu)

---

## 聯繫和支援

- **Google Search Console 說明**: https://support.google.com/webmasters
- **FAQ Schema 文檔**: https://developers.google.com/search/docs/advanced/structured-data/faqpage
- **hreflang 指南**: https://support.google.com/webmasters/answer/189077

---

**文件維護者**: SkiDIY SEO Team
**最後更新**: 2025-11-03
**相關文檔**: [SEO_OPTIMIZATION_PLAN.md](./SEO_OPTIMIZATION_PLAN.md)
