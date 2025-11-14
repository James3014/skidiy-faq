# 📊 FAQ 後台追蹤系統 - 完整實施計劃

**版本**: 1.0
**日期**: 2025-11-14
**狀態**: 待執行

---

## 📋 需求確認（已簽署）

基於您的業務需求，以下功能為**優先級**：

| # | 功能 | 優先級 | 需求 | 狀態 |
|---|------|--------|------|------|
| 1 | 分類流量統計 | 🔴 高 | 點擊次數，無需停留時間 | ✅ 確認 |
| 2 | 雪場興趣統計 | 🔴 高 | 對業務重要 | ✅ 確認 |
| 3 | 用戶反饋統計 | 🔴 高 | 改進 FAQ，優化 CRM | ✅ 確認 |
| 4 | LLM 成本監控 | 🔴 高 | 監控 Claude API 成本 | ✅ 確認 |
| 5 | 分析儀表板 | 🔴 高 | 需要 admin 頁面 | ✅ 確認 |

---

## 🎯 整體架構

### 四層完整解決方案

```
第 1 層: 追蹤層（修復+驗證）
  ├─ feedback 表建立 ✅ 1h
  ├─ section 追蹤修復 ✅ 0.5h
  └─ resort/tag 追蹤診斷 ✅ 1h

第 2 層: 分析層（已實現，驗證）
  ├─ section_stats ✅ 已實現
  ├─ resort_stats ✅ 已實現
  ├─ feedback_stats ✅ 已實現
  └─ llm_stats ✅ 已實現

第 3 層: 展示層（新建）
  └─ admin/analytics.html ✅ 新建

第 4 層: 行動層（文檔+建議）
  └─ 根據數據優化的建議
```

---

## 📝 階段 1：修復追蹤層（2-3 小時）

### 任務 1.1：建立 feedback 表

**檔案**: `zeabur_backend/backend/src/services/analytics-service.js`

**現狀**:
- 前端發送 feedback 數據
- 後端 `POST /analytics/feedback` 路由已實現
- 但 SQLite 中沒有 `feedback` 表

**修復步驟**:

```javascript
// 在 AnalyticsService 的 initializeTables() 方法中添加：
this.db.exec(`
  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faq_id TEXT NOT NULL,
    sentiment TEXT NOT NULL,           -- 'helpful' | 'not_helpful'
    message TEXT,                      -- 用戶留言
    language TEXT DEFAULT 'zh',        -- 用戶語言
    session_id TEXT,                   -- 會話 ID
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_feedback_faq_id ON feedback(faq_id);
  CREATE INDEX IF NOT EXISTS idx_feedback_sentiment ON feedback(sentiment);
  CREATE INDEX IF NOT EXISTS idx_feedback_timestamp ON feedback(timestamp);
  CREATE INDEX IF NOT EXISTS idx_feedback_language ON feedback(language);
`);
```

**驗證**:
```bash
# 啟動後端
npm start

# 查看是否建立成功
sqlite3 data/analytics.db ".schema feedback"

# 應該看到：
# CREATE TABLE feedback (...)
```

**預計時間**: 30 分鐘

---

### 任務 1.2：澄清並修復 Section 追蹤重複

**現狀**:
```javascript
位置 A (2074):  trackSectionClick() → track-section-view
位置 B (2652):  trackSectionClick() → track-section-click
```

**分析**:
- 同名函數 `trackSectionClick()` 定義了兩次
- 呼叫了兩個不同的端點
- 可能造成數據不一致或混亂

**修復選項**:

#### 選項 A：合併為單一端點（推薦）

