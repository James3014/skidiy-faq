# 用戶反饋系統 - 前端實現計劃

## 📋 概述

將在 `index.html` 中添加用戶反饋功能，允許用戶對 FAQ 項目和雪場資訊進行反饋。

---

## 🎨 UI 設計（方案 D - 簡化版）

### 1. 反饋按鈕位置

在每個 **FAQ 卡片底部** 和 **雪場卡片底部** 添加反饋按鈕組：

```html
<div class="feedback-section">
  <span class="feedback-label">這個資訊有幫助嗎？</span>
  <div class="feedback-buttons">
    <button class="btn-helpful" onclick="openFeedbackModal(this)">
      👍 有幫助
    </button>
    <button class="btn-not-helpful" onclick="openFeedbackModal(this)">
      👎 沒幫助
    </button>
  </div>
</div>
```

### 2. 反饋彈窗（Modal）

當用戶點擊按鈕時，彈出反饋彈窗：

```html
<div id="feedbackModal" class="feedback-modal" style="display: none;">
  <div class="feedback-modal-content">
    <div class="feedback-modal-header">
      <h3>😊 感謝您的反饋</h3>
      <button class="modal-close" onclick="closeFeedbackModal()">✕</button>
    </div>

    <div class="feedback-modal-body">
      <p id="feedbackPrompt"></p>

      <!-- 預設原因（如果用戶選了「沒幫助」） -->
      <div id="reasonsSection" style="display: none;">
        <p class="reasons-title">希望改進什麼？（可選）</p>
        <div class="reasons-list">
          <label><input type="radio" name="reason" value="訊息不完整"> 訊息不完整</label>
          <label><input type="radio" name="reason" value="訊息過時"> 訊息過時</label>
          <label><input type="radio" name="reason" value="難以理解"> 難以理解</label>
          <label><input type="radio" name="reason" value="找錯了問題"> 找錯了問題</label>
          <label><input type="radio" name="reason" value="其他"> 其他</label>
        </div>
      </div>

      <!-- 自由評論 -->
      <div class="comment-section">
        <label for="feedbackComment">有其他建議嗎？（可選）</label>
        <textarea
          id="feedbackComment"
          placeholder="例：需要更詳細說明..."
          rows="3"
        ></textarea>
      </div>
    </div>

    <div class="feedback-modal-footer">
      <button class="btn-cancel" onclick="closeFeedbackModal()">跳過</button>
      <button class="btn-submit" onclick="submitFeedback()">提交反饋</button>
    </div>
  </div>
</div>
```

---

## 💾 CSS 樣式

```css
/* 反饋區域 */
.feedback-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-start;
}

.feedback-label {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
}

.feedback-buttons {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}

.btn-helpful,
.btn-not-helpful {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-helpful:hover {
  background: #dcfce7;
  border-color: #16a34a;
  color: #15803d;
}

.btn-not-helpful:hover {
  background: #fee2e2;
  border-color: #dc2626;
  color: #b91c1c;
}

/* 反饋彈窗 */
.feedback-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.feedback-modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.feedback-modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.feedback-modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
}

.feedback-modal-body {
  padding: 1.5rem;
}

.reasons-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #374151;
}

.reasons-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.reasons-list label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.comment-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.comment-section label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.comment-section textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
}

.feedback-modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn-cancel,
.btn-submit {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: white;
  color: #374151;
}

.btn-cancel:hover {
  background: #f9fafb;
}

.btn-submit {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}

.btn-submit:hover {
  background: #1d4ed8;
}

/* 提交成功提示 */
.feedback-success {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #10b981;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease-out;
  z-index: 2000;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .feedback-buttons {
    flex-direction: column;
  }

  .feedback-modal-content {
    width: 85%;
  }

  .feedback-success {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
  }
}
```

---

## 📝 JavaScript 實現

### 全局變數

```javascript
// 反饋狀態
let currentFeedback = {
  type: null,        // 'faq' or 'resort'
  itemId: null,
  helpful: null,
  reason: null,
  comment: null,
  sessionId: null
};
```

