(function(global) {
  'use strict';

  function renderBarChart(containerId, dailyData, valueField = 'clicks', emptyText = '暫無每日數據') {
    const container = typeof containerId === 'string'
      ? document.getElementById(containerId)
      : containerId;

    if (!container) return;

    if (!dailyData || dailyData.length === 0) {
      container.innerHTML = `<div class="no-data">${emptyText}</div>`;
      return;
    }

    const maxValue = Math.max(...dailyData.map(d => d[valueField] || 0));
    const sortedData = [...dailyData].reverse();

    const bars = sortedData.map(day => {
      const value = day[valueField] || 0;
      const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
      const date = new Date(day.date);
      const label = `${date.getMonth() + 1}/${date.getDate()}`;

      return `
        <div class="bar-item">
          <div class="bar" style="height: ${heightPercent}%">
            <div class="bar-value">${value}</div>
          </div>
          <div class="bar-label">${label}</div>
        </div>
      `;
    }).join('');

    const lowSample = sortedData.length < 3 ? '<div style="color:#999;font-size:12px;margin-top:8px;text-align:center;">樣本數較少，僅供參考</div>' : '';
    container.innerHTML = `<div class="chart-bars">${bars}</div>${lowSample}`;
  }

  function showInlineError(containerId, message) {
    const el = document.getElementById(containerId);
    if (el) {
      el.innerHTML = `<p style="text-align: center; color: #991b1b; padding: 2rem;">${message}</p>`;
    }
  }

  global.AnalyticsUtils = {
    renderBarChart,
    showInlineError
  };
})(window);
