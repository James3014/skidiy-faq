#!/usr/bin/env python3
"""Populate missing faq.general entries from 020-060."""
import json
import pathlib
import re

PHASE_PATH = pathlib.Path('zeabur_backend/data/faq_kb.phase0a.json')

SECTION_TRANSLATIONS = {
    "🏂 教練與教學安排": {"en": "Coach and Lesson Arrangements", "th": "การจัดโค้ชและบทเรียน"},
    "📍 集合地點與交通": {"en": "Meeting Points and Transportation", "th": "จุดนัดพบและการเดินทาง"},
    "🧑‍🏫 教練資訊與教學語言": {"en": "Coach Information and Teaching Languages", "th": "ข้อมูลโค้ชและภาษาที่ใช้สอน"},
    "🧑‍🏫 教練資訊與聯繫": {"en": "Coach Info and Contact", "th": "ข้อมูลและการติดต่อโค้ช"},
    "📅 一般課程預約與安排": {"en": "General Booking and Scheduling", "th": "การจองและจัดตารางทั่วไป"},
    "📅 預約異動與取消": {"en": "Booking Changes and Cancellation", "th": "การเปลี่ยนแปลงและยกเลิกการจอง"},
    "💰 費用與支付方式": {"en": "Pricing and Payment", "th": "ค่าใช้จ่ายและการชำระเงิน"},
    "📱 平台操作與預約流程": {"en": "Platform Use and Reservation Process", "th": "การใช้งานแพลตฟอร์มและขั้นตอนการจอง"},
    "🛟 安全與保險": {"en": "Safety and Insurance", "th": "ความปลอดภัยและประกันภัย"},
    "👶 小朋友滑雪與安全保障": {"en": "Children's Skiing and Safety", "th": "การเล่นสกีของเด็กและความปลอดภัย"},
    "🎒 裝備準備與租借流程": {"en": "Equipment Prep and Rentals", "th": "การเตรียมอุปกรณ์และการเช่า"},
    "退費機制規定": {"en": "Refund Policy Guidelines", "th": "ข้อกำหนดการคืนเงิน"}
}

