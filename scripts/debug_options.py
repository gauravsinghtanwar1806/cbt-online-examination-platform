import json
import fitz

ach = json.load(open('data/achiever_minor_test_02_questions.json', encoding='utf-8'))
doc = fitz.open('source_pdfs/Achiever Minor Test 02.pdf')

gen_q = [q for q in ach if any('Option 1' in opt for opt in q.get('options', []))]
print(f"Total with generic options: {len(gen_q)}")

for q in gen_q:
    q_num = q['question_number']
    p = q['source_page']
    q_text = q['question_text'].replace('\n', ' ')[:70]
    print(f"Q{q_num:3d} (Page {p:2d}): {q_text}...")
