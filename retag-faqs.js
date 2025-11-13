#!/usr/bin/env node

/**
 * FAQ Re-tagging Script
 *
 * This script re-tags FAQs by replacing generic "#一般查詢" tags with more specific tags
 * based on the FAQ's section and intent.
 *
 * Usage:
 *   node retag-faqs.js [--dry-run] [--input FILE] [--output FILE]
 *
 * Options:
 *   --dry-run     : Show proposed changes without modifying files
 *   --input FILE  : Input FAQ file (default: zeabur_backend/data/faq_kb.phase0a.json)
 *   --output FILE : Output FAQ file (default: zeabur_backend/data/faq_kb.phase0a.json)
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const inputIndex = args.indexOf('--input');
const outputIndex = args.indexOf('--output');

const defaultFaqPath = path.join('zeabur_backend', 'data', 'faq_kb.phase0a.json');
const inputFile = inputIndex >= 0 ? args[inputIndex + 1] : defaultFaqPath;
const outputFile = outputIndex >= 0 ? args[outputIndex + 1] : defaultFaqPath;

console.log('='.repeat(60));
console.log('FAQ Re-tagging Script');
console.log('='.repeat(60));
console.log(`Input:  ${inputFile}`);
console.log(`Output: ${outputFile}`);
console.log(`Mode:   ${dryRun ? 'DRY RUN (no changes)' : 'LIVE (will modify files)'}`);
console.log('='.repeat(60));
console.log('');

// Tag mapping rules based on section and intent
const TAG_RULES = {
  // 預約與課程
  '📅 一般課程預約與安排': ['#課程預約', '#時段查詢'],
  '🧭 課程選擇與內容安排': ['#課程內容', '#課程選擇'],
  '📅 預約異動與取消': ['#預約變更', '#預約取消'],

  // 費用相關
  '💰 費用與支付方式': ['#費用計算', '#付款方式'],
  '退費機制規定': ['#退費規則'],

  // 教練相關
  '🏂 教練與教學安排': ['#教練安排', '#教學方式'],
  '🧑‍🏫 教練資訊與教學語言': ['#教練資訊', '#教練語言'],
  '🧑‍🏫 教練資訊與聯繫': ['#教練資訊'],

  // 親子與團體
  '👨‍👩‍👧‍👦 一起上課安排': ['#同堂安排', '#團體預約'],
  '👶 小朋友滑雪與安全保障': ['#親子課程', '#兒童安全'],

  // 安全與保險
  '🛟 安全與保險': ['#保險詢問', '#安全保障'],

  // 裝備與其他
  '🎒 裝備準備與租借流程': ['#裝備租借', '#裝備準備'],
  '📱 平台操作與預約流程': ['#平台操作', '#預約流程'],
  '📍 集合地點與交通': ['#交通資訊', '#集合地點'],
  '服務範圍與聯絡方式': ['#服務範圍', '#聯絡方式'],
  '行程規劃與周邊': ['#行程規劃', '#旅遊規劃'],
};

// Intent-based tag mapping (secondary rules)
const INTENT_TAGS = {
  'BOOKING': ['#課程預約'],
  'INSTRUCTOR': ['#指定教練', '#教練資訊'],
  'COURSE': ['#課程內容', '#課程選擇'],
  'GEAR': ['#裝備租借'],
  'KIDS_SAFETY': ['#兒童安全', '#親子課程'],
  'GROUPING': ['#同堂安排'],
  'PAYMENT': ['#費用計算', '#付款方式'],
  'REFUND_POLICY': ['#退費規則'],
  'ITINERARY': ['#行程規劃'],
  'SERVICE': ['#服務範圍'],
};

// Read and parse FAQ file
function loadFAQs(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    process.exit(1);
  }
}

// Apply retagging rules
function retagFAQ(faq) {
  const originalTags = faq.crm_tags || [];

  // If doesn't have #一般查詢, skip
  if (!originalTags.includes('#一般查詢')) {
    return { changed: false, originalTags, newTags: originalTags };
  }

  // Start with tags that are not #一般查詢
  let newTags = originalTags.filter(tag => tag !== '#一般查詢');

  // Apply section-based rules
  const sectionRule = TAG_RULES[faq.section];
  if (sectionRule) {
    sectionRule.forEach(tag => {
      if (!newTags.includes(tag)) {
        newTags.push(tag);
      }
    });
  }

  // Apply intent-based rules (if no section match)
  if (newTags.length === originalTags.filter(t => t !== '#一般查詢').length) {
    const intentTags = INTENT_TAGS[faq.intent];
    if (intentTags) {
      intentTags.forEach(tag => {
        if (!newTags.includes(tag)) {
          newTags.push(tag);
        }
      });
    }
  }

  // If still no new tags, keep one generic tag
  if (newTags.length === 0) {
    newTags = ['#一般查詢'];
  }

  return {
    changed: JSON.stringify(originalTags) !== JSON.stringify(newTags),
    originalTags,
    newTags
  };
}

// Main processing
function processFAQs() {
  const data = loadFAQs(inputFile);

  if (!data.items || !Array.isArray(data.items)) {
    console.error('❌ Invalid FAQ data structure');
    process.exit(1);
  }

  console.log(`📄 Loaded ${data.items.length} FAQs`);
  console.log('');

  const changes = [];
  const stats = {
    total: data.items.length,
    changed: 0,
    unchanged: 0,
    hadGenericTag: 0
  };

  // Process each FAQ
  data.items.forEach((faq, index) => {
    const result = retagFAQ(faq);

    if (faq.crm_tags && faq.crm_tags.includes('#一般查詢')) {
      stats.hadGenericTag++;
    }

    if (result.changed) {
      stats.changed++;
      changes.push({
        id: faq.id,
        question: faq.canonical_question,
        section: faq.section,
        intent: faq.intent,
        originalTags: result.originalTags,
        newTags: result.newTags
      });

      // Apply changes to data
      if (!dryRun) {
        data.items[index].crm_tags = result.newTags;
      }
    } else {
      stats.unchanged++;
    }
  });

  // Display results
  console.log('📊 Summary:');
  console.log(`   Total FAQs:              ${stats.total}`);
  console.log(`   Had "#一般查詢":          ${stats.hadGenericTag} (${(stats.hadGenericTag/stats.total*100).toFixed(1)}%)`);
  console.log(`   Changed:                 ${stats.changed}`);
  console.log(`   Unchanged:               ${stats.unchanged}`);
  console.log('');

  if (changes.length > 0) {
    console.log('🔄 Changes:');
    console.log('');

    changes.forEach((change, index) => {
      console.log(`${index + 1}. ${change.id}`);
      console.log(`   Question: ${change.question.substring(0, 50)}...`);
      console.log(`   Section:  ${change.section}`);
      console.log(`   Intent:   ${change.intent}`);
      console.log(`   Before:   ${change.originalTags.join(', ')}`);
      console.log(`   After:    ${change.newTags.join(', ')}`);
      console.log('');
    });
  }

  // Save changes
  if (!dryRun && stats.changed > 0) {
    try {
      // Create backup
      const backupFile = outputFile.replace('.json', `.backup.${Date.now()}.json`);
      fs.copyFileSync(outputFile, backupFile);
      console.log(`💾 Backup created: ${backupFile}`);

      // Save updated file
      fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf8');
      console.log(`✅ Updated ${outputFile}`);
      console.log('');
    } catch (error) {
      console.error(`❌ Error saving file:`, error.message);
      process.exit(1);
    }
  } else if (dryRun && stats.changed > 0) {
    console.log('ℹ️  DRY RUN MODE: No files were modified');
    console.log('   Run without --dry-run to apply changes');
    console.log('');
  } else {
    console.log('✅ No changes needed');
    console.log('');
  }

  console.log('='.repeat(60));
  console.log('Done!');
  console.log('='.repeat(60));
}

// Run the script
processFAQs();
