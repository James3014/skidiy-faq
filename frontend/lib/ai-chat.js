// AI Chat widget: encapsulates chat UI behavior and FAQ search fallback
(function (global) {
  function init({ faqEngine }) {
    const toggleBtn = document.getElementById('aiChatToggle');
    const chatWindow = document.getElementById('aiChatWindow');
    const chatInput = document.getElementById('aiChatInput');
    const sendBtn = document.getElementById('aiChatSend');
    const messagesContainer = document.getElementById('aiChatMessages');

    if (!toggleBtn || !chatWindow || !chatInput || !sendBtn || !messagesContainer) {
      console.warn('[AI Chat] Required elements missing, skip init');
      return;
    }

    const addMessageToChat = (role, text) => {
      const messageDiv = document.createElement('div');
      messageDiv.className = `ai-chat-message ${role}`;

      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      avatar.textContent = role === 'user' ? '👤' : '🤖';

      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      bubble.textContent = text;

      messageDiv.appendChild(avatar);
      messageDiv.appendChild(bubble);

      messagesContainer.appendChild(messageDiv);
    };

    const sendMessage = async () => {
      const message = chatInput.value.trim();
      if (!message) return;

      addMessageToChat('user', message);
      chatInput.value = '';
      sendBtn.disabled = true;
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      try {
        const results = await faqEngine.search(message);
        let response = '';

        if (results.length > 0) {
          const topResult = results[0];
          const confidence = Math.round((1 - topResult.score) * 100);

          if (confidence >= 70) {
            response = `我找到了相關答案（信心度 ${confidence}%）：\n\n${topResult.item.answer_template.text}`;
            if (topResult.item.answer_template.postscript) {
              response += `\n\n${topResult.item.answer_template.postscript}`;
            }
          } else {
            response = `我找到了一些可能相關的問題：\n\n`;
            results.slice(0, 3).forEach((result, index) => {
              const conf = Math.round((1 - result.score) * 100);
              response += `${index + 1}. ${result.item.canonical_question} (${conf}%)\n`;
            });
            response += `\n您可以點選左側搜尋來查看詳細答案。`;
          }
        } else {
          response = '抱歉，我沒有找到直接相關的答案。您可以嘗試：\n\n1. 換個方式描述您的問題\n2. 瀏覽左側的分類清單\n3. 查看熱門問題\n4. 聯繫我們的客服團隊：service@diy.ski';
        }

        setTimeout(() => {
          addMessageToChat('assistant', response);
          sendBtn.disabled = false;
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 500);
      } catch (error) {
        console.error('[AI Chat] Error:', error);
        addMessageToChat('assistant', '抱歉，處理您的問題時發生錯誤。請稍後再試。');
        sendBtn.disabled = false;
      }
    };

    toggleBtn.addEventListener('click', () => {
      chatWindow.classList.toggle('open');
      toggleBtn.classList.toggle('active');
      if (chatWindow.classList.contains('open')) {
        toggleBtn.textContent = '✕';
        chatInput.focus();
      } else {
        toggleBtn.textContent = '💬';
      }
    });

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    console.log('[AI Chat] AI chat widget initialized');
  }

  global.AIChat = { init };
})(window);
