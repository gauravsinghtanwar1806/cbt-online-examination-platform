import fitz
import json
import re

doc = fitz.open('source_pdfs/Achiever Minor Test 02.pdf')
ach = json.load(open('data/achiever_minor_test_02_questions.json', encoding='utf-8'))

diagram_qs = []
text_qs = []
match_qs = []

for q in ach:
    qn = q['questionNumber']
    txt = q['questionText']
    q_type = q.get('questionType')
    
    # Check if match the following
    if q_type == 'match_following' or 'match list' in txt.lower() or 'match column' in txt.lower():
        match_qs.append(qn)
        continue

    # In Achiever Minor Test 02, let's see which questions actually have a diagram
    # Questions with actual diagrams in Physics, Chemistry, Biology:
    txt_lower = txt.lower()
    cue = any(k in txt_lower for k in [
        'shown in figure', 'shown in the graph', 'shown in the figure', 'as shown in',
        'in the following diagram', 'following circuit', 'given circuit', 'in the given figure',
        'in the given diagram', 'the following graph', 'the graph shows', 'given graph',
        'shown in fig', 'in figure shows', 'figure shows', 'given v-t graph', 'p-v diagram'
    ])
    if cue:
        diagram_qs.append(qn)
    else:
        text_qs.append(qn)

print(f"Total Match Following: {len(match_qs)}: {match_qs}")
print(f"Questions with diagram cues: {len(diagram_qs)}: {diagram_qs}")
print(f"Pure text questions: {len(text_qs)}")

