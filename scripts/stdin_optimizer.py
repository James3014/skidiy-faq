'''
import sys
import json
import re
from datetime import datetime, timezone

def main():
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        # Exit gracefully if stdin is empty or invalid
        sys.exit(0)

    optimized_items = []
    items = data.get('items', [])
    # Use a regex that avoids the \w syntax warning
    pattern = re.compile(r'[a-zA-Z0-9_\u4e00-\u9fff]+')

    for item in items:
        # --- Keywords ---
        keywords = set()
        question = item.get('canonical_question', '')
        for tag in item.get('crm_tags', []):
            keywords.add(tag.strip('#'))
        q_keywords = pattern.findall(question)
        for kw in q_keywords:
            if len(kw) > 1 and kw not in ['你們', '我們', '什麼', '如何', '是否', '嗎', '的', '我']:
                keywords.add(kw)
        item['keywords'] = list(keywords)[:5]

        # --- Question ---
        if item['id'] == 'faq.general.009' and '小朋友' not in question:
            item['canonical_question'] = '小朋友幾歲可以開始學滑雪？'
            if 'canonical_question_translations' in item:
                item['canonical_question_translations']['en'] = 'At what age can children start learning to ski?'

        # --- Answer & Tip ---
        answer_template = item.get('answer_template', {})
        answer_text = answer_template.get('text', '')
        sentences = re.split(r'(?<=[。！？])\s*', answer_text)
        summary = sentences[0] if sentences and sentences[0] else answer_text
        if len(summary) > 80:
            break_point = summary.rfind('，')
            summary = summary[:break_point] if 40 < break_point < 80 else summary[:80] + '...'
        details = ''.join(sentences[1:]).strip()

        section = item.get('section', '')
        tip = ''
        if any(s in section for s in ['行程', '預約', '異動']):
            tip = '旺季期間建議提早 2-3 個月預約，以確保能選擇理想的教練與時段。'
        elif '裝備' in section:
            tip = '租借雪具時，請務必試穿合身，特別是雪鞋，合腳的雪鞋是愉快滑雪的關鍵。'
        elif any(s in section for s in ['小朋友', '安全']):
            tip = '為兒童準備合適的護具（如安全帽、防摔褲）非常重要，能有效提升滑雪安全。'
        elif '教練' in section:
            tip = '若想確保學習連貫性，建議連續幾天的課程都預約同一位教練。'

        answer_template['summary'] = summary
        answer_template['details'] = details
        answer_template['tip'] = tip
        answer_template['text'] = summary

        if 'metadata' in item:
            item['metadata']['content_version'] = item['metadata'].get('content_version', 1) + 1
            item['metadata']['last_updated'] = datetime.now(timezone.utc).isoformat()

        optimized_items.append(item)

    data['items'] = optimized_items
    json.dump(data, sys.stdout, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    main()
'''