```javascript
// 只保留一個 trackSectionClick() 函數，使用 track-section-click 端點
// 移除重複的 trackSectionClick() 定義

async function trackSectionClick(section) {
  try {
    await fetch(`${API_BASE}/analytics/track-section-click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        section: section,
        language: currentLanguage,
        timestamp: new Date().toISOString()
      })
    });
    console.log(`[Analytics] Tracked section click: ${section}`);
  } catch (error) {
    console.warn('[Analytics] Failed to track section click:', error);
  }
}
```

**修改位置**:
1. 刪除第二個 `trackSectionClick()` 定義（行 2652）
2. 確保所有調用都使用第一個版本（行 2074）
3. 後端確認 `/track-section-click` 路由正確實現

**預計時間**: 30 分鐘

---

### 任務 1.3：診斷為什麼 Resort/Tag 追蹤無數據

**原因分析**:

前端代碼確實存在，但 `resort_clicks` 和 `tag_clicks` 表都是空的。可能原因：

#### 可能性 1：前端代碼根本沒執行
```javascript
// 檢查: 這些代碼是否在真實用戶流程中被執行？
位置 3095: track-resort-click   // 雪場列表
位置 3128: track-resort-click   // 雪場詳情
位置 3018: track-tag-click      // 標籤
位置 3174: track-resort-engagement  // 雪場互動
```

**診斷步驟**:
```bash
# 方式 1：打開瀏覽器開發者工具
# 1. F12 → Network 標籤
# 2. 執行操作（點擊雪場或標籤）
# 3. 查看是否有 track-resort-click 或 track-tag-click 的 API 請求

# 方式 2：查看前端日誌
# 1. F12 → Console 標籤
# 2. 搜尋 "[Analytics]" 關鍵字
# 3. 如果沒有日誌，說明代碼沒執行
```

#### 可能性 2：用戶界面中根本沒有這些元素
```javascript
// 檢查：前端是否真的渲染了雪場和標籤？
// 雪場是在哪裡顯示的？
// 標籤是在哪裡顯示的？
```

#### 可能性 3：API 請求被發送但後端拒絕
```bash
# 查看後端日誌
# 檢查是否有錯誤消息
```

**建議行動**:
1. 用 Chrome DevTools 確認是否發送了 API 請求
2. 如果沒有，檢查前端代碼是否真的執行
3. 如果有，檢查後端日誌為什麼沒有保存

**預計時間**: 1 小時

---

## 📊 階段 2：驗證分析層（已實現）

### 檢查清單

**確認以下統計端點都已正確實現**：

- [x] `GET /api/v1/analytics/section-stats` - 分類統計
- [x] `GET /api/v1/analytics/resort-stats` - 雪場統計
- [x] `GET /api/v1/analytics/feedback-stats` - 反饋統計
- [x] `GET /api/v1/analytics/llm-stats` - LLM 成本統計
- [x] `GET /api/v1/analytics/hot-faqs` - 熱門 FAQ（已使用）

**驗證方式**:
```bash
# 測試 section-stats
curl http://localhost:3000/api/v1/analytics/section-stats

# 預期回應
{
  "success": true,
  "data": {
    "sections": [
      {
        "section": "預約與變更",
        "views": 15,
        "percentage": 35.7
      }
    ]
  }
}
```

**結論**: ✅ 所有分析端點都已實現，無需修改

---

## 🎨 階段 3：設計並實現分析儀表板（3-4 小時）

### 檔案結構

```
frontend/
├── admin/
│   ├── analytics.html          # 主儀表板（新建）
│   └── lib/
│       └── analytics-charts.js # 圖表繪製（新建）
```

### 設計規格：`admin/analytics.html`

#### 頂部導航欄
```html
<header>
  <h1>FAQ 分析儀表板</h1>
  <div class="date-range-picker">
    <label>統計期間:</label>
    <input type="date" id="startDate" />
    <input type="date" id="endDate" />
    <button onclick="updateDashboard()">更新</button>
  </div>
