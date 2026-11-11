import fitz
import json
import re
import os

doc = fitz.open('source_pdfs/Achiever Minor Test 02.pdf')
os.makedirs('public/images/achiever_solutions', exist_ok=True)

# Solutions are from page 41 (index 41) to page 78 (index 78)
print(f"Scanning solutions on pages 41 to {len(doc)-1}...")

# Let's find question solution headers across pages 41..78
# Pattern: `(?:^|\n)\s*(\d+)\)\s*`
solution_markers = []
for p in range(41, len(doc)):
    page = doc[p]
    blocks = page.get_text('blocks')
    for b in blocks:
        txt = b[4].strip()
        m = re.match(r'^\s*(\d+)\)\s*(.*)', txt, re.DOTALL)
        if m:
            qn = int(m.group(1))
            if 1 <= qn <= 180:
                solution_markers.append({
                    "qn": qn,
                    "page": p,
                    "bbox": b[:4],
                    "text": txt
                })

# Deduplicate keeping first occurrence for each qn
seen_sol = {}
for m in solution_markers:
    if m['qn'] not in seen_sol:
        seen_sol[m['qn']] = m

print(f"Found {len(seen_sol)} / 180 solution headers in PDF.")

# For each question, find its start and end coordinates
sol_ranges = []
for qn in range(1, 181):
    if qn not in seen_sol:
        print(f"Warning: Solution for Q{qn} not found!")
        continue
    m = seen_sol[qn]
    sol_ranges.append({
        "qn": qn,
        "start_page": m['page'],
        "start_y": m['bbox'][1],
    })

for idx, item in enumerate(sol_ranges):
    if idx + 1 < len(sol_ranges):
        nxt = sol_ranges[idx + 1]
        item['end_page'] = nxt['start_page']
        item['end_y'] = nxt['start_y']
    else:
        item['end_page'] = item['start_page']
        item['end_y'] = doc[item['start_page']].rect.height - 20

# Render solution crops
for item in sol_ranges:
    qn = item['qn']
    sp = item['start_page']
    ep = item['end_page']
    sy = item['start_y']
    ey = item['end_y']
    
    if sp == ep:
        rect = fitz.Rect(30, max(30, sy - 5), doc[sp].rect.width - 30, min(doc[sp].rect.height - 20, ey - 2))
        pix = doc[sp].get_pixmap(clip=rect, dpi=160)
        pix.save(f"public/images/achiever_solutions/sol_{qn}.png")
    else:
        # Cross page: render the main portion
        rect = fitz.Rect(30, max(30, sy - 5), doc[sp].rect.width - 30, doc[sp].rect.height - 20)
        pix = doc[sp].get_pixmap(clip=rect, dpi=160)
        pix.save(f"public/images/achiever_solutions/sol_{qn}.png")

print("Rendered all available solution page images in public/images/achiever_solutions!")
