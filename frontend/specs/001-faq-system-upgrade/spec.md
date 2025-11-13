# Feature Specification: FAQ 系統全面升級

**Feature Branch**: `001-faq-system-upgrade`
**Created**: 2025-10-13
**Status**: Draft
**Input**: 整合四大核心功能：互動式搜尋系統、資料驗證工具、智能推薦系統、CRM整合介面

## 執行摘要

本專案旨在將現有的 FAQ 知識庫系統（faq_kb.phase0a.json）升級為一個完整的、生產級的客戶服務工具，涵蓋以下四個核心功能模組：

1. **互動式 FAQ 搜尋與導覽系統** - 實現 FAQ 3.0 規格中的 Hybrid 模式（導覽+快搜）
2. **FAQ 資料驗證與管理工具** - JSON Schema 驗證、資料完整性檢查、自動化測試
3. **FAQ 智能推薦系統** - 基於意圖識別和模糊匹配的智能 FAQ 推薦
4. **FAQ 與 CRM 整合介面** - 與現有 CRM 標籤系統的無縫整合

## Clarifications

### Session 2025-10-13

- Q: 搜尋索引方案 - 前端純 JavaScript 實作（Fuse.js）vs. 後端 API（如需要，技術堆疊？）vs. 混合方案？ → A: 混合方案（前端基礎搜尋 + 後端進階功能）- 現階段用 Fuse.js 快速上線，未來當 FAQ 增長到 300-500+ 條目（含雪場介紹等）時可無痛切換搜尋引擎到後端；intent detection 和 analytics 從一開始就用後端 API，支援漸進式升級路徑
- Q: CRM 整合部署方式 - FAQ 系統與 tagger.html 是同一個 HTML 文件還是分離的兩個應用？ → A: 分離的兩個應用 - FAQ 系統獨立為 faq-search.html，CRM tagger 保持現有 tagger.html，透過共用的 JavaScript 模組（faq-engine.js）和後端 API 互通資料，實現關注點分離和獨立部署
- Q: 多語言支援範圍 → A: 支援中文（主要）、英文、泰文；日文保留結構但內容翻譯列為未來增強功能
- Q: Analytics 資料儲存方案 - 使用 localStorage（有限）、後端 API（需要架設）、還是 Google Analytics？ → A: 後端 API + 簡單資料庫（SQLite 或 JSON 文件）- 符合混合架構，提供資料持久性和深度分析能力，可跨用戶分析趨勢、生成報表，並自主控制隱私合規
- Q: Intent Detection 模型選擇 - 純規則引擎（關鍵字匹配）vs. ML 模型（如需要，訓練資料來源？）vs. LLM API？ → A: 規則引擎為基礎 + LLM API 作為可選增強層 - 80% 簡單查詢用規則引擎快速處理（<100ms），信心分數 <75% 時可選呼叫 LLM API（GPT-4/Claude）提供自然語言回答，支援未來聊天機器人場景；faq_kb.phase0a.json 作為 LLM 的知識庫（RAG 模式），確保回答準確性；後端 API 預留 use_llm 參數實現漸進式升級
- Q: 移動端體驗 - 是否需要 PWA 離線支援？還是僅響應式網頁？ → A: 僅響應式網頁 - 使用 CSS media queries（斷點 768px、1024px）確保在手機、平板、桌面都能正常使用，不實作離線功能（PWA），符合 MVP 原則降低開發複雜度，未來如需離線支援可漸進升級

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 客服人員快速搜尋 FAQ (Priority: P1)

**角色**: 客服人員處理客戶詢問

客服人員收到客戶關於「改期」的詢問，需要在 5 秒內找到正確的標準回答，包含相關政策（72小時限制）和 CTA 連結。

**Why this priority**: 這是系統的核心價值主張，直接影響客服效率和回應品質。沒有這個功能，系統無法提供實際價值。

**Independent Test**:
- 輸入關鍵字「改期」後能在 100ms 內返回相關 FAQ 列表
- 點擊搜尋結果能直接跳轉到對應的錨點位置
- 搜尋結果顯示「需客服」標籤和 72h 警告標示
- 可以一鍵複製回答模板用於客服回覆

**Acceptance Scenarios**:

1. **Given** 客服人員在搜尋框輸入「改期」, **When** 按下搜尋或 Enter, **Then** 系統在 100ms 內顯示「Q1｜想改日期／時間／雪場」等相關結果，並高亮「72小時內」和「需客服」標籤
2. **Given** 搜尋結果列表顯示多個匹配項目, **When** 點擊「Q1｜想改日期...」, **Then** 頁面平滑滾動到 #change-date 錨點，並將該答案卡高亮顯示 2 秒
3. **Given** 客服人員找到正確的 FAQ, **When** 點擊「複製回答」按鈕, **Then** 將格式化的回答文字（包含連結）複製到剪貼板
4. **Given** 客服人員輸入錯字「改機」, **When** 執行搜尋, **Then** 系統使用模糊匹配顯示「改期」相關結果，並提示「您是否要找：改期」
5. **Given** 輸入日文「変更」或英文「change」, **When** 執行搜尋, **Then** 系統透過同義詞字典匹配到「變更」相關 FAQ

