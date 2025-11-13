# Implementation Plan: FAQ 系統全面升級

**Branch**: `001-faq-system-upgrade` | **Date**: 2025-10-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-faq-system-upgrade/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

本專案將現有的 FAQ 知識庫系統（faq_kb.phase0a.json）升級為完整的生產級客戶服務工具，採用**混合架構**：前端使用 Fuse.js 實現快速搜尋（<100ms），後端 API 提供 intent detection、智能推薦（規則引擎 + 可選 LLM 增強）、analytics 和 CRM 整合。系統支援中英泰三語，獨立部署為 faq-search.html（公開訪問）和 tagger.html（CRM 內部），透過共用 JavaScript 模組和 RESTful API 互通。

## Technical Context

**Language/Version**:
- 前端: JavaScript ES6+ (原生，無需轉譯器)
- 後端: Node.js 18+ (LTS)

**Primary Dependencies**:
- 前端: Fuse.js 7.0+ (模糊搜尋，9KB), DOMPurify 3.0+ (XSS 防護，20KB), Day.js 1.11+ (日期處理，2KB)
- 後端: Express 4.18+ (REST API), better-sqlite3 3.9+ (輕量資料庫)
- 開發工具: esbuild (打包，可選), prettier (格式化)

**Storage**:
- FAQ 資料: faq_kb.phase0a.json (版本控制於 Git)
- Analytics: SQLite (analytics.db) 或 JSON 文件 (analytics.jsonl)
- CRM 整合: customer_inquiries.jsonl (JSONL append-only log)

**Testing**:
- 前端: 原生 JavaScript + assert 模組（單元測試）
- 後端: Node.js assert + supertest (API 測試)
- 驗證: `make validate` (JSON schema + 連結檢查 + 編碼驗證)
- E2E: Playwright (可選，用於關鍵流程)

**Target Platform**:
- 前端: 現代瀏覽器 (Chrome/Edge 90+, Firefox 88+, Safari 14+)
- 後端: Linux/macOS server (支援 Node.js 18+)
- 響應式設計: 768px (tablet), 1024px (desktop) 斷點

**Project Type**: Web application (frontend + backend split)

**Performance Goals**:
- 搜尋響應時間: P50 <50ms, P95 <100ms
- 頁面首次載入: <2s (3G Fast 網路)
- Intent detection: <200ms (規則引擎), <2s (LLM 模式)
- 資料驗證: <5s (100 個 FAQ)
- 併發支援: 100 同時用戶不降級

**Constraints**:
- 函數長度 ≤50 行 (Constitution 要求)
- 第三方 library 總大小 <100KB (gzipped)
- 不使用重型前端框架 (React/Vue/Angular)
- 搜尋結果 3 次點擊內找到答案 (80% 查詢)
- 必須與現有 CRM tagger.html 共存

**Scale/Scope**:
- 初期 FAQ: ~127 項目
- 預期成長: 300-500 項目 (含雪場介紹)
- 用戶規模: <1000 DAU
- 多語言: 中文（主要）+ 英文 + 泰文（內容需人工翻譯）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. 簡潔優於抽象 (Simplicity Over Abstraction)
- **Pass**: 混合架構清晰分層，前端用 Fuse.js (9KB) 而非引入搜尋框架
- **Pass**: 規則引擎優先於 ML 模型，資料驅動而非演算法複雜
- **Pass**: 分離 faq-search.html 和 tagger.html 而非單一巨型文件
- **註**: LLM 增強層為可選，不增加必要複雜度

### ✅ II. 資料驅動設計 (Data-Driven Design)
- **Pass**: FAQ 行為完全由 faq_kb.phase0a.json 定義
- **Pass**: Intent detection 基於 utterance_patterns 和關鍵字字典
- **Pass**: Slot extraction 使用明確 regex patterns (可配置)
- **Pass**: 新增 FAQ 無需修改程式碼

### ✅ III. 多語言支援優先 (Multi-Language Support Priority)
- **Pass**: FAQ Item 資料結構包含 canonical_question_en/th 欄位
- **Pass**: 搜尋支援多語言 utterance_patterns
- **Pass**: answer_template 包含 text/text_en/text_th
- **註**: 日文欄位保留但內容翻譯為未來功能

### ✅ IV. 效能為必需品 (Performance is Non-Negotiable)
- **Pass**: 搜尋目標 <100ms (P95) 使用 Fuse.js 索引
- **Pass**: 頁面載入 <2s 使用輕量 dependencies
- **Pass**: 避免不必要請求（localStorage 緩存搜尋歷史）
- **註**: LLM 模式延遲較高但為 fallback，不影響主流程