KEYWORD_ENTRIES = [
    ("久未滑雪", "Haven't skied for a while", "ไม่ได้เล่นสกีมานาน"),
    ("技能不確定", "Unsure about skills", "ไม่แน่ใจในทักษะ"),
    ("初學課", "Beginner class", "คอร์สผู้เริ่มต้น"),
    ("教練評估", "Coach assessment", "การประเมินโดยโค้ช"),
    ("暖身複習", "Refresher warm-up", "การทบทวนและวอร์มอัป"),
    ("進階建議", "Progression advice", "คำแนะนำการต่อยอด"),
    ("集合地點", "Meeting point", "จุดนัดพบ"),
    ("雪場距離", "Distance to the ski resort", "ระยะทางถึงลานสกี"),
    ("交通動線", "Transportation route", "เส้นทางการเดินทาง"),
    ("預約後通知", "Post-booking notification", "การแจ้งเตือนหลังจอง"),
    ("教練確認", "Coach confirmation", "การยืนยันจากโค้ช"),
    ("集合說明", "Meet-up instructions", "คำแนะนำการนัดพบ"),
    ("兒童教學", "Children instruction", "การสอนเด็ก"),
    ("年長者教學", "Senior instruction", "การสอนผู้สูงอายุ"),
    ("學習步調", "Learning pace", "จังหวะการเรียนรู้"),
    ("分開上課", "Separate lessons", "แยกเรียน"),
    ("教學品質", "Teaching quality", "คุณภาพการสอน"),
    ("經驗豐富", "Rich experience", "มีประสบการณ์สูง"),
    ("中文授課", "Chinese instruction", "การสอนภาษาจีน"),
    ("英文授課", "English instruction", "การสอนภาษาอังกฤษ"),
    ("廣東話授課", "Cantonese instruction", "การสอนภาษากวางตุ้ง"),
    ("泰文服務", "Thai support", "บริการภาษาไทย"),
    ("語言能力", "Language capability", "ความสามารถด้านภาษา"),
    ("多語教練", "Multilingual coaches", "โค้ชหลายภาษา"),
    ("程度評估", "Level assessment", "การประเมินระดับ"),
    ("教練配對", "Coach matching", "การจับคู่โค้ช"),
    ("場地調整", "Slope selection", "การปรับเลือกพื้นที่"),
    ("教學履歷", "Teaching resume", "ประวัติการสอน"),
    ("教練介紹", "Coach profile", "โปรไฟล์โค้ช"),
    ("學習目標", "Learning goals", "เป้าหมายการเรียน"),
    ("指定教練", "Designated coach", "เลือกโค้ชเฉพาะ"),
    ("熱門時段", "Peak times", "ช่วงเวลายอดนิยม"),
    ("提早預約", "Book early", "จองล่วงหน้า"),
    ("系統安排", "System assignment", "ระบบจัดสรร"),
    ("教練偏好", "Coach preference", "ความชอบโค้ช"),
    ("預約策略", "Booking strategy", "กลยุทธ์การจอง"),
    ("課前聯繫", "Pre-class contact", "การติดต่อก่อนคอร์ส"),
    ("教練主動聯絡", "Coach reaches out", "โค้ชเป็นผู้ติดต่อก่อน"),
    ("提前需求", "Advance request", "ความต้องการล่วงหน้า"),
    ("備註留言", "Reservation note", "โน้ตในคำสั่งจอง"),
    ("聯繫時程", "Contact timeline", "กำหนดเวลาติดต่อ"),
    ("客服協助", "Customer support", "การช่วยเหลือจาก客服"),
    ("通知信", "Notification email", "อีเมลแจ้งเตือน"),
    ("主要聯絡方式", "Primary contact method", "ช่องทางติดต่อหลัก"),
    ("Email正確", "Correct email", "อีเมลถูกต้อง"),
    ("集合確認", "Meet-up confirmation", "ยืนยันการนัดพบ"),
    ("預約成功", "Successful booking", "จองสำเร็จ"),
    ("聯繫資訊", "Contact information", "ข้อมูลติดต่อ"),
    ("教練介紹頁", "Coach profile page", "หน้าโปรไฟล์โค้ช"),
    ("理念風格", "Teaching philosophy", "ปรัชญาการสอน"),
    ("照片影片", "Photos and videos", "ภาพและวิดีโอ"),
    ("社團評價", "Community reviews", "รีวิวในชุมชน"),
    ("學員心得", "Student feedback", "ประสบการณ์ผู้เรียน"),
    ("教學影片", "Teaching videos", "วิดีโอการสอน"),
    ("課程項目變更", "Change lesson type", "เปลี่ยนประเภทคอร์ส"),
    ("雙板單板", "Ski vs snowboard", "สกีกับสโนว์บอร์ด"),
    ("教練資格", "Coach qualification", "คุณสมบัติโค้ช"),
    ("提前通知", "Notify early", "แจ้งล่วงหน้า"),
    ("替代方案", "Alternative option", "ทางเลือกทดแทน"),
    ("改期需求", "Reschedule request", "คำขอเลื่อนวัน"),
    ("更改時間", "Change time", "เปลี่ยนเวลา"),
    ("教練空檔", "Coach availability", "ช่วงว่างของโค้ช"),
    ("取消政策", "Cancellation policy", "นโยบายการยกเลิก"),
    ("重新安排", "Reschedule", "จัดเวลาใหม่"),
    ("堂數調整", "Adjust lesson count", "ปรับจำนวนคาบ"),
    ("人數調整", "Adjust participant count", "ปรับจำนวนผู้เรียน"),
    ("費用重算", "Recalculate fees", "คำนวณค่าใช้จ่ายใหม่"),
    ("訂單系統", "Order system", "ระบบคำสั่งซื้อ"),
    ("取消重訂", "Cancel and rebook", "ยกเลิกแล้วจองใหม่"),
    ("臨時加人", "Add participants last minute", "เพิ่มผู้เรียนกะทันหัน"),
    ("保險資料", "Insurance information", "ข้อมูลประกัน"),
    ("名單更新", "Roster update", "อัปเดตรายชื่อ"),
    ("學員增加", "More students", "เพิ่มนักเรียน"),
    ("課程訂單", "Course order", "คำสั่งซื้อคอร์ส"),
    ("保險生效", "Insurance activation", "การมีผลของประกัน"),
    ("兒童課程", "Children's lessons", "หลักสูตรสำหรับเด็ก"),
    ("年齡限制", "Age requirement", "ข้อจำกัดด้านอายุ"),
    ("一對一教學", "One-on-one instruction", "การสอนแบบตัวต่อตัว"),
    ("兒童安全", "Child safety", "ความปลอดภัยของเด็ก"),
    ("最低預約堂數", "Minimum required lessons", "จำนวนคลาสขั้นต่ำ"),
    ("教練行程成本", "Coach travel cost", "ต้นทุนการเดินทางของโค้ช"),
    ("跨區教練", "Coach traveling from another area", "โค้ชที่เดินทางจากพื้นที่อื่น"),
    ("課程連續安排", "Consecutive lesson planning", "การจัดบทเรียนต่อเนื่อง"),
    ("改選其他教練", "Switch to another coach", "เปลี่ยนไปเลือกโค้ชคนอื่น"),
    ("預約靈活性", "Booking flexibility", "ความยืดหยุ่นในการจอง"),
    ("穿脫裝備", "Putting on and taking off gear", "การใส่และถอดอุปกรณ์"),
    ("基礎姿勢", "Basic stance", "ท่ายืนพื้นฐาน"),
    ("平地行走", "Walking on flat ground", "การเดินบนพื้นราบ"),
    ("跌倒站起", "Falling and getting up", "การล้มและลุกขึ้น"),
    ("轉彎技巧", "Turning techniques", "เทคนิคการเลี้ยว"),
    ("煞車技巧", "Braking techniques", "เทคนิคการเบรก"),
    ("因材施教", "Personalized instruction", "การสอนตามระดับผู้เรียน"),
    ("課程內容", "Course content", "เนื้อหาคอร์ส"),
    ("國際滑雪證照", "International ski certification", "ใบรับรองสกีระดับนานาชาติ"),
    ("證照升級", "Certification upgrade", "การยกระดับใบอนุญาต"),
    ("Level 2 考試", "Level 2 exam", "การสอบ Level 2"),
    ("Level 3 考試", "Level 3 exam", "การสอบ Level 3"),
    ("NZSIA", "NZSIA", "NZSIA"),
    ("CASI", "CASI", "CASI"),
    ("PSIA", "PSIA", "PSIA"),
    ("安全考量", "Safety considerations", "ข้อควรพิจารณาด้านความปลอดภัย"),
    ("最晚修改", "Latest change deadline", "กำหนดสุดท้ายในการแก้ไข"),
    ("前一天變更", "Change one day prior", "แก้ไขก่อนหนึ่งวัน"),
    ("當天處理", "Same-day handling", "จัดการในวันเดียวกัน"),
    ("後台操作", "Back-office update", "การดำเนินการหลังบ้าน"),
    ("預約成立", "Reservation confirmed", "การจองมีผล"),
    ("通知信件", "Notification letter", "จดหมายแจ้งเตือน"),
    ("改派機制", "Reassignment process", "กระบวนการเปลี่ยนโค้ช"),
    ("等待時間", "Waiting time", "เวลารอ"),
    ("預約人數", "Booked headcount", "จำนวนผู้เรียนที่จอง"),
    ("提前抵達", "Arrive early", "ไปถึงล่วงหน้า"),
    ("租借雪具", "Rent ski equipment", "เช่าอุปกรณ์สกี"),
    ("購買雪票", "Buy lift tickets", "ซื้อตั๋วกระเช้า"),
    ("排隊時間", "Queue time", "เวลาต่อคิว"),
    ("準時集合", "Meet on time", "รวมตัวตรงเวลา"),
    ("裝備自理", "Self-arranged gear", "จัดหาอุปกรณ์เอง"),
    ("可租借項目", "Items available for rental", "อุปกรณ์ที่เช่าได้"),
    ("自備裝備", "Bring your own gear", "เตรียมอุปกรณ์เอง"),
    ("安全護具", "Protective gear", "อุปกรณ์ป้องกัน"),
    ("裝備清單", "Gear checklist", "รายการอุปกรณ์"),
    ("旅遊準備", "Travel preparation", "การเตรียมการเดินทาง"),
    ("基本配件", "Essential accessories", "อุปกรณ์เสริมพื้นฐาน"),
    ("氣候影響", "Weather impact", "ผลกระทบจากสภาพอากาศ"),
    ("雪場營運", "Resort operations", "การเปิดดำเนินการของลานสกี"),
    ("應變機制", "Contingency mechanism", "กลไกรองรับเหตุฉุกเฉิน"),
    ("取消退費", "Cancel and refund", "ยกเลิกและขอเงินคืน"),
    ("現場加人", "Add on-site", "เพิ่มผู้เรียนหน้างาน"),
    ("保險安排", "Insurance arrangement", "การจัดประกัน"),
    ("費用試算", "Cost estimator", "การคำนวณค่าใช้จ่าย"),
    ("折扣方案", "Discount option", "แผนส่วนลด"),
    ("家長陪同", "Parent accompaniment", "ผู้ปกครองร่วมดูแล"),
    ("帶手機", "Bring phone", "นำโทรศัพท์ไป"),
    ("教練拍照", "Coach takes photos", "โค้ชช่วยถ่ายรูป"),
    ("課程紀錄", "Lesson records", "บันทึกบทเรียน"),
    ("安全提醒", "Safety reminder", "การเตือนด้านความปลอดภัย"),
    ("行動裝置", "Mobile devices", "อุปกรณ์พกพา"),
    ("拍照需求", "Photo requests", "ความต้องการถ่ายภาพ"),
    ("上下纜車", "Riding lifts", "ขึ้นลงกระเช้า"),
    ("第一天課程", "Day-one lesson", "บทเรียนวันแรก"),
    ("現場評估", "On-site assessment", "ประเมินหน้างาน"),
    ("單次雪票", "Single-ride lift ticket", "ตั๋วกอนโดลารอบเดียว"),
    ("彈性安排", "Flexible arrangement", "การจัดการแบบยืดหยุ่น"),
    ("進度調整", "Adjust based on progress", "ปรับตามความก้าวหน้า"),
    ("申請開課", "Apply to open class", "ยื่นขอเปิดคลาส"),
    ("最低堂數", "Minimum lessons", "จำนวนคาบขั้นต่ำ"),
    ("外站教練", "Coach traveling from another resort", "โค้ชต่างพื้นที่"),
    ("訂金規則", "Deposit policy", "กฎเงินมัดจำ"),
    ("退費政策", "Refund policy", "นโยบายคืนเงิน"),
    ("課程費用", "Lesson fees", "ค่าเรียน"),
    ("保險包含", "Insurance included", "รวมประกัน"),
    ("雪具租借", "Gear rental", "เช่าอุปกรณ์"),
    ("纜車票", "Lift tickets", "ตั๋วกระเช้า"),
    ("學生優惠", "Student discounts", "ส่วนลดนักเรียน"),
    ("自理項目", "Self-covered items", "รายการที่ต้องรับผิดชอบเอง"),
    ("訂金支付", "Deposit payment", "การชำระเงินมัดจำ"),
    ("尾款現金", "Balance in cash", "ชำระยอดที่เหลือเป็นเงินสด"),
    ("刷卡訂金", "Deposit by card", "มัดจำผ่านบัตร"),
    ("日幣結算", "Pay in Japanese yen", "ชำระเป็นเงินเยน"),
    ("付款流程", "Payment process", "ขั้นตอนการชำระ"),
    ("臨時取消", "Last-minute cancellation", "ยกเลิกกะทันหัน"),
    ("退費比例", "Refund ratio", "อัตราการคืนเงิน"),
    ("刷卡手續費", "Card processing fee", "ค่าธรรมเนียมรูดบัตร"),
    ("延期方案", "Postponement option", "ทางเลือกเลื่อนเวลา"),
    ("特殊情況", "Special cases", "กรณีพิเศษ"),
    ("指定費", "Designation fee", "ค่าจองโค้ชเฉพาะ"),
    ("證照等級", "Certification level", "ระดับใบอนุญาต"),
    ("加價規則", "Premium rules", "กติกาการเพิ่มราคา"),
    ("收費透明", "Transparent pricing", "การคิดราคาชัดเจน"),
    ("時段滿檔", "Fully booked slots", "ช่วงเวลาถูกจองเต็ม"),
    ("即時系統", "Real-time system", "ระบบเรียลไทม์"),
    ("旺季預約", "Peak-season booking", "การจองช่วงไฮซีซัน"),
    ("提前規劃", "Plan ahead", "วางแผนล่วงหน้า"),
    ("調整日期", "Adjust travel dates", "ปรับวันเดินทาง"),
    ("搜尋其他雪場", "Search other resorts", "หาลานสกีอื่น"),
    ("付款連結", "Payment link", "ลิงก์ชำระเงิน"),
    ("超時取消", "Timeout cancellation", "ยกเลิกเพราะหมดเวลา"),
    ("重新預約", "Book again", "จองใหม่"),
    ("保留時段", "Hold the slot", "รักษาช่วงเวลาที่จอง"),
    ("未完成付款", "Unfinished payment", "ชำระเงินไม่เสร็จ"),
    ("Email驗證", "Email verification", "การยืนยันอีเมล"),
    ("垃圾郵件", "Spam folder", "โฟลเดอร์สแปม"),
    ("忘記密碼", "Forgot password", "ลืมรหัสผ่าน"),
    ("帳號註冊", "Account registration", "การลงทะเบียนบัญชี"),
    ("客服查詢", "Contact support", "สอบถามฝ่ายบริการ"),
    ("預約流程", "Reservation flow", "ขั้นตอนการจอง"),
    ("保險提醒", "Insurance reminder", "การแจ้งเตือนเรื่องประกัน"),
    ("步驟說明", "Step-by-step guide", "คำอธิบายทีละขั้น"),
    ("平台操作", "Platform operation", "วิธีใช้แพลตฟอร์ม"),
    ("電子郵件登入", "Email login", "เข้าสู่ระบบด้วยอีเมล"),
    ("第三方登入", "Third-party login", "เข้าสู่ระบบผ่านบัญชีอื่น"),
    ("登入方式", "Login method", "วิธีเข้าสู่ระบบ"),
    ("預約系統", "Booking system", "ระบบการจอง"),
    ("教練篩選", "Coach filters", "ตัวกรองโค้ช"),
    ("課程項目", "Lesson options", "ตัวเลือกคอร์ส"),
    ("授課地點", "Teaching location", "สถานที่สอน"),
    ("搜尋條件", "Search criteria", "เงื่อนไขการค้นหา"),
    ("教練回覆", "Coach response", "คำตอบจากโค้ช"),
    ("資格限制", "Eligibility requirement", "ข้อจำกัดด้านคุณสมบัติ"),
    ("提醒機制", "Reminder system", "ระบบแจ้งเตือน"),
    ("裝備準備", "Gear preparation", "การเตรียมอุปกรณ์"),
    ("集合資訊", "Meeting info", "ข้อมูลการนัดพบ"),
    ("導航定位", "Navigation guidance", "การนำทาง"),
    ("纜車陪同", "Lift escort", "มีผู้ใหญ่ประกบขึ้นกระเช้า"),
    ("教練聯繫", "Coach contact", "ติดต่อโค้ช"),
    ("再次確認", "Reconfirm", "ยืนยันอีกครั้ง"),
    ("雪場差異", "Resort differences", "ความแตกต่างของลานสกี"),
    ("課程保險", "Lesson insurance", "ประกันคอร์ส"),
    ("保障項目", "Coverage items", "รายการความคุ้มครอง"),
    ("富邦專案", "Fubon plan", "โครงการ Fubon"),
    ("有效期間", "Validity period", "ระยะเวลาคุ้มครอง"),
    ("金額上限", "Coverage limit", "วงเงินคุ้มครอง"),
    ("緊急救援", "Emergency assistance", "การช่วยเหลือฉุกเฉิน"),
    ("保險強制", "Mandatory insurance", "ประกันบังคับ"),
    ("旅遊平安險", "Travel accident insurance", "ประกันอุบัติเหตุท่องเที่ยว"),
    ("重複投保", "Duplicate coverage", "การทำประกันซ้ำ"),
    ("不可退費", "Non-refundable", "ไม่สามารถคืนเงิน"),
    ("保單寄送", "Policy delivery", "การส่งกรมธรรม์"),
    ("訂單填寫", "Order form", "การกรอกข้อมูลในคำสั่งซื้อ"),
    ("表單連結", "Form link", "ลิงก์ฟอร์ม"),
    ("填寫狀態", "Submission status", "สถานะการกรอก"),
    ("上課前一週", "One week before class", "ก่อนเริ่มคลาสหนึ่งสัปดาห์"),
    ("受傷處理", "Injury handling", "การจัดการเมื่อบาดเจ็บ"),
    ("理賠文件", "Claim documents", "เอกสารเรียกร้องค่าสินไหม"),
    ("保險窗口", "Insurance contact", "ช่องทางติดต่อประกัน"),
    ("海外診斷書", "Overseas medical certificate", "ใบรับรองแพทย์จากต่างประเทศ"),
    ("醫療收據", "Medical receipts", "ใบเสร็จค่ารักษา"),
    ("出入境證明", "Immigration proof", "หลักฐานเข้าออกประเทศ"),
    ("理賠流程", "Claim process", "ขั้นตอนการเรียกร้องค่าสินไหม"),
    ("受傷退課", "Withdraw due to injury", "ยกเลิกคอร์สเพราะบาดเจ็บ"),
    ("診斷證明", "Medical proof", "ใบรับรองแพทย์"),
    ("退款流程", "Refund process", "ขั้นตอนการคืนเงิน"),
    ("保險費", "Insurance fee", "ค่าประกัน"),
    ("手續費", "Processing fee", "ค่าดำเนินการ"),
    ("無法上課", "Unable to attend", "ไม่สามารถเข้าเรียน"),
    ("兒童保險", "Children's insurance", "ประกันสำหรับเด็ก"),
    ("未滿15歲", "Under 15", "อายุต่ำกว่า 15 ปี"),
    ("身故除外", "No death benefit", "ไม่คุ้มครองกรณีเสียชีวิต"),
    ("給付差異", "Benefit differences", "ความต่างของเงินชดเชย"),
    ("保障內容", "Coverage details", "รายละเอียดความคุ้มครอง"),
    ("保險說明", "Insurance details", "คำอธิบายประกัน"),
    ("海外就醫", "Overseas medical visit", "การรักษาพยาบาลในต่างประเทศ"),
    ("原文收據", "Original receipts", "ใบเสร็จต้นฉบับ"),
    ("診斷書", "Medical certificate", "ใบรับรองแพทย์"),
    ("健保核退", "NHI reimbursement", "เอกสารเบิกจากประกันสุขภาพ"),
    ("補件文件", "Supplementary documents", "เอกสารเพิ่มเติม"),
    ("帶團人數", "Group size limit", "จำนวนผู้ร่วมกลุ่มสูงสุด"),
    ("安全機制", "Safety mechanisms", "กลไกความปลอดภัย"),
    ("教練經驗", "Coach experience", "ประสบการณ์ของโค้ช"),
    ("專案保障", "Program coverage", "ความคุ้มครองของโครงการ"),
    ("教練收款", "Coach collects payment", "โค้ชเป็นผู้รับเงิน"),
    ("現場支付", "Pay on-site", "จ่ายหน้างาน"),
    ("線上刷卡", "Pay by card online", "ชำระผ่านบัตรออนไลน์"),
    ("訂單查詢", "Order lookup", "ตรวจสอบคำสั่งซื้อ"),
    ("訂金平台收取", "Deposit handled by platform", "แพลตฟอร์มรับเงินมัดจำ"),
    ("課程內容", "Lesson content", "เนื้อหาคอร์ส"),
    ("教練聯繫", "Coach contact", "ติดต่อโค้ช"),
    ("再次確認", "Reconfirm", "ยืนยันอีกครั้ง")
]

