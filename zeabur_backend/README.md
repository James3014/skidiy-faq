# DIY.Ski FAQ 與知識庫系統

**版本**: v1.1.0
**最後更新**: 2025-10-15
**作者**: DIY.Ski Team

智慧型 FAQ 搜尋與知識庫管理系統，整合 Intent 偵測、Slot 擷取、雪場資料庫、LLM 對話、Analytics 分析與 CRM 整合。

---

## 📋 目錄

- [功能特色](#功能特色)
- [系統架構](#系統架構)
- [快速開始](#快速開始)
- [使用指南](#使用指南)
- [API 文檔](#api-文檔)
- [配置說明](#配置說明)
- [開發指南](#開發指南)
- [常見問題](#常見問題)
- [測試報告](#測試報告)

---

## ✨ 功能特色

### 核心功能

1. **智慧 FAQ 搜尋**
   - 基於 Fuse.js 的模糊搜尋引擎
   - 支援中文、英文、泰文查詢
   - 即時搜尋建議與自動補全
   - 分類篩選與熱門問題推薦

2. **Intent 偵測與 Slot 擷取**
   - Rule-based Intent Detection (13 種 Intent 類型)
   - Regex-based Slot Extraction (日期、雪場、人數、板型)
   - 信心度評分與多 Intent 支援
   - 自動標記與 CRM 整合

3. **LLM 智慧對話**
   - RAG (Retrieval-Augmented Generation) 架構
   - 支援多種 LLM 提供者 (Gemini, Claude, OpenAI, Ollama)
   - Streaming 回應與 Context 管理
   - FAQ 上下文自動注入

4. **Analytics 分析儀表板**
   - 即時使用統計與成本追蹤
   - LLM 提供者分佈分析
   - 每日請求趨勢圖表
   - 成本預警與監控

5. **CRM 整合**
   - JSONL 格式日誌記錄
   - 客戶查詢歷史追蹤
   - 自動標籤與意圖分析
   - 匯出與報表功能

6. **多語言支援**
   - 中文（繁體）- 主要語言
   - 英文 - 次要語言
   - 泰文 - 次要語言
   - 即時切換與 localStorage 記憶

7. **雪場資料管理**
   - 42 個日本雪場完整資料庫
   - 雪場管理後台 (resort-admin.html)
   - 支援雪場資訊查詢與編輯
   - YAML → JSON 自動轉換
   - 整合至 RAG 系統供學生查詢

---

## 🏗 系統架構

```
┌──────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                           │
├──────────────────────────────────────────────────────────────────┤
│  index-intent.html │ index-llm.html │ analytics.html │ admin.html│
│  (智慧搜尋界面)      │ (LLM 對話界面)  │ (分析儀表板)    │ (管理後台)  │
└──────────┬────────────────────┬─────────────────┬──────────┬────┘
           │                    │                 │          │
           ▼                    ▼                 ▼          ▼
┌──────────────────────────────────────────────────────────────────┐
│                         Backend API                              │
├──────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────────────┐    │
│  │  FAQ API    │  │  Intent API │  │  LLM API              │    │
│  │  /faq/*     │  │  /intent/*  │  │  /llm/*               │    │
│  └─────────────┘  └─────────────┘  └───────────────────────┘    │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────────────┐    │
│  │Analytics API│  │  CRM API    │  │  Resort Admin API     │    │
│  │/analytics/* │  │  /crm/*     │  │  /admin/resort/*      │    │
│  └─────────────┘  └─────────────┘  └───────────────────────┘    │
└──────────┬────────────────────┬─────────────────┬──────────┬────┘
           │                    │                 │          │
           ▼                    ▼                 ▼          ▼
┌──────────────────────────────────────────────────────────────────┐
│                      Service Layer                               │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐     │
│  │ FAQ Engine   │  │ Intent       │  │ LLM Manager        │     │
│  │ (Fuse.js)    │  │ Detector     │  │ (Multi-provider)   │     │
│  └──────────────┘  └──────────────┘  └────────────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐     │
│  │ RAG Engine   │  │ Analytics    │  │ CRM Service        │     │
│  │ (FAQ+Resort) │  │ Service      │  │ (JSONL Logger)     │     │
│  └──────────────┘  └──────────────┘  └────────────────────┘     │
│  ┌──────────────┐                                                │
│  │ Resort       │                                                │
│  │ Service      │                                                │
│  └──────────────┘                                                │
└──────────┬────────────────────┬─────────────────┬──────────┬────┘
           │                    │                 │          │
           ▼                    ▼                 ▼          ▼
┌──────────────────────────────────────────────────────────────────┐
│                       Data Layer                                 │
├──────────────────────────────────────────────────────────────────┤
│  faq_kb.json      resort_kb.json    analytics.db                 │
│  (71 FAQ items)   (42 resorts)     (SQLite)                      │
│  customer_inquiries.jsonl (CRM logs)                             │
└──────────────────────────────────────────────────────────────────┘
```

### 技術棧

**Frontend**:
- Vanilla JavaScript ES6+ (無框架)
- Fuse.js 7.0+ (模糊搜尋)
- DOMPurify 3.0+ (XSS 防護)
- Day.js 1.11+ (日期處理)
- Chart.js (圖表渲染)

**Backend**:
- Node.js 18+ LTS
- Express 4.18+
- better-sqlite3 3.9+ (Analytics)
- Anthropic Claude SDK (LLM)
- OpenAI SDK (LLM)
- Google Generative AI SDK (Gemini)

**Database**:
- SQLite (Analytics 結構化資料)
- JSONL (CRM 非結構化日誌)

---

## 🚀 快速開始

### 環境需求

- **Node.js**: v18.x 或以上
- **Python**: v3.8+ (用於前端伺服器)
- **作業系統**: macOS, Linux, Windows

### 安裝步驟

#### 1. Clone 專案

```bash
git clone <repository-url>
cd crm/03_FAQ與知識庫
```

#### 2. 安裝後端依賴

```bash
cd backend
npm install
```

#### 3. 設定環境變數

建立 `backend/.env` 檔案：

```env
# LLM API Keys (至少需要一個)
GEMINI_API_KEY=your_gemini_api_key_here
CLAUDE_API_KEY=your_claude_api_key_here  # Optional
OPENAI_API_KEY=your_openai_api_key_here  # Optional

# Server Configuration
PORT=3000
NODE_ENV=development

# Database Paths
DATABASE_PATH=../data/analytics.db
JSONL_LOG_PATH=../data/customer_inquiries.jsonl

# LLM Configuration
DEFAULT_LLM_PROVIDER=gemini
GEMINI_MODEL=gemini-2.5-flash
CLAUDE_MODEL=claude-3-5-sonnet-20241022
OPENAI_MODEL=gpt-4-turbo-preview
```

**取得 API Keys**:
- **Gemini**: https://makersuite.google.com/app/apikey
- **Claude**: https://console.anthropic.com/
- **OpenAI**: https://platform.openai.com/api-keys

#### 4. 初始化資料庫

```bash
# 建立 SQLite 資料庫（自動執行）
cd backend
npm run migrate

# 檢查資料庫
sqlite3 ../data/analytics.db ".schema"
```

#### 5. 啟動服務

**方法 1: 使用 Makefile (推薦)**

```bash
# 在專案根目錄 (03_FAQ與知識庫/)
make start-frontend  # 啟動前端 (port 8080)
make start-backend   # 啟動後端 (port 3000)
```

**方法 2: 手動啟動**

```bash
# Terminal 1: 啟動前端
cd frontend
python3 -m http.server 8080

# Terminal 2: 啟動後端
cd backend
npm start
```

#### 6. 訪問應用

開啟瀏覽器並訪問:

- **智慧搜尋界面**: http://localhost:8080/index-intent.html
- **LLM 對話界面**: http://localhost:8080/index-llm.html
- **Analytics 儀表板**: http://localhost:8080/analytics.html
- **管理後台**: http://localhost:8080/admin.html (FAQ + 雪場管理)
- **測試頁面**: http://localhost:8080/test-page.html

**後端 API**: http://localhost:3000/api/v1

**健康檢查**: http://localhost:3000/health

---

## 📖 使用指南

### 1. 智慧 FAQ 搜尋 (index-intent.html)

#### 基本搜尋

1. 在搜尋框輸入關鍵字（例如：「教練」、「野澤」、「裝備」）
2. 系統自動進行模糊搜尋
3. 查看搜尋結果，點擊展開查看完整答案

#### 分類篩選

1. 點擊左側邊欄的分類（例如：「🏂 教練與教學安排」）
2. 查看該分類下的所有 FAQ
3. 點擊「顯示全部」回到完整列表

#### Intent 偵測

系統會自動偵測查詢意圖並顯示：
- 🎯 偵測到的 Intent (例如：INSTRUCTOR, BOOKING)
- 📊 信心度百分比
- 🔖 擷取的 Slots (日期、雪場、人數)

**支援的 Intent 類型**:
- `ITINERARY` - 行程規劃
- `SERVICE` - 服務範圍
- `COURSE` - 課程內容
- `GROUPING` - 人數與分組
- `KIDS_SAFETY` - 兒童安全
- `INSTRUCTOR` - 教練相關
- `BOOKING` - 預約流程
- `PAYMENT` - 付款與折扣
- `INSURANCE` - 保險相關
- `GEAR` - 裝備租借
- `REFUND_POLICY` - 取消退款
- `RESORT_INFO` - 雪場資訊（新增）
- `GENERAL` - 一般問題

#### 多語言切換

1. 點擊右上角的語言選擇器
2. 選擇語言：中文 (zh) / English (en) / ไทย (th)
3. UI 文字立即切換

### 2. LLM 智慧對話 (index-llm.html)

#### 開始對話

1. 訪問 http://localhost:8080/index-llm.html
2. 在輸入框輸入問題（例如：「小朋友幾歲可以學滑雪？」）
3. 點擊「發送」或按 Enter

#### 選擇 LLM 提供者

1. 點擊「設定」按鈕
2. 選擇 LLM 提供者：
   - **Gemini** (免費，需要 API Key)
   - **Claude** (付費，需要 API Key)
   - **OpenAI** (付費，需要 API Key)
   - **Ollama** (本地模型，需要安裝)

#### 查看 FAQ 上下文

LLM 回應會自動注入相關 FAQ 作為 Context：
- 顯示「使用了 X 個 FAQ 作為參考」
- 點擊「查看參考的 FAQ」展開詳情
- 包含 FAQ ID、問題、信心度

#### Streaming 模式

系統支援 Streaming 回應（逐字輸出），提供更好的使用體驗。

### 3. Analytics 儀表板 (analytics.html)

#### 查看統計資料

訪問 http://localhost:8080/analytics.html 查看：

**總覽卡片**:
- 📊 總請求數
- 💰 總成本 (USD)
- ⚡ 平均回應時間 (ms)
- ✅ 成功率 (%)

**圖表**:
- 📈 提供者使用分佈 (圓餅圖)
- 📉 每日請求趨勢 (折線圖)
- 💵 成本趨勢 (折線圖)

**最新請求列表**:
- 查詢文字
- 提供者 & 模型
- Tokens 使用量
- 成本
- 回應時間
- 狀態 (成功/失敗)

#### 篩選資料

1. 選擇日期範圍：
   - 今天
   - 最近 7 天
   - 最近 30 天
   - 自訂範圍

2. 選擇提供者：
   - 全部
   - Gemini
   - Claude
   - OpenAI
   - Ollama

3. 點擊「重新整理」更新資料

#### 匯出報表

1. 點擊「匯出 CSV」按鈕
2. 下載包含所有請求詳情的 CSV 檔案

### 4. 雪場資料管理 (admin.html)

#### 訪問管理後台

訪問 http://localhost:8080/admin.html 進入雪場管理界面

**功能**:
- 📊 **統計概覽**: 查看雪場總數、區域分佈、夜間滑雪統計
- 🔍 **搜尋與篩選**: 按雪場名稱、區域、縣市篩選
- 👁️ **查看詳情**: 查看雪場詳細資料（纜車數、雪道數、雪季等）
- ✏️ **編輯資料**: 更新雪場資訊（價格、交通、開放時間等）

#### 管理雪場資料

1. **查看雪場列表**
   - 列表顯示雪場名稱、區域、纜車數、雪道數等基本資訊
   - 支援分頁瀏覽（每頁 20 筆）

2. **搜尋雪場**
   - 輸入雪場名稱進行搜尋
   - 按區域、縣市篩選
   - 篩選夜間滑雪可用的雪場

3. **編輯雪場資料**
   - 點擊「編輯」按鈕開啟編輯介面
   - 更新雪場資料後點擊「儲存」
   - 系統自動建立備份並更新 resort_kb.json

4. **查看雪場詳情**
   - 點擊「詳情」查看完整雪場資訊
   - 包含價格、交通方式、雪季資訊、聯絡方式等

#### 從 YAML 更新資料

如果需要更新原始 YAML 資料並重新生成 JSON：

```bash
# 1. 編輯 YAML 檔案
vi faq/resorts/{region}/{resort}.yaml

# 2. 重新轉換為 JSON
cd scripts
node convert-resorts-to-json.js

# 3. 重啟後端服務
cd ../backend
npm start
```

### 5. CRM 整合

#### 查看客戶查詢日誌

```bash
# 查看最新 10 筆記錄
tail -n 10 data/customer_inquiries.jsonl | jq '.'

# 搜尋特定關鍵字
grep "野澤" data/customer_inquiries.jsonl | jq '.'

# 統計查詢數量
wc -l data/customer_inquiries.jsonl
```

#### API 查詢

```bash
# 取得客戶查詢列表
curl http://localhost:3000/api/v1/crm/inquiries?limit=10

# 取得特定使用者的歷史
curl http://localhost:3000/api/v1/crm/user/{userId}/history

# 取得統計資訊
curl http://localhost:3000/api/v1/crm/stats

# 匯出 CSV
curl http://localhost:3000/api/v1/crm/export > inquiries.csv
```

---

## 🔌 API 文檔

完整的 API 文檔請參考: `specs/001-faq-system-upgrade/contracts/api-spec.yaml` (OpenAPI 3.0 格式)

### FAQ API

#### POST /api/v1/faq/search

搜尋 FAQ

**Request**:
```json
{
  "query": "教練",
  "limit": 5,
  "language": "zh"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "faq_id": "faq.instructor.001",
        "canonical_question": "...",
        "answer": "...",
        "score": 0.95,
        "confidence": 95,
        "intent": "INSTRUCTOR"
      }
    ],
    "total": 10,
    "query": "教練"
  }
}
```

#### GET /api/v1/faq/by-section/{section}

取得特定分類的 FAQ

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "faq_id": "faq.instructor.001",
      "canonical_question": "...",
      "answer": "...",
      "section": "🏂 教練與教學安排"
    }
  ]
}
```

### Intent API

#### POST /api/v1/intent/detect

偵測查詢意圖

**Request**:
```json
{
  "query": "2月15日去野澤，2大1小"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "intent": "ITINERARY",
    "confidence": 75,
    "scores": {
      "ITINERARY": 75,
      "GENERAL": 20
    },
    "detectedIntents": ["ITINERARY"]
  }
}
```

#### POST /api/v1/intent/extract-slots

擷取結構化資訊

**Request**:
```json
{
  "query": "2月15日去野澤，2大1小，想學 Snowboard"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "slots": {
      "dates": ["2025-02-15"],
      "resort": "NOZAWA",
      "people": {
        "adults": 2,
        "children": 1,
        "raw": "2大1小"
      },
      "board_type": "SNOWBOARD"
    },
    "query": "2月15日去野澤，2大1小，想學 Snowboard"
  }
}
```

### LLM API

#### POST /api/v1/llm/chat

生成 LLM 回應 (非串流)

**Request**:
```json
{
  "query": "小朋友幾歲可以開始學滑雪？",
  "provider": "gemini",
  "maxTokens": 1024,
  "temperature": 0.7
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "answer": "根據我們的經驗...",
    "faqMatches": [
      {
        "faq_id": "faq.kids.001",
        "confidence": 88
      }
    ],
    "metadata": {
      "provider": "gemini",
      "model": "gemini-2.5-flash",
      "usage": {
        "prompt_tokens": 150,
        "completion_tokens": 200,
        "total_tokens": 350
      },
      "faqContextItems": 3
    }
  }
}
```

#### POST /api/v1/llm/chat/stream

生成 LLM 回應 (串流模式)

**Request**: 同上

**Response**: Server-Sent Events (SSE)

```
data: {"type":"chunk","text":"根據"}
data: {"type":"chunk","text":"我們的"}
data: {"type":"chunk","text":"經驗"}
data: {"type":"done","metadata":{...}}
```

#### GET /api/v1/llm/stats

取得 LLM 系統統計

**Response**:
```json
{
  "success": true,
  "data": {
    "totalFAQItems": 71,
    "maxContextItems": 5,
    "confidenceThreshold": 0.3,
    "llmProviders": ["gemini", "claude"],
    "defaultProvider": "gemini"
  }
}
```

### Analytics API

#### GET /api/v1/analytics/stats

取得分析統計

**Query Parameters**:
- `start_date` (optional): 開始日期 (YYYY-MM-DD)
- `end_date` (optional): 結束日期 (YYYY-MM-DD)
- `provider` (optional): 篩選提供者

**Response**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRequests": 150,
      "totalCost": 0.0245,
      "avgResponseTime": 1850,
      "successRate": 98.7
    },
    "byProvider": {
      "gemini": {
        "requests": 120,
        "cost": 0.0195,
        "avgTokens": 250
      }
    },
    "daily": [
      {
        "date": "2025-10-13",
        "requests": 50,
        "cost": 0.0082
      }
    ]
  }
}
```

### CRM API

#### GET /api/v1/crm/inquiries

取得客戶查詢列表

**Query Parameters**:
- `limit` (optional, default: 50): 每頁筆數
- `offset` (optional, default: 0): 偏移量
- `start_date` (optional): 開始日期
- `end_date` (optional): 結束日期
- `intent` (optional): 篩選 Intent

**Response**:
```json
{
  "success": true,
  "data": {
    "inquiries": [
      {
        "timestamp": "2025-10-13T22:12:11.300Z",
        "query_text": "野澤溫泉雪場怎麼去？",
        "llm_provider": "gemini",
        "cost_usd": 0.00005125,
        "response_time_ms": 1959
      }
    ],
    "total": 150,
    "pagination": {
      "limit": 50,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

### Resort Admin API

#### GET /api/v1/admin/resort

取得雪場列表（支援搜尋、篩選、分頁）

**Query Parameters**:
- `page` (optional, default: 1): 頁碼
- `limit` (optional, default: 20): 每頁筆數
- `search` (optional): 搜尋關鍵字
- `region` (optional): 篩選區域
- `prefecture` (optional): 篩選縣市
- `night_ski` (optional): 篩選夜間滑雪（true/false）
- `sort` (optional): 排序欄位
- `order` (optional): 排序方向（asc/desc）

**Response**:
```json
{
  "success": true,
  "data": {
    "resorts": [
      {
        "resort_id": "HAKUBA_HAPPOONE",
        "names": {
          "zh": "白馬八方尾根",
          "en": "Hakuba Happo-one",
          "ja": "白馬八方尾根スキー場"
        },
        "region": "Nagano Prefecture",
        "snow_stats": {
          "lifts": 27,
          "courses_total": 16,
          "night_ski": true
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalResorts": 42,
      "limit": 20,
      "hasNext": true
    }
  }
}
```

#### GET /api/v1/admin/resort/:id

取得單一雪場詳細資料

**Response**:
```json
{
  "success": true,
  "data": {
    "resort_id": "HAKUBA_HAPPOONE",
    "names": { "zh": "白馬八方尾根", ... },
    "region": "Nagano Prefecture",
    "snow_stats": { ... },
    "pricing": { ... },
    "transportation": { ... },
    "season_info": { ... },
    "_metadata": {
      "source_file": "faq/resorts/nagano/hakuba-happoone.yaml",
      "region": "nagano",
      "last_converted": "2025-10-15T..."
    }
  }
}
```

#### PUT /api/v1/admin/resort/:id

更新雪場資料

**Request**:
```json
{
  "names": {
    "zh": "白馬八方尾根滑雪場",
    "en": "Hakuba Happo-one Ski Resort"
  },
  "snow_stats": {
    "lifts": 28,
    "courses_total": 16
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "resort_id": "HAKUBA_HAPPOONE",
    "message": "雪場資料已更新"
  }
}
```

#### GET /api/v1/admin/resort/stats

取得雪場統計資訊

**Response**:
```json
{
  "success": true,
  "data": {
    "total": 42,
    "byRegion": {
      "niigata": 16,
      "nagano": 11,
      "hokkaido": 4
    },
    "withPricing": 42,
    "withNightSki": 25
  }
}
```

#### GET /api/v1/admin/resort/regions

取得所有區域列表

**Response**:
```json
{
  "success": true,
  "data": {
    "regions": [
      { "region": "niigata", "count": 16 },
      { "region": "nagano", "count": 11 },
      { "region": "hokkaido", "count": 4 }
    ]
  }
}
```

---

## ⚙️ 配置說明

### 環境變數

完整的環境變數列表請參考 `backend/.env.example`

**必需變數**:
```env
GEMINI_API_KEY=your_api_key  # 至少需要一個 LLM 提供者
```

**可選變數**:
```env
# LLM Providers
CLAUDE_API_KEY=your_claude_api_key
OPENAI_API_KEY=your_openai_api_key
OLLAMA_BASE_URL=http://localhost:11434

# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_PATH=../data/analytics.db
JSONL_LOG_PATH=../data/customer_inquiries.jsonl
EVENT_LOG_PATH=../data/events.jsonl
FAQ_INSIGHTS_PATH=../data/analytics_summary.json
CONTENT_MARKDOWN_ROOT=../content/markdown

# Access Control
FAQ_INSIGHTS_API_KEYS=comma,separated,keys
ADMIN_JWT_SECRET=replace-this-secret
#ADMIN_JWT_AUDIENCE=optional-audience
#ADMIN_JWT_ISSUER=optional-issuer

# LLM Models
DEFAULT_LLM_PROVIDER=gemini
GEMINI_MODEL=gemini-2.5-flash
CLAUDE_MODEL=claude-3-5-sonnet-20241022
OPENAI_MODEL=gpt-4-turbo-preview
OLLAMA_MODEL=llama2
```

### FAQ 知識庫配置

**檔案**: `data/faq_kb.json`

**格式**:
```json
{
  "meta": {
    "version": "1.1.0"
  },
  "items": [
    {
      "id": "faq.booking.001",
      "intent": "BOOKING",
      "section": "📅 一般課程預約與安排",
      "canonical_question": "中文原文",
      "canonical_question_translations": {
        "en": "",
        "th": ""
      },
      "answer_template": {
        "text": "中文答案",
        "postscript": "補充說明",
        "links_inline": false,
        "text_translations": {
          "en": "",
          "th": ""
        },
        "postscript_translations": {
          "en": "",
          "th": ""
        }
      },
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "translation_status": {
        "zh": { "status": "source", "last_synced_version": 1, "last_updated": "2025-10-28T07:36:14.070Z" },
        "en": { "status": "missing", "last_synced_version": 0, "last_updated": null },
        "th": { "status": "missing", "last_synced_version": 0, "last_updated": null }
      }
    }
  ]
}
```

- 中文原文 (`canonical_question` / `answer_template.text`) 為唯一資料來源。
- `*_translations` 物件存放英文、泰文內容；留空代表尚未翻譯。
- `translation_status` 會在原文更新或翻譯完成時自動維護 `source / complete / pending / outdated` 狀態。

**JSON Schema 驗證**:
```bash
cd scripts
node validate-faq-schema.js
```

**翻譯檢查**:
```bash
cd scripts
node check-faq-translations.js
```

### i18n 翻譯配置

**檔案位置**: `frontend/assets/i18n/{language}.json`

**支援語言**:
- `zh.json` - 中文（繁體）
- `en.json` - 英文
- `th.json` - 泰文

**範例**:
```json
{
  "app_title": "DIY.Ski FAQ 搜尋",
  "search_placeholder": "輸入關鍵字...",
  "search_button": "搜尋"
}
```

---

## 🛠 開發指南

### 專案結構

```
03_FAQ與知識庫/
├── frontend/                    # 前端應用
│   ├── index-intent.html        # 智慧搜尋界面
│   ├── index-llm.html           # LLM 對話界面
│   ├── analytics.html           # 分析儀表板
│   ├── admin.html               # 管理後台（FAQ + 雪場）
│   ├── resort-admin.html        # 雪場管理界面
│   ├── test-page.html           # 自動化測試頁面
│   ├── lib/                     # JavaScript 庫
│   │   ├── faq-engine.js        # FAQ 搜尋引擎
│   │   ├── i18n.js              # 多語言支援
│   │   ├── fuse.min.js          # 模糊搜尋
│   │   ├── purify.min.js        # XSS 防護
│   │   └── dayjs.min.js         # 日期處理
│   └── assets/i18n/             # 翻譯檔案
│       ├── zh.json
│       ├── en.json
│       └── th.json
├── backend/                     # 後端 API
│   ├── src/
│   │   ├── server.js            # Express 伺服器
│   │   ├── routes/              # API 路由
│   │   │   ├── faq.js
│   │   │   ├── intent.js
│   │   │   ├── llm.js
│   │   │   ├── analytics.js
│   │   │   ├── crm.js
│   │   │   └── resort-admin.js  # 雪場管理 API
│   │   ├── services/            # 業務邏輯
│   │   │   ├── intent-detector.js
│   │   │   ├── slot-extractor.js
│   │   │   ├── resort-service.js   # 雪場服務
│   │   │   ├── llm/
│   │   │   │   ├── llm-manager.js
│   │   │   │   ├── rag-engine.js
│   │   │   │   └── providers/
│   │   │   │       ├── claude-provider.js
│   │   │   │       ├── openai-provider.js
│   │   │   │       ├── gemini-provider.js
│   │   │   │       └── ollama-provider.js
│   │   │   ├── analytics-service.js
│   │   │   └── crm-service.js
│   │   ├── middleware/          # Express 中介層
│   │   │   ├── error-handler.js
│   │   │   └── logger.js
│   │   └── utils/               # 工具函式
│   │       └── response-formatter.js
│   ├── package.json
│   └── .env
├── data/                        # 資料檔案
│   ├── faq_kb.json              # FAQ 知識庫 (71 items)
│   ├── resort_kb.json           # 雪場資料庫 (42 resorts)
│   ├── analytics.db             # SQLite 分析資料庫
│   └── customer_inquiries.jsonl # CRM 日誌
├── faq/                         # FAQ 原始資料
│   └── resorts/                 # 雪場 YAML 資料 (42 files)
│       ├── niigata/             # 新潟雪場 (16)
│       ├── nagano/              # 長野雪場 (11)
│       ├── hokkaido/            # 北海道雪場 (4)
│       └── ...                  # 其他區域
├── specs/                       # 規格文檔
│   └── 001-faq-system-upgrade/
│       ├── spec.md              # 功能規格
│       ├── plan.md              # 技術計劃
│       ├── research.md          # 技術研究
│       ├── data-model.md        # 資料模型
│       └── contracts/
│           ├── api-spec.yaml    # OpenAPI 3.0
│           └── faq-schema.json  # JSON Schema
├── scripts/                     # 工具腳本
│   ├── validate-faq-schema.js   # FAQ Schema 驗證
│   └── convert-resorts-to-json.js  # YAML → JSON 轉換
├── Makefile                     # 便捷命令
├── README.md                    # 本文檔
├── TEST_REPORT.md               # 測試報告
└── CLAUDE.md                    # Claude Code 指南
```

> **新增元件**
> - `backend/src/middleware/api-key.js`：API Key 驗證中介層
> - `backend/src/routes/content.js`：Markdown 內容交付端點 (`GET /api/v1/content/markdown/:slug`)
> - `backend/src/routes/events.js`：使用者事件追蹤端點 (`POST /api/v1/events/track`)
> - `backend/src/services/event-tracker.js`：事件寫入 JSONL 的服務
> - `apps/analytics-worker/`：產生 FAQ insights 匯總檔 (`data/analytics_summary.json`)

### Analytics Worker

1. 進入 `apps/analytics-worker`
2. 執行 `npm install`
3. 跑批次 `npm run start`

批次會讀取 `EVENT_LOG_PATH`（預設 `data/events.jsonl`）與 `SQLITE_DB_PATH`，輸出 `FAQ_INSIGHTS_PATH`（預設 `data/analytics_summary.json`）。部署時可由排程（如 GitHub Actions / Cloud Scheduler）定期呼叫。

### 新增 FAQ

1. 編輯 `data/faq_kb.json`
2. 添加新的 FAQ 項目:

```json
{
  "faq_id": "faq.{category}.{number}",
  "canonical_question": "問題內容",
  "answer": "答案內容",
  "section": "分類名稱",
  "intent": "INTENT_TYPE",
  "keywords": ["關鍵字1", "關鍵字2"],
  "related_faqs": ["相關FAQ ID"]
}
```

3. 驗證 JSON 格式:

```bash
cd scripts
node validate-faq-schema.js
```

4. 重啟後端服務

### 新增 Intent 類型

1. 編輯 `backend/src/services/intent-detector.js`
2. 在 `INTENT_RULES` 新增規則:

```javascript
{
  intent: 'NEW_INTENT',
  keywords: ['關鍵字1', '關鍵字2'],
  patterns: [/正則表達式1/, /正則表達式2/],
  weight: 10
}
```

3. 更新 FAQ 知識庫中相關項目的 `intent` 欄位
4. 重啟後端服務

### 新增 LLM 提供者

1. 建立新的 Provider 檔案: `backend/src/services/llm/providers/new-provider.js`

```javascript
class NewProvider {
  constructor(config) {
    this.config = config;
    // Initialize SDK
  }

  async generateText(prompt, options = {}) {
    // Implement generation logic
    return {
      text: 'Generated text',
      usage: {
        prompt_tokens: 100,
        completion_tokens: 50,
        total_tokens: 150
      }
    };
  }

  async generateStream(prompt, onChunk, options = {}) {
    // Implement streaming logic
  }

  getMetadata() {
    return {
      name: 'new-provider',
      models: ['model-1', 'model-2'],
      capabilities: {
        streaming: true,
        multimodal: false
      }
    };
  }
}

module.exports = NewProvider;
```

2. 註冊 Provider: 編輯 `backend/src/services/llm/llm-manager.js`

```javascript
const NewProvider = require('./providers/new-provider');

// In constructor
this.providers.set('new-provider', new NewProvider(config.newProvider));
```

3. 更新 `.env`:

```env
NEW_PROVIDER_API_KEY=your_api_key
NEW_PROVIDER_MODEL=model-name
```

### 執行測試

**自動化測試頁面**:
```bash
open http://localhost:8080/test-page.html
```

**手動 API 測試**:
```bash
# FAQ 搜尋
curl -X POST http://localhost:3000/api/v1/faq/search \
  -H "Content-Type: application/json" \
  -d '{"query":"教練","limit":3}'

# Intent 偵測
curl -X POST http://localhost:3000/api/v1/intent/detect \
  -H "Content-Type: application/json" \
  -d '{"query":"2月15日去野澤"}'

# LLM 對話
curl -X POST http://localhost:3000/api/v1/llm/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"小朋友幾歲可以學滑雪？","provider":"gemini"}'
```

### 調試技巧

**前端調試**:
1. 開啟瀏覽器 DevTools (F12)
2. 查看 Console 輸出的 `[Init]`, `[FAQ Engine]`, `[Sidebar]` 等日誌
3. 使用 Network 面板檢查 API 請求

**後端調試**:
1. 查看終端機輸出的日誌
2. 使用 `console.log` 添加調試訊息
3. 檢查 `data/analytics.db` 和 `data/customer_inquiries.jsonl`

**常用命令**:
```bash
# 查看後端日誌 (即時)
cd backend
npm start

# 查看 SQLite 資料庫
sqlite3 ../data/analytics.db
> SELECT * FROM llm_usage ORDER BY timestamp DESC LIMIT 10;

# 查看 JSONL 日誌
tail -f ../data/customer_inquiries.jsonl

# 檢查前端伺服器
lsof -i :8080

# 檢查後端伺服器
lsof -i :3000
```

---

## ❓ 常見問題

### Q1: 啟動後端時顯示 "LLM 服務尚未初始化"

**原因**: 缺少 LLM API Key

**解決方法**:
1. 檢查 `backend/.env` 是否存在
2. 至少設定一個 LLM Provider 的 API Key (建議使用 Gemini)
3. 重啟後端服務

```env
GEMINI_API_KEY=your_api_key_here
```

### Q2: 前端無法連接後端 API

**原因**: CORS 錯誤或後端未啟動

**解決方法**:
1. 確認後端服務正在運行: `curl http://localhost:3000/health`
2. 檢查 CORS 設定: `backend/src/server.js`
3. 確認前端使用正確的 API URL (`http://localhost:3000`)

### Q3: 側邊欄分類沒有顯示

**原因**: i18n 初始化失敗

**解決方法**:
1. 檢查 `frontend/assets/i18n/zh.json` 是否存在
2. 打開瀏覽器 Console 查看錯誤訊息
3. 確認已套用最新的修復 (參考 TEST_REPORT.md)

### Q4: LLM 回應速度很慢

**原因**: 模型選擇或網路延遲

**解決方法**:
1. 使用 Gemini (最快): `gemini-2.5-flash`
2. 檢查網路連線
3. 考慮使用本地 Ollama 模型

### Q5: Analytics 儀表板沒有資料

**原因**: 資料庫尚未建立或沒有請求記錄

**解決方法**:
1. 執行幾次 LLM 請求來生成資料
2. 檢查 `data/analytics.db` 是否存在
3. 查看資料庫內容:
   ```bash
   sqlite3 data/analytics.db "SELECT COUNT(*) FROM llm_usage;"
   ```

### Q6: 如何新增自訂 FAQ？

**步驟**:
1. 編輯 `data/faq_kb.json`
2. 按照現有格式添加新項目
3. 執行驗證: `node scripts/validate-faq-schema.js`
4. 重啟後端: `cd backend && npm start`

### Q7: 如何切換 LLM 提供者？

**方法 1: 修改環境變數**
```env
DEFAULT_LLM_PROVIDER=claude  # 或 openai, gemini, ollama
```

**方法 2: API 請求時指定**
```json
{
  "query": "...",
  "provider": "claude"
}
```

### Q8: 如何匯出 CRM 資料？

**方法 1: API 匯出**
```bash
curl http://localhost:3000/api/v1/crm/export > inquiries.csv
```

**方法 2: 直接讀取 JSONL**
```bash
cat data/customer_inquiries.jsonl | jq '.' > inquiries_formatted.json
```

---

## 📊 測試報告

完整的測試報告請參考: [TEST_REPORT.md](./TEST_REPORT.md)

**測試摘要**:
- ✅ 通過: 42 項
- ⚠️ 警告: 2 項
- ❌ 失敗: 0 項

**測試涵蓋**:
1. 前端界面測試 (4 個頁面)
2. 後端 API 測試 (20+ 端點)
3. 多語言支援測試 (zh, en, th)
4. FAQ 資料驗證 (71 items)
5. Analytics & Monitoring
6. CRM 整合
7. LLM 整合 (RAG)
8. 效能測試
9. 安全性測試

---

## 📝 更新日誌

### v1.1.0 (2025-10-15)

**新功能**:
- ✅ **雪場資料整合** - 42 個日本雪場完整資料庫
- ✅ **雪場管理後台** - resort-admin.html 管理界面
- ✅ **RESORT_INFO Intent** - 新增雪場資訊查詢意圖
- ✅ **RAG 雪場整合** - 學生可直接查詢雪場資訊
- ✅ **YAML → JSON 轉換** - 自動化雪場資料轉換工具

**修復**:
- ✅ **Intent Detection 修復** - 修復所有查詢的 intent_detected 為 null 的問題
- ✅ **Slot Extraction 正常運作** - 正確擷取 resort、date、people、board_type
- ✅ **llm.js 整合** - IntentDetector 和 SlotExtractor 正確整合到 LLM API

**改進**:
- ✅ Resort 搜尋閾值優化（0.4 vs 0.6）
- ✅ 多語言雪場名稱搜尋（zh/en/ja）
- ✅ CRM 日誌記錄 intentConfidence
- ✅ Admin 界面新增雪場管理卡片

**資料**:
- 📊 42 個雪場（niigata: 16, nagano: 11, hokkaido: 4）
- 📊 13 種 Intent 類型（新增 RESORT_INFO）
- 📊 71 FAQ items + 42 resort items

### v1.0.0 (2025-10-14)

**新功能**:
- ✅ 完整的 FAQ 搜尋系統 (71 FAQ items)
- ✅ Intent 偵測與 Slot 擷取
- ✅ LLM 智慧對話 (支援 4 種提供者)
- ✅ RAG (Retrieval-Augmented Generation)
- ✅ Analytics 儀表板 (繁體中文)
- ✅ CRM 整合 (JSONL 日誌)
- ✅ 多語言支援 (zh, en, th)
- ✅ Alert 系統 (成本、請求率、錯誤率監控)

**修復**:
- ✅ 修復 index-intent.html 側邊欄不顯示問題
- ✅ 修復 CRM logging 中 `costUsd is not defined` 錯誤
- ✅ 改善 i18n 初始化錯誤處理

**文檔**:
- ✅ README.md (使用指南)
- ✅ TEST_REPORT.md (測試報告)
- ✅ CLAUDE.md (開發指南)
- ✅ API Specification (OpenAPI 3.0)

---

## 🤝 貢獻指南

歡迎貢獻！請遵循以下步驟：

1. Fork 本專案
2. 建立 Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit 變更 (`git commit -m 'Add some AmazingFeature'`)
4. Push 到 Branch (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

**代碼風格**:
- 遵循 `.specify/memory/constitution.md` 定義的 6 大原則
- Frontend: 使用 ES6+, 函數長度 ≤ 50 行
- Backend: 使用 async/await, 統一錯誤處理格式
- 添加適當的註解與 JSDoc

---

## 📄 授權

本專案為 DIY.Ski 內部專案，版權所有。

---

## 📧 聯絡方式

**專案維護**: DIY.Ski Tech Team
**Email**: tech@diy.ski
**網站**: https://diy.ski

---

## 🙏 致謝

**技術棧**:
- [Fuse.js](https://fusejs.io/) - 模糊搜尋引擎
- [Express](https://expressjs.com/) - Node.js Web 框架
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - SQLite 綁定
- [Anthropic Claude](https://www.anthropic.com/) - LLM API
- [OpenAI](https://openai.com/) - LLM API
- [Google Gemini](https://ai.google.dev/) - LLM API
- [Chart.js](https://www.chartjs.org/) - 圖表庫
- [DOMPurify](https://github.com/cure53/DOMPurify) - XSS 防護
- [Day.js](https://day.js.org/) - 日期處理

**設計原則**:
- 基於 Linus Torvalds 的設計哲學 (簡潔、資料驅動、消除特殊情況)
- 參考 `.specify/memory/constitution.md` 的 6 大核心原則

---

**祝使用愉快！如有問題請參考本文檔或聯繫開發團隊。** 🎿
