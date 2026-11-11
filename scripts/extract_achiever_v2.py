import fitz
import json
import re
import os

doc = fitz.open('source_pdfs/Achiever Minor Test 02.pdf')

def get_page_markers(p):
    blocks = doc[p].get_text('blocks')
    markers = []
    for b in blocks:
        m = re.match(r'^\s*(\d+)\)\s*(.*)', b[4], re.DOTALL)
        if m:
            q_num = int(m.group(1))
            markers.append({
                "num": q_num,
                "bbox": b[:4],
                "text": b[4],
                "page": p
            })
    return markers

all_180 = []

# Physics: 1 to 45
phys_markers = [m for p in range(0, 14) for m in get_page_markers(p) if 1 <= m['num'] <= 45]
phys_seen = {}
for m in phys_markers:
    if m['num'] not in phys_seen: phys_seen[m['num']] = m

for num in range(1, 46):
    m = phys_seen[num]
    all_180.append({
        "overall_num": num,
        "sub_num": num,
        "subject": "Physics",
        "start_page": m['page'],
        "start_y": m['bbox'][1],
        "header_text": m['text']
    })

# Chemistry: 1 to 45 (starts on page 14, p=14..22)
chem_markers = [m for p in range(14, 23) for m in get_page_markers(p) if not (p == 22 and m['bbox'][1] > 200) and 1 <= m['num'] <= 45]
chem_seen = {}
for m in chem_markers:
    if m['num'] not in chem_seen: chem_seen[m['num']] = m

for num in range(1, 46):
    m = chem_seen[num]
    all_180.append({
        "overall_num": num + 45,
        "sub_num": num,
        "subject": "Chemistry",
        "start_page": m['page'],
        "start_y": m['bbox'][1],
        "header_text": m['text']
    })

# Biology: 1 to 90
bio_markers = [m for p in range(22, 40) for m in get_page_markers(p) if not (p == 22 and m['bbox'][1] < 200) and 1 <= m['num'] <= 90]
bio_seen = {}
for m in bio_markers:
    if m['num'] not in bio_seen: bio_seen[m['num']] = m

for num in range(1, 91):
    m = bio_seen[num]
    all_180.append({
        "overall_num": num + 90,
        "sub_num": num,
        "subject": "Biology",
        "start_page": m['page'],
        "start_y": m['bbox'][1],
        "header_text": m['text']
    })

for idx, q in enumerate(all_180):
    if idx + 1 < len(all_180):
        next_q = all_180[idx + 1]
        q['end_page'] = next_q['start_page']
        q['end_y'] = next_q['start_y']
    else:
        q['end_page'] = q['start_page']
        q['end_y'] = doc[q['start_page']].rect.height

os.makedirs("public/images/achiever", exist_ok=True)
os.makedirs("public/images/achiever_opts", exist_ok=True)

# Answer keys from page 40
key_page = doc[40].get_text("text")
# Parse answer keys
def parse_keys():
    keys = {}
    lines = [l.strip() for l in key_page.split('\n') if l.strip()]
    curr_sec = "PHYSICS"
    i = 0
    while i < len(lines):
        line = lines[i]
        if line in ["PHYSICS", "CHEMISTRY", "BIOLOGY"]:
            curr_sec = line
            i += 1
            continue
        if line == "Q.":
            # Read question numbers until "A."
            i += 1
            q_nums = []
            while i < len(lines) and lines[i] != "A." and lines[i] not in ["PHYSICS", "CHEMISTRY", "BIOLOGY", "Q."]:
                if lines[i].isdigit():
                    q_nums.append(int(lines[i]))
                i += 1
            if i < len(lines) and lines[i] == "A.":
                i += 1
                a_vals = []
                while i < len(lines) and lines[i] not in ["Q.", "PHYSICS", "CHEMISTRY", "BIOLOGY"]:
                    if lines[i].isdigit():
                        a_vals.append(int(lines[i]))
                    i += 1
                for qn, ans in zip(q_nums, a_vals):
                    keys[qn] = ans
            continue
        i += 1
    return keys

official_keys = parse_keys()
print(f"Parsed {len(official_keys)} official answer keys.")

# Parse solutions text by question number
all_solutions = open('data/all_solutions.txt', encoding='utf-8').read()
solutions_map = {}
for qn in range(1, 181):
    m = re.search(rf'(?:^|\n)\s*{qn}\)\s*([\s\S]*?)(?=(?:\n\s*\d+\)|\Z))', all_solutions)
    if m:
        solutions_map[qn] = m.group(1).strip()
    else:
        solutions_map[qn] = ""

# Known special image options for Achiever
special_opts_q = [1, 2, 10, 15, 16, 18, 19, 21, 22, 27, 28, 33, 37, 38, 39, 45, 50, 51, 57, 69, 70, 75]

questions_out = []

