# 03_FAQ與知識庫 Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-13

## Active Technologies

### 001-faq-system-upgrade
**Status**: Phase 1 完成（設計階段）
**Description**: FAQ 系統升級 - 互動式搜尋、Intent 偵測、多語言支援、CRM 整合

**Technology Stack**:
- **Frontend**: JavaScript ES6+, Fuse.js 7.0+, DOMPurify 3.0+, Day.js 1.11+
- **Backend**: Node.js 18+ LTS, Express 4.18+, better-sqlite3 3.9+
- **Database**: SQLite (analytics), JSONL (CRM logs)
- **LLM**: Anthropic Claude 3.5 Sonnet (optional enhancement)
- **Languages**: 中文（主要）、英文、泰文

**Key Documents**:
- [Constitution](./.specify/memory/constitution.md) - 專案憲章（6 大核心原則）
- [Specification](./specs/001-faq-system-upgrade/spec.md) - 功能規格（6 個 User Stories）
- [Technical Plan](./specs/001-faq-system-upgrade/plan.md) - 技術實作計劃（8 個 Research Topics）
- [Research](./specs/001-faq-system-upgrade/research.md) - 技術研究文檔（8 個主題深入分析）
- [Data Model](./specs/001-faq-system-upgrade/data-model.md) - 資料模型定義
- [API Spec](./specs/001-faq-system-upgrade/contracts/api-spec.yaml) - OpenAPI 3.0 規格（7 個端點）
- [FAQ Schema](./specs/001-faq-system-upgrade/contracts/faq-schema.json) - JSON Schema 驗證規範
- [Quick Start](./specs/001-faq-system-upgrade/quickstart.md) - 快速開始指南

## Project Structure
```
03_FAQ與知識庫/
├── .specify/                    # Spec-kit 配置與腳本
│   ├── memory/
│   │   └── constitution.md      # 專案憲章（6 大原則）
│   ├── templates/               # 規格模板
│   └── scripts/                 # 自動化腳本
├── specs/                       # 功能規格文檔
│   └── 001-faq-system-upgrade/
│       ├── spec.md              # 功能規格（6 User Stories, 68 Requirements）
│       ├── plan.md              # 技術計劃（416 行）
│       ├── research.md          # 研究文檔（8 Topics）
│       ├── data-model.md        # 資料模型（7 Models）
│       ├── quickstart.md        # 快速開始（7 章節）
│       └── contracts/
│           ├── api-spec.yaml    # OpenAPI 3.0（7 端點）
│           └── faq-schema.json  # JSON Schema
├── frontend/                    # 前端應用
│   ├── faq-search.html          # FAQ 搜尋界面
│   ├── lib/                     # 第三方庫
│   │   ├── fuse.min.js          # 模糊搜尋（9KB）
│   │   ├── dompurify.min.js     # XSS 防護（20KB）
│   │   └── dayjs.min.js         # 日期處理（2KB）
│   └── assets/i18n/             # 多語言檔案
│       ├── zh.json              # 中文（主要）
│       ├── en.json              # 英文
│       └── th.json              # 泰文
├── backend/                     # 後端 API
│   ├── src/
│   │   ├── server.js            # Express 伺服器
│   │   ├── routes/              # API 路由（7 個端點）
│   │   │   ├── faq.js           # FAQ 搜尋與查詢
│   │   │   ├── intent.js        # Intent 偵測與 Slot 擷取
│   │   │   ├── analytics.js     # 搜尋分析與統計
│   │   │   └── crm.js           # CRM 整合
│   │   ├── services/            # 業務邏輯
│   │   │   ├── intent-detector.js  # Rule Engine
│   │   │   ├── slot-extractor.js   # Regex-based extraction
│   │   │   └── llm-client.js       # Claude API 客戶端
│   │   └── middleware/          # Express 中介層
│   └── tests/                   # 後端測試
├── data/                        # 資料檔案
│   ├── faq_kb.json              # FAQ 知識庫（71+ 項目）
│   ├── analytics.db             # SQLite 分析資料庫
│   └── customer_inquiries.jsonl # CRM 整合日誌
├── scripts/                     # 工具腳本
│   └── validate-faq-schema.js   # JSON Schema 驗證
└── Makefile                     # 便捷命令
```

## Commands

### Development

```bash
# 驗證 FAQ 資料格式
make validate

# 啟動前端伺服器（port 8080）
make start-frontend
# 訪問: http://localhost:8080/faq-search.html

# 啟動後端伺服器（port 3000）
make start-backend
# API: http://localhost:3000/api/v1

# 執行測試
make test
```

### Backend API

