/**
 * FAQ 分析儀表板 - 圖表模組
 * 負責載入數據和繪製圖表
 */

// API 基礎 URL - 自動適配開發和生產環境
const API_BASE = (() => {
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  return isDev ? 'http://localhost:3000/api/v1' : '/api/v1';
})();

// 圖表實例儲存
const charts = {};

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', () => {
  setDefaultDateRange();
  updateDashboard();

  // 每天自動刷新一次（可選）
  // setInterval(updateDashboard, 24 * 60 * 60 * 1000);
});

// 設置預設日期範圍（過去 30 天）
function setDefaultDateRange() {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

  document.getElementById('startDate').valueAsDate = startDate;
  document.getElementById('endDate').valueAsDate = endDate;
}

// 更新儀表板
async function updateDashboard() {
  console.log('[Analytics Dashboard] 開始更新儀表板...');

  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  try {
    // 並行載入所有數據
    await Promise.all([
      loadHotFAQs(startDate, endDate),
      loadSectionStats(startDate, endDate),
      loadResortStats(startDate, endDate),
      loadFeedbackStats(startDate, endDate),
      loadLLMStats(startDate, endDate)
    ]);

    console.log('[Analytics Dashboard] 儀表板更新完成');
  } catch (error) {
    console.error('[Analytics Dashboard] 更新失敗:', error);
  }
}

// ==================== 熱門 FAQ 載入 ====================

