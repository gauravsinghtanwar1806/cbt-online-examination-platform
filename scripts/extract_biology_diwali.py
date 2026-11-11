import fitz
import re
import json
import os

pdf_path = "source_pdfs/Biology Diwali Assignment.pdf"
doc = fitz.open(pdf_path)
print(f"Loaded {pdf_path}, {len(doc)} pages.")

# Chapter names list corresponding to chapters 1..28
chapter_names = [
    "Plant Diversity (The living world, Biological classification and Plant kingdom)",
    "Animal Kingdom",
    "Morphology of Flowering Plants",
    "Anatomy of Flowering Plants",
    "Structural organisation of animals (Animal tissues)",
    "Structural organisation of animals (Cockroach and Frog)",
    "Cell - The unit of life",
    "Biomolecules",
    "Cell cycle & Cell division",
    "Photosynthesis in Higher Plants",
    "Respiration in Plants",
    "Plant Growth and Development",
    "Breathing and Exchange of Gases",
    "Body Fluids and Circulation",
    "Excretory products & their elimination",
    "Movement and Locomotion (Muscles & skeletal system)",
    "Neural control & Co-ordination",
    "Chemical Coordination and Integration",
    "Sexual Reproduction in Flowering Plants",
    "Human Reproduction",
    "Reproductive Health",
    "Principles of Inheritance and Variation",
    "Molecular Basis of Inheritance",
    "Evolution",
    "Human Health & Disease",
    "Biotechnology : Principle and Processes",
    "Biotechnology and its application and Microbes in Human Welfare",
    "Ecology"
]

pages_with_ans = [11, 13, 16, 19, 21, 27, 30, 33, 36, 41, 45, 49, 51, 53, 54, 57, 58, 59, 63, 65, 67, 71, 75, 77, 80, 83, 88, 96]

def parse_ans_key(text):
    items = {}
    pattern = re.compile(r'Que\.?\s*((?:\d+\s+)+)Ans\.?\s*((?:\d+\s+)+)', re.DOTALL)
    for m in pattern.finditer(text):
        q_nums = [int(x) for x in m.group(1).split()]
        a_nums = [int(x) for x in m.group(2).split()]
        for q, a in zip(q_nums, a_nums):
            items[q] = a
    return items

def extract_options(q_text):
    pattern = r'\(([1-4])\)\s*(.*?)(?=(?:\([1-4]\)|\Z))'
    opts = {}
    matches = list(re.finditer(pattern, q_text, re.DOTALL))
    for m in matches:
        num = int(m.group(1))
        val = m.group(2).strip()
        opts[num] = val
    
    options = []
    for i in range(1, 5):
        if i in opts and opts[i]:
            options.append(opts[i])
        else:
            options.append(f"Option ({i})")
            
    # Question stem is before first option
    if matches:
        first_pos = matches[0].start()
        stem = q_text[:first_pos].strip()
    else:
        stem = q_text.strip()
    # Strip leading question number e.g. "1. " or "1) "
    stem = re.sub(r'^\d+\s*[\.\)]\s*', '', stem).strip()
    return stem, options

os.makedirs("public/images/biology_diwali", exist_ok=True)

all_questions = []
start_p = 6 # PDF page 7 (0-indexed 6)

