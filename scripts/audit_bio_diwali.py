import json

bio = json.load(open('data/biology_diwali_questions.json', encoding='utf-8'))
print(f"Total Biology Diwali questions: {len(bio)}")

diag_count = 0
match_count = 0
pure_text_count = 0

diag_samples = []
match_samples = []

for q in bio:
    txt = q.get('questionText', '')
    txt_lower = txt.lower()
    img = q.get('imageUrl', '')
    
    is_match = (
        'match' in txt_lower and ('list' in txt_lower or 'column' in txt_lower)
    ) or q.get('questionType') == 'match_following'
    
    # Check if there is a diagram/figure cue in question
    has_diagram = any(k in txt_lower for k in [
        'in the given figure', 'in the given diagram', 'identify a, b', 'identify the diagram',
        'given below diagram', 'shown below', 'represented below', 'in the following figure',
        'given below is a diagram', 'given below is a venn diagram', 'the given diagram shows',
        'refer to the given', 'based on the given figure', 'the diagram given below', 'given below shows'
    ])
    
    if is_match:
        match_count += 1
        match_samples.append((q['id'], q.get('chapterIndex'), q.get('questionNumber'), txt[:70]))
    elif has_diagram:
        diag_count += 1
        diag_samples.append((q['id'], q.get('chapterIndex'), q.get('questionNumber'), txt[:70]))
    else:
        pure_text_count += 1

print(f"Match questions: {match_count}")
print(f"Diagram questions: {diag_count}")
print(f"Pure text questions: {pure_text_count}")
print("\nSample Match Questions:")
for s in match_samples[:5]:
    print(" ", s)
print("\nSample Diagram Questions:")
for s in diag_samples[:5]:
    print(" ", s)