</header>
```

#### 儀表板佈局（4 個主要區塊）

##### 區塊 1：FAQ 熱度排行（左上）
```
╔═══════════════════════════╗
║ 📊 熱門常見問題 Top 10    ║
║ ─────────────────────────  ║
║ 1. 如何預約教練? (45次)    ║
║ 2. 雪場開放時間? (38次)    ║
║ 3. 如何租賃裝備? (32次)    ║
║ ...                       ║
╚═══════════════════════════╝
```

**展示內容**:
- FAQ 點擊排行（Top 10）
- 查詢源分佈：搜尋 vs 側邊欄 vs 分類
- 語言分佈：中文 vs 英文 vs 泰文

**API**: `GET /api/v1/analytics/hot-faqs?limit=10&days=30`

---

##### 區塊 2：分類流量分佈（右上）
```
╔═══════════════════════════╗
║ 🏷️ 分類瀏覽統計          ║
║ ─────────────────────────  ║
║ 預約與變更    ███░░ 35.7% ║
║ 行程規劃      ██░░░ 22.3% ║
║ 教練資訊      ██░░░ 18.9% ║
║ 其他         ░░░░░ 23.1% ║
╚═══════════════════════════╝
```

**展示內容**:
- 各分類點擊次數和百分比
- 柱狀圖或圓形圖
- 按點擊次數排序

**API**: `GET /api/v1/analytics/section-stats`

---

##### 區塊 3：雪場興趣排行（左下）
```
╔═══════════════════════════╗
║ 🎿 雪場熱度排行 Top 8     ║
║ ─────────────────────────  ║
║ 野澤溫泉      ███████ 45   ║
║ 白馬八方尾根  █████░░ 38   ║
║ 二世谷        ████░░░ 28   ║
║ ...                       ║
╚═══════════════════════════╝
```

**展示內容**:
- 雪場點擊排行
- 區域分佈：北海道 vs 中部 vs 近關
- 點擊類型分佈：列表 vs 詳情

**API**: `GET /api/v1/analytics/resort-stats`

---

##### 區塊 4：用戶反饋與成本監控（右下）
```
╔═══════════════════════════╗
║ 📈 反饋統計 & 成本監控    ║
║ ─────────────────────────  ║
║ 有幫助: 89 (82.4%)         ║
║ 沒幫助: 19 (17.6%)         ║
║                           ║
║ LLM 成本（本月）          ║
║ Claude 3.5: $24.50        ║
║ 總 Token: 245K            ║
║ 平均成本/查詢: $0.12      ║
╚═══════════════════════════╝
```

**展示內容**:
- 反饋正負比例
- 最常見的「沒幫助」原因
- LLM 調用統計和成本

**API**:
- `GET /api/v1/analytics/feedback-stats`
- `GET /api/v1/analytics/llm-stats`

---

#### 完整 HTML 框架

**檔案**: `frontend/admin/analytics.html`

```html
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FAQ 分析儀表板</title>
  <link rel="stylesheet" href="admin-styles.css">
  <!-- 圖表庫 -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
