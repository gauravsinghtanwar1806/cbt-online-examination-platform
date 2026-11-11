import json
import fitz
import re

doc = fitz.open('source_pdfs/Achiever Minor Test 02.pdf')
ach = json.load(open('data/achiever_minor_test_02_questions.json', encoding='utf-8'))
gen_nums = [q['question_number'] for q in ach if any('Option 1' in opt for opt in q.get('options', []))]

# Let's inspect each of these in extract_achiever's page text
for q_num in gen_nums:
    q = next(item for item in ach if item['question_number'] == q_num)
    p = q['source_page']
    page = doc[p]
    text = page.get_text('text')
    print(f"=== Q{q_num} (Page {p}) ===")
    # find where Q{q_num} starts
    # subject number
    sub_num = q_num if q_num <= 45 else (q_num - 45 if q_num <= 90 else q_num - 90)
    print(f"Subject number: {sub_num}")
    matches = list(re.finditer(rf'(?:^|\n)\s*{sub_num}\)\s*(.*?)(?=\n\s*\d+\)|\Z)', text, re.DOTALL))
    if matches:
        print("Matched text snippet:")
        print(matches[0].group(0)[:400])
    else:
        print("Could not match standard regex in page text!")