---

### User Story 2 - 新手學員透過導覽式問答找到答案 (Priority: P1)

**角色**: 第一次預約滑雪課程的學員

學員不知道該問什麼問題，透過「首次預約快速導覽」的 4 步流程，被引導釐清需求、查詢教練、完成預約。

**Why this priority**: 新手用戶占比高且轉換率關鍵。導覽式體驗能降低認知負擔，提高訂單完成率。

**Independent Test**:
- 進入 FAQ 首頁能看到明顯的「首次預約？從這裡開始」入口
- 點擊進入後以卡片式 UI 展示 4 步驟流程
- 每個步驟都有清楚的 CTA 按鈕連結到對應頁面或表單
- 可追蹤用戶完成了哪些步驟（使用 localStorage）

**Acceptance Scenarios**:

1. **Given** 新用戶首次進入 FAQ 頁面, **When** 頁面載入完成, **Then** 在頁面上方顯示大型「🔰 首次預約？4 步到位」banner，點擊後展開導覽流程
2. **Given** 用戶進入導覽模式, **When** 閱讀 Step 1「釐清需求」, **Then** 顯示互動式表單：日期選擇器、雪場下拉選單、人數輸入框、程度選擇（初學/有基礎/進階）
3. **Given** 用戶在 Step 2「查可預約教練」, **When** 點擊「前往查詢」CTA, **Then** 將 Step 1 收集的條件作為 URL 參數帶到 booking.diy.ski/schedule
4. **Given** 用戶選擇「輕井澤」雪場, **When** 進入 Step 3「線上預約」, **Then** 彈出 ⚠️ 提示：「輕井澤必須為王子飯店住房客」，並提供「我符合」/「改選雪場」選項
5. **Given** 用戶完成 Step 4, **When** 瀏覽器記錄了完成狀態, **Then** 下次進入 FAQ 時顯示「✅ 已完成首次預約導覽」，並提供「查看訂單」和「預約更多課程」快捷入口

---

### User Story 3 - FAQ 內容管理員驗證資料完整性 (Priority: P2)

**角色**: FAQ 內容維護人員

內容管理員新增或修改 faq_kb.phase0a.json 後，需要驗證 JSON 格式正確、所有必要欄位存在、連結有效、中文內容沒有亂碼。

**Why this priority**: 資料品質直接影響用戶體驗。自動化驗證能防止人為錯誤，確保系統穩定性。這是 P2 因為它支援 P1 的功能運作。

**Independent Test**:
- 執行 `make validate` 能檢查 JSON schema 合規性
- 驗證報告清楚列出所有錯誤和警告
- 可以單獨測試不影響生產環境
- CI/CD 流程可整合此驗證步驟

**Acceptance Scenarios**:

1. **Given** 管理員修改了 faq_kb.phase0a.json, **When** 執行 `make validate` 命令, **Then** 系統檢查所有 FAQ 項目的 schema 合規性，並在 5 秒內輸出驗證報告
2. **Given** 某個 FAQ 項目缺少 `canonical_question` 欄位, **When** 執行驗證, **Then** 報告顯示錯誤：「❌ faq.itinerary.001: 缺少必要欄位 'canonical_question'」
3. **Given** FAQ 項目中包含連結 `{{LINK_SCHEDULE}}`, **When** 執行驗證, **Then** 系統檢查 meta.link_tokens 中是否定義了 LINK_SCHEDULE，並驗證該 URL 是否可訪問（HTTP 200/301/302）
4. **Given** 某個 `answer_template.text` 包含亂碼或非 UTF-8 字元, **When** 執行驗證, **Then** 報告顯示警告：「⚠️ faq.payment.003: 檢測到潛在編碼問題」
5. **Given** 兩個 FAQ 項目使用相同的 ID, **When** 執行驗證, **Then** 報告顯示錯誤：「❌ 重複的 FAQ ID: faq.booking.001」
6. **Given** 驗證通過無錯誤, **When** 執行完成, **Then** 輸出「✅ 驗證通過：檢查了 127 個 FAQ 項目，0 個錯誤，2 個警告」並返回 exit code 0

---

### User Story 4 - 客戶在聊天介面獲得智能 FAQ 推薦 (Priority: P2)

**角色**: 通過 LINE 或網頁聊天的客戶

客戶輸入自然語言問題「我想帶小孩去輕井澤學滑雪，3月份可以嗎？」，系統自動識別意圖（ITINERARY + KARUIZAWA + KIDS），推薦最相關的 3-5 個 FAQ。

**Why this priority**: 提升自助服務率，減少人工客服負擔。這是 P2 因為需要 P1 的搜尋功能作為基礎。

