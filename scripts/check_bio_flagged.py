import json
import fitz

bio = json.load(open('data/biology_diwali_questions.json', encoding='utf-8'))
doc = fitz.open('source_pdfs/Biology Diwali Assignment.pdf')

flagged_ids = ['bio_ch01_q26', 'bio_ch02_q09', 'bio_ch03_q17', 'bio_ch04_q16', 'bio_ch08_q06', 'bio_ch09_q10', 'bio_ch18_q10', 'bio_ch28_q26']

for fid in flagged_ids:
    q = next(item for item in bio if item['id'] == fid)
    p = q['source_page']
    print(f"=== {fid} (Page {p}) ===")
    print("Question Text:", q['question_text'])
    print("Options:", q['options'])
    print("Raw page text snippet:")
    print(doc[p].get_text('text')[:400])

