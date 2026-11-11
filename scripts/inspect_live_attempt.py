import urllib.request
import json

res = urllib.request.urlopen('https://cbt-examination-platform-xi.vercel.app/api/admin/attempts')
data = json.loads(res.read())
att = data['results'][0]

print(f"Attempt ID: {att['attemptId']}")
print(f"Candidate: {att['studentName']} ({att['studentEmail']})")
print("Selected responses:")
for q in att['questionsAnalysis']:
    if q['isAttempted']:
        qn = q['questionNumber']
        qid = q['questionId']
        sel = q['selectedOption']
        print(f"  Q{qn:2d} ({qid}): Selected Option {sel}")