**Independent Test**:
- 單獨測試 intent detection 引擎的準確率（>85%）
- 測試 slot extraction（雪場名稱、日期、人數等）
- 可以在沒有 UI 的情況下測試 API
- 提供 test cases JSON 驗證推薦品質

**Acceptance Scenarios**:

1. **Given** 客戶在聊天介面輸入「我想改期」, **When** 系統進行意圖分析, **Then** 識別意圖為 BOOKING_CHANGE，推薦 FAQ #1（變更日期）、#4（申請開課）、#21（更換教練），並按相關度排序
2. **Given** 客戶輸入包含雪場名稱「輕井澤」, **When** 系統提取 slot, **Then** 正確識別 resort=KARUIZAWA，並優先推薦 FAQ #5（輕井澤入住規定）
3. **Given** 客戶輸入「3大1小」, **When** 系統分析, **Then** 提取 people_count={adults: 3, children: 1}，推薦 FAQ #7（成人與小孩同堂）、#12（起始年齡）
4. **Given** 客戶輸入「明天要上課但天氣不好」, **When** 系統分析, **Then** 識別緊急情況 + 天候問題，推薦 FAQ #9（天候政策）、#25（緊急聯絡），並標注「🔴 緊急」
5. **Given** 系統推薦了 3 個 FAQ, **When** 客戶點擊其中一個, **Then** 記錄點擊事件到 analytics（用於優化推薦演算法），並顯示完整 FAQ 內容
6. **Given** 客戶輸入「謝謝」或「已解決」, **When** 系統分析, **Then** 識別為對話結束，記錄 session 成功解決，並詢問「是否還有其他問題？」

---

### User Story 5 - CRM 系統自動標記客戶詢問類別 (Priority: P3)

**角色**: CRM 系統使用者（內部營運團隊）

客服處理完客戶詢問後，系統根據回答的 FAQ 自動為客戶記錄添加標籤（#行程規劃、#教練問題、#付款問題等），並同步到 customer_inquiries.jsonl。

**Why this priority**: 自動化客戶分類能提升數據品質，支援後續的客戶分析和行銷策略。這是 P3 因為它依賴前面的功能，且對核心流程非必需。

**Independent Test**:
- 驗證 FAQ ID 到 CRM 標籤的映射規則
- 測試 JSONL 寫入格式正確性
- 可以單獨測試標籤生成邏輯
- 不影響 FAQ 搜尋主功能運作

**Acceptance Scenarios**:

1. **Given** 客服使用 FAQ #1（變更日期）回答客戶, **When** 點擊「套用此 FAQ」, **Then** 系統自動為該客戶添加標籤：#變更、#需客服、#72h內（如果適用）
2. **Given** 客服在 CRM 介面查看客戶詢問記錄, **When** 打開某次對話, **Then** 顯示使用的 FAQ ID、自動標籤、回答時間、客服人員
3. **Given** 系統需要記錄到 customer_inquiries.jsonl, **When** FAQ 被使用, **Then** 寫入格式：`{"timestamp": "2025-10-13T10:30:00Z", "customer_id": "...", "faq_id": "faq.booking.001", "intent": "BOOKING_CHANGE", "tags": ["#變更", "#需客服"], "resolved": true}`
4. **Given** 客戶同一次對話涉及多個 FAQ, **When** 對話結束, **Then** 記錄所有使用的 FAQ ID，並計算主要意圖（出現頻率最高）
5. **Given** 月底生成分析報告, **When** 執行統計腳本, **Then** 輸出：最常用的 FAQ Top 10、各意圖類別分布、平均解決時間、客服使用 FAQ 的比率（vs 自訂回答）

---

### User Story 6 - 系統管理員監控 FAQ 使用數據 (Priority: P3)

**角色**: 系統管理員或產品負責人

管理員需要了解哪些 FAQ 最常被查詢、哪些搜尋關鍵字沒有匹配到結果（用於優化內容），以及系統效能指標（搜尋速度、推薦準確率）。

**Why this priority**: 數據驅動的優化能持續提升系統價值。這是 P3 因為它是優化而非核心功能。

**Independent Test**:
- 驗證 analytics 事件正確記錄
- 測試報表生成邏輯
- 可以離線分析歷史數據
- 不影響用戶使用體驗

**Acceptance Scenarios**:

1. **Given** 用戶執行 FAQ 搜尋, **When** 搜尋完成, **Then** 記錄事件：`{type: "search", query: "改期", results_count: 3, response_time_ms: 45, timestamp: ...}`
2. **Given** 用戶搜尋但沒有結果, **When** 顯示「無匹配結果」, **Then** 記錄 `{type: "search_no_result", query: "野澤溫泉教練", ...}` 用於識別內容缺口
3. **Given** 管理員執行 `make analytics-report`, **When** 腳本運行, **Then** 生成報告包含：
   - 過去 7 天搜尋次數、熱門關鍵字 Top 20
   - 零結果查詢列表（用於添加新 FAQ）
   - FAQ 點擊率（views / search_impressions）
   - 平均搜尋響應時間趨勢圖
