import fitz
import json

doc = fitz.open('source_pdfs/Achiever Minor Test 02.pdf')
ach = json.load(open('data/achiever_minor_test_02_questions.json', encoding='utf-8'))

# Let's inspect all questions that have drawings or images on their page
more_cues = ['figure', 'graph', 'circuit', 'shown', 'pulley', 'wedge', 'incline', 'diagram', 'below']

candidates = []
for q in ach:
    qn = q['questionNumber']
    txt = q['questionText'].lower()
    found = [c for c in more_cues if c in txt]
    if found:
        candidates.append((qn, q['subject'], found, q['questionText'][:70]))

print(f"Candidates count: {len(candidates)}")
for c in candidates:
    if c[0] not in [2, 3, 8, 17, 19, 20, 23, 31, 40, 41, 43, 44, 161, 164, 173, 177]:
        print(f"Check Q{c[0]:03d} ({c[1]}): {c[2]} -> {c[3]}")

