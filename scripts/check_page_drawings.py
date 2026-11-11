import fitz
import json

doc = fitz.open('source_pdfs/Achiever Minor Test 02.pdf')
ach = json.load(open('data/achiever_minor_test_02_questions.json', encoding='utf-8'))

# Let's inspect vector drawings and images per question
for q in ach[:30]:
    qn = q['questionNumber']
    sp = q['sourcePage'] - 1
    page = doc[sp]
    # Check text
    txt = q['questionText']
    
    # Check if question text mentions visual cues
    cues = [k for k in ['figure', 'graph', 'diagram', 'circuit', 'shown in', 'as shown'] if k in txt.lower()]
    print(f"Q{qn}: cues={cues}")

