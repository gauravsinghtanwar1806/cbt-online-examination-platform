import fitz
import json
import re

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

# Build ordered list of all 180 questions with start positions
all_180 = []

# Physics: 1 to 45
phys_markers = []
for p in range(0, 14):
    for m in get_page_markers(p):
        if 1 <= m['num'] <= 45:
            phys_markers.append(m)
# deduplicate keeping first
phys_seen = {}
for m in phys_markers:
    if m['num'] not in phys_seen:
        phys_seen[m['num']] = m

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
chem_markers = []
for p in range(13, 23):
    for m in get_page_markers(p):
        if p == 22 and m['bbox'][1] > 200: continue
        if 1 <= m['num'] <= 45:
            chem_markers.append(m)
chem_seen = {}
for m in chem_markers:
    if m['num'] not in chem_seen:
        chem_seen[m['num']] = m

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
bio_markers = []
for p in range(22, 40):
    for m in get_page_markers(p):
        if p == 22 and m['bbox'][1] < 200: continue
        if 1 <= m['num'] <= 90:
            bio_markers.append(m)
bio_seen = {}
for m in bio_markers:
    if m['num'] not in bio_seen:
        bio_seen[m['num']] = m

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

# Now calculate end position for each question
for idx, q in enumerate(all_180):
    if idx + 1 < len(all_180):
        next_q = all_180[idx + 1]
        q['end_page'] = next_q['start_page']
        q['end_y'] = next_q['start_y']
    else:
        # Last question
        q['end_page'] = q['start_page']
        q['end_y'] = doc[q['start_page']].rect.height

# Check how many cross pages
cross_page_q = [q for q in all_180 if q['start_page'] != q['end_page']]
print(f"Total questions: {len(all_180)}")
print(f"Questions crossing pages: {len(cross_page_q)}")
for q in cross_page_q:
    print(f"Q{q['overall_num']} ({q['subject']} #{q['sub_num']}): starts P{q['start_page']} at y={q['start_y']:.1f}, ends P{q['end_page']} at y={q['end_y']:.1f}")

