import fitz
import json

doc = fitz.open('source_pdfs/Achiever Minor Test 02.pdf')
ach = json.load(open('data/achiever_minor_test_02_questions.json', encoding='utf-8'))

diagram_q_nums = [2, 3, 4, 6, 8, 17, 19, 20, 21, 23, 26, 28, 29, 30, 31, 37, 40, 41, 42, 43, 44, 156, 161, 164, 173, 177]

for qn in diagram_q_nums:
    q = next(x for x in ach if x['questionNumber'] == qn)
    sp = q['sourcePage'] - 1
    # Check page sp and sp + 1
    pages_to_check = [sp]
    if sp + 1 < len(doc):
        pages_to_check.append(sp + 1)
        
    print(f"\n==================== Q{qn} ({q['subject']}) ====================")
    print("Question Text:\n", q['questionText'][:90])
    
    for p in pages_to_check:
        page = doc[p]
        imgs = page.get_images()
        for img in imgs:
            xref = img[0]
            for r in page.get_image_rects(xref):
                # only print relevant size images (ignore tiny icons < 20px)
                if r.width > 40 and r.height > 30:
                    print(f"  Page {p+1}: Image xref={xref} bbox=({r.x0:.1f}, {r.y0:.1f}, {r.x1:.1f}, {r.y1:.1f}) size=({r.width:.1f}x{r.height:.1f})")