### ✅ V. 測試與驗證 (Testing & Validation)
- **Pass**: `make validate` 整合 JSON schema + 連結 + 編碼檢查
- **Pass**: Intent detection 測試集驗證準確率 >85%
- **Pass**: 每個模組獨立可測試
- **註**: 破壞性變更需向後相容測試（驗證器檢測）

### ✅ VI. CRM 系統整合 (CRM Integration)
- **Pass**: FAQ 使用記錄到 customer_inquiries.jsonl
- **Pass**: 自動標籤生成基於 crm_tags + intent + slots
- **Pass**: 共用 faq-engine.js 模組確保邏輯一致
- **Pass**: 與 tagger.html 透過 API 互通不破壞現有功能

## Project Structure

### Documentation (this feature)

```
specs/001-faq-system-upgrade/
├── spec.md              # 功能規格（已完成，含 Clarifications）
├── plan.md              # 本文件 - 技術實作計劃
├── research.md          # Phase 0 輸出 - 技術研究與決策
├── data-model.md        # Phase 1 輸出 - 資料模型定義
├── quickstart.md        # Phase 1 輸出 - 開發環境快速開始
├── contracts/           # Phase 1 輸出 - API 合約
│   ├── api-spec.yaml    # OpenAPI 3.0 規格
│   └── faq-schema.json  # FAQ JSON Schema
└── tasks.md             # Phase 2 輸出 (/speckit.tasks 生成，未來)
```

### Source Code (repository root)

採用 **Option 2: Web application** 結構（前後端分離）

```
03_FAQ與知識庫/
├── frontend/                        # 前端應用（靜態文件）
│   ├── faq-search.html              # FAQ 搜尋主頁面（公開）
│   ├── faq-search.css               # 主要樣式（響應式）
│   ├── faq-search.js                # 前端邏輯（搜尋、UI、多語言）
│   ├── lib/
│   │   ├── faq-engine.js            # 核心引擎（共用模組）
│   │   ├── fuse.min.js              # Fuse.js (CDN 或本地)
│   │   ├── dompurify.min.js         # DOMPurify
│   │   └── dayjs.min.js             # Day.js
│   └── assets/
│       ├── i18n/                    # 多語言文件
│       │   ├── zh.json              # 中文 UI 文案
│       │   ├── en.json              # 英文 UI 文案
│       │   └── th.json              # 泰文 UI 文案
│       └── icons/                   # 圖示資源（可選）
│
├── backend/                         # 後端 API
│   ├── src/
│   │   ├── server.js                # Express 入口
│   │   ├── config.js                # 配置（環境變數）
│   │   ├── routes/
│   │   │   ├── faq.js               # FAQ 相關 endpoint
│   │   │   ├── intent.js            # Intent detection API
│   │   │   ├── analytics.js         # Analytics API
│   │   │   └── crm.js               # CRM 整合 API
│   │   ├── services/
│   │   │   ├── intent-detector.js   # 規則引擎 + LLM wrapper
│   │   │   ├── slot-extractor.js    # Slot extraction 邏輯
│   │   │   ├── faq-matcher.js       # FAQ 匹配演算法
│   │   │   ├── llm-client.js        # LLM API 客戶端（可選）
│   │   │   └── analytics-logger.js  # Analytics 記錄
│   │   ├── models/
│   │   │   ├── faq-loader.js        # 載入 faq_kb.phase0a.json
│   │   │   └── analytics-db.js      # SQLite 操作
│   │   └── utils/
│   │       ├── validator.js         # 輸入驗證
│   │       └── sanitizer.js         # XSS 防護
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── intent-detector.test.js
│   │   │   ├── slot-extractor.test.js
│   │   │   └── faq-matcher.test.js
│   │   ├── integration/
│   │   │   └── api.test.js          # API 端到端測試
│   │   └── fixtures/
│   │       └── test-faqs.json       # 測試資料
│   ├── package.json
│   └── .env.example                 # 環境變數範例
│
├── shared/                          # 共用模組（前後端共用）
│   └── faq-engine.js                # 複製到 frontend/lib/
│
├── data/                            # 資料文件
│   ├── faq_kb.phase0a.json                  # FAQ 知識庫（主要）
│   ├── analytics.db                 # SQLite 資料庫（生成）
│   └── customer_inquiries.jsonl     # CRM 整合日誌（append）
│
├── scripts/                         # 工具腳本
│   ├── validate-faq.js              # JSON schema 驗證
│   ├── check-links.js               # 連結有效性檢查
│   ├── check-encoding.js            # UTF-8 編碼檢查
│   └── generate-test-cases.js       # 生成 intent detection 測試集
│
├── 06_測試與開發工具/
│   ├── Makefile                     # 整合驗證命令
│   │   # make validate - 完整驗證
│   │   # make validate-links - 僅連結
│   │   # make test - 執行所有測試
│   │   # make dev - 啟動開發伺服器
│   └── faq-schema.json              # JSON Schema 定義
│
├── CRM test/                        # 現有 CRM 系統
│   └── tagger.html                  # 保持現有（透過 API 整合）
│
├── .gitignore
├── README.md                        # 專案說明
└── package.json                     # 根目錄 workspace 配置（可選）
```

