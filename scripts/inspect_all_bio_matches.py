import json

bio = json.load(open('data/biology_diwali_questions.json', encoding='utf-8'))

for q in bio:
    txt = q.get('questionText', '')
    if 'column-i' in txt.lower() or 'column i' in txt.lower() or 'list-i' in txt.lower() or 'list i' in txt.lower():
        print(f"=== {q['id']} (Ch {q.get('chapterIndex')} Q{q.get('questionNumber')}) ===")
        print(txt)
        print("Options:", q.get('options'))
        print("Ans:", q.get('officialAnswer'))
        print("="*60)

