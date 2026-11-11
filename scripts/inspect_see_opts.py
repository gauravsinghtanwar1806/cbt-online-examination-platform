import json
import re

ach = json.load(open('data/achiever_minor_test_02_questions.json', encoding='utf-8'))
sol_text = open('data/all_solutions.txt', encoding='utf-8').read()

print(f"Total achiever questions: {len(ach)}")

# Let's check each question's options and see if any still say "See Option"
see_opts = [q for q in ach if any('See Option' in opt for opt in q.get('options', []))]
print(f"Questions with 'See Option' text: {len(see_opts)}")
for q in see_opts:
    print(f"Q{q['question_number']:3d}: {q['options']}")
