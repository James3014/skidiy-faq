# FAQ 显示函数代码结构分析报告

## 执行摘要

在 `/Users/jameschen/Downloads/diyski/crm/03_FAQ與知識庫/zeabur/frontend` 目录中，发现了三个主要的 FAQ 卡片生成函数存在大量代码重复。这份报告详细分析了 `displayFAQs`、`showFAQDetail` 和 `displayFAQsInModal` 函数之间的代码重复部分，以及 FAQEngine 类中的过度职责问题。

---

## 一、函数行数和主要逻辑

### 1. displayFAQs() 函数
- **位置**: `/Users/jameschen/Downloads/diyski/crm/03_FAQ與知識庫/zeabur/frontend/index.html` 第 2913-3016 行
- **行数**: 104 行
- **主要职责**:
  - 显示加载状态和结果部分
  - 生成度假村搜索结果 HTML
  - 生成 FAQ 项目 HTML（包含卡片、标签、反馈按钮）
  - 绑定点击事件处理程序

### 2. showFAQDetail() 函数
- **位置**: `/Users/jameschen/Downloads/diyski/crm/03_FAQ與知識庫/zeabur/frontend/index.html` 第 3273-3326 行
- **行数**: 54 行
- **主要职责**:
  - 追踪 FAQ 交互
  - 检查 FAQ 是否已在结果中
  - 如果不在结果中，生成单个 FAQ 卡片 HTML
  - 绑定点击事件处理程序

### 3. displayFAQsInModal() 函数
- **位置**: `/Users/jameschen/Downloads/diyski/crm/03_FAQ與知識庫/zeabur/frontend/index.html` 第 2678-2745 行
- **行数**: 68 行
- **主要职责**:
  - 更新模态框标题
  - 生成 FAQ 项目 HTML（与 displayFAQs 几乎相同）
  - 绑定点击事件处理程序
  - 显示模态框

### 4. renderHotFAQs() 函数
- **位置**: `/Users/jameschen/Downloads/diyski/crm/03_FAQ與知識庫/zeabur/frontend/index.html` 第 2578-2634 行
- **行数**: 57 行
- **主要职责**:
  - 从分析 API 或本地数据加载热门 FAQ
  - 生成简化的 FAQ 卡片 HTML（仅问题部分）
  - 渲染到侧边栏

---

## 二、识别的重复代码片段

### 2.1 FAQ 卡片 HTML 结构重复

#### 片段 1: displayFAQs() 中的 FAQ 卡片 (第 2954-3006 行)
```javascript
const resultsHTML = faqs.map((faq, index) => {
  const confidence = faq.score ? Math.round((1 - faq.score) * 100) : 100;
  const confidenceClass = confidence >= 80 ? 'confidence-high' :
                         confidence >= 60 ? 'confidence-medium' : 'confidence-low';
  const position = index + 1;

  const localized = faqEngine.getLocalizedContent(faq, currentLanguage);
  const question = DOMPurify.sanitize(localized.question || faq.canonical_question || '');
  const answer = parseLinksInText(localized.answer || '無答案內容');
  const postscript = localized.postscript
    ? `<div class="faq-postscript">${parseLinksInText(localized.postscript)}</div>`
    : '';

  // 标签 HTML 生成 (第 2968-2975 行)
  const tagsHTML = faq.crm_tags && faq.crm_tags.length > 0
    ? `<div class="faq-tags">
        ${faq.crm_tags.map(tag => {
          const displayTag = DOMPurify.sanitize(getFaqTagLabel(tag, currentLanguage));
          return `<span class="faq-tag" onclick="trackTagClick(event, 'faq', '${DOMPurify.sanitize(tag)}', '${faq.id}')">${displayTag}</span>`;
        }).join('')}
      </div>`
    : '';

  return `
    <div class="faq-item" data-faq-id="${faq.id}" data-source="${safeSourceAttr}" data-position="${position}" data-query="${safeQueryAttr}">
      <div class="faq-header">
        <div class="faq-question">
          ${question}
          <span class="confidence-badge ${confidenceClass}">
            信心度 ${confidence}%
          </span>
        </div>
        <span class="faq-toggle-icon">▼</span>
      </div>
      ${tagsHTML}
      <div class="faq-answer">
        ${answer}
        ${postscript}
      </div>
      <div class="feedback-section">
        <span class="feedback-label">${currentLanguage === 'en' ? 'Was this helpful?' : currentLanguage === 'th' ? 'มีประโยชน์หรือไม่' : '這個資訊有幫助嗎？'}</span>
        <div class="feedback-buttons">
          <button class="btn-helpful" onclick="openFeedbackModal(this)" aria-label="${currentLanguage === 'en' ? 'Helpful' : currentLanguage === 'th' ? 'มีประโยชน์' : '有幫助'}">
            👍 ${currentLanguage === 'en' ? 'Helpful' : currentLanguage === 'th' ? 'มีประโยชน์' : '有幫助'}
          </button>
          <button class="btn-not-helpful" onclick="openFeedbackModal(this)" aria-label="${currentLanguage === 'en' ? 'Not helpful' : currentLanguage === 'th' ? 'ไม่มีประโยชน์' : '沒幫助'}">
            👎 ${currentLanguage === 'en' ? 'Not helpful' : currentLanguage === 'th' ? 'ไม่มีประโยชน์' : '沒幫助'}
          </button>
        </div>
      </div>
    </div>
  `;
}).join('');
```

