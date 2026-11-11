import json

ver = json.load(open('data/answer_verification.json', encoding='utf-8'))

attempted = [
    (1, 'achiever_001', 1),
    (2, 'achiever_002', 3),
    (3, 'achiever_003', 2),
    (4, 'achiever_004', 1),
    (5, 'achiever_005', 1),
    (6, 'achiever_006', 1),
    (7, 'achiever_007', 1),
    (8, 'achiever_008', 1),
]

print("Evaluating 8 attempted questions against official keys:")
correct_count = 0
incorrect_count = 0

for qn, qid, sel in attempted:
    v = ver[qid]
    app_ans = v.get('approved_answer') or v.get('approvedAnswer') or v.get('pdf_answer')
    is_corr = (sel == app_ans)
    if is_corr:
        correct_count += 1
        status_str = "CORRECT (+4)"
    else:
        incorrect_count += 1
        status_str = "INCORRECT (-1)"
    print(f"Q{qn:2d}: Student selected {sel} | Official Key: {app_ans} -> {status_str}")

pos_marks = correct_count * 4
neg_marks = incorrect_count * 1
net_score = pos_marks - neg_marks
print("\n--- Summary ---")
print(f"Total attempted: {len(attempted)}")
print(f"Correct: {correct_count}")
print(f"Incorrect: {incorrect_count}")
print(f"Positive marks: +{pos_marks}")
print(f"Negative marks: -{neg_marks}")
print(f"Net Score: {net_score}")