4. **Given** 某個 FAQ 點擊率低於 5%, **When** 生成報告, **Then** 標注為「⚠️ 低效內容」建議重寫或合併
5. **Given** 智能推薦功能運行, **When** 用戶選擇推薦的 FAQ, **Then** 記錄 `{type: "recommendation_click", position: 2, faq_id: "faq.booking.001", ...}` 用於計算 CTR 和優化排序

---

### Edge Cases

#### 搜尋與匹配相關
- **空查詢**: 用戶未輸入任何內容就按搜尋 → 顯示「熱門 FAQ」或「最近更新」
- **特殊字元**: 輸入 `<script>alert('xss')</script>` → 正確跳脫，不執行腳本
- **超長查詢**: 輸入 500 字的段落 → 截取前 100 字處理，顯示警告「查詢過長，已自動簡化」
- **多語言混合**: 輸入「改期 change date 変更」→ 正確識別所有同義詞
- **錯字連續**: 輸入「改機改機改機」→ 模糊匹配仍返回「改期」結果

#### 資料驗證相關
- **JSON 格式錯誤**: faq_kb.phase0a.json 缺少逗號或括號 → 驗證器顯示具體行號和錯誤位置
- **循環引用**: FAQ A 的 related_faqs 包含 FAQ B，FAQ B 又包含 FAQ A → 檢測並警告
- **斷鏈**: 連結指向 404 頁面 → 驗證器標記為錯誤，並建議移除或更新
- **編碼混亂**: 文件混合使用 UTF-8 和 Big5 → 檢測並強制轉換為 UTF-8
- **巨大 JSON**: faq_kb.phase0a.json 超過 10MB → 驗證器警告效能問題，建議分割

#### 智能推薦相關
- **模糊意圖**: 輸入「預約」（可能是新預約、改期、查詢） → 返回多個類別的 FAQ，要求用戶澄清
- **無法識別的雪場**: 輸入「苗場」（不在系統中）→ 推薦「其他雪場」FAQ，並建議聯絡客服
- **衝突的 slot**: 輸入「我想 3 月去但也考慮 4 月」→ 提取兩個日期，優先使用第一個
- **多重意圖**: 輸入「我要改期也要加人」→ 識別為複合需求，推薦兩個 FAQ 並說明需分步處理
- **負面情緒**: 輸入「你們的服務太爛了」→ 識別情緒，優先推薦客服聯絡方式和投訴處理流程

#### CRM 整合相關
- **JSONL 寫入失敗**: 磁碟空間不足 → 記錄錯誤到 error.log，顯示警告但不中斷主流程
- **重複標籤**: 同一客戶短時間內多次使用同一 FAQ → 不重複添加標籤，但記錄使用次數
- **標籤衝突**: FAQ 自動生成標籤與客服手動標籤不一致 → 保留兩者，註明來源（auto/manual）
- **跨系統同步延遲**: CRM 主系統和 FAQ 系統的客戶資料不同步 → 使用 customer_id 作為唯一識別，定期檢查不一致
- **隱私限制**: 敏感客戶資料不應記錄 → 只記錄匿名化的 ID 和意圖，不記錄具體詢問內容（除非客戶同意）

#### 效能與規模相關
- **併發搜尋**: 100 人同時搜尋 → 響應時間不超過 200ms（使用緩存和索引）
- **巨量 FAQ**: 知識庫增長到 1000+ 條目 → 搜尋速度不下降（使用分頁和預索引）
- **移動網路**: 3G 慢速連線 → 使用漸進式載入，核心搜尋功能優先
- **舊瀏覽器**: IE 11 或 Safari 10 → 降級方案，基本搜尋可用但無進階功能
- **離線模式**: 網路中斷 → 顯示「離線模式」，使用 localStorage 中的快取數據

## Requirements *(mandatory)*

### Functional Requirements

#### 模組 1: 互動式搜尋與導覽

- **FR-001**: 系統必須提供全文搜尋功能，支援中文分詞、模糊匹配（編輯距離 ≤2）、同義詞擴展
- **FR-002**: 搜尋結果必須在 100ms 內返回（95 百分位），包含關鍵字高亮和相關度排序
- **FR-003**: 系統必須支援錨點導航（#change-date 格式），點擊後平滑滾動並高亮目標內容 2 秒
- **FR-004**: 系統必須實作「首次預約快速導覽」互動式流程，包含 4 個步驟卡片和條件式提示
- **FR-005**: 每個 FAQ 答案卡必須顯示標籤（自助/需客服/72h內），並提供一鍵複製功能
- **FR-006**: 系統必須支援熱門標籤快速篩選（如：變更、退款、付款、保險等 12+ 標籤）
- **FR-007**: 搜尋框必須提供自動完成建議（基於歷史搜尋和 FAQ 標題），顯示最多 5 個建議
- **FR-008**: 系統必須實作 Sticky TOC（目錄）在右側，顯示當前所在章節並支援快速跳轉
- **FR-009**: 零結果頁面必須提供替代方案：熱門 FAQ、聯絡客服、檢查拼寫建議

