#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', '..', 'zeabur_backend', 'data', 'faq_kb.phase0a.json');
const OUTPUT_BASE = path.join(__dirname, '..', '..', 'frontend');
const SITE_BASE = 'https://faq.diy.ski';

const LANGS = [
  { code: 'zh', label: '繁體中文', locale: 'zh-Hant', suffix: 'zh' },
  { code: 'en', label: 'English', locale: 'en', suffix: 'en' },
  { code: 'th', label: 'ภาษาไทย', locale: 'th', suffix: 'th' }
];

const LINK_MAP = {
  LINK_SCHEDULE: {
    href: 'https://booking.diy.ski/schedule',
    label: { zh: '預約系統', en: 'Booking system', th: 'ระบบจอง' }
  },
  LINK_INSTRUCTORS: {
    href: 'https://diy.ski/instructorList.php',
    label: { zh: '教練介紹', en: 'Instructors', th: 'ผู้ฝึกสอน' }
  },
  LINK_APPLY_SCHEDULE: {
    href: 'https://booking.diy.ski/apply-schedule',
    label: { zh: '申請課程', en: 'Request a course', th: 'ขอเปิดคอร์ส' }
  },
  LINK_INSURANCE: {
    href: 'https://diy.ski/insurance_s.php',
    label: { zh: '保險方案', en: 'Insurance plan', th: 'ประกันภัย' }
  },
  LINK_ARTICLES: {
    href: 'https://diy.ski/articleList.php',
    label: { zh: '文章資源', en: 'Articles', th: 'บทความ' }
  },
  LINK_ORDER_LIST: {
    href: 'https://booking.diy.ski/order/list',
    label: { zh: '訂單查詢', en: 'My orders', th: 'คำสั่งของฉัน' }
  },
  LINK_SERVICE_EMAIL: {
    href: 'mailto:service@diy.ski',
    label: { zh: '客服信箱', en: 'Support email', th: 'อีเมลฝ่ายบริการ' }
  },
  LINK_FACEBOOK: {
    href: 'https://www.facebook.com/skidiy',
    label: { zh: 'Facebook', en: 'Facebook', th: 'Facebook' }
  }
};

function loadFaqData() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  const parsed = JSON.parse(raw);
  if (!parsed?.items) {
    throw new Error('Invalid FAQ dataset: missing items');
  }
  return parsed;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanDir(dir, extension = '.html') {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isFile() && entry.endsWith(extension)) {
      fs.unlinkSync(full);
    }
  }
}

function slugify(value) {
  const base = value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .replace(/-{2,}/g, '-');
  if (base.length > 0) return base;
  return 'section-' + Buffer.from(value).toString('hex').slice(0, 8);
}

function escapeHTML(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function replaceLinks(text, lang) {
  if (!text) return '';
  const paragraphs = text.split(/\n{2,}/);
  return paragraphs.map(par => {
    let html = escapeHTML(par).replace(/\n/g, '<br/>');
    html = html.replace(/\[LINK:([A-Z_]+)\|([^\]]+)\]/g, (_, token, label) => {
      const info = LINK_MAP[token];
      if (!info) return escapeHTML(label);
      const resolvedLabel = escapeHTML(info.label[lang] ?? label);
      return `<a href="${info.href}" target="_blank" rel="noopener">${resolvedLabel} 🔗</a>`;
    });
    return `<p>${html}</p>`;
  }).join('\n');
}

function resolveLinksInText(text, lang) {
  if (!text) return '';
  return text.replace(/\[LINK:([A-Z_]+)\|([^\]]+)\]/g, (_, token, label) => {
    const info = LINK_MAP[token];
    if (!info) return label;
    return info.label[lang] ?? label;
  });
}

function getLocalized(value, translations, lang) {
  if (lang === 'zh') return value;
  return translations?.[lang] || value;
}

function pickKeywords(item, lang) {
  if (lang === 'zh') return item.keywords || [];
  return item.keywords_translations?.[lang] || [];
}

function pickUtterances(item, lang) {
  if (lang === 'zh') return item.utterance_patterns || [];
  return item.utterance_patterns_translations?.[lang] || [];
}

function selectAnswerField(item, field, lang) {
  const translations = item.answer_template_translations?.[`${field}_translations`];
  if (lang === 'zh') {
    return item.answer_template?.[field] || item.answer_template?.text || '';
  }
  return translations?.[lang] || '';
}

function tokenToLink(token, lang) {
  const cleaned = token.replace(/[{}]/g, '').replace(/^LINK:/, '').replace(/^\s+|\s+$/g, '');
  const info = LINK_MAP[cleaned];
  if (!info) return null;
  return {
    href: info.href,
    label: info.label[lang] || info.label.zh || cleaned
  };
}

module.exports = {
  DATA_PATH,
  OUTPUT_BASE,
  SITE_BASE,
  LANGS,
  LINK_MAP,
  loadFaqData,
  ensureDir,
  cleanDir,
  slugify,
  escapeHTML,
  replaceLinks,
  resolveLinksInText,
  getLocalized,
  pickKeywords,
  pickUtterances,
  selectAnswerField,
  tokenToLink
};
