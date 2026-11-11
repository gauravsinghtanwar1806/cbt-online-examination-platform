import json
import re

ach = json.load(open('data/achiever_minor_test_02_questions.json', encoding='utf-8'))
bio = json.load(open('data/biology_diwali_questions.json', encoding='utf-8'))

print("=== AUDIT 1: CHECK FOR GENERIC / NUMERIC / SHORT OPTIONS ===")
for q in ach:
    opts = q.get('options', [])
    # check if options are like ['1', '2', '3', '4'] or ['Option 1', ...] or empty
    is_numeric = all(o.strip() in ['1', '2', '3', '4', '(1)', '(2)', '(3)', '(4)'] for o in opts if o)
    is_placeholder = any('option' in o.lower() and len(o.strip()) < 12 for o in opts)
    if is_numeric or is_placeholder or len(opts) < 4:
        print(f"Achiever Q{q['questionNumber']} ({q['subject']}): opts={opts}")

for q in bio:
    opts = q.get('options', [])
    is_numeric = all(o.strip() in ['1', '2', '3', '4', '(1)', '(2)', '(3)', '(4)'] for o in opts if o)
    is_placeholder = any('option' in o.lower() and len(o.strip()) < 12 for o in opts)
    if is_numeric or is_placeholder or len(opts) < 4:
        print(f"Bio {q['id']} (Ch {q.get('chapterIndex')} Q{q.get('questionNumber')}): opts={opts}")

print("\n=== AUDIT 2: CHECK FOR QUESTIONS WITH DIAGRAM CUES IN TEXT ===")
diag_cues = ['shown in figure', 'in figure', 'in the circuit', 'as shown', 'graph', 'diagram', 'wheatstone', 'ammeter', 'galvanometer', 'pulley', 'bridge']
for q in ach:
    txt = q['questionText'].lower()
    img = q.get('imageUrl', '')
    has_cue = any(c in txt for c in ['shown in figure', 'in the circuit shown', 'figure shows', 'shown in graph', 'shown in the graph', 'circuit diagram', 'wheatstone bridge'])
    if has_cue and not img:
        print(f"Achiever Q{q['questionNumber']} has diagram cue '{[c for c in diag_cues if c in txt]}' but NO imageUrl!")

print("\n=== AUDIT COMPLETE ===")
