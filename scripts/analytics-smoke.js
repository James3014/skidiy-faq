#!/usr/bin/env node
// Simple smoke test for analytics endpoints
// Usage: BASE_URL=http://localhost:3000 node scripts/analytics-smoke.js
const fetch = require('node-fetch');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function check(path) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url);
  const json = await res.json().catch(() => ({}));
  const ok = res.ok && json.success !== false;
  return { path, status: res.status, ok, error: json.error, count: json.data ? (json.data.count || json.data.length || json.data.total || 'n/a') : 'n/a' };
}

async function main() {
  const targets = [
    '/api/v1/analytics/faq-stats?days=1',
    '/api/v1/analytics/tag-stats?days=1',
    '/api/v1/analytics/section-stats?days=1',
    '/api/v1/analytics/resort-stats?days=1',
    '/api/v1/analytics/resort-engagement-stats?days=1',
    '/api/v1/analytics/feedback-stats?days=1'
  ];

  const results = await Promise.all(targets.map(check));
  results.forEach(r => {
    console.log(`${r.ok ? '✅' : '❌'} ${r.path} -> ${r.status} count:${r.count} ${r.error ? 'error:' + r.error : ''}`);
  });
  const failed = results.filter(r => !r.ok);
  if (failed.length > 0) process.exit(1);
}

main().catch(err => {
  console.error('Smoke test failed:', err.message);
  process.exit(1);
});