#### 片段 2: displayFAQsInModal() 中的 FAQ 卡片 (第 2683-2732 行)
```javascript
const faqsHtml = faqs.map((faq, index) => {
  const confidence = faq.score ? Math.round((1 - faq.score) * 100) : 100;
  const confidenceClass = confidence >= 80 ? 'confidence-high' :
                         confidence >= 60 ? 'confidence-medium' : 'confidence-low';

  const localized = faqEngine.getLocalizedContent(faq, currentLanguage);
  const question = DOMPurify.sanitize(localized.question || faq.canonical_question || '');
  const answer = parseLinksInText(localized.answer || faq.answer_template?.text || (i18n ? i18n.t('no_answer_content') : '無答案內容'));
  const confidenceLabel = i18n ? i18n.t('confidence') : '信心度';

  const tagsHTML = faq.crm_tags && faq.crm_tags.length > 0
    ? `<div class="faq-tags">
        ${faq.crm_tags.map(tag => {
          const displayTag = DOMPurify.sanitize(getFaqTagLabel(tag, currentLanguage));
          return `<span class="faq-tag" onclick="trackTagClick(event, 'faq', '${DOMPurify.sanitize(tag)}', '${faq.id}')">${displayTag}</span>`;
        }).join('')}
      </div>`
    : '';

  return `
    <div class="faq-item" data-faq-id="${faq.id}" data-source="section_modal" data-position="${index + 1}" data-query="">
      <div class="faq-header">
        <div class="faq-question">
          ${question}
          <span class="confidence-badge ${confidenceClass}">
            ${confidenceLabel} ${confidence}%
          </span>
        </div>
        <span class="faq-toggle-icon">▼</span>
      </div>
      ${tagsHTML}
      <div class="faq-answer">
        ${answer}
      </div>
      <div class="feedback-section">
        <span class="feedback-label">${currentLanguage === 'en' ? 'Was this helpful?' : currentLanguage === 'th' ? 'มีประโยชน์หรือไม่' : '這個資訊有幫助嗎？'}</span>
        <div class="feedback-buttons">
          <button class="btn-helpful" onclick="openFeedbackModal(this)" aria-label="${currentLanguage === 'en' ? 'Helpful' : currentLanguage === 'th' ? 'มีประโยชน์' : '有幫助'}">
            👍 ${currentLanguage === 'en' ? 'Helpful' : currentLanguage === 'th' ? 'มีประโยชน์' : '有幫助'}
          </button>
          <button class="btn-not-helpful" onclick="openFeedbackModal(this)" aria-label="${currentLanguage === 'en' ? 'Not helpful' : currentLanguage === 'th' ? 'ไม่มีประโยชน์' : '沒幫助'}">
            👎 ${currentLanguage === 'en' ? 'Not helpful' : currentLanguage === 'th' ? 'ไม่มีประโยชน์' : '沒幫助'}
          </button>
        </div>
      </div>
    </div>
  `;
}).join('');
```

