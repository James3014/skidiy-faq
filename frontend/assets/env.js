// 環境變數配置
// 開發環境：使用本機後端
// 生產環境（Zeabur）：使用 Zeabur 後端服務

// 檢測是否在生產環境（Zeabur 或自訂網域）
const isProduction = window.location.hostname.includes('zeabur.app') ||
                     window.location.hostname.includes('diy.ski');

// 如果在生產環境且沒有手動設定，使用 Zeabur 後端 URL
// 注意：如果後端服務未部署，前端會優雅降級使用 localStorage
if (isProduction && !window.ENV_API_BASE) {
  // TODO: 替換為實際的 Zeabur 後端 URL
  // 目前設為 null 讓前端使用 localStorage
  // 部署後端後，更新為: 'https://YOUR-BACKEND-URL.zeabur.app/api/v1'
  window.ENV_API_BASE = null; // 暫時停用後端 API
  window.ENV_API_ROOT = null;
  console.warn('[ENV] Backend API disabled, using localStorage only');
} else {
  // 本機開發環境，使用相對路徑
  window.ENV_API_BASE = window.ENV_API_BASE || '/api/v1';
  window.ENV_API_ROOT = window.ENV_API_ROOT || '';
}
