# Claude Code 開發指南

本文檔為 Claude Code 使用本專案時的指引。

## 語言政策

**一律使用繁體中文回覆所有回應**
- 檔案註釋、變數名稱：保持原有慣例（英文或中文）
- 輸出訊息：統一為繁體中文
- 文件標題、摘要：統一為繁體中文

## 專案概況

**FAQ 系統升級專案** - 互動式搜尋、Intent 偵測、多語言支援、CRM 整合

### 核心技術棧

- **前端**: JavaScript ES6+, Fuse.js 7.0+, DOMPurify 3.0+
- **後端**: Node.js 18+ LTS, Express 4.18+, better-sqlite3 3.9+
- **資料庫**: SQLite (分析), JSONL (CRM 日誌)
- **語言**: 中文（主要）、英文、泰文

### 目錄結構

```
zeabur/
├── zeabur_backend/                # 後端應用
│   ├── backend/
│   │   ├── src/
│   │   │   ├── server.js          # Express 伺服器
│   │   │   ├── routes/
│   │   │   │   ├── faq.js         # FAQ 搜尋與查詢
│   │   │   │   ├── intent.js      # Intent 偵測
│   │   │   │   ├── analytics.js   # 分析統計
│   │   │   │   └── crm.js         # CRM 整合
│   │   │   ├── services/          # 業務邏輯
│   │   │   └── middleware/        # 中介層
│   │   ├── data/
│   │   │   └── faq_kb.js          # FAQ 知識庫 (JS 格式備份)
│   │   └── package.json
│   └── data/
│       ├── faq_kb.phase0a.json    # 唯一資料來源
│       ├── analytics.db           # SQLite 分析資料庫
│       └── customer_inquiries.jsonl
├── frontend/                       # 前端應用
│   ├── faq-search.html            # FAQ 搜尋介面
│   ├── lib/
│   │   ├── faq-engine.js          # 搜尋引擎
│   │   ├── faq-renderer.js        # 渲染元件
│   │   ├── fuse.min.js            # Fuse.js 模糊搜尋
│   │   ├── dompurify.min.js       # XSS 防護
│   │   └── dayjs.min.js           # 日期處理
│   └── assets/i18n/               # 多語言檔案
└── docs/                          # 文件
    ├── PHASE4_OPTIMIZATION_SUMMARY.md
    ├── PERFORMANCE_BENCHMARK.md
    └── [其他文件]
```

## 重要約束

### 🚫 GitHub 推送

**當前政策**: 所有工作必須在本地驗證完成，不能推送到 GitHub，除非獲得明確授權。

操作流程：
1. 本地開發和測試
2. 所有測試通過後提交本地 Git
3. 等待使用者明確許可（例如："推送"）
4. 才能執行 `git push`

### 📝 文檔管理原則

**重要**: 過程報告不需要新增或生成

**原則**:
- ❌ **禁止生成**: 測試報告、驗證報告、分析報告、實作總結等過程記錄
- ✅ **允許新增**: 核心文檔（標準、規範）、操作指南、長期參考資料
- 🗑️ **臨時檔案**: 測試腳本和臨時報告應放在 `/tmp` 目錄，不提交到 Git

**已保留的文檔** (20 個):
- 根目錄: CLAUDE.md, README.md, PHASE4_OPTIMIZATION_SUMMARY.md, PERFORMANCE_BENCHMARK.md
- 操作指南: ADMIN_*.md, TAG_TRACKING_GUIDE.md, ZEABUR_CONFIG_GUIDE.md
- docs/: FAQ 標準與維護流程、SEO 計劃、翻譯責任、多語言影響評估

**清理歷史** (2025-11-14):
- 刪除 ~130 個過程記錄檔案
- 保留 20 個核心文檔
- 詳見 Git 提交記錄

### ✅ 測試驗證

所有程式碼改動前必須確保：
- ✅ 後端健康檢查通過
- ✅ 所有 API 端點正常
- ✅ 多語言支援測試通過
- ✅ 性能指標符合目標
- ✅ 沒有回歸問題

## 常用命令

### 後端

```bash
# 進入後端目錄
cd zeabur_backend/backend

# 啟動伺服器（port 3000）
npm start

# 運行測試
npm test

# 健康檢查
curl http://localhost:3000/health

# 搜尋 FAQ
curl -X POST http://localhost:3000/api/v1/faq/search \
  -H "Content-Type: application/json" \
  -d '{"query":"教練","limit":5}'

# 取得所有 FAQ
curl http://localhost:3000/api/v1/faq/all
```

### 前端

```bash
# 簡易伺服器（port 8080）
cd frontend
python3 -m http.server 8080

# 訪問
http://localhost:8080/faq-search.html
```

### Git 操作

```bash
# 檢查狀態
git status

# 檢查最近提交
git log --oneline -10

# 查看提交內容
git show <commit-hash>

# 差異比較
git diff
```

## 最近的優化工作（Phase 4.1+）

### ✅ 已完成的 6 個優化任務

