# Tasks: FAQ System Upgrade

**Feature ID**: 001-faq-system-upgrade
**Created**: 2025-10-13
**Input**: Design documents from `/specs/001-faq-system-upgrade/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are INCLUDED per spec requirements (SC-005: 70% unit test coverage)

**Organization**: Tasks are grouped by user story (6 stories, P1-P3 priorities) to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US6)
- File paths use project structure: `frontend/`, `backend/src/`, `data/`, `scripts/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure per plan.md

- [ ] T001 Create project directory structure (frontend/, backend/src/, data/, scripts/)
- [ ] T002 Initialize backend Node.js project with package.json and dependencies (Express, better-sqlite3, ajv, dotenv, cors, helmet, compression)
- [ ] T003 [P] Download frontend libraries (Fuse.js 7.0+, DOMPurify 3.0+, Day.js 1.11+) to frontend/lib/
- [ ] T004 [P] Create .gitignore with Node.js and environment exclusions
- [ ] T005 [P] Create backend/.env template with configuration variables
- [ ] T006 [P] Create Makefile with validate, start-frontend, start-backend, test commands
- [ ] T007 [P] Setup ESLint configuration for backend JavaScript (Node.js style)

**Checkpoint**: Project structure initialized, dependencies ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 Create faq_kb.phase0a.json schema validation using contracts/faq-schema.json
- [ ] T009 Create SQLite database schema (search_queries, faq_views tables) in data/analytics.db per data-model.md
- [ ] T010 [P] Implement scripts/validate-faq-schema.js using AJV for JSON Schema validation
- [ ] T011 [P] Create data/customer_inquiries.jsonl file structure for CRM integration
- [ ] T012 Create backend/src/middleware/error-handler.js for unified error responses
- [ ] T013 [P] Create backend/src/middleware/cors.js for CORS configuration
- [ ] T014 [P] Create backend/src/middleware/compression.js for HTTP compression
- [ ] T015 Create backend/src/utils/logger.js for structured logging
- [ ] T016 [P] Create backend/src/utils/response-formatter.js for API response standardization
- [ ] T017 Setup backend/src/server.js with Express app and middleware stack
- [ ] T018 Create backend/src/routes/index.js to aggregate all route modules
- [ ] T019 Implement /health endpoint in backend/src/server.js
- [ ] T020 [P] Create frontend/assets/i18n/ directory with zh.json, en.json, th.json stub files
- [ ] T021 Write unit tests for validation and error handling (backend/tests/unit/)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 基礎 FAQ 搜尋功能 (Priority: P1) 🎯 MVP

**Goal**: 使用者可以輸入關鍵字搜尋 FAQ，並看到相關結果清單

**Independent Test**: 在 frontend/faq-search.html 輸入「教練」，應顯示 5 筆相關 FAQ，信心度 > 70%

### Tests for User Story 1

- [ ] T022 [P] [US1] Create frontend integration test plan for search in quickstart.md Section 6
- [ ] T023 [P] [US1] Write unit tests for Fuse.js configuration in backend/tests/unit/test-search-config.js

### Implementation for User Story 1

- [ ] T024 [US1] Create frontend/faq-search.html with basic HTML structure and search input
- [ ] T025 [P] [US1] Implement frontend/lib/faq-engine.js with Fuse.js initialization (threshold 0.4, ignoreLocation true)
- [ ] T026 [P] [US1] Add CSS styling to frontend/faq-search.html (responsive design, 768px/1024px breakpoints)
- [ ] T027 [US1] Implement search event handler with 300ms debounce in faq-search.html
- [ ] T028 [US1] Implement displayResults() function with confidence score display (1-score)*100
- [ ] T029 [US1] Add loading state and error handling UI in faq-search.html
- [ ] T030 [P] [US1] Create backend/src/routes/faq.js with POST /api/v1/faq/search endpoint
- [ ] T031 [US1] Implement faq_kb.phase0a.json loading logic in backend/src/routes/faq.js
- [ ] T032 [US1] Implement GET /api/v1/faq/:faq_id endpoint in backend/src/routes/faq.js
- [ ] T033 [US1] Add response time measurement (meta.response_time_ms) to faq.js
- [ ] T034 [US1] Test frontend search with actual faq_kb.phase0a.json data (127 items)
- [ ] T035 [US1] Validate search response time < 100ms (P95) per NFR-001

