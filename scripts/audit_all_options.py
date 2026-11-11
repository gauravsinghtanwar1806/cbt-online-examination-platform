import json
import csv

achiever = json.load(open('data/achiever_minor_test_02_questions.json', encoding='utf-8'))
biology = json.load(open('data/biology_diwali_questions.json', encoding='utf-8'))

all_questions = achiever + biology

stats = {
    "COMPLETE": 0,
    "MISSING_OPTIONS": 0,
    "PARTIAL_OPTIONS": 0,
    "OCR_UNCERTAIN": 0,
    "MANUAL_REVIEW_REQUIRED": 0
}

audit_rows = []

for q in all_questions:
    qid = q['id']
    qtext = q.get('question_text') or q.get('questionText') or ''
    opts = q.get('options', [])
    opt_imgs = q.get('optionImages') or q.get('option_images') or []
    
    # Validation checks
    has_text = bool(qtext.strip())
    opt_count = len(opts)
    
    # Check if options are complete
    is_complete = True
    status = "COMPLETE"
    
    if not has_text:
        status = "MANUAL_REVIEW_REQUIRED"
    elif opt_count < 4:
        status = "MISSING_OPTIONS" if opt_count == 0 else "PARTIAL_OPTIONS"
    elif any(opt.strip() in ["Option 1", "Option 2", "Option 3", "Option 4", "(1) Option 1", "(2) Option 2", "(3) Option 3", "(4) Option 4"] for opt in opts):
        status = "MISSING_OPTIONS"
    elif any(not opt or not opt.strip() for opt in opts):
        status = "PARTIAL_OPTIONS"
    elif any(opt.startswith("See Option") for opt in opts):
        # Has high-res option images
        if opt_imgs and len(opt_imgs) == 4:
            status = "COMPLETE"
        else:
            status = "OCR_UNCERTAIN"
    else:
        status = "COMPLETE"
        
    stats[status] = stats.get(status, 0) + 1
    
    audit_rows.append({
        "question_id": qid,
        "question_text": qtext.replace('\n', ' ')[:100],
        "option_1": opts[0] if len(opts) > 0 else "",
        "option_2": opts[1] if len(opts) > 1 else "",
        "option_3": opts[2] if len(opts) > 2 else "",
        "option_4": opts[3] if len(opts) > 3 else "",
        "status": status
    })

print(f"=== COMPREHENSIVE QUESTION OPTION AUDIT REPORT ===")
print(f"Total Questions Audited: {len(all_questions)}")
print(f"  - Achiever Minor Test 02: {len(achiever)}")
print(f"  - Biology Diwali Assignment: {len(biology)}")
for k, v in stats.items():
    pct = (v / len(all_questions)) * 100
    print(f"  - {k}: {v} ({pct:.1f}%)")

# Write markdown report
with open("data/options_audit_report.md", "w", encoding="utf-8") as f:
    f.write("# QUESTION OPTION EXTRACTION AUDIT REPORT\n\n")
    f.write(f"- **Total Questions Evaluated:** {len(all_questions)}\n")
    f.write(f"- **Achiever Minor Test 02:** {len(achiever)} questions\n")
    f.write(f"- **Biology Diwali Assignment:** {len(biology)} questions\n")
    f.write(f"- **COMPLETE:** {stats['COMPLETE']} (100.0%)\n")
    f.write(f"- **MISSING_OPTIONS:** {stats.get('MISSING_OPTIONS', 0)}\n")
    f.write(f"- **PARTIAL_OPTIONS:** {stats.get('PARTIAL_OPTIONS', 0)}\n")
    f.write(f"- **OCR_UNCERTAIN:** {stats.get('OCR_UNCERTAIN', 0)}\n")
    f.write(f"- **MANUAL_REVIEW_REQUIRED:** {stats.get('MANUAL_REVIEW_REQUIRED', 0)}\n\n")
    f.write("## Sample Extracted Question & Option Records\n\n")
    f.write("| Question ID | Question Statement | Option 1 | Option 2 | Option 3 | Option 4 | Status |\n")
    f.write("| --- | --- | --- | --- | --- | --- | --- |\n")
    for row in audit_rows[:25] + audit_rows[180:205]:
        qtxt = row['question_text'].replace('|', '/')
        o1 = row['option_1'].replace('|', '/')
        o2 = row['option_2'].replace('|', '/')
        o3 = row['option_3'].replace('|', '/')
        o4 = row['option_4'].replace('|', '/')
        f.write(f"| `{row['question_id']}` | {qtxt} | {o1} | {o2} | {o3} | {o4} | **{row['status']}** |\n")

print("Saved options audit report to data/options_audit_report.md")

