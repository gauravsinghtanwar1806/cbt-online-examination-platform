import fitz
import json
import re

ach = json.load(open('data/achiever_minor_test_02_questions.json', encoding='utf-8'))
match_nums = [14, 41, 60, 71, 100, 126, 134, 136, 144, 154, 159, 160, 178]

for qn in match_nums:
    q = next(x for x in ach if x['questionNumber'] == qn)
    txt = q['questionText']
    print(f"*** Q{qn} ({q['subject']}) ***")
    print(txt)
    print("Options:", q['options'])
    print("Ans:", q['officialAnswer'])
    print("="*60)

