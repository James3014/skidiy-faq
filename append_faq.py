import json

file_path = "/Users/jameschen/Downloads/diyski/crm/03_FAQ與知識庫/zeabur/zeabur_backend/data/faq_kb.phase0a.json"

with open(file_path, 'r') as f:
    data = json.load(f)

new_faq_item = {
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
  "keywords": [
    "最少預約",
    "課程限制",
    "單堂預約",
    "交通成本",
    "時間成本",
    "教練設定"
  ],
  "answer_template": {
    "text": "部分教練，特別是需要從較遠地區移動至該雪場的教練，可能會設定最少課程預約時數，以符合交通與時間成本。這是教練個人的設定，我們平台會尊重教練的開課條件。因此，若您希望預約該教練，建議您能滿足其最低預約要求，或選擇其他沒有此限制的教練。",
    "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
    "links_inline": false
  },
  "links": [
    "{{LINK_SCHEDULE}}"
  ],
  "crm_tags": [
    "#預約規則",
    "#教練政策",
    "#課程費用",
    "#預約限制"
  ],
  "metadata": {
    "content_version": 1,
    "source_language": "zh",
    "last_updated": "2025-11-05T00:00:00.000Z"
  },
  "section_translations": {
    "en": "Coach and Teaching Arrangements",
    "th": "โค้ชและการจัดการเรียนการสอน"
  },
  "canonical_question_translations": {
    "en": "Why do some coaches have a \"minimum N sessions\" booking restriction? Can I book just one session?",
    "th": "ทำไมโค้ชบางคนถึงมีข้อจำกัด 'จองขั้นต่ำ N ครั้ง' ครับ/คะ? ฉันสามารถจองแค่ครั้งเดียวได้ไหม?"
  },
  "utterance_patterns_translations": {
    "en": [
      "Why do some coaches have a minimum booking of N lessons? Can I book just one lesson?",
      "Why do some coaches have a minimum booking of N lessons? Can I book just one lesson?",
      "Why do some coaches have a minimum booking of N lessons? Can I book just one lesson?",
      "Why do some coaches have a minimum booking of N lessons? Can I book just one lesson?",
      "Why do some coaches have a minimum booking of N lessons? Can I book just one lesson?",
      "Why do some coaches have a minimum booking of N lessons? Can I book just one lesson?",
      "Why do some coaches have a minimum booking of N lessons? Can I book just one lesson?",
      "Why do some coaches have a minimum booking of N lessons? Can I book just one lesson?",
      "Why do some coaches have a minimum booking of N lessons? Can I book just one lesson?",
      "Why do some coaches have a minimum booking of N lessons? Can I book just one lesson?",
      "Why do some coaches have a minimum booking of N lessons? Can I book just one lesson?"
    ],
    "th": [
      "ทำไมโค้ชบางคนถึงมีข้อจำกัดการจองขั้นต่ำ N บทเรียน? ฉันสามารถจองเพียงบทเรียนเดียวได้หรือไม่?",
      "ทำไมโค้ชบางคนถึงมีข้อจำกัดการจองขั้นต่ำ N บทเรียน? ฉันสามารถจองเพียงบทเรียนเดียวได้หรือไม่?",
      "ทำไมโค้ชบางคนถึงมีข้อจำกัดการจองขั้นต่ำ N บทเรียน? ฉันสามารถจองเพียงบทเรียนเดียวได้หรือไม่?",
      "ทำไมโค้ชบางคนถึงมีข้อจำกัดการจองขั้นต่ำ N บทเรียน? ฉันสามารถจองเพียงบทเรียนเดียวได้หรือไม่?",
      "ทำไมโค้ชบางคนถึงมีข้อจำกัดการจองขั้นต่ำ N บทเรียน? ฉันสามารถจองเพียงบทเรียนเดียวได้หรือไม่?",
      "ทำไมโค้ชบางคนถึงมีข้อจำกัดการจองขั้นต่ำ N บทเรียน? ฉันสามารถจองเพียงบทเรียนเดียวได้หรือไม่?",
      "ทำไมโค้ชบางคนถึงมีข้อจำกัดการจองขั้นต่ำ N บทเรียน? ฉันสามารถจองเพียงบทเรียนเดียวได้หรือไม่?",
      "ทำไมโค้ชบางคนถึงมีข้อจำกัดการจองขั้นต่ำ N บทเรียน? ฉันสามารถจองเพียงบทเรียนเดียวได้หรือไม่?",
      "ทำไมโค้ชบางคนถึงมีข้อจำกัดการจองขั้นต่ำ N บทเรียน? ฉันสามารถจองเพียงบทเรียนเดียวได้หรือไม่?",
      "ทำไมโค้ชบางคนถึงมีข้อจำกัดการจองขั้นต่ำ N บทเรียน? ฉันสามารถจองเพียงบทเรียนเดียวได้หรือไม่?",
      "ทำไมโค้ชบางคนถึงมีข้อจำกัดการจองขั้นต่ำ N บทเรียน? ฉันสามารถจองเพียงบทเรียนเดียวได้หรือไม่?"
    ]
  },
  "keywords_translations": {
    "en": [
      "Minimum booking",
      "Course restrictions",
      "Single session booking",
      "Transportation cost",
      "Time cost",
      "Coach settings"
    ],
    "th": [
      "การจองขั้นต่ำ",
      "ข้อจำกัดของหลักสูตร",
      "การจองครั้งเดียว",
      "ค่าเดินทาง",
      "ต้นทุนเวลา",
      "การตั้งค่าโค้ช"
    ]
  },
  "crm_tags_translations": {
    "en": [
      "#BookingRules",
      "#CoachPolicy",
      "#CourseFees",
      "#BookingRestrictions"
    ],
    "th": [
      "#กฎการจอง",
      "#นโยบายโค้ช",
      "#ค่าธรรมเนียมหลักสูตร",
      "#ข้อจำกัดการจอง"
    ]
  },
  "answer_template_translations": {
    "summary_translations": {
      "en": "Some coaches, especially those who need to travel from a more distant area to the ski resort, may set a minimum number of lesson hours to cover transportation and time costs. This is a personal setting of the coach, and our platform respects the coach's conditions for offering courses. Therefore, if you wish to book with this coach, we recommend that you meet their minimum booking requirements, or choose another coach who does not have this restriction.",
      "th": "โค้ชบางท่าน โดยเฉพาะผู้ที่ต้องเดินทางมาจากพื้นที่ห่างไกลไปยังสกีรีสอร์ต อาจกำหนดจำนวนชั่วโมงเรียนขั้นต่ำเพื่อครอบคลุมค่าเดินทางและค่าเสียเวลา นี่เป็นการกำหนดส่วนตัวของโค้ช และแพลตฟอร์มของเราเคารพเงื่อนไขการเปิดสอนของโค้ช ดังนั้น หากคุณต้องการจองกับโค้ชท่านนี้ เราขอแนะนำให้คุณปฏิบัติตามข้อกำหนดการจองขั้นต่ำของพวกเขา หรือเลือกโค้ชท่านอื่นที่ไม่มีข้อจำกัดนี้"
    },
    "postscript_translations": {
      "en": "For more information and the latest availability, please refer to the reservation system.",
      "th": "สำหรับข้อมูลเพิ่มเติมและจำนวนที่ว่างล่าสุด โปรดดูที่ระบบการจอง"
    }
  },
  "translation_status": {
    "zh": {
      "status": "complete",
      "translator": "human_reviewed"
    },
    "en": {
      "status": "complete",
      "translator": "human_reviewed"
    },
    "th": {
      "status": "complete",
      "translator": "human_reviewed"
    }
  }
}

data['items'].append(new_faq_item)

with open(file_path, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
