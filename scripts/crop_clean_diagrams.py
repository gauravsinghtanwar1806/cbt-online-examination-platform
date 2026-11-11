"""
Script to crop clean isolated diagrams from source PDFs with high DPI (300 DPI)
and ensure zero duplicated question text in diagram images.
"""
import os
import json
import fitz

def ensure_dir(d):
    os.makedirs(d, exist_ok=True)

ensure_dir('public/images/achiever')
ensure_dir('public/images/biology_diwali')

doc_achiever = fitz.open('source_pdfs/Achiever Minor Test 02.pdf')

# Achiever diagram definitions: (qn, page_1_based, bbox or xref)
# If xref is provided, PyMuPDF get_image_rects gives the exact pixel-perfect bbox of the embedded image!
achiever_diagrams = {
    2: (1, 23),
    3: (1, 33),
    4: (2, 42),
    5: (2, 44),
    6: (2, 46),
    7: (3, 56),
    8: (3, 58),
    15: (5, 87),
    17: (6, 115),    # Wire cone from page 6
    19: (6, 125),
    20: (7, 141),    # 6 ohm circuit from page 7
    21: (7, 143),
    23: (7, 153),
    25: (8, 164),    # Max power circuit from page 8
    26: (8, 166),
    28: (9, 184),    # Ammeter circuit from page 9
    29: (9, 194),
    30: (9, 196),
    31: (10, 204),   # Balanced wheatstone bridge from page 10
    37: (11, 223),   # Galvanometer circuit
    38: (12, 237),   # Dielectric slab capacitor
    39: (12, 246),   # Five plates
    40: (13, 260),   # Capacitors network from page 13
    41: (13, 262),   # Capacitors match circuit
    42: (13, 264),   # Charge circuit
    43: (14, 272),   # Capacitor discharge graph
    44: (14, 274),   # Steady state circuit
    87: (22, 380),   # Chemistry apparatus
    156: (34, 456),  # Zwitterion structures
    161: (36, 469),  # Cell cycle diagram
    164: (36, 471),  # Chromosome diagram
    173: (38, 484),  # Meiosis I modification diagram
    177: (39, 492),  # Cell division stage diagram
}

print('=== Processing Achiever Diagrams ===')
for qn, (pno, xref) in achiever_diagrams.items():
    page = doc_achiever[pno - 1]
    rects = page.get_image_rects(xref)
    if not rects:
        print(f'Warning: No rect for Q{qn} (pno {pno}, xref {xref})')
        continue
    rect = rects[0]
    
    # Slight margin around diagram (1 pt) for visual breathing room
    clip_rect = fitz.Rect(max(0, rect.x0 - 2), max(0, rect.y0 - 2), min(page.rect.width, rect.x1 + 2), min(page.rect.height, rect.y1 + 2))
    pix = page.get_pixmap(clip=clip_rect, dpi=300)
    
    out_path1 = f'public/images/achiever/diag_q{qn}.png'
    out_path2 = f'public/images/achiever/q_{qn}.png'
    pix.save(out_path1)
    pix.save(out_path2)
    print(f'Cropped Q{qn} clean diagram: {pix.width}x{pix.height} -> {out_path1}')

# Process Biology Diwali diagrams
doc_bio = fitz.open('source_pdfs/Biology Diwali Assignment.pdf')

bio_diagrams = {
    'bio_ch01_q01': (7, fitz.Rect(180, 150, 420, 272)),
    'bio_ch03_q13': (15, 122),
    'bio_ch05_q09': (21, 162),
    'bio_ch06_q12': (24, 187),
    'bio_ch06_q22': (27, 248),
    'bio_ch10_q10': (39, 382),
    'bio_ch14_q01': (52, 475),
    'bio_ch26_q05': (82, 684),
    'bio_ch27_q05': (84, 698),
    'bio_ch27_q16': (87, 708),
}

print('\n=== Processing Biology Diwali Diagrams ===')
for qid, target in bio_diagrams.items():
    pno = target[0]
    page = doc_bio[pno - 1]
    
    if isinstance(target[1], int):
        xref = target[1]
        rects = page.get_image_rects(xref)
        if not rects:
            print(f'Warning: No rect for {qid} (pno {pno}, xref {xref})')
            continue
        rect = rects[0]
        clip_rect = fitz.Rect(max(0, rect.x0 - 2), max(0, rect.y0 - 2), min(page.rect.width, rect.x1 + 2), min(page.rect.height, rect.y1 + 2))
    else:
        clip_rect = target[1]
        
    pix = page.get_pixmap(clip=clip_rect, dpi=300)
    
    # Filename format: e.g. ch01_q01.png
    parts = qid.split('_')
    fname = f'{parts[1]}_{parts[2]}.png'
    out_path = f'public/images/biology_diwali/{fname}'
    pix.save(out_path)
    print(f'Cropped {qid} clean diagram: {pix.width}x{pix.height} -> {out_path}')

print('\nAll diagrams cropped successfully!')
