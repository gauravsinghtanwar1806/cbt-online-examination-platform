import fitz
import json

doc = fitz.open('source_pdfs/Achiever Minor Test 02.pdf')
ach = json.load(open('data/achiever_minor_test_02_questions.json', encoding='utf-8'))
gen_nums = [q['question_number'] for q in ach if any('Option 1' in opt for opt in q.get('options', []))]

print(f"Generic questions count: {len(gen_nums)}")

for q_num in gen_nums:
    q = next(item for item in ach if item['question_number'] == q_num)
    p = q['source_page']
    
    # Check bottom of page p
    bottom_text = doc[p].get_text('text').strip().split('\n')[-4:]
    # Check top of page p+1
    top_text = doc[p+1].get_text('text').strip().split('\n')[:4] if p+1 < len(doc) else []
    
    print(f"--- Q{q_num} (Page {p}) ---")
    print(f"  Bottom of P{p}: {' / '.join(bottom_text)}")
    print(f"  Top of P{p+1}:    {' / '.join(top_text)}")

