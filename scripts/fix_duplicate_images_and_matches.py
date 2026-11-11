import json
import re

# 1. Real diagram questions in Achiever Minor Test 02
ACHIEVER_DIAGRAM_Q_NUMS = set([
    2, 3, 4, 6, 8, 17, 19, 20, 21, 23, 26, 28, 29, 30, 31, 37, 40, 41, 42, 43, 44,
    156, 161, 164, 173, 177
])

# 2. Real diagram questions in Biology Diwali Assignment
BIO_DIAGRAM_IDS = set([
    'bio_ch01_q01', 'bio_ch03_q13', 'bio_ch05_q09', 'bio_ch06_q12', 'bio_ch06_q22',
    'bio_ch10_q10', 'bio_ch14_q01', 'bio_ch26_q05', 'bio_ch27_q05', 'bio_ch27_q16'
])

# Process Achiever Minor Test 02
ach = json.load(open('data/achiever_minor_test_02_questions.json', encoding='utf-8'))

# Structured match data for Achiever questions
ach_matches = {
    14: {
        "column1Title": "Column I",
        "column2Title": "Column II",
        "rows": [
            {"leftKey": "(P)", "leftText": "Lifting the block vertically by 2 m at constant speed (Work by external agent)", "rightKey": "(i)", "rightText": "0 J"},
            {"leftKey": "(Q)", "leftText": "A force F = 10 N acts at 60° to horizontal, displacement 4 m", "rightKey": "(ii)", "rightText": "40 J"},
            {"leftKey": "(R)", "leftText": "Moving the block 10 m along a smooth horizontal surface", "rightKey": "(iii)", "rightText": "20 J"},
            {"leftKey": "(S)", "leftText": "Gravity work when the block slides 5 m down a 30° smooth incline", "rightKey": "(iv)", "rightText": "50 J"}
        ],
        "stem": "A block of mass m = 2 kg : -"
    },
    41: {
        "column1Title": "Column-I",
        "column2Title": "Column-II",
        "rows": [
            {"leftKey": "(I)", "leftText": "Charge given by battery", "rightKey": "(a)", "rightText": "20 μC"},
            {"leftKey": "(II)", "leftText": "Charge of 4μF capacitor", "rightKey": "(b)", "rightText": "30 μC"},
            {"leftKey": "(III)", "leftText": "Charge of 2 μF capacitor", "rightKey": "(c)", "rightText": "60 μC"},
            {"leftKey": "(IV)", "leftText": "Charge of 3 μF capacitor", "rightKey": "(d)", "rightText": "40 μC"}
        ],
        "stem": "In the circuit shown in figure, match the following two columns."
    },
    71: {
        "column1Title": "List-I",
        "column2Title": "List-II",
        "rows": [
            {"leftKey": "(A)", "leftText": "[Fe(CN)₆]³⁻", "rightKey": "(i)", "rightText": "5.92 BM"},
            {"leftKey": "(B)", "leftText": "[Fe(H₂O)₆]³⁺", "rightKey": "(ii)", "rightText": "0 BM"},
            {"leftKey": "(C)", "leftText": "[Fe(CN)₆]⁴⁻", "rightKey": "(iii)", "rightText": "4.90 BM"},
            {"leftKey": "(D)", "leftText": "[Fe(H₂O)₆]²⁺", "rightKey": "(iv)", "rightText": "1.73 BM"}
        ],
        "stem": "Match List-I with List-II.\nSelect the correct answer from the options given below."
    },
    134: {
        "column1Title": "List I",
        "column2Title": "List II",
        "rows": [
            {"leftKey": "A", "leftText": "GIFT", "rightKey": "P", "rightText": "Sperm injected directly into ovum"},
            {"leftKey": "B", "leftText": "ICSI", "rightKey": "Q", "rightText": "Gametes transferred into fallopian tube"},
            {"leftKey": "C", "leftText": "ZIFT", "rightKey": "R", "rightText": "Zygote/early embryo transferred into fallopian tube"},
            {"leftKey": "D", "leftText": "IVF-ET", "rightKey": "S", "rightText": "Embryo transferred into female reproductive tract"}
        ],
        "stem": "Match List I with List II:"
    },
    154: {
        "column1Title": "List-I",
        "column2Title": "List-II",
        "rows": [
            {"leftKey": "A", "leftText": "Primary structure of protein", "rightKey": "I", "rightText": "Human haemoglobin"},
            {"leftKey": "B", "leftText": "Secondary structure of protein", "rightKey": "II", "rightText": "Disulphide bonds"},
            {"leftKey": "C", "leftText": "Tertiary structure of protein", "rightKey": "III", "rightText": "Polypeptide chain"},
            {"leftKey": "D", "leftText": "Quaternary structure of protein", "rightKey": "IV", "rightText": "Alpha helix and β pleated sheet"}
        ],
        "stem": "Match List-I with List-II.\nChoose the correct answer from the options given below :"
    },
    160: {
        "column1Title": "Column I",
        "column2Title": "Column II",
        "rows": [
            {"leftKey": "(A)", "leftText": "Adenine", "rightKey": "(i)", "rightText": "Pyrimidine found only in RNA"},
            {"leftKey": "(B)", "leftText": "Thymine", "rightKey": "(ii)", "rightText": "Purine found in both DNA and RNA"},
            {"leftKey": "(C)", "leftText": "Uracil", "rightKey": "(iii)", "rightText": "Pyrimidine also known as 5-methyl uracil"},
            {"leftKey": "(D)", "leftText": "Cytosine", "rightKey": "(iv)", "rightText": "Common pyrimidine in both DNA and RNA"}
        ],
        "stem": "Match column I and column II :-"
    },
    178: {
        "column1Title": "Column I",
        "column2Title": "Column II",
        "rows": [
            {"leftKey": "A", "leftText": "Synapsis aligns homologous chromosomes", "rightKey": "1", "rightText": "Pachytene"},
            {"leftKey": "B", "leftText": "Synthesis of RNA and protein", "rightKey": "2", "rightText": "Zygotene"},
            {"leftKey": "C", "leftText": "Action of enzyme recombinase", "rightKey": "3", "rightText": "G1 phase"},
            {"leftKey": "D", "leftText": "Centromeres do not separate but chromosomes move towards opposite poles", "rightKey": "4", "rightText": "Anaphase I"}
        ],
        "stem": "Select the correct option."
    }
}