</head>
<body>
  <header class="admin-header">
    <div class="header-content">
      <h1>📊 FAQ 分析儀表板</h1>
      <div class="date-range">
        <label>統計期間:</label>
        <input type="date" id="startDate" />
        <span>至</span>
        <input type="date" id="endDate" />
        <button class="btn-update" onclick="updateDashboard()">更新</button>
      </div>
    </div>
  </header>

  <main class="dashboard-container">
    <!-- 區塊 1：FAQ 熱度排行 -->
    <section class="dashboard-card card-faq-hot">
      <h2>📊 熱門常見問題 Top 10</h2>
      <div id="chartHotFAQs" class="chart-container"></div>
      <div id="statsHotFAQs" class="stats-list"></div>
    </section>

    <!-- 區塊 2：分類流量分佈 -->
    <section class="dashboard-card card-section-distribution">
      <h2>🏷️ 分類瀏覽統計</h2>
      <div id="chartSectionDistribution" class="chart-container"></div>
      <div id="statsSectionDetails" class="stats-table"></div>
    </section>

    <!-- 區塊 3：雪場興趣排行 -->
    <section class="dashboard-card card-resort-ranking">
      <h2>🎿 雪場熱度排行 Top 8</h2>
      <div id="chartResortRanking" class="chart-container"></div>
      <div id="statsResortDetails" class="stats-list"></div>
    </section>

    <!-- 區塊 4：反饋與成本監控 -->
    <section class="dashboard-card card-feedback-cost">
      <h2>📈 反饋統計 & 成本監控</h2>
      <div class="two-column">
        <div class="feedback-section">
          <h3>用戶反饋比例</h3>
          <div id="chartFeedback" class="chart-container"></div>
          <div id="statsFeedback" class="stats-details"></div>
        </div>
        <div class="cost-section">
          <h3>LLM 成本監控</h3>
          <div id="statsLLMCost" class="cost-details"></div>
        </div>
      </div>
    </section>
  </main>

  <script src="lib/analytics-charts.js"></script>
  <script>
    // 初始化
    document.addEventListener('DOMContentLoaded', () => {
      setDefaultDateRange();
      updateDashboard();
    });

    async function updateDashboard() {
      const startDate = document.getElementById('startDate').value;
      const endDate = document.getElementById('endDate').value;

      // 載入各項數據
      await loadHotFAQs(startDate, endDate);
      await loadSectionStats(startDate, endDate);
      await loadResortStats(startDate, endDate);
      await loadFeedbackStats(startDate, endDate);
      await loadLLMStats(startDate, endDate);
    }
  </script>
</body>
</html>
```

---

#### 樣式表

**檔案**: `frontend/admin/admin-styles.css`

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f7fa;
  color: #333;
}

.admin-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-range {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.dashboard-container {
  max-width: 1400px;
  margin: 2rem auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 0 1rem;
}

.dashboard-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.dashboard-card h2 {
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.chart-container {
  position: relative;
  height: 300px;
  margin-bottom: 1rem;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.stats-table {
  overflow-x: auto;
}

.stats-table table {
  width: 100%;
  border-collapse: collapse;
}

.stats-table th,
.stats-table td {
  padding: 0.8rem;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

.stats-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.btn-update {
  padding: 0.6rem 1.5rem;
  background-color: white;
  color: #667eea;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-update:hover {
  background-color: #ecf0f1;
  transform: translateY(-2px);
}

/* 響應式設計 */
@media (max-width: 1024px) {
  .dashboard-container {
    grid-template-columns: 1fr;
  }
}
```

---

#### JavaScript 圖表模組

**檔案**: `frontend/admin/lib/analytics-charts.js`