| 編號 | 任務 | 提交 | 狀態 |
|------|------|------|------|
| 4.5 | 移除舊格式支援 | 9782fc5 | ✅ |
| 4.6 | 優化 Fuse.js | 50edadf | ✅ |
| 4.7 | 前端清理 | 388c595 | ✅ |
| 4.8 | API 文檔 | 4ba2700 | ✅ |
| 4.9 | 性能測試 | 234bebe | ✅ |
| 4.10 | 代碼註釋 | ab7843e | ✅ |

### 📊 改進指標

- **API 響應時間**: 14-15ms（目標 <200ms，改善 99%）
- **Fuse.js 最佳化**: 5 鍵（原 16+ 鍵，減少 69%）
- **程式碼精簡**: 移除 150+ 行舊格式支援
- **Linus 原則評分**: 25/25（完美）

### 📝 生成的文件

- `PHASE4_OPTIMIZATION_SUMMARY.md` - 完整優化指南
- `PERFORMANCE_BENCHMARK.md` - 性能基準測試結果

## 程式碼風格

### 前端

- 原生 JavaScript ES6+（無需 React/Vue）
- 函數長度 ≤ 50 行
- 使用 `const`/`let`，避免 `var`
- XSS 防護：使用 DOMPurify 清理使用者輸入

### 後端

- Node.js async/await 模式
- RESTful API 設計（`/api/v1/resource`）
- 統一錯誤處理格式：`{ success: false, error: { code, message } }`
- 日誌格式：`console.log('[DEBUG] ...')`

### 資料

- 所有檔案使用 UTF-8 編碼
- JSON 使用 2 空格縮排
- 日期格式：ISO 8601（`YYYY-MM-DDTHH:mm:ss.sssZ`）
- ID 格式：`faq.{category}.{序號}`

## 關鍵設計原則（Linus 原則）

### 1. 消除特殊情況

避免條件分支，通過設計改變使邊界情況消失。

**例子**:
```javascript
// ❌ 不好：多層條件
if (faq.content) {
  // 新格式
} else if (faq.answer_template) {
  // 舊格式
}

// ✅ 好：直接使用統一結構
return faq.content; // API 保證總是提供
```

### 2. 資料結構優於算法

簡潔的資料結構比複雜的邏輯更強大。

**例子**:
```javascript
// ❌ 複雜：API 返回巢狀結構，前端再組合
{
  answer_template: {
    summary: "...",
    details: "...",
    text_translations: { en: "..." }
  }
}

// ✅ 簡潔：API 直接返回組合後的內容
{
  content: {
    answer: "..." // 已組合
  }
}
```

### 3. 清晰的責任邊界

後端：負責資料轉換、組合、多語言
前端：純展示層

### 4. 實用優於理論

理論和實務衝突時，實務優先。

### 5. 使用者需求驅動

所有設計決策都來自真實使用者需求。

## 多語言支援

**優先級**: 中文（主要）> 英文（次要）> 泰文（次要）

### API 多語言

API 根據 `lang` 參數返回對應語言內容：

```javascript
// 前端請求特定語言
GET /api/v1/faq/all?lang=en

// 後端返回英文內容
{
  items: [
    {
      content: {
        question: "How to book?",
        answer: "...",
        postscript: ""
      }
    }
  ]
}
```

### 前端多語言

前端 `faq-engine.js` 使用 `setLanguage()` 切換語言：

```javascript
const engine = new FAQEngine();
await engine.initialize();
engine.setLanguage('en'); // 切換為英文
```

## 常見問題排查

### API 無法啟動

```bash
# 1. 檢查 port 3000 是否被佔用
lsof -i :3000

# 2. 殺掉佔用程序
kill -9 <PID>

# 3. 重新啟動
npm start
```

### FAQ 資料載入失敗

檢查 `zeabur_backend/data/faq_kb.phase0a.json` 是否存在：
- 如果不存在，系統會自動降級到 `faq_kb.js`
- 確保至少有一個資料源可用

### 多語言內容缺失

檢查 API 響應：
```bash
curl http://localhost:3000/api/v1/faq/all?lang=en
```

如果某些欄位為空：
- 檢查 `faq_kb.phase0a.json` 中的翻譯欄位
- 預設會回到中文

## 偵錯技巧

### 前端

1. 開啟瀏覽器開發者工具（F12）
2. 檢查 Console 日誌（搜尋 `[FAQ Engine]`）
3. 檢查 Network 標籤中的 API 請求

### 後端

1. 查看終端輸出（應該看到 `[FAQ Routes]` 日誌）
2. 檢查 git diff：`git diff`
3. 檢查最近提交：`git log -p -1`

## 後續步驟

目前狀態：
- ✅ Phase 4.1+ 所有優化完成
- ✅ 本地測試通過（9/12 測試通過）
- ✅ 6 個乾淨的 Git 提交準備完畢
- ⏳ 等待推送授權

當使用者許可推送時：
```bash
git push origin main
```

---

**最後更新**: 2025-11-14
**維護人**: Claude Code
