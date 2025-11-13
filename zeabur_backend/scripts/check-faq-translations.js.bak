const fs = require('fs');
const path = require('path');

const TRANSLATION_LANGUAGES = ['en', 'th'];

function loadFAQData() {
  const dataPath = path.join(__dirname, '../data/faq_kb.phase0a.json');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw);
}

function summarizeTranslations(items) {
  const summary = {
    total: items.length,
    languages: {}
  };

  TRANSLATION_LANGUAGES.forEach(lang => {
    summary.languages[lang] = {
      complete: 0,
      outdated: 0,
      pending: 0,
      missing: 0
    };
  });

  const issues = [];

  items.forEach(item => {
    TRANSLATION_LANGUAGES.forEach(lang => {
      const status = item.translation_status?.[lang]?.status || 'missing';
      const bucket = summary.languages[lang];
      if (bucket[status] !== undefined) {
        bucket[status] += 1;
      } else {
        bucket.missing += 1;
      }

      if (status !== 'complete') {
        issues.push({
          id: item.id,
          lang,
          status,
          question: item.canonical_question
        });
      }
    });
  });

  return { summary, issues };
}

function main() {
  const data = loadFAQData();
  const { summary, issues } = summarizeTranslations(data.items || []);

  console.log('🌐 FAQ Translation Status');
  console.log('---------------------------');
  console.log(`Total FAQs: ${summary.total}`);
  TRANSLATION_LANGUAGES.forEach(lang => {
    const stats = summary.languages[lang];
    const label = lang.toUpperCase();
    console.log(`  ${label}: ✅ ${stats.complete} | ↻ ${stats.outdated} | … ${stats.pending} | ✖ ${stats.missing}`);
  });

  if (issues.length === 0) {
    console.log('\nAll translations are up-to-date! ✅');
    return;
  }

  console.log(`\nPending translations: ${issues.length}`);
  issues.slice(0, 50).forEach(issue => {
    console.log(`- [${issue.lang.toUpperCase()}] ${issue.id} (${issue.status}) :: ${issue.question}`);
  });

  if (issues.length > 50) {
    console.log(`...and ${issues.length - 50} more`);
  }
}

main();
