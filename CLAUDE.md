# Claude Code 工作守則

本文檔描述在本專案中的開發規範、常見任務流程與設計原則。

---

## 1️⃣ 核心守則（必讀）

### 語言

* **輸出一律繁體中文**。程式碼中的變數／函式名稱維持既有英文慣例即可。

### Git / GitHub

* **禁止自行執行 `git push`**，除非使用者在對話中明確指示（例如「請幫我推送」）。
* 可以使用 `git status`, `git diff`, `git commit` 整理與提交，但**改動前必先執行下方測試清單**。

### 文檔產出

* **禁止生成**：測試報告、驗證報告、過程紀錄等檔案到 repo。
* **替代方案**：僅在終端輸出說明，或暫存於 `/tmp` 目錄，不加入 Git。

### 改動前必做檢查

執行以下檢查，確保無回歸問題：

```bash
# 1. 後端健康檢查
npm start
curl http://localhost:3000/health

# 2. FAQ API 測試（至少檢查中文 + 一個非中文語言）
curl http://localhost:3000/api/v1/faq/all?lang=zh
curl http://localhost:3000/api/v1/faq/all?lang=en

# 3. Park FAQ 測試（若改動相關功能）
curl http://localhost:3000/api/v1/park-faq/cards?park_slug=appi&lang=zh
```

---

## 2️⃣ 專案概況

**FAQ 智慧搜尋系統** - 多語言（中文／英文／泰文）、Park FAQ 卡片、Intent 偵測

### 技術棧

| 層級 | 技術 |
|------|------|
| 前端 | JavaScript ES6+, Fuse.js, DOMPurify |
| 後端 | Node.js 18+, Express 4.18+, better-sqlite3 |
| 資料庫 | SQLite (分析), JSONL (CRM 日誌) |

### 常見檔案位置

```
zeabur/
├── frontend/
│   ├── index.html                  # 主頁面（Park FAQ + FAQ 整合）
│   ├── lib/faq-engine.js           # 核心搜尋引擎
│   ├── lib/park-faq-module.js      # Park FAQ 卡片過濾
│   └── assets/i18n/{zh,en,th}.json # 多語言翻譯
├── zeabur_backend/backend/
│   ├── src/routes/
│   │   ├── faq.js                  # FAQ API
│   │   ├── park_faq.js             # Park FAQ API
│   │   └── intent.js               # Intent 偵測
│   └── data/faq_kb.phase0a.json    # 唯一資料來源
└── docs/
    ├── PHASE4_OPTIMIZATION_SUMMARY.md
    └── PERFORMANCE_BENCHMARK.md
```

---

## 3️⃣ 常見任務與流程

### Task A：修改 FAQ 搜尋或顯示邏輯

1. 編輯 `frontend/lib/faq-engine.js` 中的搜尋邏輯或 Fuse.js 設定
2. 修改前檢查 `PERFORMANCE_BENCHMARK.md` 確認目標 API 響應 < 200ms
3. 測試：
   ```bash
   npm start
   curl http://localhost:3000/api/v1/faq/all?lang=zh
   ```
4. 若改動搜尋鍵集，請確認 Fuse.js 鍵數 ≤ 5 個（避免性能惡化）
5. 本地瀏覽器驗證搜尋結果無誤

### Task B：新增或修改 FAQ 欄位（含多語言）

1. 編輯 `zeabur_backend/data/faq_kb.phase0a.json`，新增欄位
   - 必須同時提供 `canonical_question`, `canonical_question_en`, `canonical_question_th`（若無翻譯，用空字串）
2. 後端無需修改，API 會直接回傳新欄位
3. 若前端需要展示新欄位，編輯 `frontend/lib/faq-engine.js` 的渲染邏輯
4. 驗證：
   ```bash
   curl http://localhost:3000/api/v1/faq/all?lang=zh | jq '.items[0]'
   curl http://localhost:3000/api/v1/faq/all?lang=en | jq '.items[0]'
   ```

### Task C：修改 Park FAQ 卡片的標籤過濾

1. 邏輯在 `frontend/lib/park-faq-module.js` 的 `handleTagClick()` 和 `filterCardsByTag()`
2. 若要改變過濾結果的視覺風格（例如黃色框），編輯 `displayFilteredCards()` 中的 `style` 屬性
3. 測試：在瀏覽器點擊任何 Park FAQ 卡片的標籤，確認過濾結果出現且無控制台錯誤

### Task D：修改多語言翻譯或 i18n 鍵

1. 主要編輯：`frontend/assets/i18n/{zh,en,th}.json`
2. 新增鍵時，**三個語言檔都要新增**（若無翻譯，值設為空字串，系統會回退到中文）
3. 驗證 JSON 格式無誤：`jq '.' frontend/assets/i18n/zh.json > /dev/null && echo "OK"`
4. 前端會自動在初始化時載入，毋需重啟後端

