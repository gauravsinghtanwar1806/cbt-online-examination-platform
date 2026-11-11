import json

ach = json.load(open('data/achiever_minor_test_02_questions.json', encoding='utf-8'))
flagged = [q for q in ach if len(q.get('options', [])) != 4 or any(opt.strip().startswith('Option (') or (opt.strip().startswith('(') and 'Option' in opt) for opt in q.get('options', []))]

for q in flagged:
    qn = q['question_number']
    opts = q['options']
    print(f"Q{qn:3d}: {opts}")

