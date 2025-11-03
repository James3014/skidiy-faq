// 環境變數配置
// 開發環境：使用本機後端
// 生產環境（Zeabur）：使用 Zeabur 後端服務

// 檢測是否在生產環境（Zeabur 或自訂網域）
const isProduction = window.location.hostname.includes('zeabur.app') ||
                     window.location.hostname.includes('diy.ski');

// 如果在生產環境且沒有手動設定，使用 Zeabur 後端 URL
if (isProduction && !window.ENV_API_BASE) {
  window.ENV_API_BASE = 'https://faq-api-v1.zeabur.app/api/v1';
  window.ENV_API_ROOT = 'https://faq-api-v1.zeabur.app';
  console.log('[ENV] Using Zeabur backend:', window.ENV_API_BASE);
} else {
  // 本機開發環境，使用相對路徑
  window.ENV_API_BASE = window.ENV_API_BASE || '/api/v1';
  window.ENV_API_ROOT = window.ENV_API_ROOT || '';
}