**Checkpoint**: User Story 1 完成 - 基礎搜尋功能可獨立運作

---

## Phase 4: User Story 2 - 多語言搜尋支援 (Priority: P1)

**Goal**: 使用者可以切換界面語言（中文/英文/泰文），搜尋和顯示對應語言的 FAQ

**Independent Test**: 切換到英文界面，輸入 "coach"，應顯示英文 FAQ 回答（若有），否則顯示中文 fallback

### Tests for User Story 2

- [ ] T036 [P] [US2] Write unit tests for language fallback logic in backend/tests/unit/test-i18n.js
- [ ] T037 [P] [US2] Create integration test for language switching in frontend

### Implementation for User Story 2

- [ ] T038 [P] [US2] Populate frontend/assets/i18n/zh.json with UI translations (搜尋、結果、信心度等)
- [ ] T039 [P] [US2] Populate frontend/assets/i18n/en.json with English UI translations
- [ ] T040 [P] [US2] Populate frontend/assets/i18n/th.json with Thai UI translations
- [ ] T041 [US2] Implement language switcher UI component in faq-search.html
- [ ] T042 [US2] Create i18n utility functions (loadLanguage, translateUI) in frontend/lib/faq-engine.js
- [ ] T043 [US2] Implement language fallback logic: current_lang → zh → "暫無翻譯"
- [ ] T044 [US2] Update Fuse.js configuration to search multi-language fields (canonical_question_en, _th)
- [ ] T045 [US2] Update displayResults() to show translated answers based on current language
- [ ] T046 [US2] Store selected language in localStorage for persistence
- [ ] T047 [P] [US2] Update POST /api/v1/faq/search to accept language parameter
- [ ] T048 [US2] Implement language-aware response filtering in backend/src/routes/faq.js
- [ ] T049 [US2] Test all three languages with real FAQ data

**Checkpoint**: User Story 2 完成 - 多語言支援運作正常

---

## Phase 5: User Story 3 - Intent 偵測與自動標籤 (Priority: P2)

**Goal**: 系統可以自動偵測使用者查詢的意圖（ITINERARY, BOOKING, GEAR 等），並推薦相關 FAQ

**Independent Test**: 輸入「2月15日去野澤，2大1小」，應偵測出 ITINERARY intent，信心度 > 75%

### Tests for User Story 3

- [ ] T050 [P] [US3] Create intent detection test dataset (50+ samples) in backend/tests/fixtures/intent-test-data.json
- [ ] T051 [P] [US3] Write unit tests for rule engine scoring in backend/tests/unit/test-intent-detector.js
- [ ] T052 [P] [US3] Write unit tests for slot extraction in backend/tests/unit/test-slot-extractor.js

### Implementation for User Story 3

- [ ] T053 [P] [US3] Create backend/src/services/intent-detector.js with IntentType enum
- [ ] T054 [P] [US3] Create backend/src/services/slot-extractor.js with regex patterns
- [ ] T055 [US3] Implement keyword matching logic (40+ resort names, intent keywords) in intent-detector.js
- [ ] T056 [US3] Implement scoring formula: intent×0.4 + keyword×0.3 + slot×0.2 + ctr×0.1
- [ ] T057 [US3] Implement resort slot extraction (NOZAWA, KARUIZAWA, etc.) in slot-extractor.js
- [ ] T058 [P] [US3] Implement date slot extraction (YYYY-MM-DD, MM/DD, X月X日) in slot-extractor.js
- [ ] T059 [P] [US3] Implement people slot extraction (2大1小 pattern) in slot-extractor.js
- [ ] T060 [US3] Create backend/src/routes/intent.js with POST /api/v1/intent/detect endpoint
- [ ] T061 [US3] Implement POST /api/v1/intent/extract-slots endpoint in intent.js
- [ ] T062 [US3] Integrate intent detection with FAQ search (boost relevant FAQs)
- [ ] T063 [P] [US3] Create CRM tag mapping rules in data/crm_tag_rules.json per data-model.md
- [ ] T064 [US3] Implement POST /api/v1/crm/generate-tags endpoint in backend/src/routes/crm.js
- [ ] T065 [US3] Test intent detection accuracy with test dataset (target: 85%+ accuracy)

