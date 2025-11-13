/**
 * Link Registry - Fallback Module
 *
 * This is a fallback module that exports the link registry data.
 * Used when link_registry.json cannot be loaded from the filesystem.
 * Primarily for Zeabur deployment where data files may not be available.
 *
 * Generated from: zeabur_backend/data/link_registry.json
 */

module.exports = {
  "meta": {
    "version": "1.0.0",
    "description": "統一的連結管理系統，支持 FAQ 和雪場資訊",
    "last_updated": "2025-11-06T00:00:00Z",
    "migration_note": "Phase 1: 雪場連結由此管理。Phase 2: FAQ 連結將遷移至此（目前仍在 faq_kb.phase0a.json 的 meta.link_tokens）"
  },
  "faq": {
    "LINK_SCHEDULE": {
      "name": "LINK_SCHEDULE",
      "labels": {
        "zh": "預約系統",
        "en": "Schedule",
        "th": "ตารางเวลา"
      },
      "url": "https://booking.diy.ski/schedule",
      "type": "booking",
      "icon": "📅",
      "description": "官方滑雪課程預約系統"
    },
    "LINK_INSTRUCTORS": {
      "name": "LINK_INSTRUCTORS",
      "labels": {
        "zh": "教練介紹",
        "en": "Instructors",
        "th": "ผู้สอน"
      },
      "url": "https://diy.ski/instructorList.php",
      "type": "reference",
      "icon": "👨‍🏫",
      "description": "查看所有認證教練資訊"
    },
    "LINK_APPLY_SCHEDULE": {
      "name": "LINK_APPLY_SCHEDULE",
      "labels": {
        "zh": "申請課程",
        "en": "Apply for Course",
        "th": "สมัครคอร์ส"
      },
      "url": "https://booking.diy.ski/apply-schedule",
      "type": "booking",
      "icon": "📝",
      "description": "申請無教練課程或自訂課程"
    },
    "LINK_INSURANCE": {
      "name": "LINK_INSURANCE",
      "labels": {
        "zh": "保險資訊",
        "en": "Insurance",
        "th": "ประกันภัย"
      },
      "url": "https://diy.ski/insurance_s.php",
      "type": "reference",
      "icon": "🛡️",
      "description": "旅遊保險方案與說明"
    },
    "LINK_ARTICLES": {
      "name": "LINK_ARTICLES",
      "labels": {
        "zh": "文章資源",
        "en": "Articles",
        "th": "บทความ"
      },
      "url": "https://diy.ski/articleList.php",
      "type": "content",
      "icon": "📖",
      "description": "滑雪知識與旅遊指南文章"
    },
    "LINK_ORDER_LIST": {
      "name": "LINK_ORDER_LIST",
      "labels": {
        "zh": "訂單查詢",
        "en": "My Orders",
        "th": "คำสั่งของฉัน"
      },
      "url": "https://booking.diy.ski/order/list",
      "type": "account",
      "icon": "📋",
      "description": "查詢與管理訂單"
    },
    "LINK_SERVICE_EMAIL": {
      "name": "LINK_SERVICE_EMAIL",
      "labels": {
        "zh": "客服信箱",
        "en": "Support Email",
        "th": "อีเมลสนับสนุน"
      },
      "url": "mailto:service@diy.ski",
      "type": "contact",
      "icon": "✉️",
      "description": "聯繫客服支援團隊"
    },
    "LINK_FACEBOOK": {
      "name": "LINK_FACEBOOK",
      "labels": {
        "zh": "Facebook",
        "en": "Facebook",
        "th": "Facebook"
      },
      "url": "https://www.facebook.com/skidiy",
      "type": "social",
      "icon": "f",
      "description": "官方 Facebook 粉絲頁"
    },
    "LINK_PANDARUMAN": {
      "name": "LINK_PANDARUMAN",
      "labels": {
        "zh": "熊貓滑雪學校",
        "en": "Pandaruman Ski School",
        "th": "โรงเรียนสกี Pandaruman"
      },
      "url": "https://www.pandaruman.com/",
      "type": "reference",
      "icon": "🐼",
      "description": "專為幼幼兒童（5歲以下）設計的滑雪課程"
    }
  },
  "resort": {
    "official_site": {
      "name": "official_site",
      "labels": {
        "zh": "官方網站",
        "en": "Official Website",
        "th": "เว็บไซต์อย่างเป็นทางการ"
      },
      "url_template": "{resort.official_site}",
      "type": "website",
      "icon": "🌐",
      "description": "雪場官方網站",
      "dynamic": true,
      "variable": "resort.official_site"
    },
    "booking_page": {
      "name": "booking_page",
      "labels": {
        "zh": "線上訂票",
        "en": "Book Tickets Online",
        "th": "จองตั๋วออนไลน์"
      },
      "url_template": "https://booking.diy.ski/schedule?resort={resort.resort_id}",
      "type": "booking",
      "icon": "🎫",
      "description": "透過我們系統預訂此雪場課程",
      "dynamic": true,
      "variable": "resort.resort_id"
    },
    "google_maps": {
      "name": "google_maps",
      "labels": {
        "zh": "Google 地圖",
        "en": "Google Maps",
        "th": "Google Maps"
      },
      "url_template": "https://maps.google.com/?q={resort.coordinates.lat},{resort.coordinates.lng}",
      "type": "maps",
      "icon": "📍",
      "description": "查看雪場地理位置",
      "dynamic": true,
      "variable": "resort.coordinates"
    },
    "snow_report": {
      "name": "snow_report",
      "labels": {
        "zh": "積雪情況",
        "en": "Snow Report",
        "th": "รายงานหิมะ"
      },
      "url_template": "{resort.snow_report_url}",
      "type": "info",
      "icon": "❄️",
      "description": "實時積雪與天氣資訊",
      "dynamic": true,
      "variable": "resort.snow_report_url",
      "optional": true
    }
  },
  "categories": {
    "booking": {
      "label_zh": "預訂相關",
      "label_en": "Booking",
      "description": "課程與票券預訂"
    },
    "contact": {
      "label_zh": "聯繫方式",
      "label_en": "Contact",
      "description": "客服與聯絡資訊"
    },
    "reference": {
      "label_zh": "參考資訊",
      "label_en": "Reference",
      "description": "教練、保險等參考資料"
    },
    "content": {
      "label_zh": "內容資源",
      "label_en": "Content",
      "description": "文章、指南等知識內容"
    },
    "social": {
      "label_zh": "社群媒體",
      "label_en": "Social Media",
      "description": "官方社群頻道"
    },
    "website": {
      "label_zh": "官方網站",
      "label_en": "Website",
      "description": "雪場官方網站"
    },
    "maps": {
      "label_zh": "地圖位置",
      "label_en": "Maps",
      "description": "地理位置與導航"
    },
    "info": {
      "label_zh": "實時資訊",
      "label_en": "Info",
      "description": "積雪、天氣等實時信息"
    },
    "account": {
      "label_zh": "帳戶管理",
      "label_en": "Account",
      "description": "訂單、帳戶相關"
    }
  }
};