for q in all_180:
    qn = q['overall_num']
    sub = q['subject']
    sub_num = q['sub_num']
    sp = q['start_page']
    ep = q['end_page']
    sy = q['start_y']
    ey = q['end_y']
    
    # Render question visual crop
    if sp == ep:
        rect = fitz.Rect(30, max(30, sy - 5), doc[sp].rect.width - 30, ey - 5)
        pix = doc[sp].get_pixmap(clip=rect, dpi=160)
        img_name = f"q_{qn}.png"
        pix.save(os.path.join("public/images/achiever", img_name))
        combined_text = doc[sp].get_text("text", clip=rect).strip()
    else:
        # Cross page: render the full first page portion as primary question visual
        rect1 = fitz.Rect(30, max(30, sy - 5), doc[sp].rect.width - 30, doc[sp].rect.height - 30)
        pix1 = doc[sp].get_pixmap(clip=rect1, dpi=160)
        img_name = f"q_{qn}.png"
        pix1.save(os.path.join("public/images/achiever", img_name))
        t1 = doc[sp].get_text("text", clip=rect1).strip()
        
        t_mid = ""
        for mid_p in range(sp + 1, ep):
            rect_mid = fitz.Rect(30, 30, doc[mid_p].rect.width - 30, doc[mid_p].rect.height - 30)
            t_mid += "\n" + doc[mid_p].get_text("text", clip=rect_mid).strip()
            
        rect2 = fitz.Rect(30, 30, doc[ep].rect.width - 30, ey - 5)
        t2 = doc[ep].get_text("text", clip=rect2).strip()
        combined_text = (t1 + t_mid + "\n" + t2).strip()
    
    # Parse options
    opt_pattern = r'\(([1-4])\)\s*(.*?)(?=(?:\([1-4]\)|\Z))'
    matches = list(re.finditer(opt_pattern, combined_text, re.DOTALL))
    
    parsed_opts = {}
    q_stem = combined_text
    if matches and len(matches) >= 2:
        first_opt_start = matches[0].start()
        q_stem = combined_text[:first_opt_start].strip()
        q_stem = re.sub(r'^\d+\)\s*', '', q_stem).strip()
        for m in matches:
            idx = int(m.group(1))
            val = m.group(2).strip()
            # Clean up trailing section headers like CHEMISTRY, BIOLOGY
            val = re.sub(r'\s*(CHEMISTRY|BIOLOGY)\s*$', '', val)
            val = re.sub(r'\s+', ' ', val).strip()
            if val:
                parsed_opts[idx] = val

    options = []
    option_images = None
    
    if qn in special_opts_q:
        # Check if option crop images exist
        opt_imgs = [f"/images/achiever_opts/q{qn}_opt_{i}.png" for i in range(1, 5)]
        all_exist = all(os.path.exists(os.path.join("public", p.lstrip("/"))) for p in opt_imgs)
        if all_exist:
            option_images = opt_imgs
            # Use text if available, otherwise refer to image
            options = [
                parsed_opts.get(i, f"See Option ({i}) in formula/diagram")
                for i in range(1, 5)
            ]
        else:
            options = [parsed_opts.get(i, f"Option ({i})") for i in range(1, 5)]
    else:
        # Normal text question
        options = [parsed_opts.get(i, f"Option ({i})") for i in range(1, 5)]
        
    # Check question type
    upper_txt = combined_text.upper()
    if "ASSERTION" in upper_txt and "REASON" in upper_txt:
        q_type = "assertion_reason"
    elif "STATEMENT" in upper_txt or "STATEMENT-1" in upper_txt or "STATEMENT 1" in upper_txt:
        q_type = "statement_based"
    elif "MATCH" in upper_txt or "COLUMN" in upper_txt:
        q_type = "match_following"
    elif len(doc[sp].get_images()) > 0 or "FIGURE" in upper_txt or "GRAPH" in upper_txt or "DIAGRAM" in upper_txt:
        q_type = "diagram_based"
    else:
        q_type = "mcq"

    if not q_stem:
        q_stem = re.sub(r'^\d+\)\s*', '', q['header_text']).strip()

    item = {
        "id": f"achiever_{qn:03d}",
        "examId": "achiever_minor_test_02",
        "exam_id": "achiever_minor_test_02",
        "questionNumber": qn,
        "question_number": qn,
        "subject": sub,
        "questionType": q_type,
        "question_type": q_type,
        "questionText": q_stem,
        "question_text": q_stem,
        "options": options,
        "imageUrl": f"/images/achiever/q_{qn}.png",
        "image_url": f"/images/achiever/q_{qn}.png",
        "officialAnswer": official_keys.get(qn, 1),
        "official_answer": official_keys.get(qn, 1),
        "solutionText": solutions_map.get(qn, ""),
        "solution_text": solutions_map.get(qn, ""),
        "solutionFinalAnswer": official_keys.get(qn, 1),
        "solution_final_answer": official_keys.get(qn, 1),
        "sourcePdf": "Achiever Minor Test 02.pdf",
        "source_pdf": "Achiever Minor Test 02.pdf",
        "sourcePage": sp + 1,
        "source_page": sp + 1
    }
    if option_images:
        item["optionImages"] = option_images
        item["option_images"] = option_images
        
    questions_out.append(item)

# Save to data/achiever_minor_test_02_questions.json
with open("data/achiever_minor_test_02_questions.json", "w", encoding="utf-8") as f:
    json.dump(questions_out, f, indent=2, ensure_ascii=False)

print(f"Successfully wrote {len(questions_out)} questions to data/achiever_minor_test_02_questions.json")