for ch_idx, end_p in enumerate(pages_with_ans, 1):
    ch_name = chapter_names[ch_idx - 1]
    # Answer key page is end_p - 1
    ans_text = doc[end_p - 1].get_text("text")
    ans_keys = parse_ans_key(ans_text)
    expected_count = len(ans_keys)
    
    # Collect all pages for this chapter (from start_p to end_p - 1 inclusive)
    # Find bounding boxes and text of each question
    # To locate accurately, we search across the pages of this chapter
    ch_pages = list(range(start_p, end_p))
    
    # Find positions of questions across these pages
    q_positions = {}
    for p in ch_pages:
        page = doc[p]
        page_text = page.get_text("text")
        # Find every question marker on this page: \n\s*(\d{1,2})\s*[\.\)]
        # We also look at blocks
        blocks = page.get_text("blocks")
        for b in blocks:
            b_txt = b[4].strip()
            m = re.match(r'^(\d{1,2})\s*[\.\)]\s*(.*)', b_txt, re.DOTALL)
            if m:
                q_n = int(m.group(1))
                if 1 <= q_n <= expected_count and q_n not in q_positions:
                    q_positions[q_n] = {
                        "page": p,
                        "y0": b[1],
                        "y1": b[3],
                        "text": b_txt
                    }
        # Fallback: if some question was not at the start of a block, search lines
        for q_n in range(1, expected_count + 1):
            if q_n not in q_positions:
                m = re.search(r'(?:^|\n)\s*' + str(q_n) + r'\s*[\.\)]\s*', page_text)
                if m:
                    # Found on page p
                    # Estimate y position or use page
                    q_positions[q_n] = {
                        "page": p,
                        "y0": 60,
                        "y1": page.rect.height - 60,
                        "text": ""
                    }
    
    # Now extract full text for each question in this chapter
    # Concatenate chapter text with page markers
    full_ch_text = ""
    for p in ch_pages:
        # If it's the last page of chapter, exclude the answer key section from question text
        ptxt = doc[p].get_text("text")
        if p == end_p - 1:
            ans_idx = ptxt.find("Que.")
            if ans_idx != -1:
                ptxt = ptxt[:ans_idx]
            else:
                ans_idx2 = ptxt.find("ANSWER KEY")
                if ans_idx2 != -1:
                    ptxt = ptxt[:ans_idx2]
        full_ch_text += f"\n<<<PAGE_{p}>>>\n" + ptxt

    # Split into questions using regex
    # Questions start with: (?:\n|^)\s*(\d{1,2})\s*[\.\)]\s+
    pattern = re.compile(r'(?:\n|^)\s*(\d{1,2})\s*[\.\)]\s+', re.DOTALL)
    matches = list(pattern.finditer(full_ch_text))
    
    # Filter matches to only valid sequence 1..expected_count
    valid_matches = []
    current_expect = 1
    for m in matches:
        q_num = int(m.group(1))
        if q_num == current_expect:
            valid_matches.append((q_num, m.start(), m.end()))
            current_expect += 1
            if current_expect > expected_count:
                break
                
    for idx, (q_num, start_idx, header_end) in enumerate(valid_matches):
        next_start = valid_matches[idx + 1][1] if idx + 1 < len(valid_matches) else len(full_ch_text)
        raw_q_text = full_ch_text[start_idx:next_start].strip()
        # Clean page markers from text
        clean_text = re.sub(r'<<<PAGE_\d+>>>\n?', '', raw_q_text).strip()
        
        stem, options = extract_options(clean_text)
        
        # Check if question has diagram
        p_info = q_positions.get(q_num, {})
        page_num = p_info.get("page", start_p)
        page = doc[page_num]
        
        has_diagram = (len(page.get_images()) > 0 or 
                       "DIAGRAM" in clean_text.upper() or 
                       "FIGURE" in clean_text.upper() or 
                       "GIVEN BELOW" in clean_text.upper() or 
                       "VENN" in clean_text.upper())
                       
        upper_txt = clean_text.upper()
        if "ASSERTION" in upper_txt and "REASON" in upper_txt:
            q_type = "assertion_reason"
        elif "STATEMENT" in upper_txt:
            q_type = "statement_based"
        elif "MATCH" in upper_txt or "COLUMN" in upper_txt:
            q_type = "match_following"
        elif has_diagram:
            q_type = "diagram_based"
        else:
            q_type = "mcq"
            
        # Render high-res question image crop
        img_filename = f"ch{ch_idx:02d}_q{q_num:02d}.png"
        img_path = os.path.join("public/images/biology_diwali", img_filename)
        
        y0 = p_info.get("y0", 60)
        # Bounding box
        clip_top = max(35, y0 - 10)
        # Find next question y0 on same page if any
        next_y0 = None
        if q_num + 1 in q_positions and q_positions[q_num + 1]["page"] == page_num:
            next_y0 = q_positions[q_num + 1]["y0"]
            
        clip_bottom = (next_y0 - 5) if next_y0 else min(page.rect.height - 35, clip_top + 260)
        clip_rect = fitz.Rect(35, clip_top, page.rect.width - 35, clip_bottom)
        
        try:
            pix = page.get_pixmap(clip=clip_rect, dpi=160)
            pix.save(img_path)
        except Exception as e:
            # Fallback to full page crop
            pix = page.get_pixmap(dpi=120)
            pix.save(img_path)
            
        official_ans = ans_keys.get(q_num, 1)
        
        q_record = {
            "id": f"bio_ch{ch_idx:02d}_q{q_num:02d}",
            "exam_id": "biology_diwali_assignment",
            "chapter_index": ch_idx,
            "chapter_name": ch_name,
            "question_number": q_num,
            "subject": "Biology",
            "question_type": q_type,
            "question_text": stem if stem else f"Question {q_num}",
            "options": options,
            "image_url": f"/images/biology_diwali/{img_filename}",
            "official_answer": official_ans,
            "source_pdf": "Biology Diwali Assignment.pdf",
            "source_page": page_num + 1
        }
        all_questions.append(q_record)
        
    start_p = end_p

output_file = "data/biology_diwali_questions.json"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(all_questions, f, indent=2, ensure_ascii=False)

print(f"Successfully extracted {len(all_questions)} questions across all 28 chapters into {output_file}")