```bash
# 健康檢查
curl http://localhost:3000/health

# 搜尋 FAQ
curl -X POST http://localhost:3000/api/v1/faq/search \
  -H "Content-Type: application/json" \
  -d '{"query":"教練","limit":5}'

# Intent 偵測
curl -X POST http://localhost:3000/api/v1/intent/detect \
  -H "Content-Type: application/json" \
  -d '{"query":"2月15日去野澤，2大1小"}'

# Slot 擷取
curl -X POST http://localhost:3000/api/v1/intent/extract-slots \
  -H "Content-Type: application/json" \
  -d '{"query":"去野澤要準備什麼裝備"}'

# 取得分析統計
curl http://localhost:3000/api/v1/analytics/stats?start_date=2025-01-01
```

### Data Management

```bash
# 驗證 FAQ Schema
cd scripts && node validate-faq-schema.js

# 查看 SQLite 資料庫
sqlite3 data/analytics.db "SELECT * FROM search_queries LIMIT 10;"

# 查看 JSONL 日誌
tail -n 20 data/customer_inquiries.jsonl | jq '.'
```

## Code Style

### Constitution 核心原則

遵循 `.specify/memory/constitution.md` 定義的 6 大原則：

1. **簡潔優於抽象** - Avoid over-engineering, data structures over complex algorithms
2. **資料驅動設計** - System behavior defined by structured data (faq_kb.json)
3. **多語言支援優先** - Native UTF-8 support, 中文（主要）> 英文/泰文（次要）
4. **效能為必需品** - Search <100ms, Page load <2s, Intent detection <200ms
5. **測試與驗證** - JSON Schema validation, automated testing (70% unit + 20% integration + 10% E2E)
6. **CRM 系統整合** - Seamless integration with existing tagger.html, shared FAQ engine

### Coding Standards

**Frontend**:
- 使用原生 JavaScript ES6+（無需 React/Vue）
- 函數長度 ≤ 50 行
- 使用 `const`/`let`，避免 `var`
- XSS 防護：使用 DOMPurify 清理使用者輸入

**Backend**:
- Node.js async/await 模式（避免回調地獄）
- RESTful API 設計（/api/v1/resource）
- 錯誤處理：統一格式 `{ success: false, error: { code, message } }`
- Logging：使用 `console.log('[DEBUG] ...')` 格式

**Data**:
- 所有文件使用 UTF-8 編碼
- JSON 使用 2 空格縮排
- 日期格式：ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`)
- ID 格式：`faq.{category}.{序號}`（例如 `faq.gear.001`）

## Recent Changes

- **2025-10-13**: Phase 1 完成 - 設計文檔生成
  - ✅ Constitution (6 principles)
  - ✅ Specification (6 User Stories, 68 Requirements)
  - ✅ Technical Plan (8 Research Topics)
  - ✅ Research Documentation (500+ lines)
  - ✅ Data Model (7 Models)
  - ✅ API Specification (OpenAPI 3.0, 7 endpoints)
  - ✅ FAQ JSON Schema (validation rules)
  - ✅ Quick Start Guide (7 sections)

- **Next Phase**: Phase 2 - Task Breakdown
  - [ ] Execute `/speckit.tasks` to generate tasks.md
  - [ ] Break down implementation into actionable tasks
  - [ ] Assign priorities and dependencies

- **Next Phase**: Phase 3 - Implementation
  - [ ] Frontend: faq-search.html + faq-engine.js
  - [ ] Backend: 7 API endpoints
  - [ ] Services: Intent detection, Slot extraction, LLM client
  - [ ] Database: SQLite schema + JSONL logs
  - [ ] Testing: Unit tests, Integration tests, E2E tests

## Performance Goals

- **Search**: <100ms (P95)
- **Page Load**: <2s (3G network)
- **API Response**: <200ms
- **Intent Detection**: <50ms (Rule Engine), <2s (LLM)
- **Database**: <10ms query time
- **Bundle Size**: <100KB total (gzipped)

## Multi-Language Support

**Language Priority**: 中文（主要） > 英文（次要） > 泰文（次要） > 日文（保留）

**Data Structure**:
- `canonical_question` (中文, required)
- `canonical_question_en` (英文, optional)
- `canonical_question_th` (泰文, optional)
- `canonical_question_ja` (日文, optional)

**Fallback Strategy**:
1. 優先顯示當前語言
2. 若缺少翻譯，顯示中文
3. UI 提示："暫無 {language} 翻譯"

## Integration with Existing CRM

**Current System**: `crm/CRM test/tagger.html` (monolithic frontend)

**Integration Points**:
1. **Shared Module**: `faq-engine.js` (共用搜尋邏輯)
2. **Backend API**: RESTful API for data exchange
3. **JSONL Logs**: `customer_inquiries.jsonl` (append-only)
4. **Tag Rules**: `crm_tag_rules.json` (Intent → CRM tags)

**Deployment Strategy**:
- Separate applications (faq-search.html vs tagger.html)
- No breaking changes to existing tagger.html
- Gradual migration path

<!-- MANUAL ADDITIONS START -->
<!-- Add custom notes here -->
<!-- MANUAL ADDITIONS END -->