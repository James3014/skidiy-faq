/**
 * auth-helper.js
 *
 * LINUS PRINCIPLE: "消除特殊情況"
 * 只有一個函數：getUserIdOrNull()
 * 成功 → 返回 user_id (string)
 * 失敗 → 返回 null
 *
 * FAQ 系統不需要知道「為什麼」沒有 user_id，只管記錄。
 */

/**
 * 從 URL 取得 token 並驗證，返回 user_id 或 null
 * @returns {Promise<string|null>} 用戶 ID 或 null
 */
async function getUserIdOrNull() {
  try {
    // Step 1: 從 URL 取得 token
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      // 沒有 token = 未登入用戶（正常情況）
      return null;
    }

    // Step 2: 調用 API 驗證 token
    const response = await fetch('https://api.diy.ski/web/auth', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Step 3: 解析回應
    if (!response.ok) {
      // Token 無效/過期（降級為匿名用戶）
      console.log('[Auth] Token validation failed, using anonymous mode');
      return null;
    }

    const data = await response.json();

    // Step 4: 提取 user_id
    if (data && data.data && data.data.member && data.data.member._id) {
      const userId = data.data.member._id;
      console.log('[Auth] User authenticated:', userId);
      return userId;
    }

    // 回應格式不符（降級為匿名用戶）
    console.log('[Auth] Invalid response format, using anonymous mode');
    return null;

  } catch (error) {
    // 任何錯誤都降級為匿名用戶（零破壞性）
    console.log('[Auth] Error during authentication, using anonymous mode:', error.message);
    return null;
  }
}

/**
 * 取得用戶偏好語言（從 member 資料）
 * @returns {Promise<string|null>} 語言代碼 (zh-TW, en, etc.) 或 null
 */
async function getUserPreferredLanguage() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) return null;

    const response = await fetch('https://api.diy.ski/web/auth', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return null;

    const data = await response.json();

    if (data && data.data && data.data.member && data.data.member.preferredLanguage) {
      return data.data.member.preferredLanguage;
    }

    return null;

  } catch (error) {
    console.log('[Auth] Error fetching preferred language:', error.message);
    return null;
  }
}

/**
 * 取得完整的 member 資料（用於未來擴展）
 * @returns {Promise<Object|null>} Member 物件或 null
 */
async function getMemberData() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) return null;

    const response = await fetch('https://api.diy.ski/web/auth', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return null;

    const data = await response.json();

    if (data && data.data && data.data.member) {
      return data.data.member;
    }

    return null;

  } catch (error) {
    console.log('[Auth] Error fetching member data:', error.message);
    return null;
  }
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getUserIdOrNull,
    getUserPreferredLanguage,
    getMemberData
  };
}