#### 片段 3: showFAQDetail() 中的 FAQ 卡片 (第 3302-3312 行)
```javascript
const singleResultHTML = `
  <div class="faq-item" data-faq-id="${faq.id}" data-source="${source}" data-position="1" data-query="">
    <div class="faq-header">
      <div class="faq-question">${question}</div>
      <span class="faq-toggle-icon">▼</span>
    </div>
    <div class="faq-answer">
      ${answer}
      ${postscript}
    </div>
  </div>`;
```

### 重复代码分析

#### 相同的地方：
1. **本地化内容获取** (100% 相同):
   ```javascript
   const localized = faqEngine.getLocalizedContent(faq, currentLanguage);
   const question = DOMPurify.sanitize(localized.question || faq.canonical_question || '');
   const answer = parseLinksInText(localized.answer || ...);
   const postscript = localized.postscript ? `<div class="faq-postscript">...</div>` : '';
   ```

2. **信心度计算和分类** (100% 相同):
   ```javascript
   const confidence = faq.score ? Math.round((1 - faq.score) * 100) : 100;
   const confidenceClass = confidence >= 80 ? 'confidence-high' :
                          confidence >= 60 ? 'confidence-medium' : 'confidence-low';
   ```

3. **标签 HTML 生成** (99% 相同，仅事件处理略有不同):
   ```javascript
   const tagsHTML = faq.crm_tags && faq.crm_tags.length > 0
     ? `<div class="faq-tags">
         ${faq.crm_tags.map(tag => {
           const displayTag = DOMPurify.sanitize(getFaqTagLabel(tag, currentLanguage));
           return `<span class="faq-tag" onclick="trackTagClick(event, 'faq', '${DOMPurify.sanitize(tag)}', '${faq.id}')">${displayTag}</span>`;
         }).join('')}
       </div>`
     : '';
   ```

4. **FAQ 卡片外壳 HTML** (90% 相同):
   ```javascript
   <div class="faq-item" data-faq-id="${faq.id}" data-source="..." data-position="..." data-query="...">
     <div class="faq-header">
       <div class="faq-question">${question}...</div>
       <span class="faq-toggle-icon">▼</span>
     </div>
     ...
   </div>
   ```

5. **反馈按钮** (100% 相同的翻译逻辑，100% 相同的按钮 HTML):
   ```javascript
   <div class="feedback-section">
     <span class="feedback-label">${currentLanguage === 'en' ? 'Was this helpful?' : currentLanguage === 'th' ? 'มีประโยชน์หรือไม่' : '這個資訊有幫助嗎？'}</span>
     <div class="feedback-buttons">
       <button class="btn-helpful" onclick="openFeedbackModal(this)">...</button>
       <button class="btn-not-helpful" onclick="openFeedbackModal(this)">...</button>
     </div>
   </div>
   ```

#### 不同的地方：
1. **data-source 属性**: 'search_results' vs 'section_modal' vs 传入的 source
2. **data-position 属性**: `index + 1` vs `1` vs 传入的 position
3. **data-query 属性**: 有时空字符串，有时传入查询
4. **confidence 标签文本**: 硬编码的 '信心度' vs i18n.t('confidence')
5. **answer 后备文本**: '無答案內容' vs i18n.t('no_answer_content') 
6. **postscript 字段**: displayFAQs 中包含，displayFAQsInModal 中不包含

### 2.2 事件绑定重复