#### 模組 2: 資料驗證與管理

- **FR-010**: 系統必須提供 `make validate` 命令，執行完整的 FAQ 資料驗證流程
- **FR-011**: 驗證器必須檢查 JSON Schema 合規性，確保所有必要欄位存在且類型正確
- **FR-012**: 驗證器必須檢查以下內容：
  - 重複的 FAQ ID
  - 斷鏈（HTTP 4xx/5xx 錯誤）
  - meta.link_tokens 中未定義的連結引用
  - canonical_question 為空或過長（>200 字元）
  - utterance_patterns 少於 3 個
  - answer_template.text 為空
  - crm_tags 格式錯誤（非 # 開頭）
- **FR-013**: 驗證器必須檢測編碼問題：UTF-8 BOM、混合編碼、亂碼字元
- **FR-014**: 驗證報告必須分為三個層級：❌ 錯誤（阻斷）、⚠️ 警告（建議修復）、ℹ️ 資訊
- **FR-015**: 驗證器必須支援 `--fix` 參數，自動修復可修復的問題（如格式化、移除 BOM）
- **FR-016**: 系統必須提供 `make validate-links` 子命令，僅檢查連結有效性（用於快速檢查）
- **FR-017**: 驗證器必須生成 JSON 格式的報告（machine-readable），支援 CI/CD 整合

#### 模組 3: 智能推薦系統

- **FR-018**: 系統必須實作 Intent Detection 引擎（規則引擎為基礎），支援以下意圖類別：
  - ITINERARY（行程規劃）
  - BOOKING（預約相關）
  - BOOKING_CHANGE（變更預約）
  - INSTRUCTOR（教練問題）
  - COURSE（課程內容）
  - KIDS_SAFETY（親子/兒童）
  - PAYMENT（付款問題）
  - GEAR（裝備）
  - SERVICE（服務與政策）
  - EMERGENCY（緊急狀況）
  - GENERAL（一般詢問）
- **FR-019**: Intent Detection 準確率必須達到 85% 以上（基於測試集驗證）；規則引擎為主要實作方式
- **FR-019a**: 系統必須支援可選的 LLM 增強模式（use_llm 參數），當規則引擎信心分數 <75% 時可呼叫 LLM API（GPT-4/Claude）進行意圖理解和自然語言回答生成
- **FR-019b**: LLM 模式必須使用 faq_kb.phase0a.json 作為知識庫（RAG），確保回答內容基於已驗證的 FAQ 資料
- **FR-020**: 系統必須實作 Slot Extraction，支援提取：
  - resort_name（雪場名稱，支援中日英別名）
  - date（日期，支援多種格式：YYYY-MM-DD、MM/DD、X月X日）
  - people_count（人數，支援「3大1小」格式解析）
  - board_type（SKI/SNOWBOARD）
  - child_age（兒童年齡）
  - timeframe（時間範圍，如「72小時內」）
- **FR-021**: 推薦演算法必須結合以下因素計算相關度分數：
  - Intent 匹配度（40%）
  - 關鍵字匹配度（30%）
  - Slot 匹配度（20%）
  - 歷史點擊率（10%）
- **FR-022**: 系統必須返回 Top 3-5 個推薦 FAQ，並提供信心分數（0-100）
- **FR-023**: 當信心分數低於 60 分時，必須顯示「建議聯絡客服」選項
- **FR-024**: 推薦結果必須記錄到 analytics，包含查詢文字、推薦 FAQ、用戶選擇

#### 模組 4: CRM 整合介面

- **FR-025**: 系統必須提供 API endpoint：`POST /api/faq/log-usage`，記錄 FAQ 使用情況
- **FR-026**: 每次 FAQ 使用必須記錄到 customer_inquiries.jsonl，格式遵循現有 CRM 標準
- **FR-027**: 系統必須維護 FAQ ID 到 CRM 標籤的映射表（crm_tag_rules.json）
- **FR-028**: 自動標籤生成規則：
  - 基於 FAQ 的 `crm_tags` 欄位
  - 基於識別的 intent（如 BOOKING_CHANGE → #變更）
  - 基於提取的 slot（如 resort=KARUIZAWA → #輕井澤）
  - 基於政策標記（如 policy_flags: NO_MANUAL_MATCH → #需客服）