KEYWORD_TRANSLATIONS = {zh: {"en": en, "th": th} for zh, en, th in KEYWORD_ENTRIES}

CRM_TAGS = {
    "#行程規劃": ("#ItineraryPlanning", "#การวางแผนเส้นทาง"),
    "#預約流程": ("#ReservationProcess", "#ขั้นตอนการจอง"),
    "#教練選擇": ("#CoachSelection", "#การเลือกโค้ช"),
    "#客服管道": ("#CustomerServiceChannels", "#ช่องทางการบริการลูกค้า"),
    "#課程安排": ("#CourseSchedule", "#การจัดตารางเรียน"),
    "#親子同堂": ("#FamilyLearning", "#กิจกรรมครอบครัว"),
    "#課程人數": ("#CourseEnrollment", "#จำนวนผู้เรียน"),
    "#教學安排": ("#Teaching Arrangement", "#การจัดเตรียมการสอน"),
    "#兒童課程": ("#ChildrensCourses", "#หลักสูตรสำหรับเด็ก"),
    "#安全考量": ("#Safety Considerations", "#ข้อควรพิจารณาด้านความปลอดภัย"),
    "#兒童安全": ("#ChildSafety", "#ความปลอดภัยของเด็ก"),
    "#滑雪保險": ("#SkiInsurance", "#ประกันภัยการเล่นสกี"),
    "#兒童保險": ("#ChildrensInsurance", "#ประกันเด็ก"),
    "#滑雪準備": ("#SkiPreparation", "#เตรียมเล่นสกี"),
    "#家長參與": ("#ParentalInvolvement", "#การมีส่วนร่วมของผู้ปกครอง"),
    "#課程變更": ("#CourseChange", "#การเปลี่ยนแปลงหลักสูตร"),
    "#教練資格": ("#CoachQualification", "#คุณสมบัติโค้ช")
}

