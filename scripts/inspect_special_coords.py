import fitz
import json
import re

doc = fitz.open('source_pdfs/Achiever Minor Test 02.pdf')

# Let's inspect the layout of options for each of the 22 special questions in the test paper (pages 0-39)
special_q = [1, 2, 10, 15, 16, 18, 19, 21, 22, 27, 28, 33, 37, 38, 39, 45, 50, 51, 57, 69, 70, 75]

# We need their start page and end page from detect_all_ranges
from detect_all_ranges import all_180

for qn in special_q:
    q = next(item for item in all_180 if item['overall_num'] == qn)
    sp = q['start_page']
    ep = q['end_page']
    sy = q['start_y']
    ey = q['end_y']
    print(f"\n================ Q{qn} (Page {sp} to {ep}) ================")
    # Look for (1), (2), (3), (4) text words/blocks on page sp (and ep if different)
    pages_to_check = [sp] if sp == ep else [sp, ep]
    for p in pages_to_check:
        blocks = doc[p].get_text('blocks')
        for b in blocks:
            # check if inside y bounds
            top_bound = sy - 5 if p == sp else 30
            bot_bound = ey if p == ep else doc[p].rect.height
            if b[1] >= top_bound and b[3] <= bot_bound:
                txt = b[4].strip()
                if any(txt.startswith(f"({i})") or f"({i})" in txt for i in [1, 2, 3, 4]):
                    print(f"  P{p} bbox=({b[0]:.1f}, {b[1]:.1f}, {b[2]:.1f}, {b[3]:.1f}): {repr(txt[:60])}")

