import json
import os

file_path = "/Users/jameschen/Downloads/diyski/crm/03_FAQ與知識庫/zeabur/zeabur_backend/data/faq_kb.phase0a.json"

new_faq_item = {
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
  "keywords": [
    "教練更換",
    "臨時更換",
    "教練資格",
    "國際證照",
    "緊急狀況",
    "替代教練"
  ],
  "answer_template": {
    "text": "我們平台的所有教練都必須持有有效的國際滑雪指導員執照。在極少數情況下，若您預約的教練因緊急狀況無法授課，我們會在第一時間通知您，並安排「同等級或更高等級」的合格教練替代。任何教練的更換，我們都會事先與您溝通並取得您的同意。",
    "postscript": "更多資訊與最新名額，請以預約系統顯示為準。",
    "links_inline": false
  },
  "links": [
    "{{LINK_SCHEDULE}}"
  ],
  "crm_tags": [
    "#教練安排",
    "#課程變更",
    "#教練資格",
    "#緊急應變"
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
    "en": "Will my reserved coach be temporarily replaced? If so, how is the qualification of the new coach guaranteed?",
    "th": "โค้ชที่ฉันจองไว้จะถูกเปลี่ยนกะทันหันหรือไม่? ถ้าเปลี่ยน คุณจะรับประกันคุณสมบัติของโค้ชคนใหม่ได้อย่างไร?"
  },
  "utterance_patterns_translations": {
    "en": [
      "Will my reserved coach be temporarily replaced? If so, how is the qualification of the new coach guaranteed?",
      "Will my reserved coach be temporarily replaced? If so, how is the qualification of the new coach guaranteed?"
    ],
    "th": [
      "โค้ชที่ฉันจองไว้จะถูกเปลี่ยนกะทันหันหรือไม่? ถ้าเปลี่ยน คุณจะรับประกันคุณสมบัติของโค้ชคนใหม่ได้อย่างไร?",
      "โค้ชที่ฉันจองไว้จะถูกเปลี่ยนกะทันหันหรือไม่? ถ้าเปลี่ยน คุณจะรับประกันคุณสมบัติของโค้ชคนใหม่ได้อย่างไร?"
    ]
  },
  "keywords_translations": {
    "en": [
      "Coach change",
      "Temporary replacement",
      "Coach qualification",
      "International certification",
      "Emergency situation",
      "Substitute coach"
    ],
    "th": [
      "การเปลี่ยนโค้ช",
      "การเปลี่ยนชั่วคราว",
      "คุณสมบัติโค้ช",
      "ใบรับรองระหว่างประเทศ",
      "สถานการณ์ฉุกเฉิน",
      "โค้ชสำรอง"
    ]
  },
  "crm_tags_translations": {
    "en": [
      "#CoachArrangement",
      "#CourseChange",
      "#CoachQualification",
      "#EmergencyResponse"
    ],
    "th": [
      "#การจัดโค้ช",
      "#การเปลี่ยนแปลงหลักสูตร",
      "#คุณสมบัติโค้ช",
      "#การรับมือเหตุฉุกเฉิน"
    ]
  },
  "answer_template_translations": {
    "summary_translations": {
      "en": "All coaches on our platform must hold a valid international ski instructor license. In the rare event that your reserved coach is unable to teach due to an emergency, we will notify you immediately and arrange a qualified coach of \"the same or higher level\" as a replacement. For any coach change, we will communicate with you in advance and obtain your consent.",
      "th": "โค้ชทุกคนบนแพลตฟอร์มของเราจะต้องมีใบอนุญาตผู้สอนสกีระหว่างประเทศที่ถูกต้อง ในกรณีที่หายากมาก หากโค้ชที่คุณจองไว้ไม่สามารถสอนได้เนื่องจากเหตุฉุกเฉิน เราจะแจ้งให้คุณทราบทันทีและจัดหาโค้ชที่มีคุณสมบัติเหมาะสมใน \"ระดับเดียวกันหรือสูงกว่า\" มาแทนที่ สำหรับการเปลี่ยนแปลงโค้ชใดๆ เราจะสื่อสารกับคุณล่วงหน้าและได้รับความยินยอมจากคุณ"
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

with open(file_path, 'r+') as f:
    data = json.load(f)
    data['items'].append(new_faq_item)
    f.seek(0)
    json.dump(data, f, indent=2, ensure_ascii=False)