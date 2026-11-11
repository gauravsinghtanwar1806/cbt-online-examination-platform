import json
import re

sol = open('data/all_solutions.txt', encoding='utf-8').read()

special_q = [1, 2, 10, 15, 16, 18, 19, 21, 22, 27, 28, 33, 37, 38, 39, 45, 50, 51, 57, 69, 70, 75]

for qn in special_q:
    m = re.search(rf'(?:^|\n)\s*{qn}\)\s*([\s\S]*?)(?=(?:\n\s*\d+\)|\Z))', sol)
    if m:
        txt = m.group(1).strip()
        lines = [l.strip() for l in txt.split('\n') if l.strip()]
        print(f"=== Sol Q{qn} ===")
        print('\n'.join(lines[:6]))
    else:
        print(f"=== Sol Q{qn}: Not found ===")
