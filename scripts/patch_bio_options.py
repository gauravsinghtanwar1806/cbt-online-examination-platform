import json

bio = json.load(open('data/biology_diwali_questions.json', encoding='utf-8'))

# 1. bio_ch01_q26: Options from table on page 10
q_ch1_26 = next(q for q in bio if q['id'] == 'bio_ch01_q26')
q_ch1_26['options'] = [
    "(A) Photosynthesis, (B) Carotenoids, (C) Death factor, (D) Anabaena",
    "(A) Nitrogen fixation, (B) Chlorophyll-a, (C) Water blooms, (D) Oscillatoria",
    "(A) Reproduction, (B) Chlorophyll-b, (C) Water blooms, (D) Nostoc",
    "(A) Metabolism, (B) Chlorophyll-a, (C) trichome, (D) Oscillatoria"
]

# 2. bio_ch02_q09: Tympanum represents ear in
q_ch2_9 = next(q for q in bio if q['id'] == 'bio_ch02_q09')
q_ch2_9['options'] = [
    "Amphibia",
    "Reptile",
    "Birds",
    "Both (1) & (2)"
]

# 3. bio_ch03_q17: Mustard floral formula images
q_ch3_17 = next(q for q in bio if q['id'] == 'bio_ch03_q17')
q_ch3_17['options'] = [
    "Floral formula (1)",
    "Floral formula (2)",
    "Floral formula (3)",
    "Floral formula (4)"
]
q_ch3_17['optionImages'] = [
    "/images/bio_opts/ch03_q17_opt_1.png",
    "/images/bio_opts/ch03_q17_opt_2.png",
    "/images/bio_opts/ch03_q17_opt_3.png",
    "/images/bio_opts/ch03_q17_opt_4.png"
]
q_ch3_17['option_images'] = q_ch3_17['optionImages']

# 4. bio_ch04_q16: Monocot leaf table
q_ch4_16 = next(q for q in bio if q['id'] == 'bio_ch04_q16')
q_ch4_16['options'] = [
    "Option row (1) from leaf diagram table",
    "Option row (2) from leaf diagram table",
    "Option row (3) from leaf diagram table",
    "Option row (4) from leaf diagram table"
]
q_ch4_16['optionImages'] = [
    "/images/bio_opts/ch04_q16_opt_1.png",
    "/images/bio_opts/ch04_q16_opt_2.png",
    "/images/bio_opts/ch04_q16_opt_3.png",
    "/images/bio_opts/ch04_q16_opt_4.png"
]
q_ch4_16['option_images'] = q_ch4_16['optionImages']

# 5. bio_ch08_q06: Enzyme match quadrant images
q_ch8_6 = next(q for q in bio if q['id'] == 'bio_ch08_q06')
q_ch8_6['options'] = [
    "Match pattern (1)",
    "Match pattern (2)",
    "Match pattern (3)",
    "Match pattern (4)"
]
q_ch8_6['optionImages'] = [
    "/images/bio_opts/ch08_q06_opt_1.png",
    "/images/bio_opts/ch08_q06_opt_2.png",
    "/images/bio_opts/ch08_q06_opt_3.png",
    "/images/bio_opts/ch08_q06_opt_4.png"
]
q_ch8_6['option_images'] = q_ch8_6['optionImages']

# 6. bio_ch09_q10: DNA graph images
q_ch9_10 = next(q for q in bio if q['id'] == 'bio_ch09_q10')
q_ch9_10['options'] = [
    "Cell cycle graph (1)",
    "Cell cycle graph (2)",
    "Cell cycle graph (3)",
    "Cell cycle graph (4)"
]
q_ch9_10['optionImages'] = [
    "/images/bio_opts/ch09_q10_opt_1.png",
    "/images/bio_opts/ch09_q10_opt_2.png",
    "/images/bio_opts/ch09_q10_opt_3.png",
    "/images/bio_opts/ch09_q10_opt_4.png"
]
q_ch9_10['option_images'] = q_ch9_10['optionImages']

# 7. bio_ch18_q10: Blood Ca++ regulation
q_ch18_10 = next(q for q in bio if q['id'] == 'bio_ch18_q10')
q_ch18_10['options'] = [
    "TCT",
    "Parathormone",
    "Aldosterone",
    "Both (1) and (2)"
]

# 8. bio_ch28_q26: Species area curves
q_ch28_26 = next(q for q in bio if q['id'] == 'bio_ch28_q26')
q_ch28_26['options'] = [
    "Species richness slope graph (1)",
    "Species richness slope graph (2)",
    "Species richness slope graph (3)",
    "Species richness slope graph (4)"
]
q_ch28_26['optionImages'] = [
    "/images/bio_opts/ch28_q26_opt_1.png",
    "/images/bio_opts/ch28_q26_opt_2.png",
    "/images/bio_opts/ch28_q26_opt_3.png",
    "/images/bio_opts/ch28_q26_opt_4.png"
]
q_ch28_26['option_images'] = q_ch28_26['optionImages']

# Save updated biology questions
with open('data/biology_diwali_questions.json', 'w', encoding='utf-8') as f:
    json.dump(bio, f, indent=2, ensure_ascii=False)

print("Updated data/biology_diwali_questions.json with perfect options and optionImages!")

