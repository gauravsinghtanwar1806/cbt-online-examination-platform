import fitz

doc = fitz.open('source_pdfs/Achiever Minor Test 02.pdf')
page10 = doc[9]

# Search for "34)" or "dielectric"
blocks = page10.get_text('blocks')
for b in blocks:
    if '34)' in b[4] or 'dielectric' in b[4] or 'Capacity' in b[4]:
        print(f"BLOCK: {b[:4]}")
        print(b[4])
        print("="*40)

# Check drawings around y = 600 to 800
drawings = [d for d in page10.get_drawings() if 580 <= d['rect'].y0 <= 780]
print(f"Drawings in Q34 area: {len(drawings)}")

# Let's render this area of page 10 as an image to inspect the table!
rect = fitz.Rect(30, 590, page10.rect.width - 30, 780)
pix = page10.get_pixmap(clip=rect, dpi=160)
pix.save("public/images/achiever/q_34_table.png")
print("Saved Q34 table to public/images/achiever/q_34_table.png")

# Also let's extract words with coordinates in this rect
words = page10.get_text("words", clip=rect)
# sort by y, then x
words.sort(key=lambda w: (round(w[1] / 10) * 10, w[0]))
for w in words:
    print(f"({w[0]:.1f}, {w[1]:.1f}) {w[4]}")