**Structure Decision**:

選擇 **Web application (frontend + backend split)** 基於以下理由：

1. **關注點分離**: FAQ 搜尋（公開）和 CRM tagger（內部）有不同的訪問權限需求
2. **獨立部署**: 前端可部署為靜態網站（如 GitHub Pages），後端部署為 API 服務
3. **共用邏輯**: `faq-engine.js` 複製到前端 lib/，確保前後端邏輯一致
4. **擴展性**: 未來可輕鬆增加移動端或其他客戶端，共用後端 API
5. **符合 Constitution**: 避免單一巨型 HTML 文件，保持模組化

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**無需填寫** - 所有 Constitution 檢查項目均通過，無違規需要辯護。

## Phase 0: Research & Technical Decisions

*此部分將在 research.md 中詳細說明，以下為摘要*

### 已確認的技術決策（來自 Clarifications）

1. **搜尋架構**: 混合方案
   - 前端 Fuse.js（現階段）
   - 後端預留搜尋索引接口（未來 300-500+ FAQ 時切換）

2. **Intent Detection**: 規則引擎 + LLM 增強
   - 主要：關鍵字匹配 + 模糊匹配 + 權重計算
   - 增強：信心 <75% 時可選呼叫 GPT-4/Claude

3. **Analytics 儲存**: SQLite/JSON 文件
   - 輕量級本地儲存
   - 支援跨用戶分析和報表生成

4. **部署方式**: 分離應用
   - faq-search.html（公開）
   - tagger.html（CRM 內部，保持現有）
   - 透過 API + 共用 JS 模組整合

5. **移動端**: 響應式網頁
   - 不實作 PWA/離線功能
   - 斷點 768px、1024px

### 需要研究的技術細節

以下項目將在 `research.md` 中深入研究：

1. **Fuse.js 配置最佳化**
   - 中文分詞策略（是否需要 jieba.js？）
   - threshold、distance、ignoreLocation 參數調優
   - 多語言索引建立方式

2. **規則引擎實作細節**
   - 權重計算公式（Intent 40% + Keyword 30% + Slot 20% + History 10%）
   - Slot extraction regex patterns（日期、人數、雪場名稱）
   - Fallback 策略設計

3. **LLM 整合方案**
   - API 選擇（OpenAI GPT-4 vs Anthropic Claude vs 自架）
   - Prompt engineering 策略（RAG 如何使用 faq_kb.phase0a.json）
   - 成本控制機制（rate limiting、快取策略）
   - 錯誤處理（API timeout、quota exceeded）

4. **SQLite vs JSONL 選擇**
   - Analytics 資料查詢需求分析
   - 寫入效能比較（append vs insert）
   - 備份和維護便利性

5. **API 設計模式**
   - RESTful 風格 vs GraphQL（選擇 REST 更簡單）
   - 版本控制策略（/api/v1/ prefix）
   - 錯誤回應格式標準化

6. **測試策略**
   - Intent detection 測試集建立（手動標註 vs 半自動）
   - 模糊匹配準確率測量方法
   - E2E 測試範圍界定（關鍵路徑 vs 全面覆蓋）

7. **多語言實作**
   - i18n 文件結構（JSON vs JS module）
   - 語言切換機制（URL param vs localStorage）
   - 缺失翻譯 fallback 策略（顯示中文 vs 顯示 key）

8. **效能優化策略**
   - Fuse.js 索引預建立 vs 即時建立
   - localStorage 緩存策略（TTL、LRU）
   - API 回應壓縮（gzip）

## Phase 1: Design Artifacts

*此部分將在 Phase 1 產出以下文件*

### data-model.md
定義以下實體的詳細資料模型：
- FAQ Item（多語言欄位完整定義）
- Search Query
- Validation Report
- FAQ Usage Log
- Recommendation Context
- Analytics Event

