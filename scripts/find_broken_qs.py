import fitz

doc = fitz.open('source_pdfs/Achiever Minor Test 02.pdf')

# Let's inspect page 6 (index 5) or whichever page Q17, Q20, Q28, Q31, Q34, Q40 are on!
for p in range(4, 15):
    txt = doc[p].get_text('text')
    for qn in [17, 20, 28, 31, 34, 40]:
        if f"{qn})" in txt:
            print(f"Q{qn} found on page {p+1}")
