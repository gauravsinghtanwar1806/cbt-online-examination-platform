import fitz
import json

doc = fitz.open('source_pdfs/Achiever Minor Test 02.pdf')
ach = json.load(open('data/achiever_minor_test_02_questions.json', encoding='utf-8'))

for q in ach:
    qn = q['questionNumber']
    txt = q['questionText']
    subj = q['subject']
    # Look for keywords that suggest visual drawings
    kw = [
        'diagram', 'figure', 'graph', 'structure', 'given below', 'following', 'curve',
        'represented', 'identify', 'label', 'a, b, c', 'a, b and c'
    ]
    txt_lower = txt.lower()
    matches = [k for k in kw if k in txt_lower]
    if matches and subj in ['Chemistry', 'Biology']:
        print(f"Q{qn} ({subj}): {txt[:90]} | cues={matches}")