### Task E：診斷 API 回應異常

1. 檢查後端是否啟動：`curl http://localhost:3000/health`
2. 檢查資料檔：`ls -lh zeabur_backend/data/faq_kb.phase0a.json`
3. 查看後端日誌（終端輸出），尋找 `[FAQ Routes]` 或 `[Park FAQ]` 日誌
4. 若 API 回傳多語言內容為空：檢查 `faq_kb.phase0a.json` 對應欄位是否有值

---

## 4️⃣ 常用指令速查

### 後端啟動 & 測試

```bash
cd zeabur_backend/backend
npm start                                # 啟動伺服器（port 3000）

# 新開終端運行測試
curl http://localhost:3000/health       # 健康檢查
curl http://localhost:3000/api/v1/faq/all?lang=zh   # 所有 FAQ（中文）
curl http://localhost:3000/api/v1/faq/all?lang=en   # 所有 FAQ（英文）
```

### 前端

```bash
cd frontend
python3 -m http.server 8080             # 簡易伺服器
# 開啟瀏覽器：http://localhost:8080/index.html
```

### Git 基本操作

```bash
git status                               # 檢查改動
git diff                                 # 查看改動內容
git log --oneline -5                     # 最近 5 個提交
git add .
git commit -m "說明本次改動"
# ⚠️ 不要執行 git push，除非使用者明確指示
```

---

## 5️⃣ 進階主題與指路

### 性能優化

若需調整 Fuse.js 搜尋設定或 API 響應時間，請先閱讀：
* `PERFORMANCE_BENCHMARK.md` - 性能測試結果與目標（API < 200ms）
* `PHASE4_OPTIMIZATION_SUMMARY.md` - 優化策略與理由

**關鍵檢查**：避免新增多餘搜尋欄位，Fuse.js 鍵數應維持 ≤ 5 個。

### FAQ 編輯與標準

詳見 `docs/FAQ 標準與維護流程.md`（若存在）。新增 FAQ 時：
* ID 格式：`faq.{category}.{序號}`（例如 `faq.gear.061`）
* 三語言同步：中文必填，英文與泰文若無翻譯值設為空字串

### 多語言設計

詳見 `docs/多語言影響評估.md`。核心規則：
* **優先級**：中文 > 英文 > 泰文
* **Fallback**：若某語言欄位為空，自動顯示中文

### SEO 與 Hreflang

詳見 `docs/SEO 計劃.md`。hreflang 標籤由 `frontend/lib/seo-hreflang.js` 動態注入。

---

## 6️⃣ 設計 & 程式風格

### 後端邏輯

* **資料結構優於複雜算法** - API 應預先組合資料，前端只顯示
* **統一錯誤格式**：`{ success: false, error: { code, message } }`
* **多語言組合由後端負責** - 前端收到的 `content` 已是最終格式

### 前端實作

* 原生 JavaScript ES6+（無 React/Vue）
* 函式長度 ≤ 50 行
* XSS 防護：使用 `DOMPurify.sanitize()` 清理使用者輸入
* 避免多層條件分支，優先用資料驅動設計

### 資料格式

* UTF-8 編碼，JSON 用 2 空格縮排
* 日期：ISO 8601 格式（`YYYY-MM-DDTHH:mm:ss.sssZ`）
* ID：`faq.{category}.{序號}` 或 `park.{slug}.{序號}`

---

## 7️⃣ 常見問題速查

| 問題 | 檢查項目 |
|------|---------|
| API 無法啟動 | `lsof -i :3000` 檢查 port；`kill -9 <PID>` 殺掉舊程序 |
| FAQ 資料載入失敗 | 檢查 `zeabur_backend/data/faq_kb.phase0a.json` 存在且有效 JSON |
| 多語言內容缺失 | 檢查 i18n 檔案是否有對應鍵；API 會自動 fallback 到中文 |
| 控制台有 `[Park FAQ]` 警告 | 檢查 `getParkFaqData()` 或 `loadParkFaqCardsData()` 回傳是否為 null |

---

## 📌 快速參考

| 項目 | 命令 / 位置 |
|------|-----------|
| 後端重啟 | `npm start` (from zeabur_backend/backend) |
| 前端預覽 | `http://localhost:8080/index.html` |
| FAQ 資料來源 | `zeabur_backend/data/faq_kb.phase0a.json` |
| 多語言檔 | `frontend/assets/i18n/{zh,en,th}.json` |
| 搜尋引擎 | `frontend/lib/faq-engine.js` |
| Park FAQ 邏輯 | `frontend/lib/park-faq-module.js` |
| 提交程式碼 | `git add . && git commit -m "說明"` |
| 推送程式碼 | **不可自動執行**，等待使用者明確指示 |

---

**最後更新**：2025-11-15
**版本**：v2.0 (AI 優化版)
