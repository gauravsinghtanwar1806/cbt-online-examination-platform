import fitz
import json

doc = fitz.open('source_pdfs/Achiever Minor Test 02.pdf')
ach = json.load(open('data/achiever_minor_test_02_questions.json', encoding='utf-8'))

match_nums = [14, 41, 60, 71, 100, 126, 134, 136, 144, 154, 159, 160, 178]

for qn in match_nums:
    q = next(x for x in ach if x['questionNumber'] == qn)
    print(f"=== Q{qn} ({q['subject']}) [sp={q['sourcePage']}] ===")
    print("CURRENT TEXT:\n", q['questionText'])
    print("OPTIONS:\n", q['options'])
    print("ANSWER:\n", q['officialAnswer'])
    print("-"*50)

