import json

bio = json.load(open('data/biology_diwali_questions.json', encoding='utf-8'))

diag_bio = []
for q in bio:
    txt = q['questionText'].lower()
    cues = [
        'in the given figure', 'in the given diagram', 'identify a, b', 'identify the diagram',
        'given below diagram', 'given below is a diagram', 'given below is a venn diagram',
        'the given diagram shows', 'refer to the given', 'based on the given figure',
        'the diagram given below', 'given below shows', 'observe the diagram given below',
        'given flowchart and identify', 'carefully analyse a, b and c in the given diagram',
        'given diagram represents', 'in the diagram given', 'following pedigree chart',
        'given pedigree chart', 'given figure represents', 'in the given pedigree'
    ]
    matched = [c for c in cues if c in txt]
    if matched:
        diag_bio.append((q['id'], q.get('chapterIndex'), q.get('questionNumber'), matched, q['questionText'][:70]))

print(f"Total real diagram questions in Biology Diwali: {len(diag_bio)}")
for d in diag_bio:
    print(f"{d[0]} (Ch {d[1]} Q{d[2]}): {d[3]} -> {d[4]}")

