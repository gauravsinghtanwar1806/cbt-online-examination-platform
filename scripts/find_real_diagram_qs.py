import json
import re

ach = json.load(open('data/achiever_minor_test_02_questions.json', encoding='utf-8'))

diag_qs = []
for q in ach:
    qn = q['questionNumber']
    txt = q['questionText']
    txt_lower = txt.lower()
    
    # Specific visual cues indicating a figure, graph, circuit or drawing is referenced
    cues = [
        'shown in figure', 'shown in the figure', 'shown in the graph', 'shown in graph',
        'as shown in figure', 'as shown in the figure', 'as shown in graph', 'as shown in the graph',
        'as shown in the circuit', 'in the circuit shown', 'circuit shown in figure',
        'figure shows', 'fig. shows', 'given figure shows', 'in the given figure',
        'in the following diagram', 'following diagram shows', 'below diagram', 'diagram below',
        'below figure', 'figure below', 'observe the given figure', 'identify a, b', 'identify the following diagram',
        'p-v diagram', 'v-t graph', 'x-t graph', 'f-x graph', 'given v-t graph'
    ]
    matched = [c for c in cues if c in txt_lower]
    if matched:
        diag_qs.append((qn, q['subject'], matched, txt[:80]))

print(f"Total questions with actual diagram/graph/circuit references in Achiever: {len(diag_qs)}")
for d in diag_qs:
    print(f"Q{d[0]:03d} ({d[1]}): {d[2]} -> {d[3]}")

