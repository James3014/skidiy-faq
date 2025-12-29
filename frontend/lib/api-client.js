// Lightweight API/config client for frontend pages
// Ensures a single source of truth for API_BASE/BACKEND_URL and provides helpers for fetch.
(function (global) {
  const isLocalhost = ['localhost', '127.0.0.1'].includes(global.location.hostname);
  const envBase = global.ENV_API_BASE || global.API_BASE;
  const defaultBase = envBase
    ? envBase
    : isLocalhost
      ? 'http://localhost:3000/api/v1'
      : '/api/v1';

  function normalizeBase(url) {
    if (!url) return '/api/v1';
    const trimmed = url.replace(/\/+$/, '');
    return trimmed;
  }

  function deriveRoot(baseUrl) {
    if (typeof baseUrl !== 'string') return '';
    if (/^https?:\/\//.test(baseUrl)) {
      try {
        const u = new URL(baseUrl);
        const path = u.pathname.replace(/\/+$/, '');
        if (path.endsWith('/api/v1')) {
          u.pathname = path.slice(0, -'/api/v1'.length) || '/';
        }
        return u.toString().replace(/\/+$/, '');
      } catch (err) {
        console.warn('[ApiClient] Failed to derive root from base:', err);
        return '';
      }
    }
    // relative path
    if (baseUrl.endsWith('/api/v1')) {
      return baseUrl.slice(0, -'/api/v1'.length) || '';
    }
    return '';
  }

  const baseUrl = normalizeBase(defaultBase);
  const backendUrl = global.BACKEND_URL || baseUrl;
  const rootUrl = global.ENV_API_ROOT || deriveRoot(baseUrl);

  function resolveUrl(path) {
    if (typeof path !== 'string') return baseUrl;
    if (/^https?:\/\//.test(path)) return path;
    if (path.startsWith('/')) return `${baseUrl}${path}`;
    return `${baseUrl}/${path}`;
  }

  async function apiFetch(path, options = {}) {
    const url = resolveUrl(path);
    return fetch(url, options);
  }

  async function fetchJson(path, options = {}) {
    const response = await apiFetch(path, options);
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : null;
    return { ok: response.ok, status: response.status, data, response };
  }

  global.ApiClient = {
    baseUrl,
    backendUrl,
    rootUrl,
    resolveUrl,
    apiFetch,
    fetchJson
  };

  // Publish globals for legacy code paths
  global.API_BASE = baseUrl;
  global.BACKEND_URL = backendUrl;
})(window);