**Checkpoint**: User Story 3 完成 - Intent 偵測與標籤生成運作正常

---

## Phase 6: User Story 4 - LLM 增強回答（低信心度情況） (Priority: P2)

**Goal**: 當 Rule Engine 信心度 < 75% 時，系統自動呼叫 Claude API 提供增強回答

**Independent Test**: 輸入複雜查詢「帶3歲小孩第一次去滑雪，應該怎麼準備？」，Rule Engine 低信心度時應觸發 LLM，回傳合成回答

### Tests for User Story 4

- [ ] T066 [P] [US4] Create LLM client mock for testing in backend/tests/mocks/mock-llm-client.js
- [ ] T067 [P] [US4] Write unit tests for LLM fallback logic in backend/tests/unit/test-llm-integration.js
- [ ] T068 [US4] Create LLM cost tracking tests (daily quota, rate limiting)

### Implementation for User Story 4

- [ ] T069 [US4] Create backend/src/services/llm-client.js with Anthropic SDK integration
- [ ] T070 [US4] Implement callLLMEnhancement() function with Claude 3.5 Sonnet API
- [ ] T071 [US4] Create RAG prompt template with FAQ context injection
- [ ] T072 [US4] Implement confidence threshold check (< 75%) in intent-detector.js
- [ ] T073 [US4] Integrate LLM fallback into POST /api/v1/intent/detect endpoint
- [ ] T074 [US4] Implement LLM response caching (sessionStorage, 5-minute TTL)
- [ ] T075 [P] [US4] Implement daily quota tracking (100 requests/day) in llm-client.js
- [ ] T076 [P] [US4] Implement rate limiting (10 requests/minute) using express-rate-limit
- [ ] T077 [US4] Add LLM usage logging (token count, cost, latency) to SQLite
- [ ] T078 [US4] Handle LLM API errors gracefully (timeout, quota exceeded)
- [ ] T079 [US4] Test LLM enhancement with 10+ complex queries
- [ ] T080 [US4] Validate LLM cost < $0.01/request per research.md

**Checkpoint**: User Story 4 完成 - LLM 增強回答在低信心度情況下運作

---

## Phase 7: User Story 5 - 搜尋分析與統計 (Priority: P3)

**Goal**: 系統記錄所有搜尋查詢、點擊行為，並提供統計報表（熱門 FAQ、平均信心度等）

**Independent Test**: 執行 5 次搜尋後，呼叫 GET /api/v1/analytics/stats 應回傳正確的查詢數、平均信心度、熱門 FAQ

### Tests for User Story 5

- [ ] T081 [P] [US5] Write unit tests for SQLite insert operations in backend/tests/unit/test-analytics-db.js
- [ ] T082 [P] [US5] Write integration tests for analytics API endpoints in backend/tests/integration/test-analytics.js

### Implementation for User Story 5

- [ ] T083 [US5] Create backend/src/services/analytics.js with SQLite database client
- [ ] T084 [US5] Implement recordSearchQuery() function to insert into search_queries table
- [ ] T085 [US5] Implement recordFAQView() function to insert into faq_views table
- [ ] T086 [US5] Create backend/src/routes/analytics.js with GET /api/v1/analytics/queries endpoint
- [ ] T087 [P] [US5] Implement GET /api/v1/analytics/stats endpoint with aggregation queries
- [ ] T088 [P] [US5] Implement POST /api/v1/analytics/events endpoint for frontend event tracking
- [ ] T089 [US5] Integrate recordSearchQuery() into POST /api/v1/faq/search
- [ ] T090 [US5] Add frontend event tracking (FAQ_CLICK, LINK_CLICK, COPY_PERFORMED) in faq-search.html
- [ ] T091 [US5] Implement session ID generation (UUID) in frontend
- [ ] T092 [US5] Implement time-series aggregation (group by day/week/month) in analytics.js
- [ ] T093 [US5] Calculate top FAQs by view count and CTR in analytics.js
- [ ] T094 [US5] Test analytics data accuracy with 20+ simulated searches

