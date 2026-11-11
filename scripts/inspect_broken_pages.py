import fitz

doc = fitz.open('source_pdfs/Achiever Minor Test 02.pdf')

def inspect_page(p_num, target_qn):
    page = doc[p_num - 1]
    print(f"\n==================== PAGE {p_num} (TARGET Q{target_qn}) ====================")
    print("Page rect:", page.rect)
    blocks = page.get_text('blocks')
    for b in blocks:
        if f"{target_qn})" in b[4] or any(w in b[4] for w in ['cone', 'dielectric', 'condenser', 'wheatstone', 'ammeter', 'circuit shown']):
            print(f"BLOCK: bbox=({b[0]:.1f}, {b[1]:.1f}, {b[2]:.1f}, {b[3]:.1f})")
            print(b[4].strip())
            print("-" * 30)

    # Let's inspect images on the page
    imgs = page.get_images()
    print(f"Images on page {p_num}: {len(imgs)}")
    for img_info in imgs:
        xref = img_info[0]
        # find where this image is placed on the page
        for item in page.get_image_rects(xref):
            print(f"  Image xref={xref} bbox=({item.x0:.1f}, {item.y0:.1f}, {item.x1:.1f}, {item.y1:.1f}) width={item.width:.1f} height={item.height:.1f}")

    # Let's inspect vector drawings on the page
    drawings = page.get_drawings()
    print(f"Vector drawings on page {p_num}: {len(drawings)}")
    # group drawings by rect
    diag_rects = []
    for d in drawings:
        r = d['rect']
        diag_rects.append(r)
    if diag_rects:
        # print bounding boxes of distinct clusters
        print(f"Sample drawing rects: {[(r.x0, r.y0, r.x1, r.y1) for r in diag_rects[:5]]}")

inspect_page(5, 17)
inspect_page(6, 20)
inspect_page(9, 28)
inspect_page(9, 31)
inspect_page(10, 34)
inspect_page(12, 40)
