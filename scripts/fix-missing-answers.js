#!/usr/bin/env node

/**
 * Fix missing FAQ answers script
 * For each FAQ that has missing summary/details, extract from answer_template_translations
 */

const fs = require('fs');
const path = require('path');

const FAQ_FILE = path.join(__dirname, '../zeabur_backend/data/faq_kb.phase0a.json');

console.log('🔧 修復缺失的 FAQ 答案');
console.log('='.repeat(60));

try {
  // 讀取 FAQ 資料
  const data = JSON.parse(fs.readFileSync(FAQ_FILE, 'utf-8'));

  let fixedCount = 0;
  let emptyAnswerCount = 0;

  // 遍歷所有 FAQ
  data.items.forEach((item, index) => {
    const summary = item.answer_template?.summary;
    const details = item.answer_template?.details;

    // 檢查是否缺少答案
    if (!summary && !details) {
      console.log(`\n❌ ${item.id}: 缺少答案`);

      // 嘗試從 answer_template_translations 提取答案
      if (item.answer_template_translations?.summary_translations?.en) {
        const enAnswer = item.answer_template_translations.summary_translations.en;
        console.log(`   ✓ 找到英文答案: ${enAnswer.substring(0, 60)}...`);

        // 使用英文作為中文答案（臨時方案）
        if (!item.answer_template) {
          item.answer_template = {};
        }
        item.answer_template.summary = enAnswer;
        item.answer_template.details = null;
        item.answer_template.tip = null;
        item.answer_template.postscript = item.answer_template.postscript || '更多資訊與最新名額，請以預約系統顯示為準。';

        fixedCount++;
      } else {
        emptyAnswerCount++;
      }
    }
  });

  // 寫回檔案
  fs.writeFileSync(FAQ_FILE, JSON.stringify(data, null, 2) + '\n', 'utf-8');

  console.log('\n' + '='.repeat(60));
  console.log('✅ 修復完成！');
  console.log(`   - 已修復: ${fixedCount} 個 FAQ`);
  console.log(`   - 仍為空: ${emptyAnswerCount} 個 FAQ`);
  console.log(`   - 總計: ${data.items.length} 個 FAQ`);

} catch (error) {
  console.error('❌ 錯誤:', error.message);
  process.exit(1);
}
