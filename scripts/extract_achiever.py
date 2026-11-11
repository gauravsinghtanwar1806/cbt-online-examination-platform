import fitz
import re
import json
import os

pdf_path = "source_pdfs/Achiever Minor Test 02.pdf"
doc = fitz.open(pdf_path)

print(f"Loaded {pdf_path}, {len(doc)} pages.")

# 1. Parse Answer Keys from Page 41 (0-indexed 40)
ans_page = doc[40].get_text("text")
lines = [l.strip() for l in ans_page.split("\n") if l.strip()]

ans_map = {}
current_subject = None
i = 0
while i < len(lines):
    line = lines[i]
    if line in ["PHYSICS", "CHEMISTRY", "BIOLOGY"]:
        current_subject = line
        i += 1
        continue
    if line == "Q.":
        i += 1
        q_nums = []
        while i < len(lines) and lines[i] != "A.":
            if lines[i].isdigit():
                q_nums.append(int(lines[i]))
            i += 1
        if i < len(lines) and lines[i] == "A.":
            i += 1
            a_nums = []
            while i < len(lines) and lines[i] not in ["Q.", "PHYSICS", "CHEMISTRY", "BIOLOGY"]:
                if lines[i].isdigit():
                    a_nums.append(int(lines[i]))
                i += 1
            for q, a in zip(q_nums, a_nums):
                ans_map[q] = {"subject": current_subject, "ans": a}
            continue
    i += 1

print(f"Extracted {len(ans_map)} answer keys from page 41.")

# 2. Extract Solutions from Pages 42 to 79 (0-indexed 41 to 78)
sol_text = ""
for p in range(41, 79):
    sol_text += f"\n<<<PAGE {p+1}>>>\n" + doc[p].get_text("text")

sol_blocks = re.split(r'\n\s*(\d{1,3})\)\s*', sol_text)
solutions = {}
for j in range(1, len(sol_blocks), 2):
    q_num = int(sol_blocks[j])
    content = sol_blocks[j+1].strip()
    m = re.search(r'Final\s*Answer\s*:?\s*(?:Option\s*)?\(?(\d)\)?', content, re.IGNORECASE)
    sol_ans = int(m.group(1)) if m else None
    solutions[q_num] = {
        "text": content,
        "final_answer": sol_ans
    }

print(f"Extracted {len(solutions)} solutions.")

# 3. Locate Questions in Pages 1 to 40
# Physics: Q1 to 45 (pages 0..13)
# Chemistry: Q1 to 45 (pages 14..22) -> overall Q46 to Q90
#   * Note: On page 22 (PDF page 23), chemistry Q45 is at top before BIOLOGY header (y < 200)
# Biology: Q1 to 90 (pages 22..39) -> overall Q91 to Q180
#   * Note: On page 22 (PDF page 23), biology Q1 to Q5 are below BIOLOGY header (y > 200)

def locate_questions():
    # Physics 1..45
    phys_markers = []
    for p in range(0, 14):
        for b in doc[p].get_text("blocks"):
            txt = b[4].strip()
            m = re.match(r'^(\d{1,2})\)\s*(.*)', txt, re.DOTALL)
            if m and 1 <= int(m.group(1)) <= 45:
                num = int(m.group(1))
                phys_markers.append((num, num, p, b[1], b[3], txt))

    # Chemistry 1..45 -> overall 46..90
    chem_markers = []
    for p in range(14, 23):
        for b in doc[p].get_text("blocks"):
            if p == 22 and b[1] > 200: # Skip Biology on page 22
                continue
            txt = b[4].strip()
            m = re.match(r'^(\d{1,2})\)\s*(.*)', txt, re.DOTALL)
            if m and 1 <= int(m.group(1)) <= 45:
                num = int(m.group(1))
                overall = num + 45
                chem_markers.append((overall, num, p, b[1], b[3], txt))

    # Biology 1..90 -> overall 91..180
    bio_markers = []
    for p in range(22, 40):
        for b in doc[p].get_text("blocks"):
            if p == 22 and b[1] < 200: # Skip Chemistry Q45 on page 22
                continue
            txt = b[4].strip()
            m = re.match(r'^(\d{1,2})\)\s*(.*)', txt, re.DOTALL)
            if m and 1 <= int(m.group(1)) <= 90:
                num = int(m.group(1))
                overall = num + 90
                bio_markers.append((overall, num, p, b[1], b[3], txt))

    # Deduplicate in case a block was matched twice
    combined_dict = {}
    for overall, sub_num, p, y0, y1, txt in (phys_markers + chem_markers + bio_markers):
        if overall not in combined_dict:
            combined_dict[overall] = (overall, sub_num, p, y0, y1, txt)

    combined = list(combined_dict.values())
    combined.sort(key=lambda x: x[0])

    all_q = {}
    for idx, (overall, sub_num, p, y0, y1, txt) in enumerate(combined):
        next_y0 = None
        if idx + 1 < len(combined):
            next_overall, _, next_p, next_y, _, _ = combined[idx+1]
            if next_p == p:
                next_y0 = next_y

        page_height = doc[p].rect.height
        clip_top = max(30, y0 - 10)
        clip_bottom = (next_y0 - 5) if next_y0 else (page_height - 30)
        clip_rect = fitz.Rect(30, clip_top, doc[p].rect.width - 30, clip_bottom)

        all_q[overall] = {
            "overall_q": overall,
            "sub_q": sub_num,
            "page": p,
            "clip_rect": clip_rect,
            "header_text": txt
        }
    return all_q