#### displayFAQs() 中的事件绑定 (第 3011-3015 行):
```javascript
document.querySelectorAll('.faq-item').forEach(item => {
  item.addEventListener('click', (e) => {
    toggleFAQItem(item);
  });
});
```

#### displayFAQsInModal() 中的事件绑定 (第 2737-2740 行):
```javascript
document.querySelectorAll('#resultsModal .faq-item').forEach(item => {
  item.addEventListener('click', (e) => {
    toggleFAQItem(item);
  });
});
```

#### showFAQDetail() 中的事件绑定 (第 3314-3316 行):
```javascript
document.querySelectorAll('.faq-item').forEach(item => {
  item.addEventListener('click', () => toggleFAQItem(item));
});
```

**重复度**: 100% - 完全相同的逻辑，仅选择器和参数名不同

### 2.3 本地化和国际化重复

#### 在 displayFAQs() 中 (第 2994-3001 行):
```javascript
<span class="feedback-label">${currentLanguage === 'en' ? 'Was this helpful?' : currentLanguage === 'th' ? 'มีประโยชน์หรือไม่' : '這個資訊有幫助嗎？'}</span>
...
<button class="btn-helpful" onclick="openFeedbackModal(this)" aria-label="${currentLanguage === 'en' ? 'Helpful' : currentLanguage === 'th' ? 'มีประโยชน์' : '有幫助'}">
  👍 ${currentLanguage === 'en' ? 'Helpful' : currentLanguage === 'th' ? 'มีประโยชน์' : '有幫助'}
</button>
<button class="btn-not-helpful" onclick="openFeedbackModal(this)" aria-label="${currentLanguage === 'en' ? 'Not helpful' : currentLanguage === 'th' ? 'ไม่มีประโยชน์' : '沒幫助'}">
  👎 ${currentLanguage === 'en' ? 'Not helpful' : currentLanguage === 'th' ? 'ไม่มีประโยชน์' : '沒幫助'}
</button>
```

#### 在 displayFAQsInModal() 中 (第 2720-2727 行):
**完全相同的代码**

**重复度**: 100%

---

## 三、FAQEngine 类中的过度职责分析

### FAQEngine 类文件
**位置**: `/Users/jameschen/Downloads/diyski/crm/03_FAQ與知識庫/zeabur/frontend/lib/faq-engine.js`

### 当前职责清单

| 方法名 | 行数范围 | 职责 | 是否过度 |
|--------|--------|------|--------|
| `initialize()` | 27-65 | 加载 FAQ 数据，初始化 Fuse.js | 否 |
| `setLanguage()` | 67-71 | 设置语言偏好 | 否 |
| `getLanguage()` | 73-75 | 获取当前语言 | 否 |
| `prepareLocalizedContent()` | 77-106 | 为单个 FAQ 准备本地化内容 | 否 |
| `getLocalizedContent()` | 108-123 | 获取本地化内容（有回退逻辑） | **是** |
| `getFuseConfig()` | 131-186 | 返回 Fuse.js 配置对象 | 否 |
| `search()` | 197-226 | 执行搜索并返回结果 | 否 |
| `getFAQById()` | 234-241 | 按 ID 获取 FAQ | 否 |
| `getFAQsByIntent()` | 249-255 | 按意图过滤 FAQ | 否 |
| `getFAQsBySection()` | 263-269 | 按部分过滤 FAQ | **有重复逻辑** |
| `getAllFAQs()` | 276-282 | 返回所有 FAQ | 否 |
| `getStats()` | 289-311 | 计算统计数据 | **有演进空间** |
| `calculateConfidence()` | 322-324 | 从 Fuse 分数计算信心度 | 否 |

### 过度职责详解

#### 1. getLocalizedContent() 的过度职责
**问题**: 该方法做了太多事情
- 重新计算本地化内容（行 115）- 这很昂贵，每次调用都重新处理
- 有复杂的回退逻辑（行 116-120）
- 返回强制结构化对象

