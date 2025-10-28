// Global API configuration helper
// Allows overriding window.API_BASE before other scripts run.
(function () {
  if (!window.API_BASE) {
    const defaultBase = window.location.hostname === 'localhost'
      ? 'http://localhost:3000/api/v1'
      : (window.ENV_API_BASE || '/api/v1');

    window.API_BASE = defaultBase;
  }

  if (!window.API_ROOT) {
    if (window.ENV_API_ROOT) {
      window.API_ROOT = window.ENV_API_ROOT.replace(/\/$/, '');
      return;
    }

    const base = window.API_BASE || '';

    if (/^https?:\/\//.test(base)) {
      try {
        const url = new URL(base);
        const sanitizedPath = url.pathname.replace(/\/$/, '');
        if (sanitizedPath.endsWith('/api/v1')) {
          url.pathname = sanitizedPath.slice(0, -'/api/v1'.length) || '/';
        }
        window.API_ROOT = url.toString().replace(/\/$/, '');
      } catch (error) {
        console.warn('[config] Failed to parse API_BASE URL:', error);
        window.API_ROOT = '';
      }
    } else if (base.endsWith('/api/v1')) {
      window.API_ROOT = base.slice(0, -'/api/v1'.length) || '';
    } else {
      window.API_ROOT = '';
    }
  }
})();
