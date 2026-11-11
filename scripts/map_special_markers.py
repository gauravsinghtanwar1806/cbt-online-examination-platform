import fitz
import json
import re
import os

doc = fitz.open('source_pdfs/Achiever Minor Test 02.pdf')
special_q = [1, 2, 10, 15, 16, 18, 19, 21, 22, 27, 28, 33, 37, 38, 39, 45, 50, 51, 57, 69, 70, 75]

from detect_all_ranges import all_180

os.makedirs('public/images/achiever_opts', exist_ok=True)

# For each question in special_q, locate the 4 option markers (1), (2), (3), (4)
# and get their positions, text, and any adjacent images
option_crops = {}

for qn in special_q:
    q = next(item for item in all_180 if item['overall_num'] == qn)
    sp = q['start_page']
    ep = q['end_page']
    sy = q['start_y']
    ey = q['end_y']
    
    pages = [sp] if sp == ep else [sp, ep]
    found_markers = []
    
    for p in pages:
        page = doc[p]
        top = sy - 5 if p == sp else 30
        bot = ey if p == ep else page.rect.height
        
        # Search blocks for (1), (2), (3), (4)
        blocks = page.get_text('blocks')
        for b in blocks:
            if b[1] >= top and b[3] <= bot:
                txt = b[4].strip()
                # Check if starts with `(1)`, `(2)`, `(3)`, `(4)`
                m = re.match(r'^\s*\(([1-4])\)\s*(.*)', txt, re.DOTALL)
                if m:
                    idx = int(m.group(1))
                    found_markers.append({
                        "opt_idx": idx,
                        "page": p,
                        "bbox": b[:4],
                        "text": m.group(2).strip()
                    })
    
    print(f"Q{qn:2d}: found {len(found_markers)} option markers -> {[m['opt_idx'] for m in found_markers]}")
    option_crops[qn] = found_markers