**现在的用法** (重复很多次):
```javascript
// displayFAQs() 中 (第 2960 行)
const localized = faqEngine.getLocalizedContent(faq, currentLanguage);

// displayFAQsInModal() 中 (第 2689 行)
const localized = faqEngine.getLocalizedContent(faq, currentLanguage);

// showFAQDetail() 中 (第 3296 行)
const localized = faqEngine.getLocalizedContent(faq, currentLanguage);

// renderHotFAQs() 中 (第 2617 行)
const localized = faqEngine.getLocalizedContent(faq, currentLanguage);
```

#### 2. prepareLocalizedContent() 被重复调用
**问题**: getLocalizedContent() 每次都调用 prepareLocalizedContent()（行 115），导致重复计算
```javascript
// FAQEngine.getLocalizedContent() 第 115 行
const localized = this.prepareLocalizedContent(faq);
```

这在处理大量 FAQ 时非常低效。

#### 3. FAQ 卡片生成逻辑分散
**问题**: FAQ 卡片生成不应该在 FAQEngine 中，但也不应该分散在三个不同的函数中

**当前分散情况**:
- HTML 生成在 displayFAQs() / displayFAQsInModal() / showFAQDetail() 中
- 信心度计算在每个函数中独立做
- 本地化逻辑通过 FAQEngine 调用

---

## 四、识别可以提取为公共函数的逻辑

### 4.1 generateFAQCard() 函数

**候选逻辑**:
```javascript
function generateFAQCard(faq, options = {}) {
  // 参数
  const {
    currentLanguage = 'zh',
    showConfidence = true,
    showTags = true,
    showFeedback = true,
    showPostscript = true,
    source = 'search_results',
    position = null,
    query = null
  } = options;

  // 本地化内容
  const localized = faqEngine.getLocalizedContent(faq, currentLanguage);
  const question = DOMPurify.sanitize(localized.question || faq.canonical_question || '');
  const answer = parseLinksInText(localized.answer || '無答案內容');
  const postscript = showPostscript && localized.postscript
    ? `<div class="faq-postscript">${parseLinksInText(localized.postscript)}</div>`
    : '';

  // 信心度
  const confidence = faq.score ? Math.round((1 - faq.score) * 100) : 100;
  const confidenceClass = confidence >= 80 ? 'confidence-high' :
                         confidence >= 60 ? 'confidence-medium' : 'confidence-low';

  // 标签
  const tagsHTML = showTags && faq.crm_tags && faq.crm_tags.length > 0
    ? `<div class="faq-tags">
        ${faq.crm_tags.map(tag => {
          const displayTag = DOMPurify.sanitize(getFaqTagLabel(tag, currentLanguage));
          return `<span class="faq-tag" onclick="trackTagClick(event, 'faq', '${DOMPurify.sanitize(tag)}', '${faq.id}')">${displayTag}</span>`;
        }).join('')}
      </div>`
    : '';

  // 反馈按钮
  const feedbackHTML = showFeedback ? getFeedbackButtonsHTML(currentLanguage) : '';

  // 构建卡片
  return `
    <div class="faq-item" data-faq-id="${faq.id}" data-source="${source}" data-position="${position || ''}" data-query="${query || ''}">
      <div class="faq-header">
        <div class="faq-question">
          ${question}
          ${showConfidence ? `<span class="confidence-badge ${confidenceClass}">信心度 ${confidence}%</span>` : ''}
        </div>
        <span class="faq-toggle-icon">▼</span>
      </div>
      ${tagsHTML}
      <div class="faq-answer">
        ${answer}
        ${postscript}
      </div>
      ${feedbackHTML}
    </div>
  `;
}
```

### 4.2 getFeedbackButtonsHTML() 函数

**提取的理由**: 反馈按钮逻辑在两个函数中完全相同

