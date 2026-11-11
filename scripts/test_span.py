import fitz
import json
import re

doc = fitz.open('source_pdfs/Achiever Minor Test 02.pdf')

# Let's inspect where each question starts and ends
# A question starts at number N) on page P at (x, y)
# and ends when number N+1) starts!
# If number N+1) is on page P+1, the question spans from N) to the end of page P,
# PLUS the beginning of page P+1 up to N+1)!

# Let's verify for Q3:
# Q3 starts on Page 0 at 3)
# Q4 starts on Page 1 at 4)
# That means Q3 includes:
# - Text on Page 0 from 3) to bottom of Page 0
# - Text on Page 1 from top of Page 1 to 4)

p0_blocks = doc[0].get_text('blocks')
p1_blocks = doc[1].get_text('blocks')

print("P0 blocks:")
for b in p0_blocks:
    if '3)' in b[4]:
        print("  Q3 start:", b[4])

print("P1 blocks before Q4:")
for b in p1_blocks:
    if '4)' in b[4]:
        print("  Q4 reached, stopping.")
        break
    print("  Q3 continuation:", b[4])
