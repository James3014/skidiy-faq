#!/usr/bin/env node

/**
 * Initialize SQLite database schema for FAQ System Analytics
 * Run: node scripts/init-database.js
 */

const Database = require('../backend/node_modules/better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../data/analytics.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

console.log('🗄️  Initializing SQLite database...');
console.log(`📍 Database path: ${DB_PATH}`);

const db = new Database(DB_PATH);

// Create search_queries table
db.exec(`
  CREATE TABLE IF NOT EXISTS search_queries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_id TEXT UNIQUE NOT NULL,
    query_text TEXT NOT NULL,
    query_language TEXT,
    detected_intent TEXT,
    intent_confidence REAL,
    extracted_slots TEXT,
    results_count INTEGER NOT NULL,
    top_result_id TEXT,
    top_result_score REAL,
    response_time_ms INTEGER NOT NULL,
    llm_used BOOLEAN DEFAULT 0,
    llm_cost REAL,
    session_id TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT
  );
`);

console.log('✅ Created table: search_queries');

// Create faq_views table
db.exec(`
  CREATE TABLE IF NOT EXISTS faq_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faq_id TEXT NOT NULL,
    query_id INTEGER NOT NULL,
    position INTEGER NOT NULL,
    clicked BOOLEAN DEFAULT 0,
    time_to_click_ms INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (query_id) REFERENCES search_queries(id)
  );
`);

console.log('✅ Created table: faq_views');

// Create indexes for performance
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_query_timestamp ON search_queries(timestamp);
  CREATE INDEX IF NOT EXISTS idx_query_intent ON search_queries(detected_intent);
  CREATE INDEX IF NOT EXISTS idx_query_session ON search_queries(session_id);
  CREATE INDEX IF NOT EXISTS idx_faq_views_faq_id ON faq_views(faq_id);
  CREATE INDEX IF NOT EXISTS idx_faq_views_query_id ON faq_views(query_id);
`);

console.log('✅ Created indexes for performance optimization');

// Verify tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('\n📊 Database tables:');
tables.forEach(table => console.log(`   - ${table.name}`));

// Verify indexes
const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index' ORDER BY name").all();
console.log('\n📇 Database indexes:');
indexes.forEach(index => console.log(`   - ${index.name}`));

db.close();

console.log('\n✅ Database initialization complete!');
console.log(`📍 Location: ${DB_PATH}`);