- **FR-029**: 系統必須支援從 CRM 查詢介面觸發 FAQ 推薦（整合到 tagger.html）
- **FR-030**: 客服在 CRM 介面選擇 FAQ 回答後，必須能一鍵應用標籤到客戶記錄
- **FR-031**: 系統必須提供 `make sync-crm-tags` 命令，同步 FAQ 系統和 CRM 的標籤定義
- **FR-032**: 跨系統資料同步必須支援衝突解決策略（最新時間戳優先）

#### 共通需求

- **FR-033**: 所有用戶輸入必須進行 XSS 防護（sanitize HTML、跳脫特殊字元）
- **FR-034**: 系統必須支援響應式設計（桌面、平板、手機），斷點：768px、1024px
- **FR-035**: 所有非同步操作必須有 loading 指示器，超過 3 秒顯示「處理中，請稍候」
- **FR-036**: 錯誤訊息必須對用戶友善（中文），技術細節記錄到 console.error
- **FR-037**: 系統必須支援鍵盤導航（Tab、Enter、Esc），符合無障礙標準（WCAG 2.1 AA）
- **FR-038**: 搜尋歷史必須儲存在 localStorage（最多 20 筆），提供「清除歷史」功能

### Key Entities *(include if feature involves data)*

#### FAQ Item
FAQ 知識庫中的單一問答項目
- **屬性**:
  - `id` (string, unique): FAQ 唯一識別碼，格式 `faq.{section}.{number}`
  - `intent` (enum): 意圖類別（ITINERARY, BOOKING, INSTRUCTOR 等）
  - `section` (string): 分類章節名稱
  - `canonical_question` (string): 標準問題陳述（中文）
  - `canonical_question_en` (string, optional): 標準問題陳述（英文）
  - `canonical_question_th` (string, optional): 標準問題陳述（泰文）
  - `canonical_question_ja` (string, optional): 標準問題陳述（日文，保留欄位）
  - `utterance_patterns` (array<string>): 用戶可能的問法列表（3+ 個，支援多語言）
  - `required_slots` (array<string>): 必需的 slot（如 resort_name, date）
  - `policy_flags` (array<string>): 政策標記（NO_QUOTE, NO_MANUAL_MATCH 等）
  - `answer_template` (object): 回答模板，包含 text、text_en、text_th、postscript、links_inline
  - `links` (array<string>): 相關連結（使用 {{LINK_TOKEN}} 格式）
  - `crm_tags` (array<string>): CRM 標籤列表（# 開頭）
  - `related_faqs` (array<string>, optional): 相關 FAQ ID
  - `last_updated` (datetime, optional): 最後更新時間

#### Search Query
用戶的搜尋查詢及其結果
- **屬性**:
  - `query_text` (string): 原始查詢字串
  - `normalized_query` (string): 正規化後的查詢（移除標點、轉小寫）
  - `detected_intent` (enum, optional): 識別的意圖
  - `extracted_slots` (object, optional): 提取的 slot（key-value pairs）
  - `results` (array<FAQItem>): 匹配的 FAQ 列表
  - `relevance_scores` (array<float>): 各結果的相關度分數（0-100）
  - `response_time_ms` (integer): 搜尋響應時間
  - `timestamp` (datetime): 查詢時間戳

#### Validation Report
資料驗證的結果報告
- **屬性**:
  - `validation_time` (datetime): 驗證執行時間
  - `total_items` (integer): 總 FAQ 數量
  - `errors` (array<ValidationIssue>): 錯誤列表
  - `warnings` (array<ValidationIssue>): 警告列表
  - `info` (array<ValidationIssue>): 資訊列表
  - `passed` (boolean): 是否通過驗證（無錯誤）
  - `summary` (string): 人類可讀的摘要文字

#### ValidationIssue
單一驗證問題
- **屬性**:
  - `level` (enum): ERROR, WARNING, INFO
  - `faq_id` (string, optional): 相關 FAQ ID
  - `field` (string, optional): 問題欄位
  - `message` (string): 問題描述
  - `suggestion` (string, optional): 修復建議
  - `line_number` (integer, optional): JSON 行號（如果適用）

#### FAQ Usage Log
FAQ 使用記錄（CRM 整合）
- **屬性**:
  - `log_id` (string, unique): 記錄唯一 ID
  - `timestamp` (datetime): 使用時間
  - `customer_id` (string): 客戶 ID（匿名化）
  - `faq_id` (string): 使用的 FAQ ID
  - `intent` (enum): 識別的意圖
  - `tags` (array<string>): 自動生成的標籤
  - `user_type` (enum): 使用者類型（customer, agent）
  - `channel` (enum): 渠道（web, line, crm）
  - `resolved` (boolean): 是否解決問題
  - `feedback` (string, optional): 用戶反饋

#### Recommendation Context
推薦系統的上下文資訊
- **屬性**:
  - `user_query` (string): 用戶查詢
  - `session_id` (string): 會話 ID
  - `conversation_history` (array<object>): 對話歷史（最近 5 筆）
  - `detected_intent` (enum): 識別的意圖
  - `confidence_score` (float): 意圖信心分數（0-1）
  - `extracted_slots` (object): 提取的 slot
  - `recommended_faqs` (array<FAQItem>): 推薦的 FAQ
  - `recommendation_scores` (array<float>): 推薦分數
  - `fallback_needed` (boolean): 是否需要回退到人工