### 核心函數

```javascript
/**
 * 打開反饋彈窗
 */
function openFeedbackModal(buttonElement) {
  // 獲取 FAQ/雪場信息
  const card = buttonElement.closest('.faq-card, .resort-card');
  const isFAQ = card.classList.contains('faq-card');

  currentFeedback.type = isFAQ ? 'faq' : 'resort';
  currentFeedback.itemId = isFAQ ? card.dataset.faqId : card.dataset.resortId;
  currentFeedback.helpful = buttonElement.classList.contains('btn-helpful');

  // 顯示對應的提示文本
  const promptEl = document.getElementById('feedbackPrompt');
  if (currentFeedback.helpful) {
    promptEl.textContent = '太好了！感謝您的肯定 😊';
  } else {
    promptEl.textContent = '抱歉沒有幫到您，能告訴我們原因嗎？';
  }

  // 控制原因選項顯示（只在「沒幫助」時顯示）
  const reasonsSection = document.getElementById('reasonsSection');
  reasonsSection.style.display = currentFeedback.helpful ? 'none' : 'block';

  // 清空之前的選擇
  document.querySelectorAll('input[name="reason"]').forEach(el => el.checked = false);
  document.getElementById('feedbackComment').value = '';

  // 顯示彈窗
  document.getElementById('feedbackModal').style.display = 'flex';
}

/**
 * 關閉反饋彈窗
 */
function closeFeedbackModal() {
  document.getElementById('feedbackModal').style.display = 'none';
  // 重置狀態
  currentFeedback = {
    type: null,
    itemId: null,
    helpful: null,
    reason: null,
    comment: null,
    sessionId: null
  };
}

/**
 * 提交反饋到後端
 */
async function submitFeedback() {
  const reasonRadio = document.querySelector('input[name="reason"]:checked');
  const comment = document.getElementById('feedbackComment').value.trim();

  currentFeedback.reason = reasonRadio ? reasonRadio.value : null;
  currentFeedback.comment = comment || null;

  // 禁用提交按鈕（防止重複提交）
  const submitBtn = document.querySelector('.btn-submit');
  submitBtn.disabled = true;
  submitBtn.textContent = '提交中...';

  try {
    const response = await fetch(`${API_BASE}/analytics/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feedback_type: currentFeedback.type,
        item_id: currentFeedback.itemId,
        helpful: currentFeedback.helpful,
        reason: currentFeedback.reason,
        comment: currentFeedback.comment,
        language: currentLanguage
      })
    });

    if (!response.ok) {
      throw new Error(`API 錯誤: ${response.status}`);
    }

    // 成功提交
    closeFeedbackModal();
    showSuccessMessage();

  } catch (error) {
    console.error('[Feedback] 提交失敗:', error);
    // 本地保存（後備方案）
    saveLocalFeedback();
    closeFeedbackModal();
    showSuccessMessage('（已本地保存）');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '提交反饋';
  }
}

/**
 * 顯示成功提示
 */
function showSuccessMessage(suffix = '') {
  const message = document.createElement('div');
  message.className = 'feedback-success';
  message.textContent = '感謝您的反饋！' + suffix;
  document.body.appendChild(message);

  // 3 秒後自動移除
  setTimeout(() => {
    message.remove();
  }, 3000);
}

/**
 * 本地保存反饋（後備方案）
 */
function saveLocalFeedback() {
  const feedbacks = JSON.parse(localStorage.getItem('localFeedbacks') || '[]');
  feedbacks.push({
    ...currentFeedback,
    timestamp: new Date().toISOString(),
    synced: false
  });
  localStorage.setItem('localFeedbacks', JSON.stringify(feedbacks));
}
```

---

## 🔧 集成步驟

### 1. 在 FAQ 卡片中添加反饋區域

找到 FAQ 卡片渲染的地方（約第 1956 行），在卡片末尾添加：

```javascript
// 在現有代碼之後
const feedbackHTML = `
  <div class="feedback-section">
    <span class="feedback-label">這個資訊有幫助嗎？</span>
    <div class="feedback-buttons">
      <button class="btn-helpful" onclick="openFeedbackModal(this)" aria-label="有幫助">
        👍 有幫助
      </button>
      <button class="btn-not-helpful" onclick="openFeedbackModal(this)" aria-label="沒幫助">
        👎 沒幫助
      </button>
    </div>
  </div>
`;