q_locations = locate_questions()
print(f"Located {len(q_locations)} question positions.")

os.makedirs("public/images/achiever", exist_ok=True)
os.makedirs("data", exist_ok=True)

questions_data = []

for q_num in range(1, 181):
    loc = q_locations.get(q_num)
    if not loc:
        print(f"WARNING: Q{q_num} location not found!")
        continue

    p = loc["page"]
    page = doc[p]
    rect = loc["clip_rect"]

    # Render high-res image
    pix = page.get_pixmap(clip=rect, dpi=160)
    img_filename = f"q_{q_num}.png"
    img_path = os.path.join("public/images/achiever", img_filename)
    pix.save(img_path)

    # Extract text from this rect
    q_page_text = page.get_text("text", clip=rect).strip()

    # Subject determination
    if q_num <= 45:
        subject = "Physics"
    elif q_num <= 90:
        subject = "Chemistry"
    else:
        subject = "Biology"

    # Question type determination
    upper_txt = q_page_text.upper()
    if "ASSERTION" in upper_txt and "REASON" in upper_txt:
        q_type = "assertion_reason"
    elif "STATEMENT" in upper_txt or "STATEMENT-1" in upper_txt or "STATEMENT 1" in upper_txt:
        q_type = "statement_based"
    elif "MATCH" in upper_txt or "COLUMN" in upper_txt:
        q_type = "match_following"
    elif len(page.get_images()) > 0 or "FIGURE" in upper_txt or "GRAPH" in upper_txt or "DIAGRAM" in upper_txt:
        q_type = "diagram_based"
    else:
        q_type = "mcq"

    # Parse options
    opt_pattern = r'\(([1-4])\)\s*(.*?)(?=(?:\([1-4]\)|\Z))'
    matches = list(re.finditer(opt_pattern, q_page_text, re.DOTALL))

    options = ["Option 1", "Option 2", "Option 3", "Option 4"]
    question_stem = q_page_text

    if matches and len(matches) >= 2:
        first_opt_start = matches[0].start()
        question_stem = q_page_text[:first_opt_start].strip()
        question_stem = re.sub(r'^\d+\)\s*', '', question_stem).strip()

        extracted_opts = {}
        for m in matches:
            idx = int(m.group(1))
            val = m.group(2).strip()
            if val:
                extracted_opts[idx] = val

        for o_idx in range(1, 5):
            if o_idx in extracted_opts:
                options[o_idx - 1] = extracted_opts[o_idx]
            else:
                options[o_idx - 1] = f"Option ({o_idx})"
    else:
        question_stem = re.sub(r'^\d+\)\s*', '', q_page_text).strip()
        options = ["(1) Option 1", "(2) Option 2", "(3) Option 3", "(4) Option 4"]

    # Fallback: if question_stem is empty, use the header text
    if not question_stem:
        question_stem = re.sub(r'^\d+\)\s*', '', loc["header_text"]).strip()
    if not question_stem:
        question_stem = f"Question {q_num} (See diagram/formula above)"

    ans_info = ans_map.get(q_num, {})
    official_ans = ans_info.get("ans", 1)

    sol_info = solutions.get(q_num, {})
    sol_text_content = sol_info.get("text", "")
    sol_final_ans = sol_info.get("final_answer")

    # Store BOTH camelCase and snake_case for complete compatibility
    q_entry = {
        "id": f"achiever_{q_num:03d}",
        "examId": "achiever_minor_test_02",
        "exam_id": "achiever_minor_test_02",
        "questionNumber": q_num,
        "question_number": q_num,
        "subject": subject,
        "questionType": q_type,
        "question_type": q_type,
        "questionText": question_stem,
        "question_text": question_stem,
        "options": options,
        "imageUrl": f"/images/achiever/{img_filename}",
        "image_url": f"/images/achiever/{img_filename}",
        "officialAnswer": official_ans,
        "official_answer": official_ans,
        "solutionText": sol_text_content,
        "solution_text": sol_text_content,
        "solutionFinalAnswer": sol_final_ans,
        "solution_final_answer": sol_final_ans,
        "sourcePdf": "Achiever Minor Test 02.pdf",
        "source_pdf": "Achiever Minor Test 02.pdf",
        "sourcePage": p + 1,
        "source_page": p + 1
    }
    questions_data.append(q_entry)

output_file = "data/achiever_minor_test_02_questions.json"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(questions_data, f, indent=2, ensure_ascii=False)

print(f"Successfully extracted {len(questions_data)} questions into {output_file}")
