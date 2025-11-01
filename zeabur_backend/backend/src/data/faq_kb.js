module.exports = 
{
  "meta": {
    "link_tokens": {
      "LINK_SCHEDULE": "https://booking.diy.ski/schedule",
      "LINK_INSTRUCTORS": "https://diy.ski/instructorList.php",
      "LINK_APPLY_SCHEDULE": "https://booking.diy.ski/apply-schedule",
      "LINK_INSURANCE": "https://diy.ski/insurance_s.php",
      "LINK_ARTICLES": "https://diy.ski/articleList.php",
      "LINK_ORDER_LIST": "https://booking.diy.ski/order/list"
    },
    "policy_notes": [
      "NO_QUOTE: 不口頭報價，請導至系統頁面。",
      "NO_MANUAL_MATCH: 不人工查空檔/配對。",
      "NO_INSURANCE_BREAKDOWN: 不外顯保險費用細項。"
    ]
  },
  "items": [
    {
      "id": "faq.itinerary.001",
      "intent": "ITINERARY",
      "section": "行程規劃與周邊",
      "canonical_question": "應該先訂好機票住宿，還是先預約滑雪教練？",
      "hot": true,
      "utterance_patterns": [
        "應該先訂好機票住宿，還是先預約滑雪教練",
        "先訂教練還是先訂機票",
        "先訂教練還是先訂住宿",
        "要先預約教練嗎",
        "機票住宿要先訂嗎",
        "先訂教練比較保險嗎",
        "要先預約教練",
        "機票住宿要先訂",
        "先訂教練比較保險",
        "應該先訂好機票住宿，還是先預約滑雪教練？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "我們強烈建議您「先預約教練，再訂機票住宿」。尤其是在旺季，優質的中文教練非常搶手，時常比機票或住宿更早被預約一空。先確認預約到您想要的教練與時段後，再進行後續的旅遊安排，行程會比較有保障。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "We strongly recommend that you 'book your coach first, then your flights and accommodation.' Especially during peak season, high-quality Chinese-speaking coaches are in high demand and are often fully booked even before flights or accommodation. By confirming your desired coach and time slot first, and then making subsequent travel arrangements, your itinerary will be more secure.",
          "th": "เราขอแนะนำอย่างยิ่งให้คุณ \"จองโค้ชก่อน แล้วค่อยจองตั๋วเครื่องบินและที่พัก\" โดยเฉพาะอย่างยิ่งในช่วงฤดูท่องเที่ยว โค้ชภาษาจีนที่มีคุณภาพเป็นที่ต้องการอย่างมาก และมักจะถูกจองเต็มเร็วกว่าตั๋วเครื่องบินหรือที่พัก หลังจากยืนยันการจองโค้ชและช่วงเวลาที่คุณต้องการแล้ว การจัดเตรียมการเดินทางในภายหลังจะช่วยให้แผนการเดินทางของคุณมีความมั่นคงมากขึ้น"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}",
        "{{LINK_ARTICLES}}"
      ],
      "crm_tags": [
        "#行程規劃"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Should I book flights and accommodation first, or reserve a ski instructor first?",
        "th": "ควรจองตั๋วเครื่องบินและที่พักก่อน หรือจองครูสอนสกีล่วงหน้าก่อนดี?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:13:38.250688+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:13:38.250688+00:00"
        }
      }
    },
    {
      "id": "faq.itinerary.002",
      "intent": "ITINERARY",
      "section": "行程規劃與周邊",
      "canonical_question": "你們有推薦的住宿嗎？為什麼熱門時段的房間這麼難訂？",
      "hot": true,
      "utterance_patterns": [
        "你們有推薦的住宿嗎為什麼熱門時段的房間這麼難訂",
        "住宿推薦",
        "有沒有推薦的飯店",
        "房間很難訂為什麼",
        "旺季住宿怎麼訂",
        "住宿什麼時候會開放預訂",
        "你們有推薦的住宿為什麼熱門時段的房間這麼難訂",
        "你們有推薦的住宿？為什麼熱門時段的房間這麼難訂？",
        "你們有推薦的住宿嗎？為什麼熱門時段的房間這麼難訂？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "我們在網站的各雪場介紹頁面中，有整理學員們較常選擇的住宿選項供您參考。關於熱門時段（如聖誕、跨年、農曆新年）訂房困難，主要有兩個原因：1) 日本的訂房通常在 2-3 個月前才開放，太早查詢會顯示無空房。2) 這些時段是全球的滑雪旺季，房價會大幅上漲且很快被訂滿，建議您確定行程後盡早預訂。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "On the accommodation pages for each ski resort on our website, we have compiled accommodation options that students frequently choose for your reference. Regarding the difficulty of booking during popular periods (such as Christmas, New Year's Eve, and Lunar New Year), there are two main reasons: 1) Bookings in Japan usually open only 2-3 months in advance, so searching too early will show no vacancies. 2) These periods are global peak seasons for skiing, and room prices will increase significantly and be booked up quickly. We recommend booking as early as possible once your itinerary is confirmed.",
          "th": "ในหน้าแนะนำสกีรีสอร์ตต่างๆ บนเว็บไซต์ของเรา เราได้รวบรวมตัวเลือกที่พักที่นักเรียนนิยมเลือกไว้ให้คุณอ้างอิงเกี่ยวกับการจองที่พักในช่วงเวลาที่มีคนนิยม (เช่น คริสต์มาส, ปีใหม่, ตรุษจีน) ที่เป็นเรื่องยาก มีสาเหตุหลักสองประการ: 1) การจองที่พักในญี่ปุ่นมักจะเปิดให้จองล่วงหน้าเพียง 2-3 เดือนเท่านั้น การค้นหาเร็วเกินไปจะแสดงว่าไม่มีห้องว่าง 2) ช่วงเวลาเหล่านี้เป็นฤดูท่องเที่ยวสกีทั่วโลก ราคาห้องพักจะสูงขึ้นมากและถูกจองเต็มอย่างรวดเร็ว ขอแนะนำให้คุณจองล่วงหน้าโดยเร็วที่สุดหลังจากยืนยันแผนการเดินทางแล้ว"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดอ้างอิงจากระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}",
        "{{LINK_ARTICLES}}"
      ],
      "crm_tags": [
        "#行程規劃"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Do you have any recommended accommodations? Why is it so difficult to book rooms during peak seasons?",
        "th": "คุณมีที่พักแนะนำไหมครับ/คะ? ทำไมห้องพักถึงจองยากจังในช่วงเวลาที่คนนิยม?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:14:26.412029+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:14:26.412029+00:00"
        }
      }
    },
    {
      "id": "faq.service.003",
      "intent": "SERVICE",
      "section": "服務範圍與聯絡方式",
      "canonical_question": "你們主要在日本哪些地區或滑雪場提供教練服務？",
      "hot": true,
      "utterance_patterns": [
        "你們主要在日本哪些地區或滑雪場提供教練服務",
        "可以在雪場裡授課嗎",
        "可以在滑雪場內上課嗎",
        "會不會被驅趕",
        "會不會被趕走",
        "會不會被勸離",
        "輕井澤王子可以授課嗎",
        "輕井澤王子滑雪場可以上課嗎",
        "Prince Ski 可以上課嗎",
        "在某個雪場是否能安排教練授課",
        "能不能在雪場裡授課",
        "可不可以在雪場裡授課",
        "可以在雪場裡授課",
        "能否在雪場裡授課",
        "能否在滑雪場內上課",
        "可以在滑雪場內上課",
        "能不能在滑雪場內上課",
        "可不可以在滑雪場內上課",
        "輕井澤王子能否授課",
        "輕井澤王子可以授課",
        "輕井澤王子能不能授課",
        "輕井澤王子可不可以授課",
        "輕井澤王子滑雪場能不能上課",
        "輕井澤王子滑雪場可不可以上課",
        "輕井澤王子滑雪場可以上課",
        "輕井澤王子滑雪場能否上課",
        "Prince Ski 可不可以上課",
        "Prince Ski 可以上課",
        "Prince Ski 能不能上課",
        "Prince Ski 能否上課",
        "你們主要在日本哪些地區或滑雪場提供教練服務？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "我們的中文滑雪教練服務遍及日本多個熱門滑雪區域，包含：北海道（札幌、留壽都、富 良野）、東北（安比、藏王）、新潟（湯澤地區、苗場）、長野（輕井澤、白馬、野澤）等。您可以在我們的網站首頁或「雪場介紹」頁面，查看所有提供服務的雪場列表。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "Our Chinese ski instructor services cover many popular ski areas across Japan, including Hokkaido (Sapporo, Rusutsu, Furano), Tohoku (Appi, Zao), Niigata (Yuzawa area, Naeba), Nagano (Karuizawa, Hakuba, Nozawa), and more. You can view a list of all ski resorts where we offer services on our website's homepage or the 'Ski Resort Introduction' page.",
          "th": "บริการครูสอนสกีภาษาจีนของเราครอบคลุมพื้นที่สกีรีสอร์ทยอดนิยมหลายแห่งในญี่ปุ่น ได้แก่ ฮอกไกโด (ซัปโปโร, รุซุตสึ, ฟุราโนะ), โทโฮคุ (อัปปิ, ซาโอ), นีงาตะ (พื้นที่ยูซาวะ, นาเอบะ), นางาโนะ (คารุอิซาวะ, ฮาคุบะ, โนซาวะ) และอื่นๆ คุณสามารถดูรายชื่อสกีรีสอร์ททั้งหมดที่ให้บริการได้ที่หน้าแรกของเว็บไซต์ของเรา หรือหน้า \"แนะนำสกีรีสอร์ท\""
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดอ้างอิงจากระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#服務範圍"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "In which regions or ski resorts in Japan do you primarily offer coaching services?",
        "th": "คุณให้บริการโค้ชในภูมิภาคหรือสกีรีสอร์ตใดบ้างในญี่ปุ่นเป็นหลัก?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:15:37.155849+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:15:37.155849+00:00"
        }
      }
    },
    {
      "id": "faq.service.004",
      "intent": "SERVICE",
      "section": "服務範圍與聯絡方式",
      "canonical_question": "我有問題想詢問，請問有提供電話客服嗎？",
      "hot": true,
      "utterance_patterns": [
        "我有問題想詢問，有提供電話客服嗎",
        "我有問題想詢問，請問有提供電話客服嗎",
        "我有問題想詢問，有提供電話客服",
        "我有問題想詢問，有提供電話客服？",
        "我有問題想詢問，請問有提供電話客服嗎？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "為了確保服務品質與資訊的準確性，我們目前主要透過電子郵件 ( admin@diy.ski ) 提供客服。文字記錄能幫助我們更精準地理解您的問題，並完整地追蹤處理進度。我們承諾會盡快回覆您的所有問題。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "To ensure service quality and accuracy of information, we currently primarily provide customer service via email (admin@diy.ski). Text records help us understand your questions more precisely and fully track the progress of their resolution. We promise to respond to all your inquiries as quickly as possible.",
          "th": "เพื่อให้มั่นใจในคุณภาพการบริการและความถูกต้องของข้อมูล ปัจจุบันเราให้บริการลูกค้าหลักผ่านทางอีเมล (admin@diy.ski) การบันทึกข้อความช่วยให้เราเข้าใจปัญหาของคุณได้อย่างแม่นยำยิ่งขึ้น และติดตามความคืบหน้าในการแก้ไขได้อย่างสมบูรณ์ เราสัญญาว่าจะตอบกลับทุกคำถามของคุณโดยเร็วที่สุด"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดอ้างอิงตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#服務範圍"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "I have a question, do you provide phone customer service?",
        "th": "ฉันมีคำถาม อยากสอบถามว่ามีบริการลูกค้าทางโทรศัพท์หรือไม่?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:16:24.935837+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:16:24.935837+00:00"
        }
      }
    },
    {
      "id": "faq.course.005",
      "intent": "COURSE",
      "section": "🧭 課程選擇與內容安排",
      "canonical_question": "滑雪課程的課程長度？怎麼上課比較適合初學者？",
      "hot": true,
      "utterance_patterns": [
        "滑雪課程的課程長度怎麼上課比較適合初學者",
        "課程長度",
        "上幾小時比較好",
        "初學者建議上多久",
        "半天課和全天課差別",
        "初學課怎麼安排比較好",
        "滑雪課程的課程長度？怎麼上課比較適合初學者？"
      ],
      "required_slots": [
        "date?",
        "resort?",
        "board_type?",
        "people_total?"
      ],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "除了輕井澤雪場為一堂 2 小時，大部份雪場分為 3 小時上下午半天課及全天課 (時長依雪場會稍有不同 )。初學者建議至少上 8 至 12 小時，才能學習到完整進度，進階者可視自己的程度狀況預訂全日或半日課程。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "In addition to the 2-hour lessons at Karuizawa Ski Resort, most ski resorts offer 3-hour half-day lessons in the morning or afternoon, as well as full-day lessons (the duration may vary depending on the ski resort). It is recommended that beginners take at least 8 to 12 hours of lessons to learn the full curriculum; advanced skiers can book full-day or half-day lessons according to their own level.",
          "th": "ยกเว้นลานสกีคารุอิซาวะที่มีคอร์ส 2 ชั่วโมง ลานสกีส่วนใหญ่แบ่งเป็นคอร์สครึ่งวันเช้า-บ่าย 3 ชั่วโมง และคอร์สเต็มวัน (ระยะเวลาอาจแตกต่างกันไปตามลานสกี) สำหรับผู้เริ่มต้น แนะนำให้เรียนอย่างน้อย 8 ถึง 12 ชั่วโมง เพื่อให้สามารถเรียนรู้เนื้อหาได้อย่างครบถ้วน ส่วนผู้ที่มีประสบการณ์แล้วสามารถจองคอร์สเต็มวันหรือครึ่งวันได้ตามระดับความสามารถของตนเอง"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดอ้างอิงตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}",
        "{{LINK_INSTRUCTORS}}"
      ],
      "crm_tags": [
        "#課程內容"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "What is the duration of the ski lesson? How should beginners take lessons?",
        "th": "ระยะเวลาของคอร์สเรียนสกี? การเรียนแบบไหนที่เหมาะกับผู้เริ่มต้น?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:21:54.291507+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:21:54.291507+00:00"
        }
      }
    },
    {
      "id": "faq.course.006",
      "intent": "COURSE",
      "section": "🧭 課程選擇與內容安排",
      "canonical_question": "可以在同一堂課中同時學單板與雙板嗎？",
      "utterance_patterns": [
        "可以在同一堂課中同時學單板與雙板嗎",
        "能不能在同一堂課中同時學單板與雙板嗎",
        "可不可以在同一堂課中同時學單板與雙板",
        "可以在同一堂課中同時學單板與雙板",
        "能否在同一堂課中同時學單板與雙板",
        "能不能在同一堂課中同時學單板與雙板",
        "可以在同一堂課中同時學單板與雙板？",
        "能否在同一堂課中同時學單板與雙板？",
        "可不可以在同一堂課中同時學單板與雙板？",
        "可以在同一堂課中同時學單板與雙板嗎？",
        "能不能在同一堂課中同時學單板與雙板？"
      ],
      "required_slots": [
        "date?",
        "resort?",
        "board_type?",
        "people_total?"
      ],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "不建議。單板與雙板為完全不同的運動，裝備與技巧也不同。請先決定您希望學習的滑雪類型。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "Not recommended. Snowboarding and skiing are completely different sports, with different equipment and techniques. Please decide which type of skiing you wish to learn first.",
          "th": "ไม่แนะนำให้เรียนพร้อมกัน เพราะสโนว์บอร์ดและสกีเป็นกีฬาคนละแบบ มีอุปกรณ์และเทคนิคที่แตกต่างกัน ควรเลือกก่อนว่าจะเริ่มเรียนแบบใด"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดอ้างอิงจากระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}",
        "{{LINK_INSTRUCTORS}}"
      ],
      "crm_tags": [
        "#課程內容"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Can I learn both snowboarding and skiing in the same lesson?",
        "th": "สามารถเรียนสโนว์บอร์ดและสกีได้ในคลาสเดียวกันหรือไม่?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:23:22.942300+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T14:38:40.342717Z"
        }
      }
    },
    {
      "id": "faq.grouping.007",
      "intent": "GROUPING",
      "section": "👨‍👩‍👧‍👦 一起上課安排",
      "canonical_question": "我可以和朋友或家人一起上課嗎？不同程度能同堂上課嗎？",
      "utterance_patterns": [
        "我可以和朋友或家人一起上課嗎不同程度能同堂上課嗎",
        "我能不能和朋友或家人一起上課嗎不同程度能同堂上課嗎",
        "我可以和朋友或家人一起上課不同程度能同堂上課",
        "我可不可以和朋友或家人一起上課不同程度能同堂上課",
        "我能不能和朋友或家人一起上課不同程度能同堂上課",
        "我能否和朋友或家人一起上課不同程度能同堂上課",
        "我可以和朋友或家人一起上課嗎？不同程度能同堂上課嗎？",
        "我可不可以和朋友或家人一起上課？不同程度能同堂上課？",
        "我可以和朋友或家人一起上課？不同程度能同堂上課？",
        "我能否和朋友或家人一起上課？不同程度能同堂上課？",
        "我能不能和朋友或家人一起上課？不同程度能同堂上課？"
      ],
      "required_slots": [
        "date?",
        "resort?",
        "board_type?",
        "people_total?"
      ],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "可以安排同堂，但程度差距較大時，建議分開上課，確保每位學員都能獲得適合的教學進度。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "While it's possible to arrange for students to be in the same class, if there's a significant difference in their proficiency levels, it's recommended to separate them into different classes to ensure each student receives instruction at an appropriate pace.",
          "th": "สามารถจัดให้เรียนในชั้นเรียนเดียวกันได้ แต่หากระดับความสามารถแตกต่างกันมาก แนะนำให้แยกชั้นเรียน เพื่อให้แน่ใจว่านักเรียนแต่ละคนจะได้รับความก้าวหน้าในการเรียนการสอนที่เหมาะสม"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดอ้างอิงจากระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}",
        "{{LINK_INSTRUCTORS}}"
      ],
      "crm_tags": [
        "#同堂安排"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Can I take classes with friends or family? Can different skill levels attend the same class?",
        "th": "ฉันสามารถเรียนกับเพื่อนหรือครอบครัวได้ไหม? ผู้เรียนที่มีระดับต่างกันสามารถเรียนในชั้นเรียนเดียวกันได้หรือไม่?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:24:26.850507+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:24:26.850507+00:00"
        }
      }
    },
    {
      "id": "faq.grouping.008",
      "intent": "GROUPING",
      "section": "👨‍👩‍👧‍👦 一起上課安排",
      "canonical_question": "成人與小孩可以一起上課嗎？",
      "utterance_patterns": [
        "成人與小孩可以一起上課嗎",
        "成人與小孩能不能一起上課嗎",
        "成人與小孩可以一起上課",
        "成人與小孩能不能一起上課",
        "成人與小孩可不可以一起上課",
        "成人與小孩能否一起上課",
        "成人與小孩可以一起上課嗎？",
        "成人與小孩能否一起上課？",
        "成人與小孩可不可以一起上課？",
        "成人與小孩可以一起上課？",
        "成人與小孩能不能一起上課？"
      ],
      "required_slots": [
        "date?",
        "resort?",
        "board_type?",
        "people_total?"
      ],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "成人與小孩可以同堂上課，但若小孩年紀較小，教練會優先確保他們的安全與基礎動作練習，因此成人的練習時間可能會相對減少。若您希望成人學習進度不受影響，建議 5 歲以下孩童分開安排課程。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "Adults and children can attend classes together, but if the children are younger, the coach will prioritize ensuring their safety and basic movement practice, which may relatively reduce the adults' practice time. If you wish for the adults' learning progress to remain unaffected, it is recommended that children under 5 years old be arranged in separate classes.",
          "th": "ผู้ใหญ่และเด็กสามารถเรียนในชั้นเรียนเดียวกันได้ แต่ถ้าเด็กอายุน้อยกว่า โค้ชจะให้ความสำคัญกับการดูแลความปลอดภัยและการฝึกท่าพื้นฐานของเด็กก่อน ดังนั้นเวลาฝึกของอาจจะลดลง หากคุณต้องการให้การเรียนรู้ของผู้ใหญ่ไม่ได้รับผลกระทบ ขอแนะนำให้จัดตารางเรียนแยกต่างหากสำหรับเด็กอายุต่ำกว่า 5 ปี"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the booking system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูที่ระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}",
        "{{LINK_INSTRUCTORS}}"
      ],
      "crm_tags": [
        "#同堂安排"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Can adults and children take classes together?",
        "th": "ผู้ใหญ่และเด็กสามารถเรียนด้วยกันได้ไหม?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:25:03.869804+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:25:03.869804+00:00"
        }
      }
    },
    {
      "id": "faq.general.009",
      "intent": "GENERAL",
      "section": "👶 小朋友滑雪與安全保障",
      "canonical_question": "幾歲可以開始學滑雪？",
      "utterance_patterns": [
        "幾歲可以開始學滑雪",
        "幾歲能不能開始學滑雪",
        "幾歲可不可以開始學滑雪",
        "幾歲能否開始學滑雪",
        "幾歲可以開始學滑雪？",
        "幾歲可不可以開始學滑雪？",
        "幾歲能不能開始學滑雪？",
        "幾歲能否開始學滑雪？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "建議從3歲以上開始，5歲以下的兒童建議安排一對一教學，提升安全與專注力。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "It is recommended to start from 3 years old and above. For children under 5 years old, one-on-one instruction is suggested to enhance safety and concentration.",
          "th": "แนะนำสำหรับเด็กอายุ 3 ปีขึ้นไป และสำหรับเด็กอายุต่ำกว่า 5 ปี แนะนำให้จัดสอนแบบตัวต่อตัวเพื่อเพิ่มความปลอดภัยและสมาธิ"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่ระบบการจองแสดง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "At what age can one start learning to ski?",
        "th": "อายุเท่าไหร่ถึงจะเริ่มเรียนสกีได้?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:25:42.963877+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:25:42.963877+00:00"
        }
      }
    },
    {
      "id": "faq.general.010",
      "intent": "GENERAL",
      "section": "👶 小朋友滑雪與安全保障",
      "canonical_question": "不同年齡可以同班嗎？",
      "utterance_patterns": [
        "不同年齡可以同班嗎",
        "不同年齡能不能同班嗎",
        "不同年齡可不可以同班",
        "不同年齡能不能同班",
        "不同年齡能否同班",
        "不同年齡可以同班",
        "不同年齡可以同班嗎？",
        "不同年齡可不可以同班？",
        "不同年齡能不能同班？",
        "不同年齡可以同班？",
        "不同年齡能否同班？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "不建議將3歲、5歲與7歲等年齡層混班，體力與進度差異大，建議分開上課。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "It is not recommended to mix age groups such as 3, 5, and 7 years old in the same class, as there are significant differences in physical strength and progress. It is advisable to have separate classes.",
          "th": "ไม่แนะนำให้จัดชั้นเรียนรวมเด็กอายุ 3, 5 และ 7 ขวบ เนื่องจากความแตกต่างด้านพละกำลังและความก้าวหน้ามีมาก จึงแนะนำให้แยกชั้นเรียน"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Can different ages be in the same class?",
        "th": "เด็กต่างวัยสามารถเรียนห้องเดียวกันได้ไหม？"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:26:29.758338+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:26:29.758338+00:00"
        }
      }
    },
    {
      "id": "faq.general.011",
      "intent": "GENERAL",
      "section": "👶 小朋友滑雪與安全保障",
      "canonical_question": "小朋友上課有哪些安全機制？",
      "utterance_patterns": [
        "小朋友上課有哪些安全機制",
        "小朋友上課有哪些安全機制？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_INSURANCE_BREAKDOWN",
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "每位教練最多帶6人，小孩比例不會過高；全程附滑雪專案保險；教練具備兒童教學經驗，纜車使用時安排大人陪同。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "Each coach can take a maximum of 6 people, ensuring the proportion of children is not too high; the entire process includes special ski project insurance; coaches have experience in teaching children, and adults will accompany them when using the cable car.",
          "th": "โค้ชแต่ละคนดูแลนักเรียนได้สูงสุด 6 คน เพื่อไม่ให้มีสัดส่วนเด็กมากเกินไป; มีประกันภัยโครงการเล่นสกีตลอดระยะเวลา; โค้ชมีประสบการณ์ในการสอนเด็ก และจะมีการจัดผู้ใหญ่ไปพร้อมด้วยเมื่อใช้กระเช้าไฟฟ้า"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢",
        "#親子同堂詢問"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "What safety mechanisms are in place for children during class?",
        "th": "มีกลไกความปลอดภัยอะไรบ้างสำหรับเด็กๆ ในชั้นเรียน?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:28:00.250860+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:28:00.250860+00:00"
        }
      }
    },
    {
      "id": "faq.general.012",
      "intent": "GENERAL",
      "section": "👶 小朋友滑雪與安全保障",
      "canonical_question": "兒童保險內容與限制有哪些？",
      "utterance_patterns": [
        "兒童保險內容與限制有哪些",
        "兒童保險內容與限制有哪些？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_INSURANCE_BREAKDOWN",
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "15歲以下無身故理賠，提供20萬實支實付醫療保障與1萬美元緊急救援補償。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "No death benefit for those under 15 years old, providing 200,000 in actual expense medical coverage and 10,000 USD in emergency assistance compensation.",
          "th": "ไม่มีการเรียกร้องค่าสินไหมมรณกรรมสำหรับผู้ที่มีอายุต่ำกว่า 15 ปี โดยให้ความคุ้มครองค่ารักษาพยาบาลตามจริง 200,000 บาท และค่าชดเชยการช่วยเหลือฉุกเฉิน 10,000 ดอลลาร์สหรัฐฯ"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดตรวจสอบจากระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢",
        "#親子同堂詢問"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "What are the coverage and limitations of children's insurance?",
        "th": "ประกันเด็กมีเนื้อหาและข้อจำกัดอะไรบ้าง？"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:29:03.790994+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:29:03.790994+00:00"
        }
      }
    },
    {
      "id": "faq.general.013",
      "intent": "GENERAL",
      "section": "👶 小朋友滑雪與安全保障",
      "canonical_question": "五歲以下小孩可以上課嗎？",
      "utterance_patterns": [
        "五歲以下小孩可以上課嗎",
        "五歲以下小孩能不能上課嗎",
        "五歲以下小孩可以上課",
        "五歲以下小孩能否上課",
        "五歲以下小孩能不能上課",
        "五歲以下小孩可不可以上課",
        "五歲以下小孩能否上課？",
        "五歲以下小孩可不可以上課？",
        "五歲以下小孩可以上課嗎？",
        "五歲以下小孩可以上課？",
        "五歲以下小孩能不能上課？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "可以，但需安排一對一教學；若與其他孩童同上，需有大人熟悉滑雪陪同。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "Yes, but one-on-one instruction is required; if attending with other children, an adult familiar with skiing must accompany them.",
          "th": "ทำได้ แต่ต้องจัดให้มีการสอนแบบตัวต่อตัว หากเรียนร่วมกับเด็กคนอื่น จะต้องมีผู้ใหญ่ที่คุ้นเคยกับการเล่นสกีมาด้วย"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดอ้างอิงตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Can children under five attend classes?",
        "th": "เด็กอายุต่ำกว่า 5 ขวบสามารถเข้าเรียนได้หรือไม่？"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:30:13.417800+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:30:13.417800+00:00"
        }
      }
    },
    {
      "id": "faq.general.014",
      "intent": "GENERAL",
      "section": "👶 小朋友滑雪與安全保障",
      "canonical_question": "有推薦給年紀更小的兒童的滑雪學校嗎？",
      "utterance_patterns": [
        "有推薦給年紀更小的兒童的滑雪學校嗎",
        "有推薦給年紀更小的兒童的滑雪學校",
        "有推薦給年紀更小的兒童的滑雪學校？",
        "有推薦給年紀更小的兒童的滑雪學校嗎？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "可以考慮「熊貓滑雪學校」（Pandaruman），專為5歲以下兒童設計課程：https://www.pandaruman.com/",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "Consider 'Pandaruman Ski School,' which offers courses specifically designed for children under 5 years old: https://www.pandaruman.com/",
          "th": "พิจารณา \"โรงเรียนสอนสกีแพนด้า\" (Pandaruman) ซึ่งมีหลักสูตรที่ออกแบบมาสำหรับเด็กอายุต่ำกว่า 5 ปีโดยเฉพาะ: https://www.pandaruman.com/"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่นั่งว่างล่าสุด โปรดดูตามที่ระบบการจองแสดงไว้"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢",
        "#親子同堂詢問"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Do you have any recommendations for ski schools for younger children?",
        "th": "มีโรงเรียนสอนสกีสำหรับเด็กเล็กกว่านี้แนะนำไหม?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:31:10.673321+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:31:10.673321+00:00"
        }
      }
    },
    {
      "id": "faq.general.015",
      "intent": "GENERAL",
      "section": "🏂 教練與教學安排",
      "canonical_question": "我想連續上好幾天課，可以預約不同的教練嗎？",
      "utterance_patterns": [
        "我想連續上好幾天課，可以預約不同的教練嗎",
        "我想連續上好幾天課，能不能預約不同的教練嗎",
        "我想連續上好幾天課，能不能預約不同的教練",
        "我想連續上好幾天課，可不可以預約不同的教練",
        "我想連續上好幾天課，可以預約不同的教練",
        "我想連續上好幾天課，能否預約不同的教練",
        "我想連續上好幾天課，可以預約不同的教練？",
        "我想連續上好幾天課，能否預約不同的教練？",
        "我想連續上好幾天課，可不可以預約不同的教練？",
        "我想連續上好幾天課，能不能預約不同的教練？",
        "我想連續上好幾天課，可以預約不同的教練嗎？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "可以，但我們更建議盡量跟隨同一位教練上課。因為教練最了解您的學習進度與狀況，能提供連貫性的指導，學習效果會是最好的。您可以在預約系統的篩選器中「指定特定教練」，來查看他所有可預約的時段。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "Yes, but we highly recommend trying to stick with the same coach for your lessons. This is because your coach best understands your learning progress and situation, allowing them to provide consistent guidance, which leads to the best learning outcomes. You can use the 'Specify a Coach' filter in the booking system to view all their available time slots.",
          "th": "ได้ค่ะ แต่เราขอแนะนำให้คุณเรียนกับโค้ชคนเดิมให้มากที่สุดเท่าที่จะทำได้ เนื่องจากโค้ชจะเข้าใจความก้าวหน้าและสถานการณ์การเรียนรู้ของคุณดีที่สุด และสามารถให้คำแนะนำที่ต่อเนื่องได้ ซึ่งจะทำให้ผลการเรียนรู้ดีที่สุด คุณสามารถใช้ตัวกรอง \"ระบุโค้ช\" ในระบบการจองเพื่อดูช่วงเวลาที่โค้ชคนนั้นว่างทั้งหมด"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่นั่งว่างล่าสุด โปรดดูจากระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "I want to take classes for several consecutive days, can I book different coaches?",
        "th": "ฉันอยากเรียนหลายวันติดกัน สามารถจองโค้ชหลายคนได้ไหม?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:32:44.383244+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:32:44.383244+00:00"
        }
      }
    },
    {
      "id": "faq.general.016",
      "intent": "GENERAL",
      "section": "🏂 教練與教學安排",
      "canonical_question": "我預約的教練會不會臨時更換？如果更換，新教練的資格如何保證？",
      "utterance_patterns": [
        "我預約的教練會不會臨時更換如果更換，新教練的資格如何保證",
        "我預約的教練會不會臨時更換？如果更換，新教練的資格如何保證？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "我們平台的所有教練都必須持有有效的國際滑雪指導員執照。在極少數情況下，若您預約的教練因緊急狀況無法授課，我們會在第一時間通知您，並安排「同等級或更高等級」的合格教練替代。任何教練的更換，我們都會事先與您溝通並取得您的同意。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "All coaches on our platform must hold a valid international ski instructor license. In rare cases, if your booked coach is unable to teach due to an emergency, we will notify you immediately and arrange a qualified replacement coach of 'the same or higher level'. We will communicate with you and obtain your consent for any coach replacement in advance.",
          "th": "โค้ชทุกคนบนแพลตฟอร์มของเราจะต้องมีใบอนุญาตผู้สอนสกีระหว่างประเทศที่ถูกต้อง ในกรณีที่หายากมาก หากโค้ชที่คุณจองไว้ไม่สามารถสอนได้เนื่องจากสถานการณ์ฉุกเฉิน เราจะแจ้งให้คุณทราบทันทีและจัดหาโค้ชที่มีคุณสมบัติเหมาะสมในระดับเดียวกันหรือสูงกว่ามาแทนที่ เราจะสื่อสารและขอความยินยอมจากคุณล่วงหน้าสำหรับการเปลี่ยนแปลงโค้ชใดๆ"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Will my reserved coach be temporarily replaced? If replaced, how is the qualification of the new coach guaranteed?",
        "th": "โค้ชที่ฉันจองไว้จะถูกเปลี่ยนกะทันหันหรือไม่? หากมีการเปลี่ยนแปลง จะรับประกันคุณสมบัติของโค้ชคนใหม่อย่างไร?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:33:54.178278+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:33:54.178278+00:00"
        }
      }
    },
    {
      "id": "faq.general.017",
      "intent": "GENERAL",
      "section": "🏂 教練與教學安排",
      "canonical_question": "為什麼有些教練有「最少預約N堂課」的限制？我可以只預約一堂嗎？",
      "utterance_patterns": [
        "為什麼有些教練有「最少預約N堂課」的限制我可以只預約一堂嗎",
        "為什麼有些教練有「最少預約N堂課」的限制我能不能只預約一堂嗎",
        "為什麼有些教練有「最少預約N堂課」的限制我可不可以只預約一堂",
        "為什麼有些教練有「最少預約N堂課」的限制我能不能只預約一堂",
        "為什麼有些教練有「最少預約N堂課」的限制我可以只預約一堂",
        "為什麼有些教練有「最少預約N堂課」的限制我能否只預約一堂",
        "為什麼有些教練有「最少預約N堂課」的限制？我可不可以只預約一堂？",
        "為什麼有些教練有「最少預約N堂課」的限制？我可以只預約一堂？",
        "為什麼有些教練有「最少預約N堂課」的限制？我能否只預約一堂？",
        "為什麼有些教練有「最少預約N堂課」的限制？我可以只預約一堂嗎？",
        "為什麼有些教練有「最少預約N堂課」的限制？我能不能只預約一堂？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "部分教練，特別是需要從較遠地區移動至該雪場的教練，可能會設定最少課程預約時數，以符合交通與時間成本。這是教練個人的設定，我們平台會尊重教練的開課條件。因此，若您希望預約該教練，建議您能滿足其最低預約要求，或選擇其他沒有此限制的教練。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "Some coaches, especially those who need to travel from a more distant area to the ski resort, may set a minimum number of lesson hours for appointments to cover their travel and time costs. This is a personal setting of the coach, and our platform respects the coach's teaching conditions. Therefore, if you wish to book this coach, it is recommended that you meet their minimum booking requirements, or choose another coach without this restriction.",
          "th": "โค้ชบางท่าน โดยเฉพาะอย่างยิ่งผู้ที่ต้องเดินทางจากพื้นที่ห่างไกลมายังลานสกี อาจกำหนดจำนวนชั่วโมงการจองคอร์สขั้นต่ำ เพื่อให้คุ้มค่ากับค่าเดินทางและเวลา นี่คือการตั้งค่าส่วนตัวของโค้ช และแพลตฟอร์มของเราเคารพเงื่อนไขการเปิดสอนของโค้ช ดังนั้น หากคุณต้องการจองโค้ชท่านนี้ ขอแนะนำให้คุณปฏิบัติตามข้อกำหนดการจองขั้นต่ำของเขา หรือเลือกโค้ชท่านอื่นที่ไม่มีข้อจำกัดนี้"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดอ้างอิงจากระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Why do some coaches have a 'minimum N lessons' booking restriction? Can I book just one lesson?",
        "th": "ทำไมโค้ชบางคนถึงมีข้อจำกัด 'ต้องจองอย่างน้อย N คลาส'? ฉันสามารถจองแค่คลาสเดียวได้ไหม?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:35:29.891943+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:35:29.891943+00:00"
        }
      }
    },
    {
      "id": "faq.general.018",
      "intent": "GENERAL",
      "section": "🏂 教練與教學安排",
      "canonical_question": "每位教練最多可同時教幾人？",
      "utterance_patterns": [
        "每位教練最多可同時教幾人",
        "每位教練最多可同時教幾人？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "我們每位教練最多可教 6 位學員。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "Each of our coaches can teach a maximum of 6 students.",
          "th": "เรามีโค้ชที่สามารถสอนนักเรียนได้สูงสุด 6 คน"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "How many people can each coach teach at most at the same time?",
        "th": "โค้ชแต่ละคนสามารถสอนได้กี่คนพร้อมกัน?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:36:54.255700+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:36:54.255700+00:00"
        }
      }
    },
    {
      "id": "faq.general.019",
      "intent": "GENERAL",
      "section": "🏂 教練與教學安排",
      "canonical_question": "課程會學到哪些內容？",
      "utterance_patterns": [
        "課程會學到哪些內容",
        "課程會學到哪些內容？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "從穿脫裝備、基礎姿勢、平地行走、跌倒與站起，到轉彎與煞車技巧，會依學員程度量身調整。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "The instruction, ranging from putting on and taking off equipment, basic stance, walking on flat ground, falling and getting up, to turning and braking techniques, will be tailored to each student's level.",
          "th": "ตั้งแต่การใส่และถอดอุปกรณ์ ท่าทางพื้นฐาน การเดินบนพื้นราบ การล้มและการลุกขึ้น ไปจนถึงเทคนิคการเลี้ยวและการเบรก จะมีการปรับเปลี่ยนให้เหมาะสมกับระดับของนักเรียนแต่ละคน"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดอ้างอิงจากระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "What will be learned in the course?",
        "th": "คุณจะได้เรียนรู้อะไรในหลักสูตรนี้บ้าง?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:38:11.271569+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:38:11.271569+00:00"
        }
      }
    },
    {
      "id": "faq.general.020",
      "intent": "GENERAL",
      "section": "🏂 教練與教學安排",
      "canonical_question": "我已經會滑雪，還需要上初學課嗎？",
      "utterance_patterns": [
        "我已經會滑雪，還需要上初學課嗎",
        "我已經會滑雪，還需要上初學課",
        "我已經會滑雪，還需要上初學課嗎？",
        "我已經會滑雪，還需要上初學課？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "若久未滑雪或技巧不確定，建議可先上初學課讓教練評估與調整。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "If you haven't skied in a while or are unsure of your skills, it's recommended to take a beginner's lesson first so an instructor can assess and adjust.",
          "th": "หากไม่ได้เล่นสกีมานานหรือทักษะไม่แน่ใจ แนะนำให้เรียนคอร์สสำหรับผู้เริ่มต้นก่อน เพื่อให้โค้ชประเมินและปรับปรุง"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "I already know how to ski, do I still need to take a beginner's class?",
        "th": "ฉันเล่นสกีเป็นแล้ว ยังจำเป็นต้องเรียนคอร์สสำหรับผู้เริ่มต้นอีกไหม?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:39:02.110750+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:39:02.110750+00:00"
        }
      }
    },
    {
      "id": "faq.general.021",
      "intent": "GENERAL",
      "section": "📍 集合地點與交通",
      "canonical_question": "課程在哪裡集合？會不會很遠？",
      "utterance_patterns": [
        "課程在哪裡集合會不會很遠",
        "課程在哪裡集合？會不會很遠？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "集合地點會依各滑雪場有所不同，請於預約後參考網站說明或與教練確認。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "The meeting point varies depending on the ski resort. Please refer to the website instructions after booking or confirm with your instructor.",
          "th": "จุดนัดพบจะแตกต่างกันไปในแต่ละสกีรีสอร์ต โปรดดูคำอธิบายบนเว็บไซต์หรือยืนยันกับผู้สอนหลังจากการจอง"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Where does the class meet? Is it far?",
        "th": "ชั้นเรียนรวมตัวกันที่ไหน? มันจะไกลไหม?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:43:43.639033+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:43:43.639033+00:00"
        }
      }
    },
    {
      "id": "faq.general.022",
      "intent": "GENERAL",
      "section": "🧑‍🏫 教練資訊與教學語言",
      "canonical_question": "教練有國際滑雪證照嗎？是哪一國發的？",
      "utterance_patterns": [
        "教練有國際滑雪證照嗎是哪一國發的",
        "教練有國際滑雪證照是哪一國發的",
        "教練有國際滑雪證照嗎？是哪一國發的？",
        "教練有國際滑雪證照？是哪一國發的？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "是的，我們的教練皆持有國際滑雪證照，如：\n\n* 紐西蘭滑雪指導員協會 (NZSIA)  \n* 加拿大滑雪指導員聯盟 (CASI)  \n* 美國滑雪指導員協會 (PSIA)\n\n我們要求教練需具備有效證照並參與定期升級，例如 Level 2 或 Level 3 考試",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "Yes, all our coaches hold international snow sports certifications, such as:\n\n*   New Zealand Snowsports Instructors Alliance (NZSIA)\n*   Canadian Association of Snowboard Instructors (CASI)\n*   Professional Ski Instructors of America (PSIA)\n\nWe require our coaches to possess valid certifications and participate in regular upgrades, such as Level 2 or Level 3 examinations.",
          "th": "ใช่ โค้ชของเราทุกคนมีใบรับรองการเล่นสกีระดับนานาชาติ เช่น:\n\n* สมาคมผู้สอนสกีแห่งนิวซีแลนด์ (NZSIA)\n* สมาพันธ์ผู้สอนสกีแห่งแคนาดา (CASI)\n* สมาคมผู้สอนสกีแห่งสหรัฐอเมริกา (PSIA)\n\nเรากำหนดให้โค้ชต้องมีใบรับรองที่ถูกต้องและเข้าร่วมการอัปเกรดเป็นประจำ เช่น การสอบ Level 2 หรือ Level 3."
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Does the coach have an international ski instructor certification? Which country issued it?",
        "th": "โค้ชมีใบรับรองสกีระหว่างประเทศหรือไม่? ออกโดยประเทศใด?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:44:56.585812+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:44:56.585812+00:00"
        }
      }
    },
    {
      "id": "faq.general.023",
      "intent": "GENERAL",
      "section": "🧑‍🏫 教練資訊與教學語言",
      "canonical_question": "教練有教學兒童或年長者的經驗嗎？",
      "utterance_patterns": [
        "教練有教學兒童或年長者的經驗嗎",
        "教練有教學兒童或年長者的經驗",
        "教練有教學兒童或年長者的經驗嗎？",
        "教練有教學兒童或年長者的經驗？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "有，我們教練有豐富的兒童教學經驗，也熟悉年長者學習步調。對於學習進度差異大的學生，建議分開上課以利教學品質。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "Yes, our coaches have rich experience in teaching children and are also familiar with the learning pace of the elderly. For students with significant differences in learning progress, it is recommended to have separate classes to ensure teaching quality.",
          "th": "มีครับ โค้ชของเรามีประสบการณ์มากมายในการสอนเด็ก และคุ้นเคยกับจังหวะการเรียนรู้ของผู้สูงอายุ สำหรับนักเรียนที่มีความก้าวหน้าในการเรียนรู้แตกต่างกันมาก แนะนำให้แยกชั้นเรียนเพื่อคุณภาพการสอนที่ดีขึ้น"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดอ้างอิงจากระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢",
        "#親子同堂詢問"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Does the coach have experience teaching children or the elderly?",
        "th": "โค้ชมีประสบการณ์สอนเด็กหรือผู้สูงอายุหรือไม่?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:48:42.442782+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:48:42.442782+00:00"
        }
      }
    },
    {
      "id": "faq.general.024",
      "intent": "GENERAL",
      "section": "🧑‍🏫 教練資訊與教學語言",
      "canonical_question": "教練會講哪些語言？",
      "utterance_patterns": [
        "教練會講哪些語言",
        "教練會講哪些語言？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "* 中文：所有教練皆為台灣人，中文流利  \n* 英文：皆具備基本英文教學能力，部分可全英文或廣東話授課  \n* 泰文：目前無提供",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "* Chinese: All coaches are Taiwanese and fluent in Chinese.\n* English: All possess basic English teaching ability, some can teach entirely in English or Cantonese.\n* Thai: Currently not available.",
          "th": "* ภาษาจีน: โค้ชทุกคนเป็นคนไต้หวันและพูดภาษาจีนได้อย่างคล่องแคล่ว\n* ภาษาอังกฤษ: ทุกคนมีความสามารถในการสอนภาษาอังกฤษขั้นพื้นฐาน และบางคนสามารถสอนเป็นภาษาอังกฤษหรือกวางตุ้งได้ทั้งหมด\n* ภาษาไทย: ขณะนี้ยังไม่มีให้บริการ"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูที่ระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "What languages does the coach speak?",
        "th": "โค้ชพูดภาษาอะไรได้บ้าง?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:50:32.253084+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:50:32.253084+00:00"
        }
      }
    },
    {
      "id": "faq.general.025",
      "intent": "GENERAL",
      "section": "🧑‍🏫 教練資訊與教學語言",
      "canonical_question": "教練是否適合我這個程度？",
      "utterance_patterns": [
        "教練是否適合我這個程度",
        "教練是否適合我這個程度？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "教練皆具備處理各種程度學員的能力，會根據您的程度調整內容與場地。教學理念與履歷可參考教練介紹頁面。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "Coaches are capable of handling students of all levels and will adjust the content and venue according to your proficiency. For teaching philosophy and resumes, please refer to the coach introduction page.",
          "th": "โค้ชทุกคนมีความสามารถในการดูแลนักเรียนทุกระดับ และจะปรับเนื้อหาและสถานที่ตามระดับของคุณ สำหรับปรัชญาการสอนและประวัติส่วนตัว โปรดดูหน้าแนะนำโค้ช"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่ระบบการจองแสดงไว้"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Is the coach suitable for my level?",
        "th": "โค้ชเหมาะสมกับระดับของฉันหรือไม่?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:51:40.873691+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:51:40.873691+00:00"
        }
      }
    },
    {
      "id": "faq.general.026",
      "intent": "GENERAL",
      "section": "🧑‍🏫 教練資訊與教學語言",
      "canonical_question": "可以指定教練嗎？",
      "utterance_patterns": [
        "可以指定教練嗎",
        "能不能指定教練嗎",
        "可不可以指定教練",
        "能否指定教練",
        "能不能指定教練",
        "可以指定教練",
        "可以指定教練嗎？",
        "能否指定教練？",
        "能不能指定教練？",
        "可不可以指定教練？",
        "可以指定教練？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "可以。預約時可選擇指定教練，建議提早預約熱門時段。若無特定偏好，可選擇系統安排合適教練。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "Yes. You can choose a specific coach when making a reservation, and it is recommended to book popular time slots in advance. If you have no particular preference, the system can arrange a suitable coach for you.",
          "th": "ได้ค่ะ สามารถเลือกโค้ชที่ต้องการได้เมื่อทำการจอง แนะนำให้จองล่วงหน้าสำหรับช่วงเวลาที่ได้รับความนิยม หากไม่มีความต้องการพิเศษ สามารถเลือกให้ระบบจัดหาโค้ชที่เหมาะสมให้ได้เลยค่ะ"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่นั่งว่างล่าสุด โปรดดูที่ระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢",
        "#指定教練"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Can I request a specific coach?",
        "th": "สามารถเลือกโค้ชได้ไหมครับ/คะ？"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:53:10.306309+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:53:10.306309+00:00"
        }
      }
    },
    {
      "id": "faq.general.027",
      "intent": "GENERAL",
      "section": "🧑‍🏫 教練資訊與教學語言",
      "canonical_question": "可以事先聯繫教練嗎？",
      "utterance_patterns": [
        "可以事先聯繫教練嗎",
        "能不能事先聯繫教練嗎",
        "能不能事先聯繫教練",
        "能否事先聯繫教練",
        "可不可以事先聯繫教練",
        "可以事先聯繫教練",
        "可以事先聯繫教練？",
        "能否事先聯繫教練？",
        "可以事先聯繫教練嗎？",
        "可不可以事先聯繫教練？",
        "能不能事先聯繫教練？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "教練通常會於課程前七天主動聯繫您。如您希望更早聯絡，也可在預約時備註需求，我們將協助安排。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "Your coach will usually contact you proactively seven days before the course. If you wish to be contacted earlier, you can also note your request when booking, and we will assist with the arrangements.",
          "th": "โค้ชมักจะติดต่อคุณล่วงหน้าเจ็ดวันก่อนเริ่มคอร์ส หากคุณต้องการติดต่อก่อนหน้านั้น คุณสามารถระบุความต้องการของคุณเมื่อทำการจอง และเราจะช่วยจัดการให้"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Can I contact the coach in advance?",
        "th": "สามารถติดต่อโค้ชล่วงหน้าได้ไหม?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:55:07.679049+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:55:07.679049+00:00"
        }
      }
    },
    {
      "id": "faq.general.028",
      "intent": "GENERAL",
      "section": "🧑‍🏫 教練資訊與教學語言",
      "canonical_question": "開課申請後如何與教練聯繫？",
      "utterance_patterns": [
        "開課申請後如何與教練聯繫",
        "開課申請後如何與教練聯繫？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "預約成功後系統會寄出通知信，教練會依照訂單上的主要聯絡資訊與您聯繫，並於上課前確認集合地點與時間，請確保您的 Email 正確且能聯絡到您。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "After a successful booking, the system will send a notification email. The coach will contact you using the primary contact information on the order and confirm the meeting location and time before the class. Please ensure your email is correct and that you can be reached.",
          "th": "หลังจากยืนยันการจอง ระบบจะส่งอีเมลแจ้งเตือน และโค้ชจะติดต่อคุณตามข้อมูลติดต่อหลักในคำสั่งซื้อ เพื่อยืนยันสถานที่และเวลาการนัดพบก่อนเริ่มเรียน โปรดตรวจสอบให้แน่ใจว่าอีเมลของคุณถูกต้องและสามารถติดต่อได้"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "How to contact the coach after applying for the course?",
        "th": "จะติดต่อโค้ชได้อย่างไรหลังจากการสมัครเรียน?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:56:35.701132+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T10:56:35.701132+00:00"
        }
      }
    },
    {
      "id": "faq.general.029",
      "intent": "GENERAL",
      "section": "🧑‍🏫 教練資訊與教學語言",
      "canonical_question": "有教練的教學風格或評價可以參考嗎？",
      "utterance_patterns": [
        "有教練的教學風格或評價可以參考嗎",
        "有教練的教學風格或評價能不能參考嗎",
        "有教練的教學風格或評價能否參考",
        "有教練的教學風格或評價能不能參考",
        "有教練的教學風格或評價可不可以參考",
        "有教練的教學風格或評價可以參考",
        "有教練的教學風格或評價可不可以參考？",
        "有教練的教學風格或評價能否參考？",
        "有教練的教學風格或評價能不能參考？",
        "有教練的教學風格或評價可以參考嗎？",
        "有教練的教學風格或評價可以參考？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "可參考：\n\n教練個人介紹頁面：含證照、理念、風格、照片與影片\n\nFacebook社團：可加入「Skidiy日本自助滑雪討論區」，查看學員分享的心得與教練評價\n\n教學紀錄：部分教練會附上教學影片連結",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "You may refer to:\n\nCoach's personal introduction page: includes certifications, philosophy, style, photos, and videos\n\nFacebook group: You can join \"Skidiy Japan Self-Guided Skiing Discussion Group\" to view students' shared experiences and coach reviews\n\nTeaching records: Some coaches will include links to teaching videos",
          "th": "สามารถอ้างอิงได้จาก:\n\nหน้าแนะนำโค้ชส่วนตัว: รวมถึงใบรับรอง ปรัชญา สไตล์ รูปภาพ และวิดีโอ\n\nกลุ่ม Facebook: สามารถเข้าร่วม \"Skidiy Japan Self-Service Skiing Discussion Group\" เพื่อดูประสบการณ์ที่นักเรียนแบ่งปันและรีวิวโค้ช\n\nบันทึกการสอน: โค้ชบางคนจะแนบลิงก์วิดีโอการสอน"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่ระบบการจองแสดง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Is there a teaching style or evaluation of the coach available for reference?",
        "th": "มีรูปแบบการสอนหรือรีวิวของโค้ชให้ดูเป็นข้อมูลอ้างอิงไหม?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T11:00:22.180875+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T11:00:22.180875+00:00"
        }
      }
    },
    {
      "id": "faq.general.030",
      "intent": "GENERAL",
      "section": "📅 一般課程預約與安排",
      "canonical_question": "預約成功後，我可以更改上課的項目嗎（例如雙板 Ski 改成單板 Snowboard）？",
      "utterance_patterns": [
        "預約成功後，我可以更改上課的項目嗎（例如雙板 Ski 改成單板 Snowboard）",
        "預約成功後，我能不能更改上課的項目嗎（例如雙板 Ski 改成單板 Snowboard）",
        "預約成功後，我可不可以更改上課的項目（例如雙板 Ski 改成單板 Snowboard）",
        "預約成功後，我能否更改上課的項目（例如雙板 Ski 改成單板 Snowboard）",
        "預約成功後，我可以更改上課的項目（例如雙板 Ski 改成單板 Snowboard）",
        "預約成功後，我能不能更改上課的項目（例如雙板 Ski 改成單板 Snowboard）",
        "預約成功後，我能否更改上課的項目（例如雙板 Ski 改成單板 Snowboard）？",
        "預約成功後，我能不能更改上課的項目（例如雙板 Ski 改成單板 Snowboard）？",
        "預約成功後，我可以更改上課的項目（例如雙板 Ski 改成單板 Snowboard）？",
        "預約成功後，我可不可以更改上課的項目（例如雙板 Ski 改成單板 Snowboard）？",
        "預約成功後，我可以更改上課的項目嗎（例如雙板 Ski 改成單板 Snowboard）？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "可以的。若您想更換課程項目，請盡早透過 Email 或官方聯繫方式通知我們客服人員，並提供您的訂單編號。我們將為您查詢原教練是否同時具備您想更換的項目之教學資格。若原教練無法配合，我們將會為您協調其他教練，或提供其他可行的方案。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "Yes, you can. If you wish to change your course item, please notify our customer service staff as soon as possible via email or official contact methods, and provide your order number. We will check if your original coach is also qualified to teach the item you wish to change. If the original coach cannot accommodate, we will coordinate another coach for you or provide other feasible solutions.",
          "th": "ได้ค่ะ หากคุณต้องการเปลี่ยนรายการเรียน โปรดแจ้งเจ้าหน้าที่บริการลูกค้าของเราโดยเร็วที่สุดทางอีเมลหรือช่องทางการติดต่ออย่างเป็นทางการ พร้อมระบุหมายเลขคำสั่งซื้อของคุณ เราจะตรวจสอบว่าโค้ชคนเดิมมีคุณสมบัติในการสอนรายการที่คุณต้องการเปลี่ยนหรือไม่ หากโค้ชคนเดิมไม่สามารถดำเนินการได้ เราจะประสานงานกับโค้ชคนอื่นให้คุณ หรือเสนอทางเลือกอื่นที่เป็นไปได้"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "After successful booking, can I change the lesson item (e.g., switch from double-board skiing to single-board snowboarding)?",
        "th": "หลังจากจองสำเร็จแล้ว ฉันสามารถเปลี่ยนรายการเรียนได้หรือไม่ (เช่น เปลี่ยนจากสกีสองแผ่นเป็นสโนว์บอร์ด)?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T11:03:49.084548+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T11:03:49.084548+00:00"
        }
      }
    },
    {
      "id": "faq.general.031",
      "intent": "GENERAL",
      "section": "📅 一般課程預約與安排",
      "canonical_question": "預約成功後，我可以更改上課的日期或時間嗎？",
      "utterance_patterns": [
        "預約成功後，我可以更改上課的日期或時間嗎",
        "預約成功後，我能不能更改上課的日期或時間嗎",
        "預約成功後，我能不能更改上課的日期或時間",
        "預約成功後，我能否更改上課的日期或時間",
        "預約成功後，我可不可以更改上課的日期或時間",
        "預約成功後，我可以更改上課的日期或時間",
        "預約成功後，我可不可以更改上課的日期或時間？",
        "預約成功後，我可以更改上課的日期或時間嗎？",
        "預約成功後，我能不能更改上課的日期或時間？",
        "預約成功後，我能否更改上課的日期或時間？",
        "預約成功後，我可以更改上課的日期或時間？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "若要更改已確認的課程日期或時間，請您盡快與我們的客服聯繫。我們將會為您詢問原教練在新的時段是否仍有空檔。如果教練可以配合，我們將為您修改訂單。如果教練無法配合，我們會嘗試為您協調其他教練，或者您也可以選擇依照我們的取消政策來處理原訂單。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "To change the date or time of a confirmed lesson, please contact our customer service as soon as possible. We will inquire with your original instructor to see if they are available at the new time. If the instructor can accommodate, we will modify your order. If the instructor cannot accommodate, we will try to arrange another instructor for you, or you may choose to process your original order according to our cancellation policy.",
          "th": "หากต้องการเปลี่ยนแปลงวันหรือเวลาเรียนที่ยืนยันแล้ว โปรดติดต่อฝ่ายบริการลูกค้าของเราโดยเร็วที่สุด เราจะสอบถามผู้สอนเดิมว่ายังว่างในช่วงเวลาใหม่หรือไม่ หากผู้สอนสามารถดำเนินการได้ เราจะแก้ไขคำสั่งซื้อของคุณ หากผู้สอนไม่สามารถดำเนินการได้ เราจะพยายามประสานงานกับผู้สอนท่านอื่นให้คุณ หรือคุณสามารถเลือกดำเนินการตามนโยบายการยกเลิกของเราสำหรับคำสั่งซื้อเดิมได้"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "After successfully booking, can I change the date or time of the class?",
        "th": "หลังจากจองสำเร็จแล้ว ฉันสามารถเปลี่ยนวันหรือเวลาเรียนได้หรือไม่?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T11:04:51.323070+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T11:04:51.323070+00:00"
        }
      }
    },
    {
      "id": "faq.general.032",
      "intent": "GENERAL",
      "section": "📅 一般課程預約與安排",
      "canonical_question": "我想更改預約的課程堂數或人數，該如何操作？",
      "utterance_patterns": [
        "我想更改預約的課程堂數或人數，該如何操作",
        "我想更改預約的課程堂數或人數，該如何操作？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "依情況而定。若您想增加或減少人數，請直接在後台訂單選擇，系統將自動重新計算費用。若您想「增加」堂數但要合併在同一個訂單，最快的方式是請您「自行取消原訂單，然後重新預約一個正確內容的新訂單」。因為這涉及到費用重新計算與金流，取消重訂能確保您的費用正確無誤。只要符合我們的退訂政策，取消是不會收取額外費用的。若要「減少」堂數請直接連繫客服處理。\n\n參考連結：https://booking.diy.ski/order/list",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "It depends on the situation. If you wish to increase or decrease the number of participants, please select it directly in the backend order system, and the system will automatically recalculate the fees. If you wish to \"increase\" the number of sessions but want to combine them into the same order, the fastest way is to \"cancel your original order yourself and then rebook a new order with the correct content.\" This is because it involves recalculating fees and payment flows, and canceling and rebooking ensures your fees are accurate. As long as it complies with our cancellation policy, there will be no additional charges for cancellation. If you wish to \"decrease\" the number of sessions, please contact customer service directly.\n\nReference link: https://booking.diy.ski/order/list",
          "th": "ขึ้นอยู่กับสถานการณ์ หากคุณต้องการเพิ่มหรือลดจำนวนคน โปรดเลือกโดยตรงในคำสั่งซื้อแบ็คเอนด์ และระบบจะคำนวณค่าธรรมเนียมใหม่โดยอัตโนมัติ หากคุณต้องการ \"เพิ่ม\" จำนวนบทเรียนแต่ต้องการรวมไว้ในคำสั่งซื้อเดียวกัน วิธีที่เร็วที่สุดคือ \"ยกเลิกคำสั่งซื้อเดิมด้วยตนเอง จากนั้นจองคำสั่งซื้อใหม่ที่มีเนื้อหาถูกต้อง\" เนื่องจากเกี่ยวข้องกับการคำนวณค่าธรรมเนียมใหม่และการไหลของเงิน การยกเลิกและจองใหม่จะช่วยให้มั่นใจได้ว่าค่าธรรมเนียมของคุณถูกต้อง ตราบใดที่เป็นไปตามนโยบายการยกเลิกของเรา จะไม่มีการเรียกเก็บค่าธรรมเนียมเพิ่มเติมสำหรับการยกเลิก หากต้องการ \"ลด\" จำนวนบทเรียน โปรดติดต่อฝ่ายบริการลูกค้าโดยตรง\n\nลิงก์อ้างอิง: https://booking.diy.ski/order/list"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด กรุณาตรวจสอบจากระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢",
        "#改人數"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "How can I change the number of lessons or participants for my booking?",
        "th": "ฉันต้องการเปลี่ยนจำนวนบทเรียนหรือจำนวนผู้เข้าร่วมที่จองไว้ ฉันควรทำอย่างไร?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:11:15.229885+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:11:15.229885+00:00"
        }
      }
    },
    {
      "id": "faq.general.033",
      "intent": "GENERAL",
      "section": "📅 一般課程預約與安排",
      "canonical_question": "預定課程後可以臨時加減人數嗎？",
      "utterance_patterns": [
        "預定課程後可以臨時加減人數嗎",
        "預定課程後能不能臨時加減人數嗎",
        "預定課程後能否臨時加減人數",
        "預定課程後可以臨時加減人數",
        "預定課程後能不能臨時加減人數",
        "預定課程後可不可以臨時加減人數",
        "預定課程後能否臨時加減人數？",
        "預定課程後可以臨時加減人數？",
        "預定課程後能不能臨時加減人數？",
        "預定課程後可不可以臨時加減人數？",
        "預定課程後可以臨時加減人數嗎？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_INSURANCE_BREAKDOWN",
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "可以。預約成功後訂單可以修改。建議先預約原始人數，方便保險填寫名單（四天滑雪保險）。在開課前增加學員，請務必在課程開始前補齊新學員的保險資料，以確保課程當日保險生效。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "Yes. Orders can be modified after a successful reservation. It is recommended to reserve for the original number of people first, which is convenient for filling out the insurance roster (four-day ski insurance). If you need to add students before the class starts, please be sure to complete the new students' insurance information before the start of the course to ensure that the insurance takes effect on the day of the course.",
          "th": "สามารถแก้ไขคำสั่งซื้อได้หลังจากยืนยันการจองแล้ว ขอแนะนำให้จองตามจำนวนคนเดิมก่อน เพื่อความสะดวกในการกรอกรายชื่อผู้เอาประกันภัย (ประกันภัยสกีสี่วัน) หากมีการเพิ่มนักเรียนก่อนเริ่มเรียน โปรดตรวจสอบให้แน่ใจว่าได้กรอกข้อมูลประกันภัยของนักเรียนใหม่ให้ครบถ้วนก่อนเริ่มเรียน เพื่อให้แน่ใจว่าประกันภัยมีผลบังคับใช้ในวันเรียน."
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢",
        "#改人數"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Can I temporarily add or reduce the number of participants after booking a course?",
        "th": "สามารถเพิ่มหรือลดจำนวนคนได้ชั่วคราวหลังจากจองคอร์สเรียนแล้วหรือไม่?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:12:14.063708+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:12:14.063708+00:00"
        }
      }
    },
    {
      "id": "faq.general.034",
      "intent": "GENERAL",
      "section": "📅 一般課程預約與安排",
      "canonical_question": "最晚什麼時候可以修改人數？",
      "utterance_patterns": [
        "最晚什麼時候可以修改人數",
        "最晚什麼時候能不能修改人數",
        "最晚什麼時候能否修改人數",
        "最晚什麼時候可不可以修改人數",
        "最晚什麼時候可不可以修改人數？",
        "最晚什麼時候可以修改人數？",
        "最晚什麼時候能不能修改人數？",
        "最晚什麼時候能否修改人數？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "是的。前一天可修改人數；若為當天更改，須透過後台手動處理，請提前告知教練。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "Yes. The number of participants can be modified the day before. For same-day changes, manual processing through the backend is required, so please inform the coach in advance.",
          "th": "ใช่ สามารถแก้ไขจำนวนคนได้หนึ่งวันล่วงหน้า หากเป็นการเปลี่ยนแปลงในวันเดียวกัน จะต้องดำเนินการด้วยตนเองผ่านระบบหลังบ้าน โปรดแจ้งโค้ชล่วงหน้า"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢",
        "#改人數"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "What's the latest I can change the number of people?",
        "th": "สามารถแก้ไขจำนวนคนได้ช้าที่สุดเมื่อไหร่?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:12:58.526642+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:12:58.526642+00:00"
        }
      }
    },
    {
      "id": "faq.general.035",
      "intent": "GENERAL",
      "section": "📅 一般課程預約與安排",
      "canonical_question": "預約成功後就代表成立嗎？",
      "utterance_patterns": [
        "預約成功後就代表成立嗎",
        "預約成功後就代表成立",
        "預約成功後就代表成立嗎？",
        "預約成功後就代表成立？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "系統會寄發預約成功通知信。教練通常會在 3 天內確認，若由系統協調其他教練，可能需等候約兩週。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "The system will send a successful appointment notification email. Coaches usually confirm within 3 days; if the system coordinates with other coaches, you may need to wait about two weeks.",
          "th": "ระบบจะส่งอีเมลแจ้งเตือนการจองสำเร็จ โค้ชมักจะยืนยันภายใน 3 วัน หากระบบประสานงานกับโค้ชคนอื่น อาจต้องรอประมาณสองสัปดาห์"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Does a successful reservation mean it's confirmed?",
        "th": "การจองที่สำเร็จแล้วถือว่าเป็นการยืนยันใช่หรือไม่?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:14:50.530122+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:14:50.530122+00:00"
        }
      }
    },
    {
      "id": "faq.general.036",
      "intent": "GENERAL",
      "section": "📅 一般課程預約與安排",
      "canonical_question": "到現場可以再加人嗎？",
      "utterance_patterns": [
        "到現場可以再加人嗎",
        "到現場能不能再加人嗎",
        "到現場能不能再加人",
        "到現場能否再加人",
        "到現場可以再加人",
        "到現場可不可以再加人",
        "到現場可以再加人？",
        "到現場能否再加人？",
        "到現場可以再加人嗎？",
        "到現場能不能再加人？",
        "到現場可不可以再加人？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_INSURANCE_BREAKDOWN",
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "可以。建議一開始就以預計人數預約，有利保險安排與費用試算。網站可試算不同人數的折扣優惠。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "Yes. It is recommended to book with the estimated number of people from the beginning, which is beneficial for insurance arrangements and cost calculations. The website can calculate discount offers for different numbers of people.",
          "th": "ได้เลย แนะนำให้จองตามจำนวนคนที่คาดว่าจะมาตั้งแต่แรก เพื่อประโยชน์ในการจัดเตรียมประกันภัยและการคำนวณค่าใช้จ่าย เว็บไซต์สามารถคำนวณส่วนลดสำหรับจำนวนคนที่แตกต่างกันได้"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Can we add more people on site?",
        "th": "สามารถเพิ่มคนได้ที่หน้างานเลยไหม?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:17:09.498086+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:17:09.498086+00:00"
        }
      }
    },
    {
      "id": "faq.general.037",
      "intent": "GENERAL",
      "section": "📅 一般課程預約與安排",
      "canonical_question": "課程中可以帶手機嗎？可請教練幫拍照嗎？",
      "utterance_patterns": [
        "課程中可以帶手機嗎可請教練幫拍照嗎",
        "課程中能不能帶手機嗎可請教練幫拍照嗎",
        "課程中可不可以帶手機可請教練幫拍照",
        "課程中能否帶手機可請教練幫拍照",
        "課程中可以帶手機可請教練幫拍照",
        "課程中能不能帶手機可請教練幫拍照",
        "課程中能否帶手機？可請教練幫拍照？",
        "課程中可以帶手機嗎？可請教練幫拍照嗎？",
        "課程中可不可以帶手機？可請教練幫拍照？",
        "課程中可以帶手機？可請教練幫拍照？",
        "課程中能不能帶手機？可請教練幫拍照？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "可以，教練可協助拍照或錄影。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "Yes, the coach can assist with taking photos or videos.",
          "th": "โค้ชสามารถช่วยถ่ายรูปหรือถ่ายวิดีโอได้"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "ข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดอ้างอิงตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Can I bring my phone to the class? Can I ask the coach to take pictures for me?",
        "th": "สามารถนำโทรศัพท์มือถือเข้ามาในชั้นเรียนได้หรือไม่? สามารถขอให้โค้ชช่วยถ่ายรูปได้หรือไม่?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:19:43.438471+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:19:43.438471+00:00"
        }
      }
    },
    {
      "id": "faq.general.038",
      "intent": "GENERAL",
      "section": "📅 一般課程預約與安排",
      "canonical_question": "第一天課程會教上下纜車嗎？",
      "utterance_patterns": [
        "第一天課程會教上下纜車嗎",
        "第一天課程會教上下纜車",
        "第一天課程會教上下纜車？",
        "第一天課程會教上下纜車嗎？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "依現場狀況與學習進度而定。如可行建議購買單次纜車票應對彈性需求。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "It depends on the on-site situation and learning progress. If feasible, it is recommended to purchase single-ride cable car tickets to accommodate flexible needs.",
          "th": "ขึ้นอยู่กับสถานการณ์หน้างานและความคืบหน้าในการเรียนรู้ หากเป็นไปได้ แนะนำให้ซื้อตั๋วกระเช้าแบบเที่ยวเดียวเพื่อตอบสนองความต้องการที่ยืดหยุ่น"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดตรวจสอบจากระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Will the first day's class teach how to get on and off the cable car?",
        "th": "วันแรกของบทเรียนจะสอนการขึ้นลงกระเช้าไฟฟ้าหรือไม่?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:26:33.884962+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:26:33.884962+00:00"
        }
      }
    },
    {
      "id": "faq.general.039",
      "intent": "GENERAL",
      "section": "📅 一般課程預約與安排",
      "canonical_question": "申請開課流程為何？",
      "utterance_patterns": [
        "申請開課流程為何",
        "申請開課流程為何？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "教練不在滑雪場時需特別申請，通常需達 4–6 堂課，並支付訂金。教練有 2 天時間評估，若拒絕／逾時，我們會人工改派下一位合適教練，且每次改派都會重新起算 48 小時的回覆時間，最終無法配合將全額退費。若申請需要改派教練，請勿申請退費。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "When a coach is not at the ski resort, a special application is required, usually for 4–6 lessons, and a deposit must be paid. The coach has 2 days to evaluate the request. If the coach declines or exceeds the time limit, we will manually reassign the next suitable coach, and each reassignment will restart the 48-hour response time. If we are ultimately unable to accommodate, a full refund will be issued. If you request a coach reassignment, please do not apply for a refund.",
          "th": "หากโค้ชไม่ได้อยู่ที่ลานสกี จะต้องยื่นคำขอพิเศษ โดยปกติจะต้องเรียน 4-6 บทเรียนและชำระเงินมัดจำ โค้ชมีเวลา 2 วันในการประเมิน หากปฏิเสธ/เกินเวลา เราจะจัดสรรโค้ชที่เหมาะสมคนถัดไปให้ใหม่ด้วยตนเอง และทุกครั้งที่มีการจัดสรรใหม่ เวลาตอบกลับ 48 ชั่วโมงจะเริ่มต้นใหม่ หากไม่สามารถดำเนินการได้ในที่สุด จะมีการคืนเงินเต็มจำนวน หากต้องการขอเปลี่ยนโค้ช โปรดอย่าขอคืนเงิน."
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the booking system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "What is the course application process?",
        "th": "ขั้นตอนการสมัครเปิดหลักสูตรคืออะไร?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:28:06.985802+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:28:06.985802+00:00"
        }
      }
    },
    {
      "id": "faq.general.040",
      "intent": "GENERAL",
      "section": "💰 費用與支付方式",
      "canonical_question": "課程費用包含哪些內容？是否含雪具租借與纜車票？",
      "utterance_patterns": [
        "課程費用包含哪些內容是否含雪具租借與纜車票",
        "課程費用包含哪些內容？是否含雪具租借與纜車票？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_INSURANCE_BREAKDOWN",
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "課程費用包含教練教學與滑雪保險。纜車票（雪票）與裝備租借費用需自理。部分滑雪場提供學生優惠與早鳥票連結，建議提前查詢。部分雪場的雪鏡與手套需購買，無法租借。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "The course fee includes coaching and ski insurance. Lift tickets (ski passes) and equipment rental fees are at your own expense. Some ski resorts offer student discounts and early bird ticket links; it is recommended to check in advance. Goggles and gloves at some ski resorts must be purchased and cannot be rented.",
          "th": "ค่าเรียนรวมค่าสอนของโค้ชและประกันภัยการเล่นสกี ค่าตั๋วกระเช้า (ตั๋วสกี) และค่าเช่าอุปกรณ์ต้องรับผิดชอบเอง สกีรีสอร์ทบางแห่งมีส่วนลดสำหรับนักเรียนและลิงก์ตั๋ว Early Bird แนะนำให้ตรวจสอบล่วงหน้า แว่นตาและถุงมือสำหรับเล่นสกีในบางรีสอร์ทต้องซื้อ ไม่สามารถเช่าได้"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "What does the course fee include? Does it include ski equipment rental and lift tickets?",
        "th": "ค่าเรียนรวมอะไรบ้าง? รวมค่าเช่าอุปกรณ์สกีและตั๋วกระเช้าด้วยหรือไม่?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:29:34.940967+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:29:34.940967+00:00"
        }
      }
    },
    {
      "id": "faq.general.041",
      "intent": "GENERAL",
      "section": "💰 費用與支付方式",
      "canonical_question": "是否需先付全額？可以只付訂金嗎？",
      "utterance_patterns": [
        "是否需先付全額可以只付訂金嗎",
        "是否需先付全額能不能只付訂金嗎",
        "是否需先付全額可以只付訂金",
        "是否需先付全額能不能只付訂金",
        "是否需先付全額能否只付訂金",
        "是否需先付全額可不可以只付訂金",
        "是否需先付全額？能不能只付訂金？",
        "是否需先付全額？可不可以只付訂金？",
        "是否需先付全額？可以只付訂金嗎？",
        "是否需先付全額？可以只付訂金？",
        "是否需先付全額？能否只付訂金？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "預約課程時僅需線上刷卡支付訂金，尾款可於上課當日以日幣現金支付給教練。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "When booking a course, only a deposit needs to be paid online by credit card; the remaining balance can be paid in Japanese Yen cash to the instructor on the day of the lesson.",
          "th": "เมื่อจองคอร์สเรียน ชำระเพียงค่ามัดจำด้วยบัตรเครดิตออนไลน์ ส่วนยอดที่เหลือสามารถชำระเป็นเงินสดสกุลเยนญี่ปุ่นกับผู้สอนได้ในวันเรียน"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดอ้างอิงจากระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Do I need to pay in full first? Can I just pay a deposit?",
        "th": "จำเป็นต้องชำระเต็มจำนวนล่วงหน้าหรือไม่? สามารถชำระแค่เงินมัดจำได้หรือไม่?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:30:39.527000+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:30:39.527000+00:00"
        }
      }
    },
    {
      "id": "faq.general.042",
      "intent": "GENERAL",
      "section": "💰 費用與支付方式",
      "canonical_question": "臨時取消可以退款嗎？退改規則是什麼？",
      "utterance_patterns": [
        "臨時取消可以退款嗎退改規則是什麼",
        "臨時取消能不能退款嗎退改規則是什麼",
        "臨時取消能不能退款退改規則是什麼",
        "臨時取消可以退款退改規則是什麼",
        "臨時取消可不可以退款退改規則是什麼",
        "臨時取消能否退款退改規則是什麼",
        "臨時取消可不可以退款？退改規則是什麼？",
        "臨時取消能否退款？退改規則是什麼？",
        "臨時取消可以退款嗎？退改規則是什麼？",
        "臨時取消能不能退款？退改規則是什麼？",
        "臨時取消可以退款？退改規則是什麼？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "* 兩個月前取消：訂金全額退費  \n* 一個月前取消：退還 50% 訂金  \n* 一個月內取消：訂金不退   \n* 退款皆需扣除 3–3.5% 刷卡手續費。若因教練更換或疫情等特殊情況，可能提供延期或全額退費方案。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "* Cancellation two months prior: Full refund of deposit.\n* Cancellation one month prior: 50% refund of deposit.\n* Cancellation within one month: Deposit is non-refundable.\n* All refunds will be subject to a 3–3.5% credit card processing fee. In special circumstances, such as a coach change or epidemic, an extension or full refund may be offered.",
          "th": "*   ยกเลิกล่วงหน้า 2 เดือน: คืนเงินมัดจำเต็มจำนวน\n*   ยกเลิกล่วงหน้า 1 เดือน: คืนเงินมัดจำ 50%\n*   ยกเลิกภายใน 1 เดือน: ไม่คืนเงินมัดจำ\n*   การคืนเงินทั้งหมดจะถูกหักค่าธรรมเนียมบัตรเครดิต 3–3.5%\n*   ในกรณีพิเศษ เช่น การเปลี่ยนโค้ชหรือสถานการณ์โควิด-19 อาจมีการเสนอการเลื่อนกำหนดการหรือแผนการคืนเงินเต็มจำนวน"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดตรวจสอบจากระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢",
        "#退費規則"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Can I get a refund for a last-minute cancellation? What is the cancellation and change policy?",
        "th": "สามารถขอคืนเงินได้ไหมหากยกเลิกกะทันหัน? กฎการคืนเงินและการเปลี่ยนแปลงคืออะไร?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:32:31.345771+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:32:31.345771+00:00"
        }
      }
    },
    {
      "id": "faq.general.043",
      "intent": "GENERAL",
      "section": "💰 費用與支付方式",
      "canonical_question": "付款是直接給教練還是透過平台？",
      "utterance_patterns": [
        "付款是直接給教練還是透過平台",
        "付款是直接給教練還是透過平台？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "* 訂金：線上刷卡由平台收取  \n* 尾款：現場交由教練收取日幣現金",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "*   Deposit: Collected by the platform via online credit card payment.\n*   Final Payment: Paid to the coach in Japanese Yen cash on-site.",
          "th": "*   เงินมัดจำ: ชำระด้วยบัตรเครดิตออนไลน์โดยแพลตฟอร์ม\n*   ยอดชำระส่วนที่เหลือ: ชำระเป็นเงินสดเยนญี่ปุ่นกับโค้ชที่หน้างาน"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the booking system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Is the payment made directly to the coach or through the platform?",
        "th": "ชำระเงินกับโค้ชโดยตรงหรือผ่านแพลตฟอร์ม?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:36:43.451530+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:36:43.451530+00:00"
        }
      }
    },
    {
      "id": "faq.general.044",
      "intent": "GENERAL",
      "section": "💰 費用與支付方式",
      "canonical_question": "關於教練指定費與證照等級加價",
      "utterance_patterns": [
        "關於教練指定費與證照等級加價"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "部分教練因證照等級或規則有「指定費」；是否加價以系統顯示與教練介紹為準；若由系統自動指派，是否加收會在頁面或確認信載明。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "Some coaches have a 'designation fee' due to their certification level or specific rules. Whether an additional charge applies is determined by the system display and the coach's introduction. If automatically assigned by the system, any additional charges will be specified on the page or in the confirmation email.",
          "th": "โค้ชบางคนมี 'ค่าธรรมเนียมการแต่งตั้ง' เนื่องจากระดับใบรับรองหรือกฎระเบียบ การเพิ่มราคาขึ้นอยู่กับการแสดงผลของระบบและข้อมูลแนะนำของโค้ช หากระบบกำหนดโดยอัตโนมัติ การเรียกเก็บเงินเพิ่มเติมจะระบุไว้ในหน้าหรืออีเมลยืนยัน"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูที่ระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢",
        "#指定教練"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Regarding the designated coach fee and certification level surcharge.",
        "th": "เกี่ยวกับค่าธรรมเนียมการแต่งตั้งโค้ชและค่าธรรมเนียมเพิ่มเติมระดับใบรับรอง"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:38:36.447684+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:38:36.447684+00:00"
        }
      }
    },
    {
      "id": "faq.general.045",
      "intent": "GENERAL",
      "section": "📱 平台操作與預約流程",
      "canonical_question": "我在網站上想預約的時段，系統顯示沒有可預約的教練，該怎麼辦？",
      "utterance_patterns": [
        "我在網站上想預約的時段，系統顯示沒有可預約的教練，該怎麼辦",
        "我在網站上想預約的時段，系統顯示沒有可預約的教練，該怎麼辦？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "我們的教練預約系統是即時更新的。如果您看到的時段顯示為灰色或無法點選，代表該時段的教練已經被預約滿了。特別是在旺季（如聖誕、新年、農曆春節）和熱門雪場，建議您提早 2-3 個月預約。您也可以嘗試搜尋鄰近的其他雪場，或調整您的旅遊日期，看看是否有可預約的時段。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "Our coach booking system is updated in real-time. If the time slot you see is grayed out or cannot be clicked, it means that the coach for that time slot is fully booked. Especially during peak seasons (such as Christmas, New Year, and Lunar New Year) and popular ski resorts, it is recommended to book 2-3 months in advance. You can also try searching for other nearby ski resorts or adjusting your travel dates to see if there are available time slots.",
          "th": "ระบบจองโค้ชของเราอัปเดตแบบเรียลไทม์ หากช่วงเวลาที่คุณเห็นเป็นสีเทาหรือไม่สามารถคลิกได้ แสดงว่าโค้ชในช่วงเวลานั้นถูกจองเต็มแล้ว โดยเฉพาะอย่างยิ่งในช่วงฤดูท่องเที่ยว (เช่น คริสต์มาส ปีใหม่ ตรุษจีน) และลานสกีที่ได้รับความนิยม เราขอแนะนำให้คุณจองล่วงหน้า 2-3 เดือน คุณยังสามารถลองค้นหาสถานที่เล่นสกีอื่นๆ ในบริเวณใกล้เคียง หรือปรับเปลี่ยนวันเดินทางของคุณเพื่อดูว่ามีช่วงเวลาที่ว่างให้จองหรือไม่"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "For the time slot I want to book on the website, the system shows no available coaches. What should I do?",
        "th": "ช่วงเวลาที่ฉันต้องการจองบนเว็บไซต์ ระบบแสดงว่าไม่มีโค้ชว่าง ฉันควรทำอย่างไร?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:39:58.973516+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:39:58.973516+00:00"
        }
      }
    },
    {
      "id": "faq.general.046",
      "intent": "GENERAL",
      "section": "📱 平台操作與預約流程",
      "canonical_question": "我點擊付款連結後不小心關掉了頁面，或連結已失效，該怎麼辦？",
      "utterance_patterns": [
        "我點擊付款連結後不小心關掉了頁面，或連結已失效，該怎麼辦",
        "我點擊付款連結後不小心關掉了頁面，或連結已失效，該怎麼辦？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "我們的付款頁面設有保護機制，連結具有時效性。如果您未完成付款就離開頁面，該筆「未成立」的訂單將會在約20分鐘後自動取消，您原本選擇的時段也會被釋出。屆時，您只需要回到網站，重新進行一次您想要的預約即可。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "Our payment page is protected, and the link is time-sensitive. If you leave the page without completing the payment, the \"unestablished\" order will be automatically canceled in about 20 minutes, and your originally selected time slot will be released. At that time, you just need to return to the website and make your desired reservation again.",
          "th": "หน้าการชำระเงินของเรามีกลไกป้องกัน และลิงก์มีอายุจำกัด หากคุณออกจากหน้าโดยไม่ชำระเงิน คำสั่งซื้อ \"ที่ยังไม่สมบูรณ์\" นั้นจะถูกยกเลิกโดยอัตโนมัติภายในประมาณ 20 นาที และช่วงเวลาที่คุณเลือกไว้จะถูกปล่อยออกมา เมื่อถึงเวลานั้น คุณเพียงแค่กลับไปที่เว็บไซต์และทำการจองที่คุณต้องการอีกครั้ง"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดอ้างอิงตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "What should I do if I accidentally closed the page after clicking the payment link, or if the link has expired?",
        "th": "ฉันเผลอปิดหน้าหลังจากคลิกลิงก์ชำระเงิน หรือลิงก์หมดอายุแล้ว ฉันควรทำอย่างไรดี?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:41:40.048358+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:41:40.048358+00:00"
        }
      }
    },
    {
      "id": "faq.general.047",
      "intent": "GENERAL",
      "section": "📱 平台操作與預約流程",
      "canonical_question": "我註冊了帳號，但一直沒收到Email驗證信，該怎麼辦？",
      "utterance_patterns": [
        "我註冊了帳號，但一直沒收到Email驗證信，該怎麼辦",
        "我註冊了帳號，但一直沒收到Email驗證信，該怎麼辦？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "如果您沒有收到驗證信，請先仔細檢查您的「垃圾郵件」信箱。若垃圾信箱也沒有，很可能是您先前已用同一個Email註冊過。請您嘗試使用「忘記密碼」功能來重設密碼並登入。若問題持續，請提供您註冊的Email，讓客服人員為您查詢處理。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "If you haven't received the verification email, please first check your 'spam' folder carefully. If it's not in your spam folder either, it's likely that you have previously registered with the same email. Please try using the 'Forgot Password' function to reset your password and log in. If the problem persists, please provide your registered email so that customer service can assist you with the inquiry.",
          "th": "หากคุณไม่ได้รับอีเมลยืนยัน โปรดตรวจสอบกล่อง \"สแปม\" ของคุณอย่างละเอียดก่อน หากไม่มีในกล่องสแปม เป็นไปได้ว่าคุณได้ลงทะเบียนด้วยอีเมลเดียวกันนี้แล้ว โปรดลองใช้ฟังก์ชัน \"ลืมรหัสผ่าน\" เพื่อรีเซ็ตรหัสผ่านและเข้าสู่ระบบ หากปัญหายังคงอยู่ โปรดระบุอีเมลที่คุณใช้ลงทะเบียน เพื่อให้เจ้าหน้าที่บริการลูกค้าสามารถตรวจสอบและดำเนินการให้คุณได้"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "I registered an account, but I haven't received the email verification letter. What should I do?",
        "th": "ฉันลงทะเบียนบัญชีแล้ว แต่ไม่ได้รับอีเมลยืนยันเลย ควรทำอย่างไรดี?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:42:54.812856+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:42:54.812856+00:00"
        }
      }
    },
    {
      "id": "faq.general.048",
      "intent": "GENERAL",
      "section": "📱 平台操作與預約流程",
      "canonical_question": "預約流程怎麼走？幾步驟完成？",
      "utterance_patterns": [
        "預約流程怎麼走幾步驟完成",
        "預約流程怎麼走？幾步驟完成？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_INSURANCE_BREAKDOWN",
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "預約流程會根據教練是否開課有所不同。\n\n* 若有教練開課，您可在網站上直接預約並完成訂單。  \n* 若無教練開課，需申請開課並等待教練同意。  \n* 預約成功後會收到通知信，後續保險、上課提醒等資訊也會寄送給您。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "The reservation process varies depending on whether a coach offers a class.\n\n* If a coach offers a class, you can directly book and complete your order on the website.\n* If no coach offers a class, you need to apply for a class and wait for the coach's approval.\n* After a successful reservation, you will receive a notification email, and subsequent information such as insurance and class reminders will also be sent to you.",
          "th": "ขั้นตอนการจองจะแตกต่างกันไปขึ้นอยู่กับว่าโค้ชเปิดสอนหรือไม่\n\n* หากโค้ชเปิดสอน คุณสามารถจองและดำเนินการสั่งซื้อได้โดยตรงบนเว็บไซต์\n* หากโค้ชไม่ได้เปิดสอน คุณต้องยื่นคำขอเปิดสอนและรอการอนุมัติจากโค้ช\n* หลังจากจองสำเร็จ คุณจะได้รับอีเมลแจ้งเตือน และข้อมูลที่เกี่ยวข้องกับการประกันภัยและการแจ้งเตือนชั้นเรียนจะถูกส่งถึงคุณในภายหลัง"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "What is the appointment booking process? How many steps are involved?",
        "th": "ขั้นตอนการจองเป็นอย่างไร? ต้องทำกี่ขั้นตอน?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:44:36.839129+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:44:36.839129+00:00"
        }
      }
    },
    {
      "id": "faq.general.049",
      "intent": "GENERAL",
      "section": "📱 平台操作與預約流程",
      "canonical_question": "我要先註冊嗎？可以用 Line 或 Facebook 登入嗎？",
      "utterance_patterns": [
        "我要先註冊嗎可以用 Line 或 Facebook 登入嗎",
        "我要先註冊嗎能不能用 Line 或 Facebook 登入嗎",
        "我要先註冊可不可以用 Line 或 Facebook 登入",
        "我要先註冊能否用 Line 或 Facebook 登入",
        "我要先註冊可以用 Line 或 Facebook 登入",
        "我要先註冊能不能用 Line 或 Facebook 登入",
        "我要先註冊？可以用 Line 或 Facebook 登入？",
        "我要先註冊嗎？可以用 Line 或 Facebook 登入嗎？",
        "我要先註冊？可不可以用 Line 或 Facebook 登入？",
        "我要先註冊？能不能用 Line 或 Facebook 登入？",
        "我要先註冊？能否用 Line 或 Facebook 登入？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "是的，需要先註冊才能使用網站，目前僅提供電子郵件註冊與登入。 \n\n註冊網址：https://booking.diy.ski/schedule",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "Yes, you need to register first to use the website. Currently, only email registration and login are provided. Registration URL: https://booking.diy.ski/schedule",
          "th": "ใช่ ต้องลงทะเบียนก่อนจึงจะสามารถใช้งานเว็บไซต์ได้ ขณะนี้รองรับเฉพาะการลงทะเบียนและเข้าสู่ระบบด้วยอีเมลเท่านั้น\n\nลิงก์ลงทะเบียน: https://booking.diy.ski/schedule"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Do I need to register first? Can I log in with Line or Facebook?",
        "th": "ฉันต้องลงทะเบียนก่อนไหม? สามารถเข้าสู่ระบบด้วย Line หรือ Facebook ได้หรือไม่?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:57:22.370969+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:57:22.370969+00:00"
        }
      }
    },
    {
      "id": "faq.general.050",
      "intent": "GENERAL",
      "section": "📱 平台操作與預約流程",
      "canonical_question": "有哪些教練可以選？可以用什麼條件篩選？",
      "utterance_patterns": [
        "有哪些教練可以選可以用什麼條件篩選",
        "有哪些教練能不能選能不能用什麼條件篩選",
        "有哪些教練可不可以選可不可以用什麼條件篩選",
        "有哪些教練能否選能否用什麼條件篩選",
        "有哪些教練能不能選？能不能用什麼條件篩選？",
        "有哪些教練可不可以選？可不可以用什麼條件篩選？",
        "有哪些教練能否選？能否用什麼條件篩選？",
        "有哪些教練可以選？可以用什麼條件篩選？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "可在網站查詢開課教練與費用：https://booking.diy.ski/schedule\n\n教練介紹頁面：https://diy.ski/instructorList.php\n\n篩選條件包括：\n\n* 雙板/單板  \n* 上課地點（如是否在神樂）  \n* 可預約時段（半日或全日）",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "You can check the available instructors and fees on the website: https://booking.diy.ski/schedule\n\nInstructor introduction page: https://diy.ski/instructorList.php\n\nFilter conditions include:\n\n* Ski/Snowboard\n* Class location (e.g., whether in Kagura)\n* Available booking slots (half-day or full-day)",
          "th": "สามารถตรวจสอบโค้ชและค่าธรรมเนียมการเรียนได้ที่เว็บไซต์: https://booking.diy.ski/schedule\n\nหน้าแนะนำโค้ช: https://diy.ski/instructorList.php\n\nเงื่อนไขการคัดกรองประกอบด้วย:\n\n* สกีคู่/สโนว์บอร์ด\n* สถานที่เรียน (เช่น อยู่ที่คางุระหรือไม่)\n* ช่วงเวลาที่สามารถจองได้ (ครึ่งวันหรือเต็มวัน)"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดอ้างอิงตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "What coaches are available for selection? What criteria can be used for filtering?",
        "th": "มีโค้ชคนไหนบ้างที่สามารถเลือกได้? สามารถใช้เงื่อนไขอะไรในการคัดกรองได้บ้าง?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:58:50.809475+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T12:58:50.809475+00:00"
        }
      }
    },
    {
      "id": "faq.general.051",
      "intent": "GENERAL",
      "section": "📱 平台操作與預約流程",
      "canonical_question": "如果教練無法即時確認，預約會成立嗎？",
      "utterance_patterns": [
        "如果教練無法即時確認，預約會成立嗎",
        "如果教練無法即時確認，預約會成立",
        "如果教練無法即時確認，預約會成立嗎？",
        "如果教練無法即時確認，預約會成立？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "* 若教練開課，預約可即時成立。  \n* 若需申請開課，教練會於 2 天內回覆是否接受。  \n* 若該教練無法配合，系統會詢問其他教練，若皆無法配合，將取消訂單並退費。  \n* 特定雪場如輕井澤需住宿王子飯店才能預約，若不符規定，預約可能取消。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "* If the coach offers a class, the reservation can be confirmed immediately.\n* If you need to apply for a class, the coach will respond within 2 days whether they accept.\n* If the coach cannot accommodate, the system will inquire with other coaches. If none can accommodate, the order will be canceled and refunded.\n* For specific ski resorts like Karuizawa, reservations require staying at Prince Hotel. If this condition is not met, the reservation may be canceled.",
          "th": "* หากโค้ชเปิดคอร์ส การจองสามารถยืนยันได้ทันที\n* หากต้องการสมัครเปิดคอร์ส โค้ชจะตอบกลับภายใน 2 วันว่าจะรับหรือไม่\n* หากโค้ชคนดังกล่าวไม่สามารถดำเนินการได้ ระบบจะสอบถามโค้ชคนอื่น หากไม่มีใครสามารถดำเนินการได้ จะยกเลิกคำสั่งซื้อและคืนเงิน\n* สกีรีสอร์ทบางแห่ง เช่น คารุอิซาวะ ต้องพักที่ Prince Hotel จึงจะสามารถจองได้ หากไม่เป็นไปตามข้อกำหนด การจองอาจถูกยกเลิก"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Will the booking be confirmed if the coach cannot confirm it immediately?",
        "th": "หากโค้ชไม่สามารถยืนยันได้ทันที การจองจะยังคงมีผลหรือไม่?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:01:35.766982+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:01:35.766982+00:00"
        }
      }
    },
    {
      "id": "faq.general.052",
      "intent": "GENERAL",
      "section": "📱 平台操作與預約流程",
      "canonical_question": "預約課程後我會收到什麼通知？Email 或簡訊嗎？",
      "utterance_patterns": [
        "預約課程後我會收到什麼通知Email 或簡訊嗎",
        "預約課程後我會收到什麼通知Email 或簡訊",
        "預約課程後我會收到什麼通知？Email 或簡訊嗎？",
        "預約課程後我會收到什麼通知？Email 或簡訊？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_INSURANCE_BREAKDOWN",
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "* 預約成功通知信件  \n* 保險與上課提醒通知信  \n* 您也可隨時於網站查詢訂單：https://booking.diy.ski/order/list\n\nQ：上課前需要準備什麼？平台會提醒嗎？\n\nA：建議準備：\n\n* 雪具（雪板、雪鞋）可先行租借  \n* 安全帽與護具（防摔褲、膝、手腕護具）建議自備  \n* 雪衣褲、手套、雪鏡等基本裝備  \n* 雪票：部分雪場提供優惠購票連結  \n* 機票、住宿、交通等個人安排\n\n提醒方式：\n\n* 上課前 7 天教練會主動聯繫確認  \n* 系統會寄出提醒信與保險通知表單",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "* Booking successful notification email\n* Insurance and class reminder notification email\n* You can also check your order on the website at any time: https://booking.diy.ski/order/list\n\nQ: What do I need to prepare before class? Will the platform remind me?\n\nA: Recommended preparations:\n\n* Snow gear (snowboard, snow boots) can be rented in advance\n* Helmet and protective gear (crash pants, knee, wrist guards) are recommended to be brought by yourself\n* Basic equipment such as snow jacket and pants, gloves, and snow goggles\n* Lift ticket: Some ski resorts offer discounted ticket purchase links\n* Personal arrangements such as air tickets, accommodation, and transportation\n\nReminder methods:\n\n* The coach will proactively contact you to confirm 7 days before class\n* The system will send out a reminder email and insurance notification form",
          "th": "* จดหมายแจ้งยืนยันการจองสำเร็จ\n* จดหมายแจ้งเตือนเรื่องประกันภัยและการเรียน\n* คุณสามารถตรวจสอบคำสั่งซื้อของคุณได้ตลอดเวลาบนเว็บไซต์: https://booking.diy.ski/order/list\n\nถาม: ต้องเตรียมอะไรก่อนเรียนบ้าง? แพลตฟอร์มจะแจ้งเตือนหรือไม่?\n\nตอบ: แนะนำให้เตรียม:\n\n* อุปกรณ์สกี (สกีบอร์ด, รองเท้าสกี) สามารถเช่าล่วงหน้าได้\n* หมวกกันน็อคและอุปกรณ์ป้องกัน (กางเกงกันกระแทก, สนับเข่า, สนับข้อมือ) แนะนำให้นำมาเอง\n* ชุดสกี, ถุงมือ, แว่นตาสกี และอุปกรณ์พื้นฐานอื่นๆ\n* ตั๋วขึ้นกระเช้า: สกีรีสอร์ทบางแห่งมีลิงก์สำหรับซื้อตั๋วในราคาพิเศษ\n* การจัดการส่วนตัว เช่น ตั๋วเครื่องบิน, ที่พัก, การเดินทาง\n\nวิธีการแจ้งเตือน:\n\n* โค้ชจะติดต่อเพื่อยืนยันล่วงหน้า 7 วันก่อนเรียน\n* ระบบจะส่งอีเมลแจ้งเตือนและแบบฟอร์มแจ้งประกันภัย"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "What notifications will I receive after booking a course? Email or SMS?",
        "th": "คุณจะได้รับการแจ้งเตือนอะไรบ้างหลังจากจองคอร์สเรียนแล้ว? อีเมลหรือ SMS?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:02:42.332455+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:02:42.332455+00:00"
        }
      }
    },
    {
      "id": "faq.general.053",
      "intent": "GENERAL",
      "section": "📱 平台操作與預約流程",
      "canonical_question": "上課當天怎麼跟教練碰面？有定位或導航嗎？",
      "utterance_patterns": [
        "上課當天怎麼跟教練碰面有定位或導航嗎",
        "上課當天怎麼跟教練碰面有定位或導航",
        "上課當天怎麼跟教練碰面？有定位或導航？",
        "上課當天怎麼跟教練碰面？有定位或導航嗎？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "* 教練會於上課前一週左右主動聯繫，告知集合地點與時間  \n* 集合地點資訊會公布於網站雪場說明中  \n* 若未收到聯繫，可主動聯絡客服或平台協助轉達  \n* 每個雪場集合地點略有不同，建議再次與教練確認",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "* The coach will proactively contact you about a week before the class to inform you of the meeting location and time.\n* Information on meeting locations will be published in the ski resort description on the website.\n* If you do not receive contact, you can proactively contact customer service or the platform for assistance in relaying the message.\n* The meeting location for each ski resort is slightly different; it is recommended to reconfirm with the coach.",
          "th": "* โค้ชจะติดต่อคุณประมาณหนึ่งสัปดาห์ก่อนเริ่มเรียน เพื่อแจ้งสถานที่และเวลาในการรวมตัว\n* ข้อมูลสถานที่นัดพบจะประกาศอยู่ในคำอธิบายลานสกีบนเว็บไซต์\n* หากไม่ได้รับการติดต่อ โปรดติดต่อฝ่ายบริการลูกค้าหรือแพลตฟอร์มเพื่อขอความช่วยเหลือในการส่งต่อข้อความ\n* สถานที่นัดพบของแต่ละลานสกีอาจแตกต่างกันเล็กน้อย แนะนำให้ยืนยันกับโค้ชอีกครั้ง"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "How do I meet the coach on the day of the class? Is there a location or navigation?",
        "th": "จะพบโค้ชในวันเรียนได้อย่างไร? มีตำแหน่งหรือระบบนำทางไหม?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:04:31.051931+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:04:31.051931+00:00"
        }
      }
    },
    {
      "id": "faq.general.054",
      "intent": "GENERAL",
      "section": "🛟 安全與保險",
      "canonical_question": "課程是否包含保險？保障範圍是什麼？",
      "utterance_patterns": [
        "課程是否包含保險保障範圍是什麼",
        "課程是否包含保險？保障範圍是什麼？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_INSURANCE_BREAKDOWN",
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "SKIDIY 課程皆含富邦滑雪專案保險，有效期為課程首日起四天。保障如下：\n\n* 意外身故與殘廢：100 萬（15 歲以下不適用）  \n* 意外醫療實支實付：30 萬  \n* 15 歲以下：20 萬 \\+ 1 萬美元緊急救援",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "SKIDIY courses all include Fubon Ski Project Insurance, valid for four days from the first day of the course. The coverage is as follows:\n\n* Accidental death and disability: 1 million (not applicable to those under 15 years old)\n* Accidental medical actual expenses: 300,000\n* Under 15 years old: 200,000 + 10,000 USD for emergency rescue",
          "th": "หลักสูตร SKIDIY ทั้งหมดรวมประกันภัยโครงการสกี Fubon ซึ่งมีอายุสี่วันนับจากวันแรกของหลักสูตร ความคุ้มครองมีดังนี้:\n\n* การเสียชีวิตจากอุบัติเหตุและการทุพพลภาพ: 1 ล้าน (ไม่สามารถใช้ได้กับผู้ที่มีอายุต่ำกว่า 15 ปี)\n* ค่ารักษาพยาบาลจากอุบัติเหตุ: 300,000\n* อายุต่ำกว่า 15 ปี: 200,000 + 10,000 ดอลลาร์สหรัฐสำหรับการช่วยเหลือฉุกเฉิน"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Does the course include insurance? What is the scope of coverage?",
        "th": "หลักสูตรครอบคลุมการประกันภัยหรือไม่? ความคุ้มครองคืออะไร?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:05:47.003670+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:05:47.003670+00:00"
        }
      }
    },
    {
      "id": "faq.general.055",
      "intent": "GENERAL",
      "section": "🛟 安全與保險",
      "canonical_question": "課程費用包含的保險是強制的嗎？如果我已經自己買了旅遊平安險，可以不要或退費嗎？",
      "utterance_patterns": [
        "課程費用包含的保險是強制的嗎如果我已經自己買了旅遊平安險，可以不要或退費嗎",
        "課程費用包含的保險是強制的嗎如果我已經自己買了旅遊平安險，能不能不要或退費嗎",
        "課程費用包含的保險是強制的如果我已經自己買了旅遊平安險，能否不要或退費",
        "課程費用包含的保險是強制的如果我已經自己買了旅遊平安險，能不能不要或退費",
        "課程費用包含的保險是強制的如果我已經自己買了旅遊平安險，可不可以不要或退費",
        "課程費用包含的保險是強制的如果我已經自己買了旅遊平安險，可以不要或退費",
        "課程費用包含的保險是強制的嗎？如果我已經自己買了旅遊平安險，可以不要或退費嗎？",
        "課程費用包含的保險是強制的？如果我已經自己買了旅遊平安險，可不可以不要或退費？",
        "課程費用包含的保險是強制的？如果我已經自己買了旅遊平安險，可以不要或退費？",
        "課程費用包含的保險是強制的？如果我已經自己買了旅遊平安險，能否不要或退費？",
        "課程費用包含的保險是強制的？如果我已經自己買了旅遊平安險，能不能不要或退費？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_INSURANCE_BREAKDOWN",
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "是的，課程費用內含的富邦滑雪專案保險是我們為保障所有學員而提供的，屬於課程的一部分，無法單獨取消或退費。此保險主要針對「滑雪活動中發生的意外傷害」進行理賠。請特別注意，若您已自行投保富邦產險的旅遊平安險，可能會因保險公司的「重複投保」規定而無法承保我們的專案，但課程費用與內容不變。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "Yes, the Fubon Ski Project Insurance included in the course fee is provided to protect all students and is part of the course, so it cannot be canceled or refunded separately. This insurance mainly covers accidental injuries that occur during skiing activities. Please note that if you have already purchased Fubon's travel insurance, you may not be able to be covered by our project due to the insurance company's \"double insurance\" regulations, but the course fees and content will remain unchanged.",
          "th": "ใช่ การประกันภัยโครงการสกี Fubon ที่รวมอยู่ในค่าเล่าเรียนนั้นจัดทำขึ้นเพื่อคุ้มครองนักเรียนทุกคนและเป็นส่วนหนึ่งของหลักสูตร จึงไม่สามารถยกเลิกหรือขอคืนเงินแยกต่างหากได้ ประกันนี้ครอบคลุมการบาดเจ็บจากอุบัติเหตุที่เกิดขึ้นระหว่างกิจกรรมเล่นสกีเป็นหลัก โปรดทราบว่าหากคุณได้ซื้อประกันการเดินทางของ Fubon แล้ว คุณอาจไม่ได้รับความคุ้มครองจากโครงการของเราเนื่องจากข้อบังคับ \"การประกันซ้ำซ้อน\" ของบริษัทประกัน แต่ค่าเล่าเรียนและเนื้อหาของหลักสูตรจะยังคงไม่เปลี่ยนแปลง"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢",
        "#退費規則"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Is the insurance included in the course fee mandatory? If I have already purchased my own travel insurance, can I opt out or get a refund?",
        "th": "ประกันที่รวมอยู่ในค่าเล่าเรียนเป็นภาคบังคับหรือไม่? หากฉันซื้อประกันการเดินทางเองแล้ว ฉันสามารถเลือกไม่รับหรือขอเงินคืนได้หรือไม่?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:16:20.527810+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:16:20.527810+00:00"
        }
      }
    },
    {
      "id": "faq.general.056",
      "intent": "GENERAL",
      "section": "🛟 安全與保險",
      "canonical_question": "如何確認保險是否完成？會收到保單嗎？",
      "utterance_patterns": [
        "如何確認保險是否完成會收到保單嗎",
        "如何確認保險是否完成會收到保單",
        "如何確認保險是否完成？會收到保單嗎？",
        "如何確認保險是否完成？會收到保單？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_INSURANCE_BREAKDOWN",
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "保險投保作業會於上課前約一週完成，不會個別寄發保單，您可登入官網「帳號 → 訂單資訊」填寫，或使用我們提供的專用表單連結完成。可於「訂單資訊」中查詢所有學員的保險填寫狀態。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "The insurance application process will be completed approximately one week before the class starts. Individual insurance policies will not be sent out. You can log in to the official website, go to \"Account → Order Information\" to fill it out, or use the dedicated form link we provide. You can check the insurance completion status of all students in \"Order Information.\"",
          "th": "การดำเนินการประกันภัยจะแล้วเสร็จประมาณหนึ่งสัปดาห์ก่อนเริ่มเรียน จะไม่มีการส่งกรมธรรม์ประกันภัยแยกต่างหาก คุณสามารถเข้าสู่ระบบเว็บไซต์ทางการ \"บัญชี → ข้อมูลการสั่งซื้อ\" เพื่อกรอกข้อมูล หรือใช้ลิงก์แบบฟอร์มพิเศษที่เราจัดหาให้ คุณสามารถตรวจสอบสถานะการกรอกข้อมูลประกันภัยของนักเรียนทุกคนได้ใน \"ข้อมูลการสั่งซื้อ\""
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดอ้างอิงจากระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "How to confirm if the insurance is complete? Will I receive the policy?",
        "th": "จะยืนยันได้อย่างไรว่าการประกันภัยเสร็จสมบูรณ์แล้ว? จะได้รับกรมธรรม์หรือไม่?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:18:00.829851+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:18:00.829851+00:00"
        }
      }
    },
    {
      "id": "faq.general.057",
      "intent": "GENERAL",
      "section": "🛟 安全與保險",
      "canonical_question": "滑雪受傷怎麼處理？可以理賠嗎？",
      "utterance_patterns": [
        "滑雪受傷怎麼處理可以理賠嗎",
        "滑雪受傷怎麼處理能不能理賠嗎",
        "滑雪受傷怎麼處理能不能理賠",
        "滑雪受傷怎麼處理可以理賠",
        "滑雪受傷怎麼處理能否理賠",
        "滑雪受傷怎麼處理可不可以理賠",
        "滑雪受傷怎麼處理？能不能理賠？",
        "滑雪受傷怎麼處理？可以理賠嗎？",
        "滑雪受傷怎麼處理？可以理賠？",
        "滑雪受傷怎麼處理？能否理賠？",
        "滑雪受傷怎麼處理？可不可以理賠？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_INSURANCE_BREAKDOWN",
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "平台會提供協助，並指引聯繫保險窗口。 您需準備以下理賠文件：\n\n* 海外診斷書、醫療收據、出院摘要（住院者）  \n* 護照出入境證明、健保核退文件",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "The platform will provide assistance and guide you to contact the insurance window. You will need to prepare the following claim documents:\n\n*   Overseas diagnosis certificate, medical receipts, discharge summary (for inpatients)\n*   Passport entry and exit stamps/proof, National Health Insurance reimbursement documents",
          "th": "แพลตฟอร์มจะให้ความช่วยเหลือและแนะนำให้ติดต่อตัวแทนประกันภัย คุณต้องเตรียมเอกสารการเรียกร้องดังต่อไปนี้:\n\n* ใบรับรองแพทย์จากต่างประเทศ, ใบเสร็จค่ารักษาพยาบาล, สรุปการออกจากโรงพยาบาล (สำหรับผู้ป่วยใน)\n* หลักฐานการเข้าออกประเทศจากหนังสือเดินทาง, เอกสารการขอคืนเงินค่ารักษาพยาบาลจากประกันสุขภาพ"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "How to deal with a skiing injury? Can I claim compensation?",
        "th": "การบาดเจ็บจากการเล่นสกีจัดการอย่างไร? สามารถเรียกร้องค่าสินไหมทดแทนได้หรือไม่?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:19:36.102272+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:19:36.102272+00:00"
        }
      }
    },
    {
      "id": "faq.general.058",
      "intent": "GENERAL",
      "section": "🛟 安全與保險",
      "canonical_question": "受傷後不能上課可以退費嗎？",
      "utterance_patterns": [
        "受傷後不能上課可以退費嗎",
        "受傷後不能上課能不能退費嗎",
        "受傷後不能上課可不可以退費",
        "受傷後不能上課能不能退費",
        "受傷後不能上課能否退費",
        "受傷後不能上課可以退費",
        "受傷後不能上課能否退費？",
        "受傷後不能上課可以退費嗎？",
        "受傷後不能上課能不能退費？",
        "受傷後不能上課可不可以退費？",
        "受傷後不能上課可以退費？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_INSURANCE_BREAKDOWN",
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "可以。請提供診斷證明，我們會協助退課。退費金額會扣除保險費與刷卡手續費後退款。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "Okay. Please provide a diagnostic certificate, and we will assist you with withdrawing from the course. The refund amount will be processed after deducting insurance fees and credit card handling fees.",
          "th": "ได้ โปรดแสดงใบรับรองแพทย์ แล้วเราจะช่วยคุณยกเลิกชั้นเรียน จำนวนเงินที่คืนจะถูกหักค่าเบี้ยประกันและค่าธรรมเนียมบัตรเครดิต"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดอ้างอิงจากระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢",
        "#退費規則"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Can I get a refund if I can't attend class after an injury?",
        "th": "หลังได้รับบาดเจ็บ ไม่สามารถเข้าเรียนได้ สามารถขอคืนเงินได้หรือไม่?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:21:05.827154+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:21:05.827154+00:00"
        }
      }
    },
    {
      "id": "faq.general.059",
      "intent": "GENERAL",
      "section": "🛟 安全與保險",
      "canonical_question": "小朋友也有保險嗎？有什麼不同？",
      "utterance_patterns": [
        "小朋友也有保險嗎有什麼不同",
        "小朋友也有保險有什麼不同",
        "小朋友也有保險？有什麼不同？",
        "小朋友也有保險嗎？有什麼不同？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_INSURANCE_BREAKDOWN",
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "有，未滿15歲不適用身故項目，其他給付另有規定（如上所述）。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "Yes, the death benefit does not apply to individuals under 15 years old; other benefits are subject to separate regulations (as mentioned above).",
          "th": "มี ข้อกำหนดอื่น ๆ สำหรับผลประโยชน์อื่น ๆ (ตามที่ระบุไว้ข้างต้น) โดยผู้ที่มีอายุต่ำกว่า 15 ปีไม่สามารถใช้สิทธิ์ในกรณีเสียชีวิตได้"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢",
        "#親子同堂詢問"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Do children also have insurance? What are the differences?",
        "th": "เด็กๆ มีประกันภัยด้วยไหม มีอะไรแตกต่างกันบ้าง?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:22:34.229683+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:22:34.229683+00:00"
        }
      }
    },
    {
      "id": "faq.general.060",
      "intent": "GENERAL",
      "section": "🛟 安全與保險",
      "canonical_question": "如果在海外就醫，理賠流程是什麼？",
      "utterance_patterns": [
        "如果在海外就醫，理賠流程是什麼",
        "如果在海外就醫，理賠流程是什麼？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "請保留：\n\n* 原文收據正本  \n* 診斷書與出院摘要影本  \n* 健保核退資料  \n* 回台補件文件（健保局關防、診斷書副本、理賠申請書、存摺影本）",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "The platform will provide assistance and guide you to contact the insurance window. You will need to prepare the following claim documents:\n\n*   Overseas diagnosis certificate, medical receipts, discharge summary (for inpatients)\n*   Passport entry and exit stamps/proof, National Health Insurance reimbursement documents",
          "th": "แพลตฟอร์มจะให้ความช่วยเหลือและแนะนำให้ติดต่อตัวแทนประกันภัย คุณต้องเตรียมเอกสารการเรียกร้องดังต่อไปนี้:\n\n* ใบรับรองแพทย์จากต่างประเทศ, ใบเสร็จค่ารักษาพยาบาล, สรุปการออกจากโรงพยาบาล (สำหรับผู้ป่วยใน)\n* หลักฐานการเข้าออกประเทศจากหนังสือเดินทาง, เอกสารการขอคืนเงินค่ารักษาพยาบาลจากประกันสุขภาพ"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดอ้างอิงตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#一般查詢"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "What is the claim process if I seek medical treatment overseas?",
        "th": "หากเข้ารับการรักษาพยาบาลในต่างประเทศ ขั้นตอนการเรียกร้องค่าสินไหมทดแทนคืออะไร?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:24:07.200543+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:24:07.200543+00:00"
        }
      }
    },
    {
      "id": "faq.gear.061",
      "intent": "GEAR",
      "section": "🎒 裝備準備與租借流程",
      "canonical_question": "上課當天，我應該先租好裝備、買好雪票再去找教練集合嗎？",
      "utterance_patterns": [
        "上課當天，我應該先租好裝備、買好雪票再去找教練集合嗎",
        "要先租裝備嗎",
        "雪票要先買嗎",
        "現場租得到裝備嗎",
        "裝備租借流程",
        "集合前要做什麼準備",
        "幾點到現場比較好",
        "上課當天，我應該先租好裝備、買好雪票再去找教練集合",
        "要先租裝備",
        "雪票要先買",
        "現場租得到裝備",
        "上課當天，我應該先租好裝備、買好雪票再去找教練集合嗎？",
        "上課當天，我應該先租好裝備、買好雪票再去找教練集合？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "是的，我們強烈建議您「提早至少1小時」抵達雪場，並在與教練約定的集合時間前，完成「租借雪具」和「購買雪票」這兩件事。因為租借裝備需要時間試穿，旺季時也可能需要排隊。將這些都準備好，才能準時開始上課，確保您的上課時間不被壓縮。如果您不確定要買哪種雪票，可以等見到教練後，聽從他的建議再迅速購買。\n\nQ：沒有裝備可以參加嗎？租借流程怎麼辦？\n\nA：可以參加，但需自行安排裝備租借，課程不含裝備：\n\n* 自行租借：建議提早至雪場附近租借店處理  \n* 教練建議：可先詢問教練推薦的租借店家與流程  \n* 可租借：雪板、雪鞋、頭盔  \n* 建議自備：雪鏡、手套、防摔褲、護膝等（多數店家不提供）  \n* 教學資訊：網站整理部分租借教學與地點可供參考",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "Yes, we strongly recommend that you arrive at the ski resort \"at least 1 hour early\" and complete \"ski equipment rental\" and \"ski ticket purchase\" before the agreed-upon meeting time with your instructor. This is because renting equipment takes time to try on, and during peak season, you may also need to queue. Having all these ready will ensure you can start your lesson on time and that your lesson time is not cut short. If you are unsure which type of ski ticket to buy, you can wait until you meet your instructor and quickly purchase it after hearing their advice.\n\nQ: Can I participate without equipment? What about the rental process?\n\nA: You can participate, but you need to arrange equipment rental yourself, as the course does not include equipment:\n\n*   **Self-rental:** It is recommended to handle rentals at a rental shop near the ski resort in advance.\n*   **Instructor's advice:** You can first ask the instructor for recommended rental shops and procedures.\n*   **Available for rent:** Snowboard, ski boots, helmet.\n*   **Recommended to bring your own:** Goggles, gloves, crash pants, knee pads, etc. (most shops do not provide these).\n*   **Instructional information:** The website provides some rental tutorials and locations for reference.",
          "th": "ใช่ เราขอแนะนำอย่างยิ่งให้คุณมาถึงลานสกี \"อย่างน้อย 1 ชั่วโมงก่อน\" และดำเนินการ \"เช่าอุปกรณ์สกี\" และ \"ซื้อตั๋วสกี\" ให้เสร็จสิ้นก่อนเวลาที่นัดหมายกับโค้ช เนื่องจากต้องใช้เวลาในการลองอุปกรณ์ และอาจต้องรอคิวในช่วงฤดูท่องเที่ยว การเตรียมสิ่งเหล่านี้ให้พร้อมจะช่วยให้คุณเริ่มเรียนได้ตรงเวลาและมั่นใจได้ว่าเวลาเรียนของคุณจะไม่ถูกบีบ หากคุณไม่แน่ใจว่าจะซื้อตั๋วสกีประเภทใด คุณสามารถรอพบโค้ชแล้วทำตามคำแนะนำของเขาเพื่อซื้อได้อย่างรวดเร็ว\n\nถาม: ไม่มีอุปกรณ์สามารถเข้าร่วมได้หรือไม่? ขั้นตอนการเช่าเป็นอย่างไร?\n\nตอบ: สามารถเข้าร่วมได้ แต่คุณต้องจัดการเรื่องการเช่าอุปกรณ์เอง คอร์สเรียนไม่รวมอุปกรณ์:\n\n*   เช่าเอง: แนะนำให้ไปที่ร้านเช่าใกล้ลานสกีก่อนเวลา\n*   คำแนะนำจากโค้ช: สามารถสอบถามโค้ชเพื่อแนะนำร้านเช่าและขั้นตอน\n*   อุปกรณ์ที่เช่าได้: สโนว์บอร์ด, รองเท้าสกี, หมวกกันน็อค\n*   แนะนำให้นำมาเอง: แว่นตาสกี, ถุงมือ, กางเกงกันกระแทก, สนับเข่า ฯลฯ (ร้านส่วนใหญ่ไม่มีให้)\n*   ข้อมูลการสอน: เว็บไซต์ได้รวบรวมข้อมูลการเช่าและสถานที่บางส่วนไว้เพื่อเป็นข้อมูลอ้างอิง"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดอ้างอิงจากระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}",
        "{{LINK_ARTICLES}}"
      ],
      "crm_tags": [
        "#裝備租借"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "On the day of the lesson, should I rent my equipment and buy my lift ticket first, and then meet the instructor?",
        "th": "ในวันเรียน ฉันควรเช่าอุปกรณ์ ซื้อตั๋วสกี แล้วค่อยไปรวมตัวกับโค้ชใช่ไหม"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:27:24.972512+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:27:24.972512+00:00"
        }
      }
    },
    {
      "id": "faq.gear.062",
      "intent": "GEAR",
      "section": "🎒 裝備準備與租借流程",
      "canonical_question": "滑雪裝備有哪些是必備的？可以提供清單嗎？",
      "utterance_patterns": [
        "滑雪裝備有哪些是必備的可以提供清單嗎",
        "滑雪裝備有哪些是必備的能不能提供清單嗎",
        "要帶什麼裝備",
        "裝備清單",
        "需要準備哪些東西",
        "護具有哪些",
        "初學者裝備建議",
        "滑雪裝備有哪些是必備的可不可以提供清單",
        "滑雪裝備有哪些是必備的能否提供清單",
        "滑雪裝備有哪些是必備的可以提供清單",
        "滑雪裝備有哪些是必備的能不能提供清單",
        "滑雪裝備有哪些是必備的？能否提供清單？",
        "滑雪裝備有哪些是必備的？能不能提供清單？",
        "滑雪裝備有哪些是必備的？可以提供清單嗎？",
        "滑雪裝備有哪些是必備的？可不可以提供清單？",
        "滑雪裝備有哪些是必備的？可以提供清單？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "* 可租借：雪板、雪鞋、頭盔  \n* 建議自備：雪鏡、手套、雪衣褲、防摔褲、護膝  \n* 其他準備提醒：機票、護照、交通、雪票與住宿等請提前安排好",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "* Available for rent: snowboard, boots, helmet\n* Recommended to bring your own: goggles, gloves, snow jacket/pants, crash pants, knee pads\n* Other preparation reminders: Please arrange air tickets, passport, transportation, lift tickets, and accommodation in advance.",
          "th": "*   **สามารถเช่าได้:** สโนว์บอร์ด, รองเท้าสกี, หมวกกันน็อค\n*   **แนะนำให้เตรียมมาเอง:** แว่นตาสกี, ถุงมือ, ชุดสกี (เสื้อและกางเกงสกี), กางเกงกันกระแทก, สนับเข่า\n*   **การเตรียมตัวอื่นๆ ที่ควรทราบ:** กรุณาจัดเตรียมตั๋วเครื่องบิน, หนังสือเดินทาง, การเดินทาง, ตั๋วขึ้นลิฟต์สกี และที่พักล่วงหน้า"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดอ้างอิงจากระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}",
        "{{LINK_ARTICLES}}"
      ],
      "crm_tags": [
        "#裝備租借"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "What ski equipment is essential? Can you provide a list?",
        "th": "อุปกรณ์เล่นสกีที่จำเป็นมีอะไรบ้าง? ขอรายการได้ไหม?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:29:02.023893+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:29:02.023893+00:00"
        }
      }
    },
    {
      "id": "faq.refund_policy.063",
      "intent": "REFUND_POLICY",
      "section": "退費機制規定",
      "canonical_question": "「如付了訂金後上課當天氣候不佳會如何處理？」",
      "utterance_patterns": [
        "「如付了訂金後上課當天氣候不佳會如何處理」",
        "天氣不好可以退嗎",
        "下雨會上課嗎",
        "雪場關閉會怎麼處理",
        "纜車停駛怎麼辦",
        "不可抗力怎麼計費",
        "氣候不佳退費",
        "天候不佳可以延期嗎",
        "天氣不好可不可以退",
        "天氣不好可以退",
        "天氣不好能否退",
        "天氣不好能不能退",
        "下雨會上課",
        "天候不佳能否延期",
        "天候不佳能不能延期",
        "天候不佳可以延期",
        "天候不佳可不可以延期",
        "「如付了訂金後上課當天氣候不佳會如何處理？」"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH",
        "NO_QUOTE"
      ],
      "answer_template": {
        "text": "以「雪場是否營運」為判斷：若雪場關閉則退費；只要纜車有營運，下雪／下雨／變冷皆屬正常上課。",
        "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
        "links_inline": false,
        "text_translations": {
          "en": "The decision is based on whether the ski resort is open: if the ski resort is closed, a refund will be issued; as long as the cable car is running, classes will proceed as normal in snow, rain, or cold weather.",
          "th": "การตัดสินใจขึ้นอยู่กับว่าลานสกีเปิดหรือไม่: หากลานสกีปิดจะมีการคืนเงินให้ ตราบใดที่กระเช้ายังเปิดให้บริการ การเรียนการสอนจะดำเนินต่อไปตามปกติไม่ว่าจะมีหิมะตก ฝนตก หรืออากาศหนาวเย็น"
        },
        "postscript_translations": {
          "en": "For more information and the latest availability, please refer to the reservation system.",
          "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูตามที่แสดงในระบบการจอง"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#退費規則"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "What happens if the weather is bad on the day of the class after the deposit has been paid?",
        "th": "จะเกิดอะไรขึ้นหากอากาศไม่ดีในวันเรียนหลังจากชำระเงินมัดจำแล้ว?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:31:25.404622+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:31:25.404622+00:00"
        }
      }
    },
    {
      "id": "faq.booking.064",
      "intent": "BOOKING",
      "section": "📅 預約異動與取消",
      "canonical_question": "預約成功後，可以更改日期或時間嗎（改期）？",
      "utterance_patterns": [
        "可以改期嗎",
        "更改上課日期",
        "更改上課時間",
        "變更預約時間",
        "改一下時間",
        "移動到別天",
        "改預約日期",
        "可不可以改期",
        "可以改期",
        "能否改期",
        "能不能改期",
        "預約成功後，能不能更改日期或時間（改期）？",
        "預約成功後，可以更改日期或時間（改期）？",
        "預約成功後，可不可以更改日期或時間（改期）？",
        "預約成功後，能否更改日期或時間（改期）？",
        "預約成功後，可以更改日期或時間嗎（改期）？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "若需更改已確認的日期或時間，請盡快與客服聯繫並提供訂單編號。我們會協調原教練可行時段；若無法配合，將提供其他可行安排或依規定處理。",
        "postscript": "更多資訊以預約系統與訂單頁為準。",
        "links_inline": false,
        "text_translations": {
          "en": "If you need to change a confirmed date or time, please contact customer service as soon as possible and provide your order number. We will coordinate with the original coach for available times; if this is not possible, we will provide other feasible arrangements or handle it according to regulations.",
          "th": "หากต้องการเปลี่ยนแปลงวันหรือเวลาที่ยืนยันแล้ว โปรดติดต่อฝ่ายบริการลูกค้าโดยเร็วที่สุดพร้อมแจ้งหมายเลขคำสั่งซื้อ เราจะประสานงานกับโค้ชเดิมเพื่อหาช่วงเวลาที่เหมาะสม หากไม่สามารถทำได้ เราจะจัดหาทางเลือกอื่นหรือดำเนินการตามระเบียบ"
        },
        "postscript_translations": {
          "en": "More details are subject to the booking system and order page.",
          "th": "ข้อมูลเพิ่มเติมขึ้นอยู่กับระบบการจองและหน้าคำสั่งซื้อ"
        }
      },
      "links": [
        "{{LINK_ORDER_LIST}}",
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#改期",
        "#預約變更"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Can I change the date or time after a successful booking (reschedule)?",
        "th": "หลังจากจองสำเร็จแล้ว สามารถเปลี่ยนวันหรือเวลาได้หรือไม่ (เลื่อนนัด)?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:33:06.200073+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:33:06.200073+00:00"
        }
      }
    },
    {
      "id": "faq.booking.065",
      "intent": "BOOKING",
      "section": "📅 預約異動與取消",
      "canonical_question": "可以更改人數嗎（加人/減人/改人數）？",
      "utterance_patterns": [
        "可以改人數嗎",
        "更改人數",
        "加一位",
        "少一位",
        "加人",
        "減人",
        "換人",
        "人數變動",
        "能否改人數",
        "能不能改人數",
        "可不可以改人數",
        "可以改人數",
        "能不能更改人數（加人/減人/改人數）？",
        "能否更改人數（加人/減人/改人數）？",
        "可以更改人數（加人/減人/改人數）？",
        "可以更改人數嗎（加人/減人/改人數）？",
        "可不可以更改人數（加人/減人/改人數）？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "可提出人數異動申請，我們將視教練負荷與安全評估調整安排。請於訂單頁或來信客服說明欲異動的人數與成員。",
        "postscript": "實際是否可異動以當下教練負荷與政策為準。",
        "links_inline": false,
        "text_translations": {
          "en": "You can submit a request to change the number of people, and we will adjust the arrangement based on the coach's workload and safety assessment. Please specify the number of people and members you wish to change on the order page or by contacting customer service.",
          "th": "สามารถยื่นคำขอเปลี่ยนแปลงจำนวนคนได้ เราจะปรับเปลี่ยนตามภาระงานของโค้ชและการประเมินความปลอดภัย โปรดระบุจำนวนคนและสมาชิกที่ต้องการเปลี่ยนแปลงในหน้าคำสั่งซื้อหรือติดต่อฝ่ายบริการลูกค้า"
        },
        "postscript_translations": {
          "en": "Actual changes are subject to the coach's current workload and policies.",
          "th": "การเปลี่ยนแปลงจริงขึ้นอยู่กับภาระงานและนโยบายของโค้ชในปัจจุบัน"
        }
      },
      "links": [
        "{{LINK_ORDER_LIST}}"
      ],
      "crm_tags": [
        "#改人數",
        "#預約變更"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Can the number of people be changed (adding, reducing, or adjusting the count)?",
        "th": "สามารถเปลี่ยนแปลงจำนวนคนได้ไหม (เพิ่ม/ลด)?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:52:07.931660+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:52:07.931660+00:00"
        }
      }
    },
    {
      "id": "faq.booking.066",
      "intent": "BOOKING",
      "section": "📅 預約異動與取消",
      "canonical_question": "可以取消預約嗎？是否有退費規定？",
      "utterance_patterns": [
        "可以取消預約嗎",
        "如何取消",
        "我要取消",
        "我想取消",
        "可以幫我取消嗎",
        "取消上課",
        "取消課程",
        "取消2/23的課",
        "退訂",
        "退單",
        "取消預約流程",
        "可以取消預約",
        "能不能取消預約",
        "能否取消預約",
        "可不可以取消預約",
        "能否幫我取消",
        "可不可以幫我取消",
        "能不能幫我取消",
        "可以幫我取消",
        "可以取消預約嗎？是否有退費規定？",
        "能不能取消預約？是否有退費規定？",
        "可以取消預約？是否有退費規定？",
        "可不可以取消預約？是否有退費規定？",
        "能否取消預約？是否有退費規定？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH",
        "NO_QUOTE"
      ],
      "answer_template": {
        "text": "可取消預約，依取消時間點與政策計價。請先至訂單頁查看狀態與可用操作；若需協助再來信客服。",
        "postscript": "詳細退費機制請參考退費規定頁。",
        "links_inline": false,
        "text_translations": {
          "en": "Cancellations are permitted, with charges based on the time of cancellation and policy. Please check your order page for status and available actions; if you need assistance, please contact customer service.",
          "th": "สามารถยกเลิกการจองได้ โดยมีค่าธรรมเนียมตามเวลาและนโยบายการยกเลิก กรุณาตรวจสอบสถานะและการดำเนินการที่มีอยู่ในหน้าคำสั่งซื้อของคุณก่อน หากต้องการความช่วยเหลือเพิ่มเติม โปรดติดต่อฝ่ายบริการลูกค้า"
        },
        "postscript_translations": {
          "en": "For detailed refund procedures, please refer to the refund policy page.",
          "th": "สำหรับรายละเอียดกลไกการคืนเงิน โปรดดูหน้าข้อกำหนดการคืนเงิน"
        }
      },
      "links": [
        "{{LINK_ORDER_LIST}}",
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#退費規則"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Can I cancel the appointment? Are there any refund policies?",
        "th": "สามารถยกเลิกการนัดหมายได้หรือไม่? มีนโยบายการคืนเงินหรือไม่?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:57:19.057175+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:57:19.057175+00:00"
        }
      }
    },
    {
      "id": "faq.instructor.067",
      "intent": "INSTRUCTOR",
      "section": "🧑‍🏫 教練資訊與聯繫",
      "canonical_question": "可以指定或推薦教練嗎？怎麼挑選合適的教練？",
      "utterance_patterns": [
        "可以指定教練嗎",
        "可以推薦教練嗎",
        "推薦哪位教練",
        "如何挑選教練",
        "想要指定教練",
        "教練評價",
        "教練風格",
        "想知道教練資訊",
        "可不可以指定教練",
        "能否指定教練",
        "能不能指定教練",
        "可以指定教練",
        "可以推薦教練",
        "能不能推薦教練",
        "可不可以推薦教練",
        "能否推薦教練",
        "能不能指定或推薦教練？怎麼挑選合適的教練？",
        "可以指定或推薦教練？怎麼挑選合適的教練？",
        "可以指定或推薦教練嗎？怎麼挑選合適的教練？",
        "能否指定或推薦教練？怎麼挑選合適的教練？",
        "可不可以指定或推薦教練？怎麼挑選合適的教練？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "可以於預約系統指定教練，或依滑雪程度與偏好挑選。建議先瀏覽教練列表與介紹頁，包含證照、風格與可授課時段。",
        "postscript": "熱門教練建議提早預約。",
        "links_inline": false,
        "text_translations": {
          "en": "You can specify a coach in the reservation system, or choose according to your skiing level and preferences. It is recommended to browse the coach list and introduction page first, which includes certifications, styles, and available teaching times.",
          "th": "คุณสามารถระบุผู้สอนในระบบการจอง หรือเลือกตามระดับการเล่นสกีและความชอบของคุณ ขอแนะนำให้เรียกดูรายชื่อผู้สอนและหน้าแนะนำ ซึ่งรวมถึงใบรับรอง สไตล์ และช่วงเวลาที่สามารถสอนได้"
        },
        "postscript_translations": {
          "en": "Popular coaches recommend booking early.",
          "th": "โค้ชยอดนิยมแนะนำให้จองล่วงหน้า"
        }
      },
      "links": [
        "{{LINK_INSTRUCTORS}}",
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#指定教練",
        "#教練資訊"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Can I specify or recommend a coach? How do I choose a suitable coach?",
        "th": "สามารถระบุหรือแนะนำโค้ชได้หรือไม่? จะเลือกโค้ชที่เหมาะสมได้อย่างไร?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:59:57.094910+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T13:59:57.094910+00:00"
        }
      }
    },
    {
      "id": "faq.instructor.068",
      "intent": "INSTRUCTOR",
      "section": "🧑‍🏫 教練資訊與聯繫",
      "canonical_question": "可以事先聯繫教練嗎？如何與教練溝通？",
      "utterance_patterns": [
        "可以事先聯繫教練嗎",
        "如何與教練聯繫",
        "想先跟教練聯絡",
        "可以直接聯絡教練嗎",
        "能不能事先聯繫教練",
        "能否事先聯繫教練",
        "可不可以事先聯繫教練",
        "可以事先聯繫教練",
        "能不能直接聯絡教練",
        "可不可以直接聯絡教練",
        "可以直接聯絡教練",
        "能否直接聯絡教練",
        "能不能事先聯繫教練？如何與教練溝通？",
        "可不可以事先聯繫教練？如何與教練溝通？",
        "能否事先聯繫教練？如何與教練溝通？",
        "可以事先聯繫教練？如何與教練溝通？",
        "可以事先聯繫教練嗎？如何與教練溝通？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "教練通常會於課程前約 7 天主動與您聯繫，確認集合地點與上課細節。若需提前聯絡，請於備註中說明，我們會協助安排。",
        "postscript": "請確保訂單聯絡資訊正確可用。",
        "links_inline": false,
        "text_translations": {
          "en": "The coach will usually contact you proactively about 7 days before the course to confirm the meeting point and class details. If you need to be contacted earlier, please specify in the remarks, and we will assist with the arrangements.",
          "th": "โค้ชจะติดต่อคุณล่วงหน้าประมาณ 7 วันก่อนเริ่มคอร์ส เพื่อยืนยันสถานที่นัดพบและรายละเอียดการเรียน หากต้องการติดต่อล่วงหน้า โปรดระบุในหมายเหตุ เราจะช่วยจัดการให้"
        },
        "postscript_translations": {
          "en": "Please ensure the order contact information is correct and usable.",
          "th": "โปรดตรวจสอบให้แน่ใจว่าข้อมูลติดต่อสำหรับการสั่งซื้อถูกต้องและใช้งานได้"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#教練資訊"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "Can I contact the coach in advance? How do I communicate with the coach?",
        "th": "สามารถติดต่อโค้ชล่วงหน้าได้ไหม? จะสื่อสารกับโค้ชได้อย่างไร?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T14:01:24.082780+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T14:01:24.082780+00:00"
        }
      }
    },
    {
      "id": "faq.kids.069",
      "intent": "KIDS_SAFETY",
      "section": "👶 小朋友滑雪與安全保障",
      "canonical_question": "幾歲可以開始學滑雪？有哪些注意事項？",
      "utterance_patterns": [
        "幾歲可以開始學滑雪",
        "幾歲能學滑雪",
        "小朋友多大可以上課",
        "小孩幾歲開始",
        "幾歲可不可以開始學滑雪",
        "幾歲能不能開始學滑雪",
        "幾歲能否開始學滑雪",
        "小朋友多大可不可以上課",
        "小朋友多大能不能上課",
        "小朋友多大能否上課",
        "幾歲可不可以開始學滑雪？有哪些注意事項？",
        "幾歲能不能開始學滑雪？有哪些注意事項？",
        "幾歲能否開始學滑雪？有哪些注意事項？",
        "幾歲可以開始學滑雪？有哪些注意事項？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "建議 3 歲以上開始，5 歲以下建議安排一對一，提升安全與專注力。若與其他孩童同堂，需有大人熟悉滑雪陪同。",
        "postscript": "實際安排依當日安全與教學評估為準。",
        "links_inline": false,
        "text_translations": {
          "en": "Recommended for ages 3 and up; for children under 5, one-on-one instruction is suggested to enhance safety and focus. If attending with other children, an adult familiar with skiing must accompany them.",
          "th": "แนะนำสำหรับเด็กอายุ 3 ปีขึ้นไป สำหรับเด็กอายุต่ำกว่า 5 ปี แนะนำให้จัดแบบตัวต่อตัวเพื่อเพิ่มความปลอดภัยและสมาธิ หากเรียนรวมกับเด็กคนอื่น ควรมีผู้ใหญ่ที่คุ้นเคยกับการเล่นสกีมาด้วย."
        },
        "postscript_translations": {
          "en": "Actual arrangements are subject to safety and teaching evaluations on the day.",
          "th": "การจัดการจริงขึ้นอยู่กับการประเมินความปลอดภัยและการสอนในวันนั้น"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#兒童安全",
        "#親子同堂詢問"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "At what age can one start learning to ski? What are the precautions?",
        "th": "เริ่มเล่นสกีได้ตั้งแต่อายุเท่าไหร่? และมีข้อควรระวังอะไรบ้าง?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T14:19:22.778204+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T14:19:22.778204+00:00"
        }
      }
    },
    {
      "id": "faq.kids.070",
      "intent": "KIDS_SAFETY",
      "section": "👶 小朋友滑雪與安全保障",
      "canonical_question": "兒童保險內容與限制有哪些？",
      "utterance_patterns": [
        "兒童保險有哪些",
        "保險內容與限制",
        "小孩保險",
        "保險保障",
        "兒童保險內容與限制有哪些？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_INSURANCE_BREAKDOWN",
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "15 歲以下無身故理賠，提供醫療與緊急救援保障。詳細內容請參考保險說明頁。",
        "postscript": "以保單條款與官網說明為準。",
        "links_inline": false,
        "text_translations": {
          "en": "No death benefit for those under 15 years old, providing medical and emergency assistance coverage. Please refer to the insurance policy details page for more information.",
          "th": "ไม่มีการเรียกร้องค่าสินไหมมรณกรรมสำหรับผู้ที่มีอายุต่ำกว่า 15 ปี โดยให้ความคุ้มครองทางการแพทย์และการช่วยเหลือฉุกเฉิน สำหรับรายละเอียด โปรดดูหน้าคำอธิบายกรมธรรม์"
        },
        "postscript_translations": {
          "en": "Subject to the policy terms and conditions and the official website description.",
          "th": "เป็นไปตามข้อกำหนดและเงื่อนไขของกรมธรรม์และคำอธิบายบนเว็บไซต์ทางการ"
        }
      },
      "links": [
        "{{LINK_INSURANCE}}"
      ],
      "crm_tags": [
        "#保險提問"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "What are the coverage and limitations of children's insurance?",
        "th": "เนื้อหาและข้อจำกัดของประกันภัยเด็กมีอะไรบ้าง?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T14:21:23.834884+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T14:21:23.834884+00:00"
        }
      }
    },
    {
      "id": "faq.kids.071",
      "intent": "KIDS_SAFETY",
      "section": "👶 小朋友滑雪與安全保障",
      "canonical_question": "小朋友上課的安全機制有哪些？",
      "utterance_patterns": [
        "小朋友上課安全機制",
        "小孩安全怎麼做",
        "上課安全措施",
        "有什麼安全機制",
        "小朋友上課的安全機制有哪些？"
      ],
      "required_slots": [],
      "policy_flags": [
        "NO_MANUAL_MATCH"
      ],
      "answer_template": {
        "text": "每位教練有帶團人數上限；全程附保險；兒童乘坐纜車時安排大人陪同；教練具備兒童教學經驗。",
        "postscript": "依當日安全為最高原則。",
        "links_inline": false,
        "text_translations": {
          "en": "Each coach has a maximum group size; insurance is included throughout the entire process; adults are arranged to accompany children when riding the cable car; coaches have experience in teaching children.",
          "th": "โค้ชแต่ละคนมีจำนวนผู้เข้าร่วมสูงสุดที่สามารถนำได้; มีประกันภัยตลอดการเดินทาง; จัดให้มีผู้ใหญ่ดูแลเด็กขณะขึ้นกระเช้า; โค้ชมีประสบการณ์ในการสอนเด็ก."
        },
        "postscript_translations": {
          "en": "Safety on the day is the top priority.",
          "th": "ความปลอดภัยในวันนั้นเป็นหลักการสูงสุด"
        }
      },
      "links": [
        "{{LINK_SCHEDULE}}"
      ],
      "crm_tags": [
        "#兒童安全"
      ],
      "metadata": {
        "content_version": 1,
        "source_language": "zh",
        "last_updated": "2025-10-28T07:36:14.070Z"
      },
      "canonical_question_translations": {
        "en": "What are the safety mechanisms for children in class?",
        "th": "กลไกความปลอดภัยสำหรับการเรียนของเด็กๆ มีอะไรบ้าง?"
      },
      "translation_status": {
        "zh": {
          "status": "source",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T07:36:14.070Z"
        },
        "en": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T14:23:47.205243+00:00"
        },
        "th": {
          "status": "complete",
          "last_synced_version": 1,
          "last_updated": "2025-10-28T14:23:47.205243+00:00"
        }
      }
    }
  ]
}