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
  // IMPORTANT: Also set window.API_BASE for FAQEngine compatibility
  window.API_BASE = 'https://faq-api-v1.zeabur.app/api/v1';
  window.BACKEND_URL = 'https://faq-api-v1.zeabur.app/api/v1';
  console.log('[ENV] Using Zeabur backend:', window.ENV_API_BASE);
} else {
  // LINUS PRINCIPLE: Eliminate special cases - detect localhost + non-production port
  // window.location.port can be string or number, so normalize it
  const port = String(window.location.port);
  const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const isLocalDev = isLocalhost && (port === '8080' || port === '5000' || port === '3000' || port === '');

  if (isLocalDev) {
    // Local development: frontend on 8080 → backend on 3000
    window.ENV_API_ROOT = 'http://localhost:3000';
    window.ENV_API_BASE = `${window.ENV_API_ROOT}/api/v1`;
    window.API_BASE = window.ENV_API_BASE;
    window.BACKEND_URL = window.ENV_API_BASE;
    console.log('[ENV] Local dev detected, using backend:', window.ENV_API_BASE);
  } else {
    // 其他情況使用相對路徑（例如整合到同一主機時）
    window.ENV_API_BASE = window.ENV_API_BASE || '/api/v1';
    window.ENV_API_ROOT = window.ENV_API_ROOT || '';
    window.API_BASE = window.API_BASE || '/api/v1';
    window.BACKEND_URL = window.BACKEND_URL || '/api/v1';
  }
}
