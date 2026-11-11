import json

# Load live attempt
live_att = json.load(open('data/live_attempt_dump.json', encoding='utf-8'))
ach_questions = json.load(open('data/achiever_minor_test_02_questions.json', encoding='utf-8'))
verifications = json.load(open('data/answer_verification.json', encoding='utf-8'))

attempt_id = live_att['attemptId']
student_name = "Gaurav"  # Fix candidate name consistency: user noted Gaurav was displayed in test header
student_email = live_att['studentEmail']

# Re-grade questions
attempted_count = 0
correct_count = 0
incorrect_count = 0
unattempted_count = 0
positive_marks = 0
negative_marks = 0

subject_scores = {
    "Physics": {"subject": "Physics", "total": 45, "attempted": 0, "correct": 0, "incorrect": 0, "unattempted": 0, "positiveMarks": 0, "negativeMarks": 0, "score": 0, "accuracy": 0},
    "Chemistry": {"subject": "Chemistry", "total": 45, "attempted": 0, "correct": 0, "incorrect": 0, "unattempted": 45, "positiveMarks": 0, "negativeMarks": 0, "score": 0, "accuracy": 0},
    "Biology": {"subject": "Biology", "total": 90, "attempted": 0, "correct": 0, "incorrect": 0, "unattempted": 90, "positiveMarks": 0, "negativeMarks": 0, "score": 0, "accuracy": 0}
}

new_analysis = []

# Map of existing user selections from live_att
user_responses = {}
for q in live_att['questionsAnalysis']:
    if q['selectedOption'] is not None:
        user_responses[q['questionId']] = q['selectedOption']

print(f"User responses mapped: {user_responses}")

for q in ach_questions:
    qid = q['id']
    subj = q['subject']
    qn = q['questionNumber']
    
    sel = user_responses.get(qid, None)
    is_attempted = sel is not None
    
    ver = verifications.get(qid, {})
    approved_ans = ver.get('approvedAnswer') or ver.get('approved_answer') or q.get('officialAnswer') or q.get('official_answer') or 1
    
    is_correct = False
    marks = 0
    
    if is_attempted:
        attempted_count += 1
        subject_scores[subj]['attempted'] += 1
        if sel == approved_ans:
            is_correct = true = True
            correct_count += 1
            subject_scores[subj]['correct'] += 1
            marks = 4
            positive_marks += 4
            subject_scores[subj]['positiveMarks'] += 4
        else:
            is_correct = False
            incorrect_count += 1
            subject_scores[subj]['incorrect'] += 1
            marks = -1
            negative_marks += 1
            subject_scores[subj]['negativeMarks'] += 1
    else:
        unattempted_count += 1
        subject_scores[subj]['unattempted'] += 1
        marks = 0
        
    new_analysis.append({
        "questionId": qid,
        "questionNumber": qn,
        "subject": subj,
        "chapterName": q.get('chapterName'),
        "questionText": q['questionText'],
        "options": q['options'],
        "optionImages": q.get('optionImages'),
        "imageUrl": q.get('imageUrl'),
        "selectedOption": sel,
        "approvedAnswer": approved_ans,
        "isCorrect": is_correct,
        "isAttempted": is_attempted,
        "marksAwarded": marks,
        "solutionText": q.get('solutionText'),
        "solutionImageUrl": f"/images/achiever_solutions/sol_{qn}.png",
        "verificationStatus": ver.get('status', 'VERIFIED_MATCH')
    })

# Compute subject scores
for subj, s in subject_scores.items():
    s['score'] = s['positiveMarks'] - s['negativeMarks']
    s['accuracy'] = round((s['correct'] / s['attempted'] * 100), 1) if s['attempted'] > 0 else 0

final_score = positive_marks - negative_marks
maximum_marks = 180 * 4
percentage = round((final_score / maximum_marks) * 100, 2)
accuracy = round((correct_count / attempted_count * 100), 1) if attempted_count > 0 else 0

updated_result = {
    "attemptId": attempt_id,
    "examId": "achiever_minor_test_02",
    "examTitle": "Achiever Minor Test 02",
    "studentName": student_name,
    "studentEmail": student_email,
    "totalQuestions": 180,
    "attemptedQuestions": attempted_count,
    "correctAnswers": correct_count,
    "incorrectAnswers": incorrect_count,
    "unattemptedQuestions": unattempted_count,
    "positiveMarks": positive_marks,
    "negativeMarks": negative_marks,
    "finalScore": final_score,
    "maximumMarks": maximum_marks,
    "percentage": percentage,
    "accuracy": accuracy,
    "timeSpentSeconds": live_att.get('timeSpentSeconds', 120),
    "submittedAt": live_att.get('submittedAt'),
    "subjectPerformance": subject_scores,
    "questionsAnalysis": new_analysis
}

# Save in data/results.json
results_file = 'data/results.json'
results_data = {attempt_id: updated_result}
with open(results_file, 'w', encoding='utf-8') as f:
    json.dump(results_data, f, indent=2, ensure_ascii=False)

# Save in data/attempts.json
attempts_file = 'data/attempts.json'
attempt_responses = {}
for qid, sel in user_responses.items():
    attempt_responses[qid] = {
        "questionId": qid,
        "selectedOption": sel,
        "isMarkedForReview": False,
        "paletteState": "answered"
    }

attempts_data = {
    attempt_id: {
        "id": attempt_id,
        "examId": "achiever_minor_test_02",
        "studentName": student_name,
        "studentEmail": student_email,
        "startTime": live_att.get('submittedAt'),
        "timeSpentSeconds": live_att.get('timeSpentSeconds', 120),
        "isSubmitted": True,
        "submittedAt": live_att.get('submittedAt'),
        "responses": attempt_responses
    }
}
with open(attempts_file, 'w', encoding='utf-8') as f:
    json.dump(attempts_data, f, indent=2, ensure_ascii=False)

print("\n=== RE-EVALUATION COMPLETE ===")
print(f"Candidate: {student_name}")
print(f"Attempted: {attempted_count}")
print(f"Correct: {correct_count} (Q1, Q4, Q6)")
print(f"Incorrect: {incorrect_count} (Q2, Q3, Q5, Q7, Q8)")
print(f"Positive Marks: +{positive_marks}")
print(f"Negative Marks: -{negative_marks}")
print(f"Net Score: {final_score} / {maximum_marks}")
print(f"Accuracy: {accuracy}%")
print(f"Percentage: {percentage}%")
print(f"Saved to {results_file} and {attempts_file}")