### Non-Functional Requirements

#### 效能 (Performance)
- **NFR-001**: 搜尋響應時間中位數 < 50ms，95 百分位 < 100ms
- **NFR-002**: 頁面首次載入時間 < 2 秒（3G Fast 網路）
- **NFR-003**: 資料驗證執行時間 < 5 秒（100 個 FAQ）
- **NFR-004**: 支援至少 100 併發用戶同時搜尋，不降級
- **NFR-005**: Intent detection 延遲 < 200ms（包含 slot extraction）

#### 可靠性 (Reliability)
- **NFR-006**: 搜尋功能可用性 ≥ 99.5%（允許每月最多 3.6 小時停機）
- **NFR-007**: 資料驗證錯誤檢測率 ≥ 95%（不漏報關鍵錯誤）
- **NFR-008**: CRM 整合失敗時不影響主要搜尋功能（graceful degradation）
- **NFR-009**: 系統必須記錄所有錯誤到 error.log，包含完整 stack trace

#### 可維護性 (Maintainability)
- **NFR-010**: 函數長度不超過 50 行（遵循 constitution）
- **NFR-011**: 代碼覆蓋率 ≥ 80%（單元測試 + 整合測試）
- **NFR-012**: 所有公共 API 必須有 JSDoc 註解
- **NFR-013**: 新增 FAQ 項目不需要修改程式碼（data-driven）
- **NFR-014**: 每個模組必須可獨立測試和部署

#### 可用性 (Usability)
- **NFR-015**: 搜尋結果必須在 3 次點擊內找到答案（80% 的查詢）
- **NFR-016**: 首次使用者不需要教學即可完成搜尋（self-explanatory UI）
- **NFR-017**: 支援鍵盤快捷鍵：`/` 聚焦搜尋框、`Esc` 關閉對話框
- **NFR-018**: 錯誤訊息必須提供明確的下一步行動（如「聯絡客服」按鈕）

#### 安全性 (Security)
- **NFR-019**: 所有用戶輸入必須經過 sanitization（防 XSS）
- **NFR-020**: API endpoint 必須實作 rate limiting（每 IP 每分鐘 60 次請求）
- **NFR-021**: 敏感客戶資料（姓名、email）不得記錄到 analytics
- **NFR-022**: CRM 整合 API 必須使用 API key 認證

#### 相容性 (Compatibility)
- **NFR-023**: 支援瀏覽器：Chrome/Edge 90+, Firefox 88+, Safari 14+
- **NFR-024**: 必須與現有 CRM 系統（tagger.html）共存，不破壞現有功能
- **NFR-025**: 資料格式必須向後相容，新版本能讀取舊格式 FAQ
- **NFR-026**: API 必須版本化（/api/v1/），支援至少 2 個主版本

#### 可擴展性 (Scalability)
- **NFR-027**: 系統必須支援 1000+ FAQ 項目而不降低效能
- **NFR-028**: 新增意圖類別不需要重構核心邏輯
- **NFR-029**: 支援多語言擴展（當前中文，未來日文、英文）
- **NFR-030**: 資料驗證規則必須可配置（透過 schema 文件，不修改程式碼）

## Success Metrics

### 產品指標
- **客服效率**: FAQ 使用率從 0% 提升到 60%+（客服回答中使用 FAQ 的比例）
- **自助解決率**: 客戶在聊天介面中透過 FAQ 自助解決問題的比例 > 40%
- **搜尋成功率**: 零結果查詢比例 < 15%
- **用戶滿意度**: FAQ 回答後的「有幫助」反饋率 > 70%

### 技術指標
- **效能**: P95 搜尋響應時間 < 100ms
- **品質**: 資料驗證通過率 100%（生產環境）
- **準確性**: Intent detection 準確率 > 85%
- **整合**: CRM 標籤自動生成準確率 > 90%

### 業務指標
- **成本節省**: 減少人工客服工時 20%+（透過 FAQ 自助）
- **回應速度**: 平均首次回應時間從 5 分鐘降到 2 分鐘
- **資料價值**: 累積 1000+ 筆客戶意圖和標籤資料（用於分析和優化）

## Technical Constraints

### 必須遵循
- 遵循專案 Constitution（.specify/memory/constitution.md）的所有原則
- 使用原生 JavaScript/HTML/CSS，避免重型框架（React/Vue 等）
- 所有資料使用 JSON/JSONL 格式
- UTF-8 編碼
- 程式碼與現有 CRM 系統相容（crm/06_測試與開發工具/Makefile 整合）

