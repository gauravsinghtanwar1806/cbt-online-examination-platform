import json

ach = json.load(open('data/achiever_minor_test_02_questions.json', encoding='utf-8'))
for q_num in [3, 10, 14, 17, 20]:
    q = next(item for item in ach if item['question_number'] == q_num)
    print(f"Q{q_num}: page={q['source_page']}")
    print(f"  Text: {q['question_text']}")
    print(f"  Options: {q['options']}")
