# 📄 FAQ 靜態頁面發布手冊

此手冊說明如何把 `faq_kb.phase0a.json` 轉換為可上線的 FAQ / Category 靜態頁面，以及重新生成的步驟。所有操作僅對 repo 內檔案產生變化，部署時可依舊有流程推送到 https://faq.diy.ski/

---

## 1. 先決條件

- 已更新好的 `zeabur_backend/data/faq_kb.phase0a.json`（含多語、關鍵字、CRM tags、LINK token）
- Node.js 18+（用於執行生成腳本）
- Repo 內已有 `frontend/assets/faq-page.css` 與 `scripts/lib/faqRenderer.js`

---

## 2. 生成 FAQ 詳細頁

```bash
# 在 repo 根目錄執行
node scripts/generate-static-faq-pages.js
```

腳本流程：

1. 讀取 `zeabur_backend/data/faq_kb.phase0a.json`
2. 清空 `frontend/faq/` 既有 `.html`
3. 對每筆 FAQ 產生 `faq/<faq_id>-<lang>.html`（zh / en / th）
4. 每頁包含 canonical、hreflang、OG、FAQPage JSON-LD、語言切換、LINK token 轉換成實際網址

輸出總數：`71 FAQ × 3 語系 = 213` 檔案

---

## 3. 生成分類頁

```bash
node scripts/generate-category-pages.js
```

腳本流程：

1. 依 `section` 分組 FAQ
2. 清空 `frontend/category/`
3. 產生 `category/section-*.html`（每分類三語系）

輸出總數：48 個分類 × 3 語系 = 144 檔案

命名規則：若 section 文字含 emoji/非 ASCII，會 fallback 成 `section-<十六進位>`，避免檔名錯亂。

---

## 4. 部署步驟建議

1. 執行兩支腳本 → 確認 `frontend/faq/`、`frontend/category/` 有最新檔案
2. 抽查幾頁（特別是含 `[LINK:...]` 或 emoji section 的頁面）
3. 依既有部署流程上傳 `frontend/faq/*`、`frontend/category/*`、`frontend/assets/faq-page.css` 到目標靜態主機/CDN
4. 若線上站已有 Analytics/追蹤碼，只需沿用現有框架即可（靜態頁面無額外 script）

---

## 5. 常見問題

- **Q：FAQ JSON 改了要怎麼重新上線？**
  - 重新跑上述兩支腳本，檢查輸出後再部署即可。
- **Q：Link token 不存在會怎樣？**
  - 腳本會 fallback 為純文字，不影響生成，可再更新 `scripts/lib/faqRenderer.js` 的 `LINK_MAP`。
- **Q：section 名稱出現 `section-e69c8d...`？**
  - 那是 emoji/多語 section 的 hex slug，於 Category 頁仍顯示原文，不影響 UI。

---

更新紀錄：
- 2025-11-05 建立（對應 SEO Phase 1 靜態頁生成）