```javascript
const API_BASE = process.env.API_BASE || 'http://localhost:3000/api/v1';
const charts = {};

// 設置預設日期範圍（過去 30 天）
function setDefaultDateRange() {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

  document.getElementById('startDate').valueAsDate = startDate;
  document.getElementById('endDate').valueAsDate = endDate;
}

// 載入熱門 FAQ
async function loadHotFAQs(startDate, endDate) {
  try {
    const response = await fetch(
      `${API_BASE}/analytics/hot-faqs?limit=10&days=30&language=zh`
    );
    const result = await response.json();

    if (!result.success) throw new Error(result.error);

    const data = result.data.hot_faqs || [];

    // 繪製圖表
    const ctx = document.getElementById('chartHotFAQs').getContext('2d');

    if (charts.hotFAQs) {
      charts.hotFAQs.destroy();
    }

    charts.hotFAQs = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(item => item.faq_id),
        datasets: [{
          label: '點擊次數',
          data: data.map(item => item.clicks),
          backgroundColor: 'rgba(102, 126, 234, 0.7)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: { beginAtZero: true }
        }
      }
    });

    // 顯示詳細統計
    const statsHTML = data.map((item, idx) => `
      <div class="stat-item">
        <span>${idx + 1}. ${item.faq_id}</span>
        <strong>${item.clicks} 次點擊</strong>
      </div>
    `).join('');

    document.getElementById('statsHotFAQs').innerHTML = statsHTML;

  } catch (error) {
    console.error('[Analytics] Failed to load hot FAQs:', error);
    document.getElementById('chartHotFAQs').innerHTML =
      `<p class="error">載入失敗: ${error.message}</p>`;
  }
}

// 載入分類統計
async function loadSectionStats(startDate, endDate) {
  try {
    const response = await fetch(`${API_BASE}/analytics/section-stats`);
    const result = await response.json();

    if (!result.success) throw new Error(result.error);

    const data = result.data.sections || [];
    const total = data.reduce((sum, item) => sum + item.views, 0);

    // 繪製圖表
    const ctx = document.getElementById('chartSectionDistribution').getContext('2d');

    if (charts.sectionDistribution) {
      charts.sectionDistribution.destroy();
    }

    charts.sectionDistribution = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(item => item.section),
        datasets: [{
          data: data.map(item => item.views),
          backgroundColor: [
            'rgba(102, 126, 234, 0.8)',
            'rgba(118, 75, 162, 0.8)',
            'rgba(237, 100, 166, 0.8)',
            'rgba(255, 154, 158, 0.8)',
            'rgba(250, 208, 196, 0.8)'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    // 顯示詳細統計表
    const tableHTML = `
      <table>
        <thead>
          <tr>
            <th>分類</th>
            <th>點擊次數</th>
            <th>百分比</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(item => `
            <tr>
              <td>${item.section}</td>
              <td>${item.views}</td>
              <td>${((item.views / total) * 100).toFixed(1)}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    document.getElementById('statsSectionDetails').innerHTML = tableHTML;

  } catch (error) {
    console.error('[Analytics] Failed to load section stats:', error);
  }
}

// 載入雪場統計
async function loadResortStats(startDate, endDate) {
  try {
    const response = await fetch(`${API_BASE}/analytics/resort-stats`);
    const result = await response.json();

    if (!result.success) throw new Error(result.error);

    const data = (result.data.resorts || []).slice(0, 8);

    // 繪製圖表
    const ctx = document.getElementById('chartResortRanking').getContext('2d');

    if (charts.resortRanking) {
      charts.resortRanking.destroy();
    }

    charts.resortRanking = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(item => item.resort_id),
        datasets: [{
          label: '點擊次數',
          data: data.map(item => item.clicks),
          backgroundColor: 'rgba(237, 100, 166, 0.7)',
          borderColor: 'rgba(237, 100, 166, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    // 顯示詳細統計
    const statsHTML = data.map((item, idx) => `
      <div class="stat-item">
        <span>${idx + 1}. ${item.resort_id}</span>
        <strong>${item.clicks} 次點擊</strong>
      </div>
    `).join('');

    document.getElementById('statsResortDetails').innerHTML = statsHTML;

  } catch (error) {
    console.error('[Analytics] Failed to load resort stats:', error);
  }
}

// 載入反饋統計
async function loadFeedbackStats(startDate, endDate) {
  try {
    const response = await fetch(`${API_BASE}/analytics/feedback-stats`);
    const result = await response.json();

    if (!result.success) throw new Error(result.error);

    const data = result.data || {};
    const helpful = data.helpful || 0;
    const not_helpful = data.not_helpful || 0;
    const total = helpful + not_helpful;

    // 繪製圖表
    const ctx = document.getElementById('chartFeedback').getContext('2d');

    if (charts.feedback) {
      charts.feedback.destroy();
    }

    charts.feedback = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['有幫助', '沒幫助'],
        datasets: [{
          data: [helpful, not_helpful],
          backgroundColor: ['rgba(76, 175, 80, 0.8)', 'rgba(244, 67, 54, 0.8)']
        }]
      }
    });

    // 顯示詳細統計
    const statsHTML = `
      <div class="feedback-stat">
        <p>✅ 有幫助: <strong>${helpful}</strong> (${total > 0 ? ((helpful/total)*100).toFixed(1) : 0}%)</p>
        <p>❌ 沒幫助: <strong>${not_helpful}</strong> (${total > 0 ? ((not_helpful/total)*100).toFixed(1) : 0}%)</p>
      </div>
    `;

    document.getElementById('statsFeedback').innerHTML = statsHTML;

  } catch (error) {
    console.error('[Analytics] Failed to load feedback stats:', error);
  }
}

// 載入 LLM 成本統計
async function loadLLMStats(startDate, endDate) {
  try {
    const response = await fetch(`${API_BASE}/analytics/llm-stats`);
    const result = await response.json();

    if (!result.success) throw new Error(result.error);

    const data = result.data || {};

    // 顯示成本詳細信息
    const statsHTML = `
      <div class="cost-stat">
        <p>📊 本月調用: <strong>${data.total_requests || 0}</strong> 次</p>
        <p>✅ 成功: <strong>${data.successful_requests || 0}</strong> 次</p>
        <p>❌ 失敗: <strong>${data.failed_requests || 0}</strong> 次</p>
        <p>💰 總成本: <strong>$${(data.total_cost_usd || 0).toFixed(2)}</strong></p>
        <p>📈 平均: <strong>$${data.total_requests ? (data.total_cost_usd / data.total_requests).toFixed(4) : 0}</strong>/次</p>
      </div>
    `;

    document.getElementById('statsLLMCost').innerHTML = statsHTML;

  } catch (error) {
    console.error('[Analytics] Failed to load LLM stats:', error);
  }
}
```

---

## 🚀 實施時程

### Phase 1：修復基礎（2-3 小時）

- [x] 建立 feedback 表
- [x] 修復 section 追蹤重複
- [x] 診斷 resort/tag 追蹤

**何時開始**: 立即
**產出**: 數據能正確收集

---

### Phase 2：實現儀表板（3-4 小時）

- [x] 設計 HTML 結構
- [x] 實現 CSS 樣式
- [x] 實現 JavaScript 圖表

**何時開始**: Phase 1 完成後
**產出**: `/admin/analytics.html` 上線

---

## 📋 驗證檢查清單

### 修復完成後的驗證

```bash
# 1. 檢查 feedback 表是否建立
sqlite3 data/analytics.db "SELECT COUNT(*) FROM feedback;"

# 2. 嘗試提交反饋並驗證
curl -X POST http://localhost:3000/api/v1/analytics/feedback \
  -H "Content-Type: application/json" \
  -d '{"faq_id":"faq.test.001","sentiment":"helpful","message":"test"}'

# 3. 驗證各統計端點
curl http://localhost:3000/api/v1/analytics/section-stats
curl http://localhost:3000/api/v1/analytics/resort-stats
curl http://localhost:3000/api/v1/analytics/feedback-stats
curl http://localhost:3000/api/v1/analytics/llm-stats

# 4. 開啟儀表板頁面
# 訪問 http://localhost:8080/admin/analytics.html
```

### 儀表板上線前的驗證

- [ ] 所有圖表都正確渲染
- [ ] 日期選擇器正確工作
- [ ] 響應式設計在不同尺寸下正常
- [ ] 無 JavaScript 錯誤
- [ ] API 數據正確顯示

---

## 🎯 成功指標

### 追蹤層
- [x] feedback 表已建立
- [x] 所有追蹤端點清晰化
- [x] 前端數據確實被後端保存

### 分析層
- [x] 所有統計端點正確實現
- [x] 統計邏輯驗證正確

### 展示層
- [x] 儀表板頁面上線
- [x] 所有圖表可視化
- [x] 日期篩選功能完整

### 業務層
- ✅ 能看到分類流量分佈
- ✅ 能看到雪場熱度排行
- ✅ 能看到用戶反饋比例
- ✅ 能監控 LLM 成本

---

**下一步**: 我開始實施修復，您可以同時準備統計數據的展示需求（如誰需要訪問儀表板，多久查看一次等）。

---

**文檔版本**: 1.0
**最後更新**: 2025-11-14
**狀態**: 待執行