// 添加 data-faq-id 屬性到卡片
card.dataset.faqId = faq.id;
card.innerHTML = faqHTML + feedbackHTML;
```

### 2. 在雪場卡片中添加反饋區域

類似地，在雪場卡片渲染處添加反饋按鈕。

### 3. 在頁面加載時初始化

```javascript
// 在 DOMContentLoaded 事件中添加
document.addEventListener('DOMContentLoaded', () => {
  // ... 現有初始化代碼 ...

  // 初始化反饋系統
  initializeFeedbackSystem();

  // 同步本地保存的反饋
  syncLocalFeedbacks();
});

function initializeFeedbackSystem() {
  // 添加彈窗 HTML（如果不存在）
  if (!document.getElementById('feedbackModal')) {
    // 從上方 HTML 代碼添加彈窗
  }

  // 綁定彈窗關閉事件
  document.getElementById('feedbackModal').addEventListener('click', (e) => {
    if (e.target.id === 'feedbackModal') {
      closeFeedbackModal();
    }
  });
}

async function syncLocalFeedbacks() {
  const feedbacks = JSON.parse(localStorage.getItem('localFeedbacks') || '[]');
  const unsynced = feedbacks.filter(f => !f.synced);

  for (const feedback of unsynced) {
    try {
      await fetch(`${API_BASE}/analytics/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback)
      });
      feedback.synced = true;
    } catch (error) {
      console.warn('[Feedback Sync] 同步失敗:', error);
    }
  }

  // 保存更新狀態
  localStorage.setItem('localFeedbacks', JSON.stringify(feedbacks));
}
```

---

## 📱 測試清單

- [ ] **桌面版本**
  - [ ] 點擊「有幫助」按鈕 → 彈窗顯示（無原因選項）
  - [ ] 點擊「沒幫助」按鈕 → 彈窗顯示（有原因選項）
  - [ ] 選擇原因 → 原因被正確記錄
  - [ ] 輸入評論 → 評論被正確記錄
  - [ ] 點擊「提交反饋」→ 成功提示出現
  - [ ] 檢查 Network → 後端 API 被正確調用
  - [ ] 檢查數據庫 → 反饋被正確儲存

- [ ] **行動版本**
  - [ ] 彈窗在小屏幕下正確顯示（寬度 < 400px）
  - [ ] 按鈕堆疊排列
  - [ ] 文本易讀（字號足夠大）
  - [ ] 觸摸交互正常

- [ ] **邊界情況**
  - [ ] 網絡離線 → 本地保存反饋
  - [ ] 重複提交 → 不會出現重複反饋
  - [ ] 關閉彈窗 → 狀態被清空，下次打開時為空

---

## 📊 預期效果

用戶完整流程：
1. 用戶瀏覽 FAQ 或雪場信息
2. 點擊「有幫助」或「沒幫助」按鈕
3. 彈窗打開，根據選擇顯示不同提示
4. 用戶選擇原因（可選）和添加評論（可選）
5. 點擊「提交反饋」
6. 數據發送到後端
7. 顯示成功提示
8. 系統自動統計到分析頁面

---

## ⚠️ 注意事項

1. **API_BASE 必須設定** - 確保 `env.js` 或全局變數中設置了正確的 API 基礎 URL
2. **localStorage 限制** - 建議定期清理過舊的本地數據
3. **無障礙性** - 確保按鈕有 aria-label，彈窗可通過鍵盤操作關閉
4. **多語言** - 提示文本和標籤應該由 i18n 系統管理

---

**準備好實施了嗎？回覆「開始」或「有問題」！**
