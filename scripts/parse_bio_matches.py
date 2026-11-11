import json

bio = json.load(open('data/biology_diwali_questions.json', encoding='utf-8'))

matches_bio = []
for q in bio:
    txt = q.get('questionText', '')
    txt_lower = txt.lower()
    if ('match' in txt_lower and ('list' in txt_lower or 'column' in txt_lower)) or q.get('questionType') == 'match_following':
        matches_bio.append(q)

print(f"Total Biology Diwali Match questions: {len(matches_bio)}")
for m in matches_bio[:10]:
    print(f"ID: {m['id']} (Ch {m.get('chapterIndex')} Q{m.get('questionNumber')}): {m['questionText'][:90]}")
    print("Options:", m.get('options'))
    print("-" * 50)