**Checkpoint**: User Story 5 完成 - 分析與統計功能正常記錄與回報

---

## Phase 8: User Story 6 - CRM 系統整合 (Priority: P3)

**Goal**: FAQ 查詢結果自動寫入 JSONL 日誌，並與現有 tagger.html 共用 FAQ engine

**Independent Test**: 執行 FAQ 搜尋後，customer_inquiries.jsonl 應新增一筆記錄，包含 query_text、detected_intent、generated_tags

### Tests for User Story 6

- [ ] T095 [P] [US6] Write unit tests for JSONL append operations in backend/tests/unit/test-jsonl-writer.js
- [ ] T096 [P] [US6] Write integration tests for CRM endpoints in backend/tests/integration/test-crm.js

### Implementation for User Story 6

- [ ] T097 [US6] Create backend/src/services/jsonl-writer.js for append-only JSONL operations
- [ ] T098 [US6] Implement appendCRMInquiry() function in jsonl-writer.js
- [ ] T099 [US6] Implement POST /api/v1/crm/inquiry-log endpoint in backend/src/routes/crm.js
- [ ] T100 [US6] Integrate CRM logging into POST /api/v1/faq/search (async, non-blocking)
- [ ] T101 [US6] Extract faq-engine.js logic into shared module (frontend/lib/faq-engine.js)
- [ ] T102 [US6] Document integration points with tagger.html in quickstart.md
- [ ] T103 [US6] Create migration script for existing customer_inquiries.jsonl (scripts/migrate-crm-logs.js)
- [ ] T104 [US6] Test JSONL write performance (target: < 10ms per write)
- [ ] T105 [US6] Validate JSONL format compatibility with existing CRM tools

**Checkpoint**: User Story 6 完成 - CRM 整合完成，JSONL 日誌正常寫入

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T106 [P] Add comprehensive inline comments to all JavaScript files
- [ ] T107 [P] Create API documentation using OpenAPI spec (contracts/api-spec.yaml)
- [ ] T108 Performance optimization: Enable HTTP compression for API responses
- [ ] T109 Performance optimization: Implement sessionStorage caching for FAQ data
- [ ] T110 [P] Security: Add input sanitization using DOMPurify in frontend
- [ ] T111 [P] Security: Add Helmet middleware for HTTP headers in backend
- [ ] T112 Code cleanup: Run ESLint and fix all warnings
- [ ] T113 [P] Update README.md with project overview and commands
- [ ] T114 [P] Update CLAUDE.md with final implementation notes
- [ ] T115 Run full validation: make validate && make test
- [ ] T116 Perform end-to-end testing following quickstart.md Section 6
- [ ] T117 [P] Create deployment guide in docs/deployment.md
- [ ] T118 Final performance benchmarking (search < 100ms, page load < 2s)

**Checkpoint**: All polish tasks complete, system ready for production

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational (Phase 2) completion
  - User stories CAN proceed in parallel (if staffed)
  - Or sequentially in priority order: US1 → US2 → US3 → US4 → US5 → US6
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1) 基礎搜尋**: Independent - can start after Foundational
- **US2 (P1) 多語言**: Depends on US1 (extends search functionality)
- **US3 (P2) Intent 偵測**: Independent - can start after Foundational
- **US4 (P2) LLM 增強**: Depends on US3 (extends intent detection)
- **US5 (P3) 分析統計**: Depends on US1 (needs search queries to analyze)
- **US6 (P3) CRM 整合**: Depends on US1 + US3 (needs search and intent data)

### Within Each User Story

