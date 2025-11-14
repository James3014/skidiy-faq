/**
 * Admin Page Access Control
 *
 * 簡單的前端密碼驗證系統，用於保護管理頁面
 * 使用 localStorage 儲存登入狀態
 */

(function() {
  'use strict';

  // 配置
  const CONFIG = {
    // 管理員密碼（SHA-256 雜湊值）
    // ⚠️ 請立即更改此雜湊值！
    // 使用 scripts/generate-admin-password.js 生成新的雜湊值
    // 範例: node scripts/generate-admin-password.js "YourSecurePassword"
    PASSWORD_HASH: 'e26586c5e5322452d4878df93f91c49a0946cabdd3805fbdc6c813f49ee1a255',

    // Session 有效期限（毫秒）
    SESSION_DURATION: 8 * 60 * 60 * 1000, // 8 小時

    // localStorage 鍵名
    STORAGE_KEY: 'admin_session',

    // 登入頁面 URL
    LOGIN_PAGE: '/admin-login.html',

    // 允許的管理頁面（相對路徑）
    PROTECTED_PAGES: [
      '/menu.html',
      '/analytics.html',
      '/admin.html',
      '/docs.html',
      '/faq-admin.html',
      '/resort-admin.html'
    ]
  };

  /**
   * 生成 SHA-256 雜湊值
   */
  async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  /**
   * 驗證密碼
   */
  async function verifyPassword(password) {
    const hash = await sha256(password);
    return hash === CONFIG.PASSWORD_HASH;
  }

  /**
   * 檢查 Session 是否有效
   */
  function isSessionValid() {
    try {
      const sessionData = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (!sessionData) return false;

      const session = JSON.parse(sessionData);
      const now = Date.now();

      // 檢查過期時間
      if (session.expiresAt < now) {
        logout();
        return false;
      }

      // 更新最後訪問時間
      session.lastAccess = now;
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(session));

      return true;
    } catch (error) {
      console.error('[AdminAuth] Session check error:', error);
      return false;
    }
  }

  /**
   * 建立新 Session
   */
  function createSession() {
    const now = Date.now();
    const session = {
      createdAt: now,
      lastAccess: now,
      expiresAt: now + CONFIG.SESSION_DURATION
    };
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(session));
  }

  /**
   * 登出
   */
  function logout() {
    localStorage.removeItem(CONFIG.STORAGE_KEY);
  }

  /**
   * 檢查當前頁面是否為受保護頁面
   */
  function isProtectedPage() {
    const currentPath = window.location.pathname;
    return CONFIG.PROTECTED_PAGES.some(page => currentPath.endsWith(page));
  }

  /**
   * 顯示登入對話框
   */
  function showLoginDialog() {
    return new Promise((resolve, reject) => {
      // 建立遮罩層
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999999;
        backdrop-filter: blur(5px);
      `;

      // 建立登入框
      const loginBox = document.createElement('div');
      loginBox.style.cssText = `
        background: white;
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        width: 90%;
        animation: slideIn 0.3s ease-out;
      `;

      loginBox.innerHTML = `
        <style>
          @keyframes slideIn {
            from {
              transform: translateY(-20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .admin-login-title {
            font-size: 24px;
            font-weight: 600;
            color: #619AEC;
            margin-bottom: 10px;
            text-align: center;
          }
          .admin-login-subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 30px;
            text-align: center;
          }
          .admin-login-input {
            width: 100%;
            padding: 12px 16px;
            font-size: 16px;
            border: 2px solid #E0E0E0;
            border-radius: 8px;
            box-sizing: border-box;
            transition: border-color 0.3s;
          }
          .admin-login-input:focus {
            outline: none;
            border-color: #619AEC;
          }
          .admin-login-error {
            color: #F44336;
            font-size: 14px;
            margin-top: 10px;
            text-align: center;
            min-height: 20px;
          }
          .admin-login-buttons {
            display: flex;
            gap: 12px;
            margin-top: 24px;
          }
          .admin-login-btn {
            flex: 1;
            padding: 12px;
            font-size: 16px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            font-weight: 500;
          }
          .admin-login-btn-primary {
            background: #619AEC;
            color: white;
          }
          .admin-login-btn-primary:hover {
            background: #4A7BC8;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(97, 154, 236, 0.3);
          }
          .admin-login-btn-secondary {
            background: #F5F5F5;
            color: #666;
          }
          .admin-login-btn-secondary:hover {
            background: #E0E0E0;
          }
        </style>
        <div class="admin-login-title">🔒 管理員登入</div>
        <div class="admin-login-subtitle">請輸入管理員密碼以繼續</div>
        <input
          type="password"
          id="admin-password-input"
          class="admin-login-input"
          placeholder="請輸入密碼"
          autocomplete="current-password"
        >
        <div id="admin-login-error" class="admin-login-error"></div>
        <div class="admin-login-buttons">
          <button id="admin-cancel-btn" class="admin-login-btn admin-login-btn-secondary">
            取消
          </button>
          <button id="admin-login-btn" class="admin-login-btn admin-login-btn-primary">
            登入
          </button>
        </div>
      `;

      overlay.appendChild(loginBox);
      document.body.appendChild(overlay);

      const passwordInput = document.getElementById('admin-password-input');
      const errorDiv = document.getElementById('admin-login-error');
      const loginBtn = document.getElementById('admin-login-btn');
      const cancelBtn = document.getElementById('admin-cancel-btn');

      // 自動 focus 輸入框
      setTimeout(() => passwordInput.focus(), 100);

      // 登入處理
      const handleLogin = async () => {
        const password = passwordInput.value.trim();

        if (!password) {
          errorDiv.textContent = '請輸入密碼';
          return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = '驗證中...';
        errorDiv.textContent = '';

        try {
          const isValid = await verifyPassword(password);

          if (isValid) {
            createSession();
            document.body.removeChild(overlay);
            resolve(true);
          } else {
            errorDiv.textContent = '密碼錯誤，請重試';
            passwordInput.value = '';
            passwordInput.focus();
            loginBtn.disabled = false;
            loginBtn.textContent = '登入';
          }
        } catch (error) {
          console.error('[AdminAuth] Login error:', error);
          errorDiv.textContent = '登入失敗，請重試';
          loginBtn.disabled = false;
          loginBtn.textContent = '登入';
        }
      };

      // 取消處理
      const handleCancel = () => {
        document.body.removeChild(overlay);
        reject(new Error('User cancelled login'));
      };

      // 事件監聽
      loginBtn.addEventListener('click', handleLogin);
      cancelBtn.addEventListener('click', handleCancel);
      passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
      });
    });
  }

  /**
   * 初始化訪問控制
   */
  async function init() {
    // 只在受保護頁面執行
    if (!isProtectedPage()) {
      return;
    }

    console.log('[AdminAuth] Checking access...');

    // 檢查 Session
    if (isSessionValid()) {
      console.log('[AdminAuth] Valid session found');
      return;
    }

    // 需要登入
    console.log('[AdminAuth] No valid session, showing login dialog');

    try {
      await showLoginDialog();

      // 登入成功
      console.log('[AdminAuth] Login successful');
    } catch (error) {
      console.log('[AdminAuth] Login cancelled, redirecting to home');
      // 登入取消，返回首頁
      window.location.href = '/';
    }
  }

  /**
   * 全域 API
   */
  window.AdminAuth = {
    logout: logout,
    isAuthenticated: isSessionValid,
    showLogin: showLoginDialog,

    // 更改密碼雜湊（開發用）
    async generatePasswordHash(password) {
      const hash = await sha256(password);
      console.log('Password hash:', hash);
      return hash;
    }
  };

  // 頁面載入時執行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