### contracts/api-spec.yaml
OpenAPI 3.0 規格，定義以下 endpoint：
- `POST /api/v1/faq/search` - 前端搜尋
- `POST /api/v1/intent/detect` - Intent detection
- `POST /api/v1/recommend` - 智能推薦
- `POST /api/v1/analytics/log` - 記錄事件
- `POST /api/v1/crm/log-usage` - CRM 整合
- `GET /api/v1/faq/:id` - 取得單一 FAQ
- `GET /api/v1/analytics/report` - 生成報表

### contracts/faq-schema.json
JSON Schema 定義 faq_kb.phase0a.json 結構，用於 `make validate`

### quickstart.md
開發環境設置指南：
- 前端：直接開啟 faq-search.html 或使用 `python3 -m http.server`
- 後端：`cd backend && npm install && npm run dev`
- 驗證：`make validate`
- 測試：`make test`

## Implementation Phases

### Phase 2: Task Breakdown (由 /speckit.tasks 生成)

將在 `tasks.md` 中包含：
1. 開發環境設置與依賴安裝
2. 前端搜尋介面實作（P1）
3. 規則引擎 Intent Detection（P1）
4. 後端 API 框架（P2）
5. Analytics 系統（P2）
6. CRM 整合（P3）
7. 多語言支援（P2）
8. 測試與驗證（貫穿所有階段）
9. 文檔撰寫

### Phase 3: Implementation (由 /speckit.implement 執行)

執行 tasks.md 中的所有任務，按優先級（P1 → P2 → P3）進行。

## Risk & Mitigation

### 技術風險

1. **Fuse.js 中文分詞效果不佳**
   - **風險**: 中文搜尋準確率 <80%
   - **緩解**: 預先測試，必要時引入 jieba.js（輕量中文分詞）
   - **Plan B**: 遷移到後端使用專業搜尋引擎

2. **LLM API 成本超出預算**
   - **風險**: 高流量導致 API 費用過高
   - **緩解**: 規則引擎優先，只有信心 <75% 才呼叫 LLM；設置每日 quota
   - **Plan B**: 完全使用規則引擎，LLM 作為管理員工具

3. **多語言內容翻譯工作量大**
   - **風險**: 英文/泰文內容翻譯延遲上線
   - **緩解**: 先上線中文版，逐步補充翻譯；使用 LLM 輔助翻譯後人工校對
   - **Plan B**: 僅提供中文，其他語言作為未來 iteration

4. **現有 CRM tagger.html 整合複雜度**
   - **風險**: 破壞現有功能或資料格式不相容
   - **緩解**: 充分測試 JSONL 寫入格式；保持 API backward compatible
   - **Plan B**: 暫時不整合，獨立運作 FAQ 系統

### 非技術風險

1. **FAQ 內容不足以訓練規則引擎**
   - **風險**: Intent detection 準確率 <85%
   - **緩解**: 分析現有 CRM 客戶詢問記錄，補充 utterance_patterns
   - **Plan B**: 人工標註 100-200 筆真實查詢作為測試集

2. **用戶習慣人工客服，不使用 FAQ**
   - **風險**: 系統使用率 <20%
   - **緩解**: 在客服回覆中主動推薦相關 FAQ；設計簡潔的導覽流程
   - **Plan B**: 作為客服內部工具，提升客服效率

## Success Criteria

### 技術指標（可測量）
- ✅ 搜尋響應時間 P95 <100ms
- ✅ Intent detection 準確率 >85%（測試集驗證）
- ✅ `make validate` 100% 通過（生產環境）
- ✅ 單元測試覆蓋率 >80%
- ✅ 前端 dependencies 總大小 <100KB (gzipped)

### 功能指標（可演示）
- ✅ 支援中英泰三語搜尋和顯示
- ✅ 首次預約導覽流程完整可用
- ✅ 客服人員 5 秒內找到正確 FAQ
- ✅ CRM 自動標籤生成準確率 >90%
- ✅ 零結果查詢 <15%

### 業務指標（需部署後追蹤）
- ⏳ FAQ 使用率 >60%（客服回答中）
- ⏳ 自助解決率 >40%（客戶端）
- ⏳ 客服平均回應時間降低 >20%

## Next Steps

1. **執行 Phase 0**: 撰寫 `research.md` 深入研究上述技術細節
2. **執行 Phase 1**:
   - 生成 `data-model.md`
   - 生成 `contracts/api-spec.yaml` 和 `faq-schema.json`
   - 撰寫 `quickstart.md`
   - 更新 CLAUDE.md（agent context）
3. **執行 Phase 2**: 使用 `/speckit.tasks` 生成任務分解
4. **執行 Phase 3**: 使用 `/speckit.implement` 開始實作

---

**Plan Version**: 1.0.0
**Last Updated**: 2025-10-13
**Status**: ✅ Phase 0 Ready - 可進入研究階段