CONFIGS = [
    {"id": "faq.general.017", "keywords": ["最低預約堂數","教練行程成本","跨區教練","課程連續安排","改選其他教練","預約靈活性"], "tags": ["#預約流程","#課程安排","#教練選擇"]},
    {"id": "faq.general.019", "keywords": ["穿脫裝備","基礎姿勢","平地行走","跌倒站起","轉彎技巧","煞車技巧","因材施教","課程內容"], "tags": ["#教學安排","#課程安排"]},
    {"id": "faq.general.020", "keywords": ["久未滑雪","技能不確定","初學課","教練評估","暖身複習","進階建議"], "tags": ["#教學安排","#課程安排"]},
    {"id": "faq.general.021", "keywords": ["集合地點","雪場距離","交通動線","預約後通知","教練確認","集合說明"], "tags": ["#行程規劃","#客服管道"]},
    {"id": "faq.general.023", "keywords": ["兒童教學","年長者教學","學習步調","分開上課","教學品質","經驗豐富"], "tags": ["#兒童課程","#教學安排"]},
    {"id": "faq.general.024", "keywords": ["中文授課","英文授課","廣東話授課","泰文服務","語言能力","多語教練"], "tags": ["#教練選擇","#教學安排"]},
    {"id": "faq.general.025", "keywords": ["程度評估","教練配對","場地調整","教學履歷","教練介紹","學習目標"], "tags": ["#教練選擇","#教練資格"]},
    {"id": "faq.general.026", "keywords": ["指定教練","熱門時段","提早預約","系統安排","教練偏好","預約策略"], "tags": ["#教練選擇","#預約流程"]},
    {"id": "faq.general.027", "keywords": ["課前聯繫","教練主動聯絡","提前需求","備註留言","聯繫時程","客服協助"], "tags": ["#預約流程","#教學安排"]},
    {"id": "faq.general.028", "keywords": ["通知信","主要聯絡方式","Email正確","集合確認","預約成功","聯繫資訊"], "tags": ["#預約流程","#客服管道"]},
    {"id": "faq.general.029", "keywords": ["教練介紹頁","理念風格","照片影片","社團評價","學員心得","教學影片"], "tags": ["#教練選擇","#教學安排"]},
    {"id": "faq.general.030", "keywords": ["課程項目變更","雙板單板","客服協助","教練資格","提前通知","替代方案"], "tags": ["#課程安排","#課程變更"]},
    {"id": "faq.general.031", "keywords": ["改期需求","更改時間","客服協助","教練空檔","取消政策","重新安排"], "tags": ["#課程安排","#課程變更"]},
    {"id": "faq.general.032", "keywords": ["堂數調整","人數調整","費用重算","訂單系統","取消重訂","客服協助"], "tags": ["#課程安排","#課程變更"]},
    {"id": "faq.general.033", "keywords": ["臨時加人","保險資料","名單更新","學員增加","課程訂單","保險生效"], "tags": ["#課程人數","#課程變更"]},
    {"id": "faq.general.034", "keywords": ["最晚修改","前一天變更","當天處理","後台操作","教練確認","人數調整"], "tags": ["#課程人數","#課程變更"]},
    {"id": "faq.general.035", "keywords": ["預約成立","通知信件","教練確認","改派機制","等待時間","預約成功"], "tags": ["#預約流程","#課程安排"]},
    {"id": "faq.general.036", "keywords": ["現場加人","預約人數","保險安排","費用試算","折扣方案","臨時加人"], "tags": ["#課程人數","#課程安排"]},
    {"id": "faq.general.037", "keywords": ["帶手機","教練拍照","課程紀錄","安全提醒","行動裝置","拍照需求"], "tags": ["#教學安排","#家長參與"]},
    {"id": "faq.general.038", "keywords": ["上下纜車","第一天課程","現場評估","單次雪票","彈性安排","進度調整"], "tags": ["#教學安排","#課程安排"]},
    {"id": "faq.general.039", "keywords": ["申請開課","最低堂數","外站教練","訂金規則","改派機制","退費政策"], "tags": ["#預約流程","#課程安排"]},
    {"id": "faq.general.040", "keywords": ["課程費用","保險包含","雪具租借","纜車票","學生優惠","自理項目"], "tags": ["#課程安排","#滑雪保險"]},
    {"id": "faq.general.041", "keywords": ["訂金支付","尾款現金","刷卡訂金","日幣結算","付款流程","預約成功"], "tags": ["#預約流程","#課程安排"]},
    {"id": "faq.general.042", "keywords": ["臨時取消","退費比例","刷卡手續費","延期方案","特殊情況","退費政策"], "tags": ["#預約流程","#課程變更"]},
    {"id": "faq.general.043", "keywords": ["訂金平台收取","尾款現金","付款流程","線上刷卡","現場支付","教練收款"], "tags": ["#預約流程","#課程安排"]},
    {"id": "faq.general.044", "keywords": ["指定費","證照等級","加價規則","系統安排","教練介紹","收費透明"], "tags": ["#教練選擇","#教練資格"]},
    {"id": "faq.general.045", "keywords": ["時段滿檔","即時系統","旺季預約","提前規劃","調整日期","搜尋其他雪場"], "tags": ["#行程規劃","#預約流程"]},
    {"id": "faq.general.046", "keywords": ["付款連結","超時取消","重新預約","保留時段","未完成付款","即時系統"], "tags": ["#預約流程","#客服管道"]},
    {"id": "faq.general.047", "keywords": ["Email驗證","垃圾郵件","忘記密碼","帳號註冊","客服查詢","預約流程"], "tags": ["#客服管道","#預約流程"]},
    {"id": "faq.general.048", "keywords": ["預約流程","申請開課","通知信","保險提醒","步驟說明","平台操作"], "tags": ["#預約流程","#課程安排"]},
    {"id": "faq.general.049", "keywords": ["帳號註冊","電子郵件登入","第三方登入","登入方式","預約系統","客服協助"], "tags": ["#預約流程","#客服管道"]},
    {"id": "faq.general.050", "keywords": ["教練篩選","課程項目","授課地點","搜尋條件","教練介紹","預約系統"], "tags": ["#教練選擇","#預約流程"]},
    {"id": "faq.general.051", "keywords": ["預約成立","教練回覆","申請開課","改派機制","取消退費","資格限制"], "tags": ["#預約流程","#課程安排"]},
    {"id": "faq.general.052", "keywords": ["通知信件","保險提醒","訂單查詢","裝備準備","提醒機制","預約成功"], "tags": ["#預約流程","#教學安排"]},
    {"id": "faq.general.053", "keywords": ["集合資訊","導航定位","教練聯繫","客服協助","雪場差異","再次確認"], "tags": ["#行程規劃","#客服管道"]},
    {"id": "faq.general.054", "keywords": ["課程保險","保障項目","富邦專案","有效期間","金額上限","緊急救援"], "tags": ["#滑雪保險","#安全考量"]},
    {"id": "faq.general.055", "keywords": ["保險強制","旅遊平安險","重複投保","不可退費","專案保障","課程內容"], "tags": ["#滑雪保險","#課程安排"]},
    {"id": "faq.general.056", "keywords": ["保單寄送","訂單填寫","表單連結","填寫狀態","上課前一週","保險提醒"], "tags": ["#滑雪保險","#預約流程"]},
    {"id": "faq.general.057", "keywords": ["受傷處理","理賠文件","保險窗口","海外診斷書","醫療收據","出入境證明"], "tags": ["#滑雪保險","#安全考量"]},
    {"id": "faq.general.058", "keywords": ["受傷退課","診斷證明","退款流程","保險費","手續費","無法上課"], "tags": ["#滑雪保險","#課程變更"]},
    {"id": "faq.general.059", "keywords": ["兒童保險","未滿15歲","身故除外","給付差異","保障內容","保險說明"], "tags": ["#兒童保險","#兒童安全"]},
    {"id": "faq.general.060", "keywords": ["海外就醫","理賠流程","原文收據","診斷書","健保核退","補件文件"], "tags": ["#滑雪保險","#安全考量"]},
    {"id": "faq.general.022", "keywords": ["國際滑雪證照","教練資格","NZSIA","CASI","PSIA","證照升級","Level 2 考試","Level 3 考試"], "tags": ["#教練資格","#教學安排"]},
    {"id": "faq.gear.061", "keywords": ["提前抵達","租借雪具","購買雪票","排隊時間","準時集合","裝備自理"], "tags": ["#滑雪準備","#課程安排"]},
    {"id": "faq.gear.062", "keywords": ["可租借項目","自備裝備","安全護具","裝備清單","旅遊準備","基本配件"], "tags": ["#滑雪準備","#課程安排"]},
    {"id": "faq.refund_policy.063", "keywords": ["氣候影響","雪場營運","退費政策","取消政策","應變機制","安全考量"], "tags": ["#課程變更","#安全考量"]},
    {"id": "faq.booking.064", "keywords": ["改期需求","客服協助","教練空檔","預約流程","重新安排","訂單系統"], "tags": ["#預約流程","#課程變更"]},
    {"id": "faq.booking.065", "keywords": ["人數調整","學員增加","臨時加人","保險資料","客服協助","課程訂單"], "tags": ["#課程人數","#課程變更"]},
    {"id": "faq.booking.066", "keywords": ["取消政策","退費政策","退款流程","客服協助","預約流程","訂單查詢"], "tags": ["#預約流程","#課程變更"]},
    {"id": "faq.instructor.067", "keywords": ["教練介紹頁","教練篩選","教練資格","教練偏好","指定教練","提早預約"], "tags": ["#教練選擇","#教練資格"]},
    {"id": "faq.instructor.068", "keywords": ["課前聯繫","教練主動聯絡","提前需求","客服協助","聯繫時程","備註留言"], "tags": ["#客服管道","#預約流程"]},
    {"id": "faq.kids.069", "keywords": ["兒童課程","年齡限制","一對一教學","家長陪同","安全考量","學習步調"], "tags": ["#兒童課程","#兒童安全"]},
    {"id": "faq.kids.070", "keywords": ["兒童保險","保障內容","給付差異","身故除外","保險說明","緊急救援"], "tags": ["#兒童保險","#兒童安全"]},
    {"id": "faq.kids.071", "keywords": ["兒童安全","帶團人數","保險包含","纜車陪同","教練經驗","安全機制"], "tags": ["#兒童安全","#安全考量"]}
]