### 禁止使用
- 不得使用 `eval()` 或 `Function()` 動態執行程式碼
- 不得引入超過 100KB 的第三方 library（gzip 壓縮後）
- 不得使用需要 Node.js runtime 的工具（瀏覽器端）
- 不得在客戶端儲存敏感資料（localStorage 僅限非敏感）

### 建議使用
- **前端**：Fuse.js（模糊搜尋，9KB gzipped）、DOMPurify（XSS 防護，~20KB）、Day.js（日期處理，2KB）
- **後端 API**（用於 intent detection、analytics、CRM 整合）：Node.js + Express（輕量級 REST API）
- **原生瀏覽器 API**：Fetch API（HTTP 請求）、IntersectionObserver（lazy loading）、localStorage（本地緩存）

**架構說明**：採用混合方案，前端負責基礎搜尋（Fuse.js），後端 API 負責智能推薦、analytics 和 CRM 整合。當 FAQ 規模增長時，可將搜尋索引遷移到後端而無需重寫前端 UI。

## Out of Scope (明確不包含在此版本)

- ❌ 日文完整內容翻譯 - 保留資料結構支援，但內容翻譯列為未來增強功能
- ❌ 即時聊天機器人（LINE bot）完整實作 - 僅提供後端 API 和 LLM 整合接口，具體 bot 整合由其他專案負責
- ❌ PWA 離線功能 - 僅實作響應式網頁，不包含 Service Worker、離線緩存、推送通知等 PWA 功能
- ❌ 語音輸入搜尋 - 可作為未來增強功能
- ❌ FAQ 內容的 AI 生成 - 內容仍由人工維護，LLM 僅用於理解查詢和生成回答
- ❌ A/B 測試框架 - 基礎 analytics 足夠
- ❌ 用戶帳號系統 - 使用匿名 session ID
- ❌ 圖片/影片搜尋 - 僅限文字內容
- ❌ PDF 導出功能 - 可複製內容即可

## Review & Acceptance Checklist

**IMPORTANT**: 在進入技術規劃階段前，必須完成以下檢查項目：

### 需求完整性
- [ ] 所有 4 個核心模組的用戶故事都已定義並有明確的驗收標準
- [ ] Edge cases 涵蓋了 80% 以上的預期異常情況
- [ ] 功能需求（FR-001 ~ FR-038）可測試且無歧義
- [ ] 非功能需求（NFR-001 ~ NFR-030）有明確的量化指標
- [ ] Out of Scope 清楚標註，避免範圍蔓延

### 優先級與可行性
- [ ] P1 用戶故事（US1, US2）確實是 MVP 的核心價值
- [ ] P2 和 P3 用戶故事可獨立實施，不阻塞 P1
- [ ] 技術約束已確認（原生 JS、不用重型框架、整合現有 CRM）
- [ ] 效能目標可達成（搜尋 <100ms，載入 <2s）

### Constitution 合規性
- [ ] 遵循「簡潔優於抽象」- 無不必要的抽象層
- [ ] 資料驅動設計 - 系統行為由 faq_kb.phase0a.json 定義
- [ ] 中文優先支援 - UTF-8、分詞、模糊匹配
- [ ] 效能為必需品 - 所有指標符合 NFR
- [ ] 測試與驗證 - `make validate` 整合
- [ ] CRM 整合 - 與 tagger.html 和 JSONL 格式相容

### 可測試性
- [ ] 每個用戶故事都有「Independent Test」描述
- [ ] 驗收場景使用 Given-When-Then 格式
- [ ] Success Metrics 可量化且可自動收集
- [ ] 提供明確的測試資料集要求（test cases JSON）

### 利益相關者確認
- [ ] 客服團隊確認 FAQ 分類和標籤符合實際需求
- [ ] CRM 系統負責人確認整合方案可行
- [ ] 產品負責人確認 Success Metrics 與業務目標一致
- [ ] 技術負責人確認技術約束和 NFR 可達成

---

## Remaining Questions (剩餘待確認問題)

以下問題優先級較低，可在技術規劃階段決策：

1. **連結驗證頻率**: `make validate` 手動執行 vs. CI/CD 自動執行 vs. 定時 cron job？
   - **建議**: 先手動執行，後續整合到 CI/CD
2. **多租戶支援**: 是否需要支援多個雪場（如 DIY.SKI 有多個品牌）的獨立 FAQ？
   - **建議**: 單租戶為主，透過 section 分類區分雪場即可
3. **備份與版本控制**: faq_kb.phase0a.json 是否需要內建版本歷史（類似 Git）還是依賴外部版本控制？
   - **建議**: 依賴 Git 版本控制，不在應用內實作版本歷史

**註**: 這些問題不影響核心架構設計，可在實作過程中根據實際需求調整。

---

**規格文件版本**: 1.0.0
**最後更新**: 2025-10-13
**下一步**: 執行 `/speckit.clarify` 釐清待確認問題，然後進入 `/speckit.plan` 技術規劃階段