ach_images_removed = 0
ach_matches_configured = 0

for q in ach:
    qn = q['questionNumber']
    
    # Configure match questions
    if qn in ach_matches:
        m_info = ach_matches[qn]
        q['matchData'] = {
            "column1Title": m_info["column1Title"],
            "column2Title": m_info["column2Title"],
            "rows": m_info["rows"]
        }
        q['match_data'] = q['matchData']
        q['questionText'] = m_info["stem"]
        q['question_text'] = m_info["stem"]
        q['questionType'] = "match_following"
        q['question_type'] = "match_following"
        ach_matches_configured += 1

    # Remove duplicate PDF screenshot if NOT a real diagram
    # Note: Q41 has a circuit diagram AND a match table, so it keeps its circuit diagram
    if qn in ACHIEVER_DIAGRAM_Q_NUMS:
        # Keep diagram
        q['questionType'] = 'diagram_based'
        q['question_type'] = 'diagram_based'
    else:
        # Pure text or pure match table: REMOVE duplicate PDF screenshot
        q['imageUrl'] = ""
        q['image_url'] = ""
        ach_images_removed += 1

with open('data/achiever_minor_test_02_questions.json', 'w', encoding='utf-8') as f:
    json.dump(ach, f, indent=2, ensure_ascii=False)

print(f"Achiever: Removed duplicate PDF image from {ach_images_removed} pure text questions.")
print(f"Achiever: Configured structured match tables for {ach_matches_configured} questions.")
print(f"Achiever: Kept {len(ACHIEVER_DIAGRAM_Q_NUMS)} legitimate diagrams.")

# Now process Biology Diwali Assignment
bio = json.load(open('data/biology_diwali_questions.json', encoding='utf-8'))

bio_images_removed = 0
bio_matches_configured = 0

# Generic parser for Biology Diwali match questions that have Column I / Column II
for q in bio:
    qid = q['id']
    txt = q.get('questionText', '')
    
    # Check if match question
    is_match = False
    if 'match the column' in txt.lower() or 'match list' in txt.lower() or 'column-i' in txt.lower() or 'column i' in txt.lower():
        # Let's see if we can parse structured match rows
        # E.g. bio_ch03_q02
        if 'runner' in txt.lower() and 'stolon' in txt.lower():
            q['matchData'] = {
                "column1Title": "Column-I",
                "column2Title": "Column-II",
                "rows": [
                    {"leftKey": "I", "leftText": "Runner", "rightKey": "a", "rightText": "Eichhornia"},
                    {"leftKey": "II", "leftText": "Stolon", "rightKey": "b", "rightText": "Pineapple"},
                    {"leftKey": "III", "leftText": "Sucker", "rightKey": "c", "rightText": "Jasmine"},
                    {"leftKey": "IV", "leftText": "Offset", "rightKey": "d", "rightText": "Doob grass"}
                ]
            }
            q['match_data'] = q['matchData']
            q['questionText'] = "Match the column-I with column-II and choose the correct answer on the basis of codes given in column-I and column-II :"
            q['question_text'] = q['questionText']
            q['questionType'] = "match_following"
            q['question_type'] = "match_following"
            bio_matches_configured += 1
            is_match = True

    # Remove duplicate PDF screenshot if NOT in BIO_DIAGRAM_IDS
    if qid in BIO_DIAGRAM_IDS:
        q['questionType'] = 'diagram_based'
        q['question_type'] = 'diagram_based'
    else:
        q['imageUrl'] = ""
        q['image_url'] = ""
        bio_images_removed += 1

with open('data/biology_diwali_questions.json', 'w', encoding='utf-8') as f:
    json.dump(bio, f, indent=2, ensure_ascii=False)

print(f"Biology Diwali: Removed duplicate PDF image from {bio_images_removed} pure text questions.")
print(f"Biology Diwali: Kept {len(BIO_DIAGRAM_IDS)} legitimate biological diagrams.")

