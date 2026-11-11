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

# Map all 180 questions with start and end
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

# Chemistry: 1 to 45
chem_markers = [m for p in range(13, 23) for m in get_page_markers(p) if not (p == 22 and m['bbox'][1] > 200) and 1 <= m['num'] <= 45]
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

print("Built 180 boundaries.")

# Now for each question, collect the full text across its span
os.makedirs("public/images/achiever_opts", exist_ok=True)

results = []
for q in all_180:
    q_num = q['overall_num']
    sp = q['start_page']
    ep = q['end_page']
    sy = q['start_y']
    ey = q['end_y']
    
    # Collect text across pages
    combined_text = ""
    if sp == ep:
        rect = fitz.Rect(30, max(30, sy - 5), doc[sp].rect.width - 30, ey - 5)
        combined_text = doc[sp].get_text("text", clip=rect).strip()
    else:
        # Cross-page
        # Page sp from sy to bottom
        rect1 = fitz.Rect(30, max(30, sy - 5), doc[sp].rect.width - 30, doc[sp].rect.height - 30)
        t1 = doc[sp].get_text("text", clip=rect1).strip()
        # Intervening pages if any
        t_mid = ""
        for mid_p in range(sp + 1, ep):
            rect_mid = fitz.Rect(30, 30, doc[mid_p].rect.width - 30, doc[mid_p].rect.height - 30)
            t_mid += "\n" + doc[mid_p].get_text("text", clip=rect_mid).strip()
        # Page ep from top to ey
        rect2 = fitz.Rect(30, 30, doc[ep].rect.width - 30, ey - 5)
        t2 = doc[ep].get_text("text", clip=rect2).strip()
        combined_text = (t1 + t_mid + "\n" + t2).strip()
    
    # Test parsing options from combined_text
    # Try multiple option regex patterns:
    # 1. `\(([1-4])\)\s*(.*?)(?=(?:\([1-4]\)|\Z))`
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
            # Clean up trailing newlines / extra noise
            val = re.sub(r'\s+', ' ', val)
            if val:
                parsed_opts[idx] = val
                
    results.append({
        "q_num": q_num,
        "subject": q['subject'],
        "sub_num": q['sub_num'],
        "sp": sp,
        "ep": ep,
        "text_len": len(combined_text),
        "opts_found": list(parsed_opts.keys()),
        "parsed_opts": parsed_opts,
        "stem": q_stem[:60]
    })

# Check summary
complete_text = [r for r in results if len(r['opts_found']) == 4 and all(r['parsed_opts'][i] for i in range(1, 5))]
print(f"Questions with all 4 text options extracted: {len(complete_text)} / 180")
incomplete = [r for r in results if len(r['opts_found']) < 4]
print(f"Questions requiring image/special handling: {len(incomplete)}")
for r in incomplete:
    print(f"Q{r['q_num']:3d} (P{r['sp']}->P{r['ep']}): found opts {r['opts_found']} | {r['stem']}")
