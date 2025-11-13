#!/usr/bin/env node

/**
 * FAQ 答案合并脚本
 * 从 faq_kb.json (有完整答案) 合并答案到 faq_kb.phase0a.json (有完整问题结构)
 *
 * 用法: node merge-faq-answers.js
 */

const fs = require('fs');
const path = require('path');

const SOURCE_FILE = path.join(__dirname, '../zeabur_backend/data/faq_kb.json');
const TARGET_FILE = path.join(__dirname, '../zeabur_backend/data/faq_kb.phase0a.json');
const BACKUP_FILE = path.join(__dirname, '../zeabur_backend/data/faq_kb.phase0a.json.backup');

console.log('🔄 FAQ 答案合并脚本');
console.log('='.repeat(50));

try {
  // 读取源文件 (有答案)
  console.log(`📖 读取源文件: ${SOURCE_FILE}`);
  const sourceData = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf-8'));

  // 读取目标文件 (有问题结构)
  console.log(`📖 读取目标文件: ${TARGET_FILE}`);
  const targetData = JSON.parse(fs.readFileSync(TARGET_FILE, 'utf-8'));

  // 创建 ID 索引方便查找
  const sourceMap = new Map();
  sourceData.items.forEach(item => {
    sourceMap.set(item.id, item);
  });

  console.log(`✅ 源文件: ${sourceData.items.length} 个 FAQ`);
  console.log(`✅ 目标文件: ${targetData.items.length} 个 FAQ`);

  let mergedCount = 0;
  let skippedCount = 0;

  // 合并答案
  targetData.items = targetData.items.map(targetItem => {
    const sourceItem = sourceMap.get(targetItem.id);

    if (!sourceItem) {
      console.warn(`⚠️  找不到对应的源 FAQ: ${targetItem.id}`);
      skippedCount++;
      return targetItem;
    }

    // 检查源文件是否有答案
    if (!sourceItem.answer_template?.summary && !sourceItem.answer_template?.details) {
      console.warn(`⚠️  源 FAQ 无答案: ${targetItem.id}`);
      skippedCount++;
      return targetItem;
    }

    // 合并答案内容
    const mergedItem = { ...targetItem };

    // 复制 answer_template 的所有字段
    if (sourceItem.answer_template) {
      mergedItem.answer_template = {
        ...targetItem.answer_template,
        ...sourceItem.answer_template,
        // 确保关键字段存在
        summary: sourceItem.answer_template.summary || '',
        details: sourceItem.answer_template.details || '',
        tip: sourceItem.answer_template.tip || '',
        postscript: sourceItem.answer_template.postscript || ''
      };
    }

    // 如果源文件有翻译，合并翻译
    if (sourceItem.canonical_question_translations) {
      mergedItem.canonical_question_translations = {
        ...targetItem.canonical_question_translations,
        ...sourceItem.canonical_question_translations
      };
    }

    // 合并链接信息
    if (sourceItem.links) {
      mergedItem.links = sourceItem.links;
    }

    // 复制 CRM 标签
    if (sourceItem.crm_tags) {
      mergedItem.crm_tags = sourceItem.crm_tags;
    }

    mergedCount++;
    return mergedItem;
  });

  // 备份原文件
  console.log(`💾 备份原文件: ${BACKUP_FILE}`);
  if (!fs.existsSync(BACKUP_FILE)) {
    fs.copyFileSync(TARGET_FILE, BACKUP_FILE);
  }

  // 写入合并后的文件
  console.log(`📝 写入合并后的文件: ${TARGET_FILE}`);
  fs.writeFileSync(TARGET_FILE, JSON.stringify(targetData, null, 2) + '\n', 'utf-8');

  console.log('');
  console.log('✅ 合并完成！');
  console.log(`   - 合并成功: ${mergedCount} 个 FAQ`);
  console.log(`   - 跳过: ${skippedCount} 个 FAQ`);
  console.log(`   - 总计: ${targetData.items.length} 个 FAQ`);

} catch (error) {
  console.error('❌ 错误:', error.message);
  process.exit(1);
}