async function loadHotFAQs(startDate, endDate) {
  try {
    const response = await fetch(`${API_BASE}/analytics/hot-faqs?limit=10&days=30&language=zh`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || '載入失敗');
    }

    const data = result.data.hot_faqs || [];
    console.log('[Hot FAQs] 載入完成，共', data.length, '筆');

    // 繪製柱狀圖
    const ctx = document.getElementById('chartHotFAQs');

    // 清空 loading 狀態
    ctx.innerHTML = '';
    ctx.parentElement.style.height = '300px';

    const canvas = document.createElement('canvas');
    ctx.appendChild(canvas);
    const chartCtx = canvas.getContext('2d');

    if (charts.hotFAQs) {
      charts.hotFAQs.destroy();
    }

    charts.hotFAQs = new Chart(chartCtx, {
      type: 'bar',
      data: {
        labels: data.map(item => {
          // 縮短 FAQ ID 以適應圖表
          const parts = item.faq_id.split('.');
          return parts.length > 1 ? parts.slice(1).join('.') : item.faq_id;
        }),
        datasets: [{
          label: '點擊次數',
          data: data.map(item => item.clicks || 0),
          backgroundColor: 'rgba(102, 126, 234, 0.7)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: { beginAtZero: true }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    });

    // 顯示詳細統計
    const statsHTML = data.map((item, idx) => `
      <div class="stat-item">
        <span>${idx + 1}. ${item.faq_id}</span>
        <strong>${item.clicks || 0}</strong>
      </div>
    `).join('');

    document.getElementById('statsHotFAQs').innerHTML = statsHTML || '<p class="error">無數據</p>';
    document.getElementById('hotFaqsTime').textContent = '最後更新: ' + new Date().toLocaleString('zh-TW');

  } catch (error) {
    console.error('[Hot FAQs] 錯誤:', error);
    document.getElementById('chartHotFAQs').innerHTML = `<div class="error">❌ ${error.message}</div>`;
    document.getElementById('statsHotFAQs').innerHTML = '<div class="error">無法載入數據</div>';
  }
}

// ==================== 分類統計載入 ====================

async function loadSectionStats(startDate, endDate) {
  try {
    const response = await fetch(`${API_BASE}/analytics/section-stats`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || '載入失敗');
    }

    const data = result.data.sections || [];
    const total = data.reduce((sum, item) => sum + (item.views || 0), 0);

    console.log('[Section Stats] 載入完成，共', data.length, '個分類');

    // 繪製圓形圖
    const ctx = document.getElementById('chartSectionDistribution');
    ctx.innerHTML = '';
    ctx.parentElement.style.height = '300px';

    const canvas = document.createElement('canvas');
    ctx.appendChild(canvas);
    const chartCtx = canvas.getContext('2d');

    if (charts.sectionDistribution) {
      charts.sectionDistribution.destroy();
    }

    charts.sectionDistribution = new Chart(chartCtx, {
      type: 'doughnut',
      data: {
        labels: data.map(item => item.section || '未分類'),
        datasets: [{
          data: data.map(item => item.views || 0),
          backgroundColor: [
            'rgba(102, 126, 234, 0.8)',
            'rgba(118, 75, 162, 0.8)',
            'rgba(237, 100, 166, 0.8)',
            'rgba(255, 154, 158, 0.8)',
            'rgba(250, 208, 196, 0.8)',
            'rgba(255, 183, 77, 0.8)',
            'rgba(76, 175, 80, 0.8)',
            'rgba(33, 150, 243, 0.8)'
          ],
          borderColor: 'white',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });

    // 顯示詳細統計表
    const tableHTML = `
      <table>
        <thead>
          <tr>
            <th>分類名稱</th>
            <th>點擊次數</th>
            <th>百分比</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(item => `
            <tr>
              <td><strong>${item.section || '未分類'}</strong></td>
              <td>${item.views || 0}</td>
              <td><span class="stat-percentage">${total > 0 ? ((item.views || 0) / total * 100).toFixed(1) : 0}%</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    document.getElementById('statsSectionDetails').innerHTML = tableHTML || '<div class="error">無數據</div>';
    document.getElementById('sectionTime').textContent = '最後更新: ' + new Date().toLocaleString('zh-TW');

  } catch (error) {
    console.error('[Section Stats] 錯誤:', error);
    document.getElementById('chartSectionDistribution').innerHTML = `<div class="error">❌ ${error.message}</div>`;
    document.getElementById('statsSectionDetails').innerHTML = '<div class="error">無法載入數據</div>';
  }
}

// ==================== 雪場統計載入 ====================

async function loadResortStats(startDate, endDate) {
  try {
    const response = await fetch(`${API_BASE}/analytics/resort-stats`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || '載入失敗');
    }

    const data = (result.data.resorts || []).slice(0, 8);
    console.log('[Resort Stats] 載入完成，共', data.length, '個雪場');

    // 繪製柱狀圖
    const ctx = document.getElementById('chartResortRanking');
    ctx.innerHTML = '';
    ctx.parentElement.style.height = '300px';

    const canvas = document.createElement('canvas');
    ctx.appendChild(canvas);
    const chartCtx = canvas.getContext('2d');

    if (charts.resortRanking) {
      charts.resortRanking.destroy();
    }

    charts.resortRanking = new Chart(chartCtx, {
      type: 'bar',
      data: {
        labels: data.map(item => item.resort_id || '未知'),
        datasets: [{
          label: '點擊次數',
          data: data.map(item => item.clicks || 0),
          backgroundColor: 'rgba(237, 100, 166, 0.7)',
          borderColor: 'rgba(237, 100, 166, 1)',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    });

    // 顯示詳細統計
    const statsHTML = data.map((item, idx) => `
      <div class="stat-item">
        <span>${idx + 1}. ${item.resort_id || '未知'} ${item.region ? '(' + item.region + ')' : ''}</span>
        <strong>${item.clicks || 0}</strong>
      </div>
    `).join('');

    document.getElementById('statsResortDetails').innerHTML = statsHTML || '<p class="error">無數據</p>';
    document.getElementById('resortTime').textContent = '最後更新: ' + new Date().toLocaleString('zh-TW');

  } catch (error) {
    console.error('[Resort Stats] 錯誤:', error);
    document.getElementById('chartResortRanking').innerHTML = `<div class="error">❌ ${error.message}</div>`;
    document.getElementById('statsResortDetails').innerHTML = '<div class="error">無法載入數據</div>';
  }
}

// ==================== 反饋統計載入 ====================

async function loadFeedbackStats(startDate, endDate) {
  try {
    const response = await fetch(`${API_BASE}/analytics/feedback-stats`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || '載入失敗');
    }

    const data = result.data || {};
    const helpful = data.helpful_count || 0;
    const not_helpful = data.not_helpful_count || 0;
    const total = helpful + not_helpful;

    console.log('[Feedback Stats] 載入完成，共', total, '筆反饋');

    // 繪製圓形圖
    const ctx = document.getElementById('chartFeedback');
    ctx.innerHTML = '';
    ctx.parentElement.style.height = '300px';

    const canvas = document.createElement('canvas');
    ctx.appendChild(canvas);
    const chartCtx = canvas.getContext('2d');

    if (charts.feedback) {
      charts.feedback.destroy();
    }

    charts.feedback = new Chart(chartCtx, {
      type: 'doughnut',
      data: {
        labels: ['有幫助', '沒幫助'],
        datasets: [{
          data: [helpful, not_helpful],
          backgroundColor: ['rgba(76, 175, 80, 0.8)', 'rgba(244, 67, 54, 0.8)'],
          borderColor: 'white',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });

    // 顯示詳細統計
    const statsHTML = `
      <p>✅ <strong>有幫助</strong>: <strong>${helpful}</strong> (${total > 0 ? ((helpful / total) * 100).toFixed(1) : 0}%)</p>
      <p>❌ <strong>沒幫助</strong>: <strong>${not_helpful}</strong> (${total > 0 ? ((not_helpful / total) * 100).toFixed(1) : 0}%)</p>
      <p>📊 <strong>總計</strong>: <strong>${total}</strong> 筆反饋</p>
    `;

    document.getElementById('statsFeedback').innerHTML = statsHTML || '<p class="error">無數據</p>';
    document.getElementById('feedbackTime').textContent = '最後更新: ' + new Date().toLocaleString('zh-TW');

  } catch (error) {
    console.error('[Feedback Stats] 錯誤:', error);
    document.getElementById('chartFeedback').innerHTML = `<div class="error">❌ ${error.message}</div>`;
    document.getElementById('statsFeedback').innerHTML = '<div class="error">無法載入數據</div>';
  }
}

// ==================== LLM 成本統計載入 ====================

async function loadLLMStats(startDate, endDate) {
  try {
    const response = await fetch(`${API_BASE}/analytics/llm-stats`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || '載入失敗');
    }

    const data = result.data || {};
    console.log('[LLM Stats] 載入完成');

    // 顯示成本詳細信息
    const totalRequests = data.total_requests || 0;
    const totalCost = (data.total_cost_usd || 0).toFixed(2);
    const avgCost = totalRequests > 0 ? (data.total_cost_usd / totalRequests).toFixed(4) : 0;
    const successRate = totalRequests > 0 ? ((data.successful_requests || 0) / totalRequests * 100).toFixed(1) : 0;

    const statsHTML = `
      <p>📞 <strong>本月調用</strong>: <strong>${totalRequests}</strong> 次</p>
      <p>✅ <strong>成功率</strong>: <strong>${successRate}</strong>%</p>
      <p>💰 <strong>總成本</strong>: <strong>$${totalCost}</strong></p>
      <p>📈 <strong>平均成本</strong>: <strong>$${avgCost}</strong>/次</p>
    `;

    document.getElementById('statsLLMCost').innerHTML = statsHTML || '<p class="error">無數據</p>';
    document.getElementById('feedbackTime').textContent = '最後更新: ' + new Date().toLocaleString('zh-TW');

  } catch (error) {
    console.error('[LLM Stats] 錯誤:', error);
    document.getElementById('statsLLMCost').innerHTML = `<div class="error">❌ ${error.message}</div>`;
  }
}

// ==================== 工具函數 ====================

/**
 * 格式化時間戳
 */
function formatDate(date) {
  return new Date(date).toLocaleString('zh-TW');
}

/**
 * 格式化貨幣
 */
function formatCurrency(value) {
  return '$' + parseFloat(value).toFixed(2);
}