AVERAGE_METADATA = {
    "content_version": 1,
    "source_language": "zh",
    "last_updated": "2025-11-05T00:00:00.000Z"
}

TRANSLATION_STATUS = {
    "zh": {"status": "complete", "translator": "human_reviewed"},
    "en": {"status": "complete", "translator": "human_reviewed"},
    "th": {"status": "complete", "translator": "human_reviewed"}
}


def build_entry(source_item, cfg):
    keywords = cfg["keywords"]
    tags = cfg["tags"]
    missing_kw = [kw for kw in keywords if kw not in KEYWORD_TRANSLATIONS]
    if missing_kw:
        raise KeyError(f"Missing keyword translations: {missing_kw}")
    for tag in tags:
        if tag not in CRM_TAGS:
            raise KeyError(f"Unknown CRM tag: {tag}")

    canonical_en = source_item.get('canonical_question_translations', {}).get('en', '')
    canonical_th = source_item.get('canonical_question_translations', {}).get('th', '')
    utterances = source_item.get('utterance_patterns') or [source_item['canonical_question']]

    return {
        "id": source_item['id'],
        "intent": source_item['intent'],
        "section": source_item['section'],
        "section_translations": SECTION_TRANSLATIONS[source_item['section']],
        "canonical_question": source_item['canonical_question'],
        "canonical_question_translations": source_item.get('canonical_question_translations', {}),
        "keywords": keywords,
        "keywords_translations": {
            "en": [KEYWORD_TRANSLATIONS[k]['en'] for k in keywords],
            "th": [KEYWORD_TRANSLATIONS[k]['th'] for k in keywords]
        },
        "utterance_patterns": utterances,
        "utterance_patterns_translations": {
            "en": [canonical_en for _ in utterances],
            "th": [canonical_th for _ in utterances]
        },
        "answer_template": {
            "text": source_item['answer_template']['text'],
            "postscript": source_item['answer_template']['postscript'],
            "links_inline": False
        },
        "answer_template_translations": {
            "summary_translations": source_item['answer_template'].get('text_translations', {}),
            "postscript_translations": source_item['answer_template'].get('postscript_translations', {})
        },
        "links": source_item.get('links', []),
        "required_slots": source_item.get('required_slots', []),
        "policy_flags": source_item.get('policy_flags', []),
        "crm_tags": tags,
        "crm_tags_translations": {
            "en": [CRM_TAGS[tag][0] for tag in tags],
            "th": [CRM_TAGS[tag][1] for tag in tags]
        },
        "metadata": dict(AVERAGE_METADATA),
        "translation_status": dict(TRANSLATION_STATUS)
    }


def main():
    phase = json.loads(PHASE_PATH.read_text())
    source_items = {item['id']: item for item in phase['items']}

    target_ids = {cfg['id'] for cfg in CONFIGS}
    phase['items'] = [item for item in phase['items'] if item['id'] not in target_ids]

    for cfg in CONFIGS:
        src = source_items[cfg['id']]
        entry = build_entry(src, cfg)
        phase['items'].append(entry)

    pre, general, post = [], [], []
    seen_general = False
    for item in phase['items']:
        if item['id'].startswith('faq.general.'):
            seen_general = True
            general.append(item)
        else:
            (post if seen_general else pre).append(item)

    general.sort(key=lambda x: int(re.search(r'faq\.general\.(\d+)', x['id']).group(1)))
    phase['items'] = pre + general + post
    PHASE_PATH.write_text(json.dumps(phase, ensure_ascii=False, indent=2))
    print(f"Inserted/updated {len(CONFIGS)} GENERAL FAQs")


if __name__ == '__main__':
    main()
