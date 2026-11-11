import fitz
import json
import re
import os

doc = fitz.open('source_pdfs/Achiever Minor Test 02.pdf')
special_q = [1, 2, 10, 15, 16, 18, 19, 21, 22, 27, 28, 33, 37, 38, 39, 45, 50, 51, 57, 69, 70, 75]

from detect_all_ranges import all_180
os.makedirs('public/images/achiever_opts', exist_ok=True)

# For each question, render crops for each option (1..4)
for qn in special_q:
    q = next(item for item in all_180 if item['overall_num'] == qn)
    sp = q['start_page']
    ep = q['end_page']
    sy = q['start_y']
    ey = q['end_y']
    
    pages = [sp] if sp == ep else [sp, ep]
    markers = []
    for p in pages:
        page = doc[p]
        top = sy - 5 if p == sp else 30
        bot = ey if p == ep else page.rect.height
        blocks = page.get_text('blocks')
        for b in blocks:
            if b[1] >= top and b[3] <= bot:
                txt = b[4].strip()
                m = re.match(r'^\s*\(([1-4])\)\s*(.*)', txt, re.DOTALL)
                if m:
                    idx = int(m.group(1))
                    markers.append({
                        "idx": idx,
                        "p": p,
                        "bbox": b[:4],
                        "text": m.group(2).strip()
                    })
    
    # Sort markers by idx
    markers.sort(key=lambda x: x['idx'])
    
    # Render option images
    for i, m in enumerate(markers):
        p = m['p']
        page = doc[p]
        b = m['bbox']
        # Determine bottom of this option crop:
        # either the top of the next marker on the same page, or b[3] + 25
        next_top = None
        if i + 1 < len(markers) and markers[i+1]['p'] == p:
            next_top = markers[i+1]['bbox'][1] - 2
        else:
            # could be end of question or page bottom
            next_top = min(b[3] + 28, page.rect.height - 20)
            
        opt_rect = fitz.Rect(40, max(20, b[1] - 4), page.rect.width - 40, max(b[3] + 4, next_top))
        pix = page.get_pixmap(clip=opt_rect, dpi=160)
        img_name = f"q{qn}_opt_{m['idx']}.png"
        pix.save(os.path.join('public/images/achiever_opts', img_name))

print("Rendered option crops for all 22 special questions!")

