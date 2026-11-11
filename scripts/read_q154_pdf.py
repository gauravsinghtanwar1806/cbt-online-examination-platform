import fitz

doc = fitz.open('source_pdfs/Achiever Minor Test 02.pdf')
page = doc[33] # Page 34
blocks = page.get_text('blocks')
for b in blocks[:15]:
    print("BLOCK:", b[:4])
    print(b[4])
    print("="*40)
