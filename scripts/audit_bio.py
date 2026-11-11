import json

bio = json.load(open('data/biology_diwali_questions.json', encoding='utf-8'))
print(f"Total bio questions: {len(bio)}")

bio_flagged = []
for q in bio:
    opts = q.get('options', [])
    if len(opts) != 4:
        bio_flagged.append((q['id'], 'len!=4', opts))
    elif any(not opt or not opt.strip() for opt in opts):
        bio_flagged.append((q['id'], 'empty_opt', opts))
    elif any('Option 1' in opt or 'Option (' in opt for opt in opts):
        bio_flagged.append((q['id'], 'generic_opt', opts))

print(f"Flagged bio questions: {len(bio_flagged)}")
if bio_flagged:
    for item in bio_flagged[:10]:
        print(item)