```javascript
function getFeedbackButtonsHTML(language) {
  const labels = {
    en: {
      question: 'Was this helpful?',
      helpful: 'Helpful',
      notHelpful: 'Not helpful'
    },
    th: {
      question: 'มีประโยชน์หรือไม่',
      helpful: 'มีประโยชน์',
      notHelpful: 'ไม่มีประโยชน์'
    },
    zh: {
      question: '這個資訊有幫助嗎？',
      helpful: '有幫助',
      notHelpful: '沒幫助'
    }
  };

  const label = labels[language] || labels.zh;

  return `
    <div class="feedback-section">
      <span class="feedback-label">${label.question}</span>
      <div class="feedback-buttons">
        <button class="btn-helpful" onclick="openFeedbackModal(this)" aria-label="${label.helpful}">
          👍 ${label.helpful}
        </button>
        <button class="btn-not-helpful" onclick="openFeedbackModal(this)" aria-label="${label.notHelpful}">
          👎 ${label.notHelpful}
        </button>
      </div>
    </div>
  `;
}
```

### 4.3 bindFAQItemEvents() 函数

**提取的理由**: 事件绑定逻辑在三个函数中重复

```javascript
function bindFAQItemEvents(selector = '.faq-item') {
  document.querySelectorAll(selector).forEach(item => {
    item.addEventListener('click', (e) => {
      toggleFAQItem(item);
    });
  });
}
```

### 4.4 calculateConfidenceBadge() 函数

**提取的理由**: 信心度计算和分类在多个函数中重复

```javascript
function calculateConfidenceBadge(score) {
  const confidence = score ? Math.round((1 - score) * 100) : 100;
  const confidenceClass = confidence >= 80 ? 'confidence-high' :
                         confidence >= 60 ? 'confidence-medium' : 'confidence-low';
  
  return { confidence, confidenceClass };
}
```

### 4.5 sanitizeAnswerContent() 函数

**提取的理由**: 答案内容处理（本地化 + 链接解析）在多个函数中重复

```javascript
function sanitizeAnswerContent(faq, language = 'zh', fallback = '無答案內容') {
  const localized = faqEngine.getLocalizedContent(faq, language);
  const answer = parseLinksInText(localized.answer || fallback);
  const postscript = localized.postscript
    ? `<div class="faq-postscript">${parseLinksInText(localized.postscript)}</div>`
    : '';
  
  return { answer, postscript };
}
```

---

## 五、具体优化建议

### 优化优先级

| 优先级 | 提取函数 | 重复次数 | 预期节省代码行数 |
|--------|---------|--------|----------------|
| **P0** | `generateFAQCard()` | 3 | ~80 |
| **P0** | `getFeedbackButtonsHTML()` | 2 | ~15 |
| **P1** | `bindFAQItemEvents()` | 3 | ~5 |
| **P1** | `calculateConfidenceBadge()` | 3 | ~3 |
| **P2** | `sanitizeAnswerContent()` | 4 | ~10 |

### 实施步骤

#### 第一阶段: 提取基础函数
1. 创建 `generateFAQCard()` 函数
2. 创建 `getFeedbackButtonsHTML()` 函数
3. 创建 `bindFAQItemEvents()` 函数

#### 第二阶段: 重构显示函数
1. 更新 `displayFAQs()` 使用 `generateFAQCard()`
2. 更新 `displayFAQsInModal()` 使用 `generateFAQCard()`
3. 更新 `showFAQDetail()` 使用 `generateFAQCard()`

#### 第三阶段: 优化 FAQEngine
1. 添加缓存机制到 `getLocalizedContent()`
2. 考虑提取信心度计算到 FAQEngine
3. 考虑在 FAQEngine 中添加 HTML 生成选项

### 代码质量指标改进

**当前状态**:
- 代码重复率: ~40%
- FAQ 卡片生成逻辑: 分散在 3+ 个函数中
- 事件绑定逻辑: 分散在 3 个函数中
- 反馈 UI: 硬编码在 2 个函数中

