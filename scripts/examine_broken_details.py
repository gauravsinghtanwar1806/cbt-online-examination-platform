import fitz

doc = fitz.open('source_pdfs/Achiever Minor Test 02.pdf')

def examine_q(p_start, p_end, title):
    print(f"\n==================== {title} (Pages {p_start} to {p_end}) ====================")
    for p in range(p_start - 1, p_end):
        page = doc[p]
        print(f"--- PAGE {p+1} ---")
        blocks = page.get_text('blocks')
        for b in blocks:
            print(f"({b[0]:.1f}, {b[1]:.1f}, {b[2]:.1f}, {b[3]:.1f}):\n{b[4].strip()}")
        # Check images
        for img_info in page.get_images():
            xref = img_info[0]
            for item in page.get_image_rects(xref):
                print(f"  IMAGE xref={xref}: bbox=({item.x0:.1f}, {item.y0:.1f}, {item.x1:.1f}, {item.y1:.1f})")

examine_q(5, 6, "Q17 Wire Cone")
examine_q(6, 7, "Q20 Circuit 6 ohm")
examine_q(9, 9, "Q28 Ammeter")
examine_q(9, 10, "Q31 Wheatstone")
examine_q(10, 11, "Q34 Dielectric Table")
examine_q(12, 13, "Q40 Capacitors Network")
