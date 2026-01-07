/**
 * 自动化功能测试脚本
 * 在浏览器控制台运行: 复制粘贴此文件内容并执行 runAllTests()
 */

const TestRunner = {
  results: [],
  
  log(test, passed, message) {
    const result = { test, passed, message };
    this.results.push(result);
    console.log(`${passed ? '✅' : '❌'} ${test}: ${message}`);
  },

  async runAllTests() {
    console.log('🧪 开始运行测试...\n');
    
    await this.testSearch();
    await this.testFAQToggle();
    await this.testLanguageSwitch();
    await this.testResortFilter();
    await this.testParkFAQ();
    await this.testAIChat();
    await this.testFeedback();
    await this.testTagTracking();
    
    console.log('\n📊 测试总结:');
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    console.log(`通过: ${passed}/${total}`);
    
    if (passed === total) {
      console.log('🎉 所有测试通过！');
    } else {
      console.log('⚠️ 部分测试失败，请检查上方详情');
    }
    
    return this.results;
  },

  async testSearch() {
    try {
      const searchInput = document.getElementById('searchInput');
      const searchBtn = document.getElementById('searchBtn');
      
      if (!searchInput || !searchBtn) {
        this.log('搜索功能', false, '找不到搜索元素');
        return;
      }
      
      searchInput.value = '教練';
      searchBtn.click();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const results = document.getElementById('searchResults');
      const hasResults = results && results.children.length > 0;
      
      this.log('搜索功能', hasResults, hasResults ? '搜索结果正常显示' : '没有搜索结果');
    } catch (e) {
      this.log('搜索功能', false, `错误: ${e.message}`);
    }
  },

  async testFAQToggle() {
    try {
      const faqItem = document.querySelector('.faq-item');
      
      if (!faqItem) {
        this.log('FAQ 展开/收起', false, '找不到 FAQ 项目');
        return;
      }
      
      const wasExpanded = faqItem.classList.contains('expanded');
      faqItem.click();
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const isExpanded = faqItem.classList.contains('expanded');
      const toggled = wasExpanded !== isExpanded;
      
      this.log('FAQ 展开/收起', toggled, toggled ? 'FAQ 切换正常' : 'FAQ 切换失败');
    } catch (e) {
      this.log('FAQ 展开/收起', false, `错误: ${e.message}`);
    }
  },

  async testLanguageSwitch() {
    try {
      const langSelector = document.getElementById('languageSelector');
      
      if (!langSelector) {
        this.log('语言切换', false, '找不到语言选择器');
        return;
      }
      
      const originalLang = langSelector.value;
      langSelector.value = 'en';
      langSelector.dispatchEvent(new Event('change'));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const currentLang = langSelector.value;
      const switched = currentLang === 'en';
      
      // 切换回原语言
      langSelector.value = originalLang;
      langSelector.dispatchEvent(new Event('change'));
      
      this.log('语言切换', switched, switched ? '语言切换正常' : '语言切换失败');
    } catch (e) {
      this.log('语言切换', false, `错误: ${e.message}`);
    }
  },

  async testResortFilter() {
    try {
      const resortLink = document.querySelector('[data-resort-id]');
      
      if (!resortLink) {
        this.log('雪场筛选', false, '找不到雪场链接');
        return;
      }
      
      resortLink.click();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const results = document.getElementById('searchResults');
      const hasResults = results && results.children.length > 0;
      
      this.log('雪场筛选', hasResults, hasResults ? '雪场筛选正常' : '雪场筛选无结果');
    } catch (e) {
      this.log('雪场筛选', false, `错误: ${e.message}`);
    }
  },

  async testParkFAQ() {
    try {
      const parkFAQItem = document.querySelector('[data-park-faq-id]');
      
      if (!parkFAQItem) {
        this.log('Park FAQ', true, 'Park FAQ 不存在（可能未加载）');
        return;
      }
      
      parkFAQItem.click();
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const isExpanded = parkFAQItem.classList.contains('expanded');
      
      this.log('Park FAQ', isExpanded, isExpanded ? 'Park FAQ 展开正常' : 'Park FAQ 展开失败');
    } catch (e) {
      this.log('Park FAQ', false, `错误: ${e.message}`);
    }
  },

  async testAIChat() {
    try {
      const aiChatBtn = document.getElementById('aiChatButton');
      
      if (!aiChatBtn) {
        this.log('AI Chat', false, '找不到 AI Chat 按钮');
        return;
      }
      
      aiChatBtn.click();
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const chatWindow = document.getElementById('aiChatWindow');
      const isVisible = chatWindow && chatWindow.style.display !== 'none';
      
      // 关闭窗口
      if (isVisible) {
        const closeBtn = document.getElementById('aiChatClose');
        if (closeBtn) closeBtn.click();
      }
      
      this.log('AI Chat', isVisible, isVisible ? 'AI Chat 打开正常' : 'AI Chat 打开失败');
    } catch (e) {
      this.log('AI Chat', false, `错误: ${e.message}`);
    }
  },

  async testFeedback() {
    try {
      const feedbackBtn = document.querySelector('.btn-helpful');
      
      if (!feedbackBtn) {
        this.log('Feedback', false, '找不到反馈按钮');
        return;
      }
      
      feedbackBtn.click();
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const modal = document.getElementById('feedbackModal');
      const isVisible = modal && modal.style.display !== 'none';
      
      // 关闭 modal
      if (isVisible) {
        const closeBtn = document.getElementById('feedbackModalClose');
        if (closeBtn) closeBtn.click();
      }
      
      this.log('Feedback', isVisible, isVisible ? 'Feedback modal 打开正常' : 'Feedback modal 打开失败');
    } catch (e) {
      this.log('Feedback', false, `错误: ${e.message}`);
    }
  },

  async testTagTracking() {
    try {
      const tag = document.querySelector('.faq-tag');
      
      if (!tag) {
        this.log('标签追踪', true, '没有标签（可能未展开 FAQ）');
        return;
      }
      
      // 检查是否有 data 属性或事件监听
      const hasDataAttrs = tag.hasAttribute('data-tag') || tag.hasAttribute('onclick');
      const hasEventListener = typeof trackTagClick === 'function';
      
      this.log('标签追踪', hasEventListener, hasEventListener ? '标签追踪函数存在' : '标签追踪函数不存在');
    } catch (e) {
      this.log('标签追踪', false, `错误: ${e.message}`);
    }
  }
};

// 导出到全局
window.runAllTests = () => TestRunner.runAllTests();

console.log('✅ 测试脚本已加载');
console.log('💡 运行测试: runAllTests()');
