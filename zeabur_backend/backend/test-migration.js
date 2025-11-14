#!/usr/bin/env node
/**
 * 測試 Analytics Service 資料庫遷移
 *
 * 模擬 Zeabur 上的舊資料庫情況：
 * 1. 創建一個舊版本的資料庫（沒有 session_id 欄位）
 * 2. 初始化 AnalyticsService（應該自動遷移）
 * 3. 驗證 session_id 欄位是否被添加
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const AnalyticsService = require('./src/services/analytics-service');

const TEST_DB_PATH = '/tmp/test-analytics-migration.db';

// 刪除舊測試資料庫
if (fs.existsSync(TEST_DB_PATH)) {
  fs.unlinkSync(TEST_DB_PATH);
  console.log('[測試] 已刪除舊測試資料庫');
}

// 步驟 1: 創建舊版本資料庫（模擬 Zeabur 上的情況）
console.log('\n[步驟 1] 創建舊版本資料庫（無 session_id 欄位）...');
const oldDb = new Database(TEST_DB_PATH);

oldDb.exec(`
  CREATE TABLE faq_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faq_id TEXT NOT NULL,
    query_id TEXT,
    position INTEGER DEFAULT 0,
    clicked BOOLEAN DEFAULT 0,
    time_to_click_ms INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_faq_views_faq_id ON faq_views(faq_id);
  CREATE INDEX idx_faq_views_timestamp ON faq_views(timestamp);
`);

// 插入測試數據
oldDb.prepare(`
  INSERT INTO faq_views (faq_id, query_id, position, clicked)
  VALUES (?, ?, ?, ?)
`).run('faq.test.001', 'query-123', 1, 1);

console.log('[步驟 1] ✅ 舊版本資料庫創建完成');

// 檢查舊版本欄位
const oldColumns = oldDb.prepare('PRAGMA table_info(faq_views)').all();
console.log('[步驟 1] 舊版本欄位:', oldColumns.map(c => c.name).join(', '));
console.log('[步驟 1] ❌ session_id 欄位不存在:', !oldColumns.some(c => c.name === 'session_id'));

oldDb.close();

// 步驟 2: 使用 AnalyticsService 初始化（應該自動遷移）
console.log('\n[步驟 2] 使用 AnalyticsService 初始化（測試自動遷移）...');

let analyticsService;
try {
  analyticsService = new AnalyticsService(TEST_DB_PATH);
  console.log('[步驟 2] ✅ AnalyticsService 初始化成功');
} catch (error) {
  console.error('[步驟 2] ❌ AnalyticsService 初始化失敗:', error.message);
  console.error('[步驟 2] 錯誤堆疊:', error.stack);
  process.exit(1);
}

// 步驟 3: 驗證遷移結果
console.log('\n[步驟 3] 驗證遷移結果...');

const newColumns = analyticsService.db.prepare('PRAGMA table_info(faq_views)').all();
console.log('[步驟 3] 新版本欄位:', newColumns.map(c => c.name).join(', '));

const hasSessionId = newColumns.some(c => c.name === 'session_id');
const hasViewId = newColumns.some(c => c.name === 'view_id');
const hasQueryText = newColumns.some(c => c.name === 'query_text');
const hasSource = newColumns.some(c => c.name === 'source');
const hasLanguage = newColumns.some(c => c.name === 'language');

console.log('\n[驗證結果]');
console.log('  session_id:', hasSessionId ? '✅' : '❌');
console.log('  view_id:', hasViewId ? '✅' : '❌');
console.log('  query_text:', hasQueryText ? '✅' : '❌');
console.log('  source:', hasSource ? '✅' : '❌');
console.log('  language:', hasLanguage ? '✅' : '❌');

// 測試插入新資料（使用新欄位）
console.log('\n[步驟 4] 測試插入新資料（使用 session_id）...');
try {
  analyticsService.db.prepare(`
    INSERT INTO faq_views (faq_id, session_id, language)
    VALUES (?, ?, ?)
  `).run('faq.test.002', 'session-456', 'en');

  const count = analyticsService.db.prepare('SELECT COUNT(*) as count FROM faq_views').get();
  console.log('[步驟 4] ✅ 插入成功，總記錄數:', count.count);
} catch (error) {
  console.error('[步驟 4] ❌ 插入失敗:', error.message);
  process.exit(1);
}

// 清理
analyticsService.db.close();
fs.unlinkSync(TEST_DB_PATH);
console.log('\n[清理] ✅ 測試資料庫已刪除');

console.log('\n' + '='.repeat(60));
if (hasSessionId && hasViewId && hasQueryText && hasSource && hasLanguage) {
  console.log('🎉 遷移測試通過！所有欄位已正確添加。');
  console.log('✅ 這個修復應該可以解決 Zeabur 上的 "no such column: session_id" 錯誤');
} else {
  console.log('❌ 遷移測試失敗！某些欄位未被添加。');
  process.exit(1);
}
console.log('='.repeat(60));