**优化后预期**:
- 代码重复率: <10%
- FAQ 卡片生成逻辑: 统一在 `generateFAQCard()`
- 事件绑定逻辑: 统一在 `bindFAQItemEvents()`
- 反馈 UI: 统一在 `getFeedbackButtonsHTML()`
- 维护成本降低: ~50%

---

## 六、变量和属性重复

### data-* 属性不一致

在不同函数中设置的 `data-*` 属性有不同的值：

| 属性 | displayFAQs | displayFAQsInModal | showFAQDetail |
|-----|------------|-------------------|---------------|
| `data-source` | `safeSourceAttr` | `'section_modal'` | `source` |
| `data-position` | `index + 1` | `index + 1` | `'1'` |
| `data-query` | `safeQueryAttr` | `''` | `''` |

**问题**: 不同函数设置不同的值，可能导致追踪数据不一致。

### 建议的统一方式

```javascript
function createFAQDataAttributes(faq, options = {}) {
  const {
    source = 'search_results',
    position = null,
    query = null
  } = options;

  return {
    'data-faq-id': faq.id,
    'data-source': DOMPurify.sanitize(source),
    'data-position': position ? String(position) : '',
    'data-query': query ? DOMPurify.sanitize(query) : ''
  };
}

// 使用方式
const attrs = createFAQDataAttributes(faq, { source: 'search_results', position: 1, query: lastSearchQuery });
const attrString = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ');
// <div class="faq-item" ${attrString}>
```

---

## 七、i18n 处理的不一致

### 问题场景

#### displayFAQs() 中:
```javascript
// 第 2919 行 - 使用 i18n.t()
const resultsLabel = i18n ? i18n.t('results_count', { count: totalResults }) : `找到 ${totalResults} 筆結果`;

// 第 2994-3001 行 - 硬编码三元表达式
<span class="feedback-label">${currentLanguage === 'en' ? 'Was this helpful?' : currentLanguage === 'th' ? 'มีประโยชน์หรือไม่' : '這個資訊有幫助嗎？'}</span>
```

#### displayFAQsInModal() 中:
```javascript
// 第 2692 行 - 使用 i18n.t()
const confidenceLabel = i18n ? i18n.t('confidence') : '信心度';

// 第 2720-2727 行 - 硬编码三元表达式（与 displayFAQs() 完全相同）
```

**建议**: 
1. 所有 i18n 字符串应该统一使用 i18n.t()
2. 创建 i18n 配置文件，包含所有 UI 文本
3. 避免硬编码的三元表达式

---

## 八、总结

### 主要发现

1. **代码重复最多的地方**:
   - FAQ 卡片 HTML 生成 (~80 行代码重复)
   - 反馈按钮 (~15 行代码重复)
   - 事件绑定逻辑 (~5 行代码重复)

2. **FAQEngine 的设计**:
   - 总体职责清晰，但有优化空间
   - `getLocalizedContent()` 重复调用导致性能浪费
   - 建议添加缓存机制

3. **前端函数职责分散**:
   - FAQ 卡片生成逻辑在 3+ 个函数中
   - 每个函数都做了太多事情
   - 需要大量的辅助函数来提取通用逻辑

### 建议的改进方案

| 改进项 | 影响范围 | 实施难度 | 预期收益 |
|--------|--------|--------|--------|
| 提取 `generateFAQCard()` | 3 个函数 | 中等 | 高 |
| 提取 `getFeedbackButtonsHTML()` | 2 个函数 | 低 | 中等 |
| 提取 `bindFAQItemEvents()` | 3 个函数 | 低 | 中等 |
| 规范化 i18n 使用 | 全局 | 中等 | 高 |
| 优化 FAQEngine 缓存 | FAQEngine 类 | 中等 | 高 |

### 预期代码改进
- **代码行数减少**: ~100-150 行
- **代码重复率降低**: 从 40% 到 <10%
- **维护成本降低**: ~50%
- **测试覆盖更容易**: 通过单独测试提取的函数

