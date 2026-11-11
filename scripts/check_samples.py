import json

ach = json.load(open('data/achiever_minor_test_02_questions.json', encoding='utf-8'))
for qn in [1, 2, 3, 10, 11, 20, 25, 45, 90, 180]:
    q = next(item for item in ach if item['question_number'] == qn)
    print(f"=== Q{qn} ===")
    print(f"Text: {q['question_text'][:70]}...")
    print(f"Options: {q['options']}")
    print(f"OptionImages: {q.get('optionImages')}")

