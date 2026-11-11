import fitz
import json
import re

doc = fitz.open('source_pdfs/Achiever Minor Test 02.pdf')

# Let's inspect pages 0 to 39
# Find all text blocks with coordinates
# Questions have number patterns like `^\s*(\d+)\)\s*`
# Notice in Physics (p0-13): numbers 1 to 45
# Notice in Chemistry (p13-22): numbers 1 to 45
# Notice in Biology (p22-39): numbers 1 to 90

sections = [
    {"name": "Physics", "start_page": 0, "end_page": 13, "q_start": 1, "q_end": 45, "overall_offset": 0},
    {"name": "Chemistry", "start_page": 13, "end_page": 22, "q_start": 1, "q_end": 45, "overall_offset": 45},
    {"name": "Biology", "start_page": 22, "end_page": 39, "q_start": 1, "q_end": 90, "overall_offset": 90}
]

# Let's check how blocks appear across pages
for p in range(len(doc)):
    if p > 39: break
    txt = doc[p].get_text('text')
    matches = re.findall(r'(?:^|\n)\s*(\d+)\)\s*', txt)
    print(f"Page {p} (1-indexed {p+1}): found question markers: {matches}")

