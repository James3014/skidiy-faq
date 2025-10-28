# Quick Start Guide: FAQ System Upgrade

**Version**: 1.0.0
**Last Updated**: 2025-10-13
**Prerequisites**: Node.js 18+, Git, 基本的命令列操作能力

---

## 目錄

1. [環境需求](#1-環境需求)
2. [專案設置](#2-專案設置)
3. [前端開發](#3-前端開發)
4. [後端開發](#4-後端開發)
5. [資料驗證](#5-資料驗證)
6. [測試與除錯](#6-測試與除錯)
7. [常見問題](#7-常見問題)

---

## 1. 環境需求

### 1.1 必要軟體

| 軟體 | 版本要求 | 用途 | 安裝指令 |
|------|---------|------|---------|
| **Node.js** | 18.x LTS 或以上 | JavaScript 執行環境 | `brew install node` (macOS) |
| **npm** | 9.x 或以上 | 套件管理工具 | 隨 Node.js 安裝 |
| **Git** | 2.x 或以上 | 版本控制 | `brew install git` (macOS) |
| **VS Code** | 最新版 | 程式碼編輯器（推薦） | https://code.visualstudio.com/ |

### 1.2 選用軟體

| 軟體 | 用途 | 安裝指令 |
|------|------|---------|
| **SQLite Browser** | SQLite 資料庫視覺化工具 | https://sqlitebrowser.org/ |
| **Postman** | API 測試工具 | https://www.postman.com/ |
| **jq** | JSON 處理命令列工具 | `brew install jq` |

### 1.3 驗證環境

執行以下命令驗證環境設置：

```bash
# 檢查 Node.js 版本
node --version
# 預期輸出：v18.x.x 或更高

# 檢查 npm 版本
npm --version
# 預期輸出：9.x.x 或更高

# 檢查 Git 版本
git --version
# 預期輸出：git version 2.x.x
```

---

## 2. 專案設置

### 2.1 初始化專案

```bash
# 進入 FAQ 系統目錄
cd /Users/jameschen/Downloads/diyski/crm/03_FAQ與知識庫

# 建立專案目錄結構（若不存在）
mkdir -p frontend/lib frontend/assets/i18n
mkdir -p backend/src/{routes,services,middleware,utils} backend/tests
mkdir -p data scripts docs

# 初始化 Node.js 專案
cd backend
npm init -y

# 安裝後端依賴套件
npm install express better-sqlite3 ajv dotenv cors helmet compression
npm install --save-dev nodemon jest supertest eslint

# 回到專案根目錄
cd ..
```

### 2.2 設定環境變數

建立 `.env` 檔案（後端配置）：

```bash
cat > backend/.env <<EOF
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database
DB_PATH=../data/analytics.db

# JSONL Logs
JSONL_PATH=../data/customer_inquiries.jsonl

# LLM Configuration (Claude API)
ANTHROPIC_API_KEY=your_api_key_here
LLM_MODEL=claude-3-5-sonnet-20241022
LLM_MAX_TOKENS=1024
LLM_TEMPERATURE=0.3

# Rate Limiting
LLM_DAILY_QUOTA=100
LLM_RATE_LIMIT_PER_MINUTE=10

# CORS
CORS_ORIGIN=http://localhost:8080

# Logging
LOG_LEVEL=debug
EOF
```

**重要**：請將 `ANTHROPIC_API_KEY` 替換為您的實際 API Key。

### 2.3 下載前端依賴庫

```bash
# 下載 Fuse.js（9KB，模糊搜尋引擎）
curl -o frontend/lib/fuse.min.js https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js

# 下載 DOMPurify（20KB，XSS 防護）
curl -o frontend/lib/dompurify.min.js https://cdn.jsdelivr.net/npm/dompurify@3.0.8/dist/purify.min.js

# 下載 Day.js（2KB，日期處理）
curl -o frontend/lib/dayjs.min.js https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js

# 驗證檔案大小
ls -lh frontend/lib/
# 預期看到三個檔案，總大小約 31KB
```

### 2.4 建立 Git 忽略規則

```bash
cat > .gitignore <<EOF
# Node.js
node_modules/
npm-debug.log
package-lock.json

# Environment Variables
.env
.env.local

# Database
*.db
*.db-journal

# Logs
logs/
*.log

# OS Files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Test Coverage
coverage/

# Build Artifacts
dist/
build/
EOF
```

---

## 3. 前端開發

### 3.1 建立基本 HTML 檔案

**檔案**：`frontend/faq-search.html`

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DIY Ski FAQ 搜尋系統</title>
  <style>
    /* 基本樣式（後續完善） */
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .search-box { max-width: 600px; margin: 50px auto; }
    input[type="search"] { width: 100%; padding: 12px; font-size: 16px; }
    .results { margin-top: 20px; }
  </style>
</head>
<body>
  <div class="search-box">
    <h1>FAQ 搜尋</h1>
    <input type="search" id="search-input" placeholder="輸入問題搜尋...">
    <div class="results" id="results"></div>
  </div>

  <script src="lib/fuse.min.js"></script>
  <script src="lib/dompurify.min.js"></script>
  <script>
    console.log('FAQ Search System Loaded');
    // 搜尋邏輯將在 3.2 節實作
  </script>
</body>
</html>
```

### 3.2 啟動本地伺服器（前端）

使用 Python 內建的 HTTP 伺服器：

```bash
cd frontend
python3 -m http.server 8080
```

開啟瀏覽器訪問：http://localhost:8080/faq-search.html

### 3.3 載入 FAQ 資料

在 `faq-search.html` 的 `<script>` 中加入：

```javascript
// 載入 FAQ 資料
let faqData = null;
let fuseInstance = null;

async function loadFAQData() {
  try {
    const response = await fetch('../data/faq_kb.json');
    faqData = await response.json();

    // 初始化 Fuse.js
    fuseInstance = new Fuse(faqData.items, {
      keys: [
        { name: 'canonical_question', weight: 0.4 },
        { name: 'utterance_patterns', weight: 0.3 },
        { name: 'answer_template.text', weight: 0.15 },
        { name: 'keywords', weight: 0.1 }
      ],
      threshold: 0.4,
      ignoreLocation: true,
      includeScore: true,
      minMatchCharLength: 1
    });

    console.log(`已載入 ${faqData.items.length} 個 FAQ 項目`);
  } catch (error) {
    console.error('無法載入 FAQ 資料:', error);
  }
}

// 頁面載入時執行
loadFAQData();

// 搜尋功能
const searchInput = document.getElementById('search-input');
const resultsDiv = document.getElementById('results');

searchInput.addEventListener('input', (e) => {
  const query = e.target.value.trim();
  if (query.length < 2) {
    resultsDiv.innerHTML = '';
    return;
  }

  const results = fuseInstance.search(query, { limit: 5 });
  displayResults(results);
});

function displayResults(results) {
  if (results.length === 0) {
    resultsDiv.innerHTML = '<p>找不到相關結果</p>';
    return;
  }

  const html = results.map(result => {
    const confidence = Math.round((1 - result.score) * 100);
    return `
      <div class="result-card" style="border: 1px solid #ddd; padding: 15px; margin: 10px 0;">
        <h3>${result.item.canonical_question}</h3>
        <p>${result.item.answer_template.text.substring(0, 150)}...</p>
        <small>信心度: ${confidence}%</small>
      </div>
    `;
  }).join('');

  resultsDiv.innerHTML = html;
}
```

重新整理瀏覽器，現在應該可以搜尋 FAQ 了！

---

## 4. 後端開發

### 4.1 建立基本 Express 伺服器

**檔案**：`backend/src/server.js`

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(compression());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    uptime: process.uptime(),
    database: 'connected'
  });
});

// API Routes (後續新增)
app.use('/api/v1/faq', require('./routes/faq'));
app.use('/api/v1/intent', require('./routes/intent'));
app.use('/api/v1/analytics', require('./routes/analytics'));
app.use('/api/v1/crm', require('./routes/crm'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: '伺服器發生錯誤'
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ FAQ API Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});
```

### 4.2 建立路由檔案

**檔案**：`backend/src/routes/faq.js`

```javascript
const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// 載入 FAQ 資料
let faqData = null;

async function loadFAQData() {
  if (!faqData) {
    const dataPath = path.join(__dirname, '../../../data/faq_kb.json');
    const data = await fs.readFile(dataPath, 'utf8');
    faqData = JSON.parse(data);
  }
  return faqData;
}

// POST /api/v1/faq/search
router.post('/search', async (req, res) => {
  const startTime = Date.now();

  try {
    const { query, limit = 5 } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_QUERY',
          message: '查詢文字不得為空'
        }
      });
    }

    const data = await loadFAQData();

    // 簡化搜尋（完整實作需使用 Fuse.js 或委託前端）
    const results = data.items
      .filter(item => item.canonical_question.includes(query))
      .slice(0, limit)
      .map(item => ({
        faq_id: item.id,
        canonical_question: item.canonical_question,
        answer_preview: item.answer_template.text.substring(0, 100),
        confidence: 85 // 簡化計算
      }));

    res.json({
      success: true,
      data: {
        results,
        total: results.length
      },
      meta: {
        timestamp: new Date().toISOString(),
        query_id: `q_${Date.now()}`,
        response_time_ms: Date.now() - startTime
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SEARCH_ERROR',
        message: '搜尋失敗'
      }
    });
  }
});

// GET /api/v1/faq/:faq_id
router.get('/:faq_id', async (req, res) => {
  try {
    const { faq_id } = req.params;
    const data = await loadFAQData();

    const faqItem = data.items.find(item => item.id === faq_id);

    if (!faqItem) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FAQ_NOT_FOUND',
          message: '找不到指定的 FAQ'
        }
      });
    }

    res.json({
      success: true,
      data: faqItem,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get FAQ error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_FAQ_ERROR',
        message: '無法取得 FAQ'
      }
    });
  }
});

module.exports = router;
```

### 4.3 建立空白路由檔案（後續實作）

```bash
cd backend/src/routes

# 建立 intent.js
cat > intent.js <<EOF
const express = require('express');
const router = express.Router();

// TODO: 實作 Intent 偵測邏輯

router.post('/detect', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.post('/extract-slots', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

module.exports = router;
EOF

# 建立 analytics.js
cat > analytics.js <<EOF
const express = require('express');
const router = express.Router();

// TODO: 實作分析功能

router.get('/queries', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.get('/stats', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.post('/events', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

module.exports = router;
EOF

# 建立 crm.js
cat > crm.js <<EOF
const express = require('express');
const router = express.Router();

// TODO: 實作 CRM 整合功能

router.post('/inquiry-log', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.post('/generate-tags', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

module.exports = router;
EOF
```

### 4.4 啟動後端伺服器

```bash
cd backend

# 使用 nodemon 啟動（自動重啟）
npx nodemon src/server.js

# 或使用一般 node
node src/server.js
```

預期輸出：
```
✅ FAQ API Server running on http://localhost:3000
📊 Environment: development
```

### 4.5 測試 API 端點

```bash
# 測試健康檢查
curl http://localhost:3000/health

# 測試 FAQ 搜尋
curl -X POST http://localhost:3000/api/v1/faq/search \
  -H "Content-Type: application/json" \
  -d '{"query":"教練","limit":3}'

# 測試取得單一 FAQ
curl http://localhost:3000/api/v1/faq/faq.itinerary.001
```

---

## 5. 資料驗證

### 5.1 安裝 JSON Schema 驗證工具

```bash
cd scripts
npm init -y
npm install ajv ajv-formats
```

### 5.2 建立驗證腳本

**檔案**：`scripts/validate-faq-schema.js`

```javascript
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const fs = require('fs');
const path = require('path');

// 初始化 AJV
const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);

// 載入 Schema
const schemaPath = path.join(__dirname, '../specs/001-faq-system-upgrade/contracts/faq-schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

// 載入 FAQ 資料
const dataPath = path.join(__dirname, '../data/faq_kb.json');
const faqData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 編譯 Schema
const validate = ajv.compile(schema);

// 執行驗證
const valid = validate(faqData);

if (valid) {
  console.log('✅ FAQ 資料驗證通過！');
  console.log(`📊 總共 ${faqData.items.length} 個 FAQ 項目`);
  process.exit(0);
} else {
  console.error('❌ FAQ 資料驗證失敗：');
  console.error(JSON.stringify(validate.errors, null, 2));
  process.exit(1);
}
```

### 5.3 執行驗證

```bash
cd scripts
node validate-faq-schema.js
```

預期輸出：
```
✅ FAQ 資料驗證通過！
📊 總共 71 個 FAQ 項目
```

### 5.4 建立 Makefile（便捷命令）

**檔案**：`Makefile`（專案根目錄）

```makefile
.PHONY: validate start-frontend start-backend test help

# 預設目標
help:
	@echo "FAQ System Upgrade - Available Commands:"
	@echo "  make validate       驗證 FAQ 資料格式"
	@echo "  make start-frontend 啟動前端伺服器 (port 8080)"
	@echo "  make start-backend  啟動後端伺服器 (port 3000)"
	@echo "  make test           執行測試"
	@echo "  make dev            同時啟動前端和後端"

# 驗證 FAQ 資料
validate:
	@echo "🔍 驗證 FAQ 資料格式..."
	cd scripts && node validate-faq-schema.js

# 啟動前端伺服器
start-frontend:
	@echo "🚀 啟動前端伺服器 (http://localhost:8080)"
	cd frontend && python3 -m http.server 8080

# 啟動後端伺服器
start-backend:
	@echo "🚀 啟動後端伺服器 (http://localhost:3000)"
	cd backend && npx nodemon src/server.js

# 執行測試
test:
	@echo "🧪 執行測試..."
	cd backend && npm test

# 同時啟動前端和後端（需要 tmux 或兩個終端）
dev:
	@echo "請在兩個終端分別執行："
	@echo "  終端 1: make start-frontend"
	@echo "  終端 2: make start-backend"
```

---

## 6. 測試與除錯

### 6.1 前端除錯技巧

**使用瀏覽器開發者工具**：

1. 開啟瀏覽器（Chrome/Firefox）
2. 按 `F12` 或 `Cmd+Option+I` (macOS) 開啟開發者工具
3. 切換到 **Console** 標籤查看 JavaScript 錯誤
4. 切換到 **Network** 標籤查看 HTTP 請求

**常見問題**：

```javascript
// 問題：FAQ 資料未載入
// 檢查：Console 是否有 CORS 錯誤
// 解決：確認後端已啟用 CORS

// 問題：搜尋無結果
// 檢查：Fuse.js 配置的 threshold 是否過低
// 解決：調整 threshold 為 0.4-0.6

// 問題：中文搜尋不準確
// 檢查：是否設定 ignoreLocation: true
// 解決：確認 Fuse.js 配置正確
```

### 6.2 後端除錯技巧

**使用 console.log**：

```javascript
// 在關鍵位置加入日誌
console.log('[DEBUG] Query:', req.body.query);
console.log('[DEBUG] Results count:', results.length);
```

**使用 Postman 測試 API**：

1. 下載並安裝 Postman
2. 建立新請求：`POST http://localhost:3000/api/v1/faq/search`
3. 設定 Body 為 JSON：`{"query":"教練","limit":5}`
4. 查看回應和狀態碼

**使用 curl 測試**：

```bash
# 測試搜尋 API
curl -X POST http://localhost:3000/api/v1/faq/search \
  -H "Content-Type: application/json" \
  -d '{"query":"教練"}' \
  | jq '.'

# 測試健康檢查
curl http://localhost:3000/health | jq '.'
```

### 6.3 效能分析

**測試搜尋速度**：

```javascript
// 在前端加入效能計時
const startTime = performance.now();
const results = fuseInstance.search(query);
const endTime = performance.now();
console.log(`搜尋耗時: ${(endTime - startTime).toFixed(2)}ms`);
```

**目標效能指標**：
- 搜尋時間：< 100ms (P95)
- 頁面載入：< 2 秒
- API 回應：< 200ms

---

## 7. 常見問題

### Q1: 前端無法載入 FAQ 資料

**問題**：Console 顯示 `Failed to load resource: net::ERR_FILE_NOT_FOUND`

**解決**：
```bash
# 確認 faq_kb.json 路徑正確
ls -l data/faq_kb.json

# 確認前端使用正確的相對路徑
# faq-search.html 中應該是 '../data/faq_kb.json'
```

### Q2: 後端無法啟動

**問題**：`Error: Cannot find module 'express'`

**解決**：
```bash
cd backend
npm install
```

### Q3: CORS 錯誤

**問題**：Console 顯示 `Access to fetch at ... has been blocked by CORS policy`

**解決**：
```javascript
// 確認後端 server.js 有正確設定 CORS
app.use(cors({ origin: 'http://localhost:8080' }));
```

### Q4: SQLite 資料庫檔案不存在

**問題**：`Error: SQLITE_CANTOPEN: unable to open database file`

**解決**：
```bash
# 建立空資料庫（會在首次寫入時自動建立）
touch data/analytics.db

# 或執行初始化腳本（後續實作）
node scripts/init-database.js
```

### Q5: 中文搜尋結果不準確

**問題**：搜尋「教練」找不到相關 FAQ

**解決**：
```javascript
// 確認 Fuse.js 配置
const fuseOptions = {
  threshold: 0.4,           // 降低閾值（0.6 → 0.4）
  ignoreLocation: true,     // 必須設為 true
  minMatchCharLength: 1     // 允許單字匹配
};
```

### Q6: API 回應速度過慢

**問題**：API 回應時間 > 500ms

**排查**：
```bash
# 檢查是否啟用壓縮
curl -H "Accept-Encoding: gzip" http://localhost:3000/api/v1/faq/search

# 檢查是否有不必要的資料庫查詢
# 查看 server.js 的日誌輸出
```

**解決**：
- 啟用 `compression` middleware
- 使用快取（sessionStorage）
- 優化資料庫查詢

### Q7: 如何新增新的 FAQ 項目？

**步驟**：

1. 編輯 `data/faq_kb.json`，新增 FAQ 項目：
```json
{
  "id": "faq.new_category.001",
  "intent": "GENERAL",
  "canonical_question": "新問題",
  "utterance_patterns": ["變體1", "變體2", "變體3"],
  "answer_template": {
    "text": "答案內容"
  },
  "keywords": ["關鍵字1", "關鍵字2"],
  "crm_tags": ["#標籤"],
  "metadata": {
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z",
    "version": 1,
    "status": "active"
  }
}
```

2. 驗證資料格式：
```bash
make validate
```

3. 重新載入頁面（前端會自動重新載入 FAQ 資料）

### Q8: 如何部署到生產環境？

**前端部署**：
```bash
# 將 frontend/ 目錄上傳到靜態網站託管（如 Netlify, Vercel）
# 或使用 Nginx 提供服務
```

**後端部署**：
```bash
# 設定 NODE_ENV=production
export NODE_ENV=production

# 使用 PM2 管理 Node.js 進程
npm install -g pm2
pm2 start backend/src/server.js --name faq-api

# 或使用 Docker（參考 Dockerfile）
docker build -t faq-api .
docker run -p 3000:3000 faq-api
```

---

## 下一步

完成本快速開始指南後，建議閱讀以下文檔：

1. **[plan.md](./plan.md)** - 完整技術實作計劃
2. **[data-model.md](./data-model.md)** - 詳細資料模型定義
3. **[research.md](./research.md)** - 技術研究與決策
4. **[contracts/api-spec.yaml](./contracts/api-spec.yaml)** - 完整 API 規格

開始實作更多功能：
- **Intent 偵測**：實作 `backend/src/services/intent-detector.js`
- **Slot 擷取**：實作 `backend/src/services/slot-extractor.js`
- **LLM 整合**：實作 `backend/src/services/llm-client.js`
- **分析功能**：實作 `backend/src/services/analytics.js`

---

**維護者**：DIY Ski CRM Team
**最後更新**：2025-10-13
**相關文檔**：[spec.md](./spec.md) | [plan.md](./plan.md) | [research.md](./research.md)
