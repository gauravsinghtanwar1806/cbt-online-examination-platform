import json

ach = json.load(open('data/achiever_minor_test_02_questions.json', encoding='utf-8'))
for q in ach[:15]:
    qn = q['question_number']
    p = q['source_page']
    txt = q['question_text'].replace('\n', ' ')[:40]
    opts = q['options']
    print(f"Q{qn:2d} (P{p:2d}): {txt} | opts: {opts}")

