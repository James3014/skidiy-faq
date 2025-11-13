'''
import json
import re
from datetime import datetime, timezone
from pathlib import Path

def optimize_faqs():
    print("--- Script starting ---")
    repo_root = Path(__file__).resolve().parent.parent
    phase0a_path = repo_root / 'zeabur_backend' / 'data' / 'faq_kb.phase0a.json'
    input_path = phase0a_path
    output_path = phase0a_path

    print(f"Reading input file: {input_path}")
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print("Input file read successfully.")
    except FileNotFoundError:
        print(f"Error: Input file not found at {input_path}")
        return
    except json.JSONDecodeError as e:
        print(f"Error: Could not decode JSON from {input_path}. Details: {e}")
        return

    optimized_items = []
    print("Processing FAQ items...")
    items = data.get('items', [])
    for i, item in enumerate(items):
        # Using a raw string for the pattern directly
        pattern = re.compile(r'[\w\u4e00-\u9fff]+')
        
        # --- T0A.3: Add Keywords ---
        keywords = set()
        question = item.get('canonical_question', '')
        for tag in item.get('crm_tags', []):
            keywords.add(tag.strip('#'))
        
        q_keywords = pattern.findall(question)
        for kw in q_keywords:
            if len(kw) > 1 and kw not in ['你們', '我們', '什麼', '如何', '是否', '嗎', '的', '我']:
                keywords.add(kw)
        
        for utterance in item.get('utterance_patterns', [])[:3]:
             u_keywords = pattern.findall(utterance)
             for kw in u_keywords:
                 if len(kw) > 1 and kw not in ['你們', '我們', '什麼', '如何', '是否', '嗎', '的', '我']:
                    keywords.add(kw)
        item['keywords'] = list(keywords)[:5]

        # --- T0A.1: Adjust Question ---
        if item['id'] == 'faq.general.009' and '小朋友' not in question:
            item['canonical_question'] = '小朋友幾歲可以開始學滑雪？'
            if 'canonical_question_translations' in item:
                item['canonical_question_translations']['en'] = 'At what age can children start learning to ski?'
                item['canonical_question_translations']['th'] = 'เด็กอายุเท่าไหร่ถึงจะเริ่มเรียนสกีได้?'

        # --- T0A.2: Optimize Answer & Add Tip ---
        answer_template = item.get('answer_template', {})
        answer_text = answer_template.get('text', '')
        summary = ''
        details = ''
        tip = ''

        sentences = re.split(r'(?<=[。！？])\s*', answer_text)
        if sentences and sentences[0]:
            summary = sentences[0]
            if len(summary) > 80:
                break_point = summary.rfind('，')
                if 40 < break_point < 80:
                    summary = summary[:break_point]
                else:
                    summary = summary[:80] + '...'
            details = ''.join(sentences[1:]).strip()
        else:
            summary = answer_text
            details = ''

        section = item.get('section', '')
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
    
    print(f"Processed {len(optimized_items)} items.")

    data['items'] = optimized_items

    print(f"Writing to output file: {output_path}")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"--- Successfully optimized {len(optimized_items)} FAQs and saved to {output_path} ---")

if __name__ == '__main__':
    optimize_faqs()
'''
