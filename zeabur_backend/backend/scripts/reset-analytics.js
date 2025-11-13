#!/usr/bin/env node
/**
 * Reset Analytics Database
 *
 * 清除舊的分析資料，從新的 FAQ tag 系統重新開始統計
 *
 * 使用方式：
 *   node backend/scripts/reset-analytics.js [選項]
 *
 * 選項：
 *   --all          清除所有資料（預設）
 *   --keep-days N  只保留最近 N 天的資料
 *   --dry-run      只顯示會刪除什麼，不實際執行
 */

const Database = require('better-sqlite3');
const path = require('path');

// 解析命令列參數
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const keepDaysIndex = args.indexOf('--keep-days');
const MIN_KEEP_DAYS = parseInt(process.env.ANALYTICS_MIN_KEEP_DAYS || '7', 10);
let keepDays = keepDaysIndex >= 0 ? parseInt(args[keepDaysIndex + 1]) : null;
if (keepDays && keepDays < MIN_KEEP_DAYS) {
  console.warn(`⚠️ keepDays 不得少於 ${MIN_KEEP_DAYS} 天，已自動調整。`);
  keepDays = MIN_KEEP_DAYS;
}

// 資料庫路徑
const dbPath = path.join(__dirname, '../../data/analytics.db');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 Analytics Database Reset Tool');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('資料庫路徑:', dbPath);
console.log('模式:', dryRun ? '🔍 預覽模式 (不會實際刪除)' : '⚠️  執行模式 (會刪除資料)');

if (keepDays) {
  console.log('保留策略: 保留最近', keepDays, '天的資料');
} else {
  console.log('保留策略: 清除所有資料');
}
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

try {
  const db = new Database(dbPath);

  // 查詢當前資料量
  const stats = {
    search_queries: db.prepare('SELECT COUNT(*) as count FROM search_queries').get(),
    faq_views: db.prepare('SELECT COUNT(*) as count FROM faq_views').get(),
    feedback: db.prepare('SELECT COUNT(*) as count FROM feedback').get()
  };

  console.log('📈 當前資料統計：');
  console.log('  search_queries: ', stats.search_queries.count, '筆');
  console.log('  faq_views:      ', stats.faq_views.count, '筆');
  console.log('  feedback:       ', stats.feedback.count, '筆');
  console.log('');

  if (keepDays) {
    // 計算截止日期
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - keepDays);
    const cutoffStr = cutoffDate.toISOString();

    console.log('🗓️  截止日期:', cutoffStr.split('T')[0]);
    console.log('   (', cutoffDate.toISOString(), ')');
    console.log('');

    // 查詢會被刪除的資料量
    const toDelete = {
      search_queries: db.prepare('SELECT COUNT(*) as count FROM search_queries WHERE timestamp < ?').get(cutoffStr),
      faq_views: db.prepare('SELECT COUNT(*) as count FROM faq_views WHERE timestamp < ?').get(cutoffStr),
      feedback: db.prepare('SELECT COUNT(*) as count FROM feedback WHERE timestamp < ?').get(cutoffStr)
    };

    console.log('🗑️  將刪除的資料：');
    console.log('  search_queries: ', toDelete.search_queries.count, '筆');
    console.log('  faq_views:      ', toDelete.faq_views.count, '筆');
    console.log('  feedback:       ', toDelete.feedback.count, '筆');
    console.log('');

    if (!dryRun) {
      console.log('🔄 開始刪除...');
      db.exec('BEGIN TRANSACTION');

      db.prepare('DELETE FROM search_queries WHERE timestamp < ?').run(cutoffStr);
      db.prepare('DELETE FROM faq_views WHERE timestamp < ?').run(cutoffStr);
      db.prepare('DELETE FROM feedback WHERE timestamp < ?').run(cutoffStr);

      db.exec('COMMIT');
      db.exec('VACUUM');

      console.log('✅ 刪除完成！');
    } else {
      console.log('ℹ️  預覽模式，未實際刪除資料');
    }
  } else {
    // 清除所有資料
    console.log('🗑️  將清除所有分析資料');
    console.log('');

    if (!dryRun) {
      console.log('🔄 開始清除...');
      db.exec('BEGIN TRANSACTION');

      db.exec('DELETE FROM search_queries');
      db.exec('DELETE FROM faq_views');
      db.exec('DELETE FROM feedback');

      db.exec('COMMIT');
      db.exec('VACUUM');

      console.log('✅ 清除完成！');
    } else {
      console.log('ℹ️  預覽模式，未實際刪除資料');
    }
  }

  // 查詢清除後的資料量
  if (!dryRun) {
    const afterStats = {
      search_queries: db.prepare('SELECT COUNT(*) as count FROM search_queries').get(),
      faq_views: db.prepare('SELECT COUNT(*) as count FROM faq_views').get(),
      feedback: db.prepare('SELECT COUNT(*) as count FROM feedback').get()
    };

    console.log('');
    console.log('📊 清除後資料統計：');
    console.log('  search_queries: ', afterStats.search_queries.count, '筆');
    console.log('  faq_views:      ', afterStats.faq_views.count, '筆');
    console.log('  feedback:       ', afterStats.feedback.count, '筆');
  }

  db.close();

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ 操作完成');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

} catch (error) {
  console.error('❌ 錯誤:', error.message);
  console.error(error.stack);
  process.exit(1);
}