1. Tests FIRST (write and ensure they FAIL)
2. Models and services
3. API endpoints
4. Frontend integration
5. Validation and testing

### Parallel Opportunities

**Setup Phase**:
- T003, T004, T005, T006, T007 can run in parallel

**Foundational Phase**:
- T010, T011, T013, T014, T016, T020 can run in parallel

**Within User Stories**:
- US1: T022-T023, T025-T026, T030 can run in parallel
- US2: T036-T037, T038-T040, T047 can run in parallel
- US3: T050-T052, T053-T054, T058-T059, T063 can run in parallel
- US4: T066-T068, T075-T076 can run in parallel
- US5: T081-T082, T087-T088 can run in parallel
- US6: T095-T096 can run in parallel

**Polish Phase**:
- T106, T107, T110, T111, T113, T114, T117 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch tests in parallel:
Task: "T022 - Create frontend integration test plan"
Task: "T023 - Write unit tests for Fuse.js configuration"

# Launch independent implementations in parallel:
Task: "T025 - Implement faq-engine.js with Fuse.js"
Task: "T026 - Add CSS styling to faq-search.html"
Task: "T030 - Create POST /api/v1/faq/search endpoint"
```

---

## Parallel Example: User Story 2

```bash
# Launch i18n files in parallel:
Task: "T038 - Populate zh.json"
Task: "T039 - Populate en.json"
Task: "T040 - Populate th.json"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only - P1 Priority)

1. ✅ Complete Phase 1: Setup
2. ✅ Complete Phase 2: Foundational (CRITICAL)
3. ✅ Complete Phase 3: User Story 1 (基礎搜尋)
4. ✅ Complete Phase 4: User Story 2 (多語言)
5. **STOP and VALIDATE**: Test US1 + US2 independently
6. Deploy MVP with core search functionality

**Estimated Tasks**: T001-T049 (49 tasks)
**Estimated Time**: 2-3 weeks (1 developer)

### Incremental Delivery

1. **Foundation** (T001-T021): Setup + Core infrastructure
2. **MVP** (T022-T049): US1 + US2 → Test → Deploy 🎯
3. **Enhancement 1** (T050-T065): US3 Intent detection → Test → Deploy
4. **Enhancement 2** (T066-T080): US4 LLM integration → Test → Deploy
5. **Enhancement 3** (T081-T094): US5 Analytics → Test → Deploy
6. **Enhancement 4** (T097-T105): US6 CRM integration → Test → Deploy
7. **Production Ready** (T106-T118): Polish → Test → Deploy

Each increment adds value without breaking previous features.

### Parallel Team Strategy

With 2-3 developers after Foundational phase:

- **Developer A**: US1 + US2 (P1, core search)
- **Developer B**: US3 + US4 (P2, intent + LLM)
- **Developer C**: US5 + US6 (P3, analytics + CRM)

Stories integrate independently at the end.

---

## Task Summary

- **Total Tasks**: 118
- **Setup**: 7 tasks (T001-T007)
- **Foundational**: 14 tasks (T008-T021)
- **User Story 1 (P1)**: 14 tasks (T022-T035)
- **User Story 2 (P1)**: 14 tasks (T036-T049)
- **User Story 3 (P2)**: 16 tasks (T050-T065)
- **User Story 4 (P2)**: 15 tasks (T066-T080)
- **User Story 5 (P3)**: 14 tasks (T081-T094)
- **User Story 6 (P3)**: 12 tasks (T095-T106)
- **Polish**: 13 tasks (T106-T118)

**Parallelizable Tasks**: 45 tasks marked [P] (~38%)

**MVP Scope** (P1 only): 49 tasks (T001-T049)
**Full Feature**: 118 tasks

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Constitution principle: 簡潔優於抽象 - avoid over-engineering
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Follow quickstart.md for development workflow
- Use make validate before committing
- Reference data-model.md for data structure details
- Reference contracts/api-spec.yaml for API implementation details

---

**Next Step**: Start with Phase 1 (Setup) - execute T001-T007
