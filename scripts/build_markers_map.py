import fitz
import json
import re

doc = fitz.open('source_pdfs/Achiever Minor Test 02.pdf')

def get_page_markers(p):
    blocks = doc[p].get_text('blocks')
    markers = []
    for b in blocks:
        # Match `^\s*(\d+)\)\s*(.*)`
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

# Map out each section
phys_markers = []
for p in range(0, 14):
    for m in get_page_markers(p):
        if 1 <= m['num'] <= 45:
            phys_markers.append(m)

chem_markers = []
for p in range(13, 23):
    for m in get_page_markers(p):
        # On page 22 (index 22), Chemistry is at top, Biology at bottom
        if p == 22 and m['bbox'][1] > 200:
            continue
        if 1 <= m['num'] <= 45:
            chem_markers.append(m)

bio_markers = []
for p in range(22, 40):
    for m in get_page_markers(p):
        if p == 22 and m['bbox'][1] < 200:
            continue
        if 1 <= m['num'] <= 90:
            bio_markers.append(m)

print(f"Phys markers: {len(phys_markers)}, Chem markers: {len(chem_markers)}, Bio markers: {len(bio_markers)}")

# Check for duplicates or missing in each section
def analyze_section(name, markers, expected_count):
    seen = {}
    for m in markers:
        num = m['num']
        if num not in seen:
            seen[num] = m
    missing = [i for i in range(1, expected_count + 1) if i not in seen]
    print(f"{name}: found {len(seen)}/{expected_count}. Missing: {missing}")
    return seen

phys_map = analyze_section("Physics", phys_markers, 45)
chem_map = analyze_section("Chemistry", chem_markers, 45)
bio_map = analyze_section("Biology", bio_markers, 90)

