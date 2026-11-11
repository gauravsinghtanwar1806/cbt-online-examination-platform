import json

bio = json.load(open('data/biology_diwali_questions.json', encoding='utf-8'))

# Map of question id to structured match data
bio_match_dict = {
    "bio_ch04_q02": {
        "column1Title": "Column I",
        "column2Title": "Column II & III",
        "rows": [
            {"leftKey": "A", "leftText": "Dicot leaf", "rightKey": "a - (ii)", "rightText": "Mesophyll tissue; Palisade parenchyma towards adaxial"},
            {"leftKey": "B", "leftText": "Monocot leaf", "rightKey": "b - (i)", "rightText": "Spongy and palisade parenchyma; Mesophyll not differentiated"},
            {"leftKey": "C", "leftText": "Dicot stem", "rightKey": "d - (iii)", "rightText": "Open vascular bundle; Starch sheath is present"},
            {"leftKey": "D", "leftText": "Monocot stem", "rightKey": "c - (iv)", "rightText": "Closed vascular bundle; Vascular bundles are scattered"}
        ],
        "stem": "Match the column I, II and III and select the correct option:"
    },
    "bio_ch07_q09": {
        "column1Title": "Column-I",
        "column2Title": "Column-II & III",
        "rows": [
            {"leftKey": "a", "leftText": "Red blood cells", "rightKey": "3 - L", "rightText": "Red blood cells — Round and biconcave"},
            {"leftKey": "b", "leftText": "White blood cells", "rightKey": "4 - M", "rightText": "White blood cells — Amoeboid"},
            {"leftKey": "c", "leftText": "Mesophyll cell", "rightKey": "1 - N", "rightText": "Mesophyll cell — Round and oval"},
            {"leftKey": "d", "leftText": "Tracheid", "rightKey": "2 - K", "rightText": "Tracheid — Elongated"}
        ],
        "stem": "Match the columns I, II and III and choose the correct combination from the options given :-"
    },
    "bio_ch09_q01": {
        "column1Title": "List I",
        "column2Title": "List II",
        "rows": [
            {"leftKey": "A", "leftText": "S-phase", "rightKey": "4", "rightText": "DNA replication"},
            {"leftKey": "B", "leftText": "G2-phase", "rightKey": "1", "rightText": "Proteins are synthesised"},
            {"leftKey": "C", "leftText": "Quiescent stage", "rightKey": "2", "rightText": "Inactive phase"},
            {"leftKey": "D", "leftText": "G1-phase", "rightKey": "3", "rightText": "Interval between mitosis and initiation of DNA replication"}
        ],
        "stem": "Match the List-I with List-II.\nChoose the correct answer from the options given below."
    },
    "bio_ch10_q01": {
        "column1Title": "Column-I",
        "column2Title": "Column-II",
        "rows": [
            {"leftKey": "A", "leftText": "Joseph Priestley", "rightKey": "(iii)", "rightText": "Discovered oxygen"},
            {"leftKey": "B", "leftText": "Jan Ingenhousz", "rightKey": "(iv)", "rightText": "Sunlight is essential to the plant process that purifies fouled air"},
            {"leftKey": "C", "leftText": "Julius von Sachs", "rightKey": "(i)", "rightText": "Green plant parts synthesise sugar"},
            {"leftKey": "D", "leftText": "Cornelius Van Niel", "rightKey": "(ii)", "rightText": "In photosynthesis O₂ comes from H₂O"}
        ],
        "stem": "Match the columns :-"
    },
    "bio_ch11_q09": {
        "column1Title": "Column-I (Compounds)",
        "column2Title": "Column-II (Examples)",
        "rows": [
            {"leftKey": "A", "leftText": "4 C compound", "rightKey": "5", "rightText": "Malic acid"},
            {"leftKey": "B", "leftText": "2 C compound", "rightKey": "1", "rightText": "Acetyl Co-A"},
            {"leftKey": "C", "leftText": "5 C compound", "rightKey": "4", "rightText": "α-ketoglutaric acid"},
            {"leftKey": "D", "leftText": "3 C compound", "rightKey": "2", "rightText": "Pyruvate"}
        ],
        "stem": "Match the following columns (A, B, C, D) with their compound types:"
    },
    "bio_ch11_q20": {
        "column1Title": "Column-I",
        "column2Title": "Column-II",
        "rows": [
            {"leftKey": "A", "leftText": "RQ", "rightKey": "5", "rightText": "Respirometer"},
            {"leftKey": "B", "leftText": "ETS", "rightKey": "1", "rightText": "Chemiosmotic ATP synthesis"},
            {"leftKey": "C", "leftText": "Cytochromes", "rightKey": "3", "rightText": "Inner mitochondrial membrane"},
            {"leftKey": "D", "leftText": "Lactic acid", "rightKey": "2", "rightText": "Fatigue"},
            {"leftKey": "E", "leftText": "Yeast", "rightKey": "4", "rightText": "Alcoholic fermentation"}
        ],
        "stem": "Match the following columns:"
    },
    "bio_ch12_q02": {
        "column1Title": "List-I",
        "column2Title": "List-II",
        "rows": [
            {"leftKey": "A", "leftText": "Auxin", "rightKey": "(ii)", "rightText": "Differentiation of xylem elements"},
            {"leftKey": "B", "leftText": "Gibberellin", "rightKey": "(iii)", "rightText": "Speed up malting process"},
            {"leftKey": "C", "leftText": "Cytokinin", "rightKey": "(iv)", "rightText": "Overcome the apical dominance"},
            {"leftKey": "D", "leftText": "Ethylene", "rightKey": "(i)", "rightText": "Ripening and maturity of fruits"}
        ],
        "stem": "Match the following plant growth regulators with their functions:"
    },
    "bio_ch16_q05": {
        "column1Title": "Column-I",
        "column2Title": "Column-II",
        "rows": [
            {"leftKey": "(a)", "leftText": "Myosin", "rightKey": "(iii)", "rightText": "ATPase Enzyme"},
            {"leftKey": "(b)", "leftText": "Z-disc", "rightKey": "(iv)", "rightText": "Actinin Protein"},
            {"leftKey": "(c)", "leftText": "Actin", "rightKey": "(i)", "rightText": "Troponin-C"},
            {"leftKey": "(d)", "leftText": "Cardiac muscle", "rightKey": "(ii)", "rightText": "Intercalated Disc"}
        ],
        "stem": "Match the column–I with column–II and choose the correct option:"
    },
    "bio_ch16_q06": {
        "column1Title": "Column-I",
        "column2Title": "Column-II",
        "rows": [
            {"leftKey": "(A)", "leftText": "Hinge joint", "rightKey": "(ii)", "rightText": "Interphalangeal joint"},
            {"leftKey": "(B)", "leftText": "Pivot joint", "rightKey": "(iii)", "rightText": "Radioulnar joint"},
            {"leftKey": "(C)", "leftText": "Ellipsoid joint", "rightKey": "(i)", "rightText": "Wrist joint"},
            {"leftKey": "(D)", "leftText": "Saddle joint", "rightKey": "(iv)", "rightText": "First carpometacarpal joint"}
        ],
        "stem": "Match Column-I with Column-II and select the correct option from the options given below :"
    },
    "bio_ch16_q08": {
        "column1Title": "Column I",
        "column2Title": "Column II",
        "rows": [
            {"leftKey": "(A)", "leftText": "Tetany", "rightKey": "(ii)", "rightText": "Rapid spasm in muscles"},
            {"leftKey": "(B)", "leftText": "Muscle fibre", "rightKey": "(i)", "rightText": "Endomysium"},
            {"leftKey": "(C)", "leftText": "Fasciculi", "rightKey": "(iv)", "rightText": "Perimysium"},
            {"leftKey": "(D)", "leftText": "Myasthenia gravis", "rightKey": "(iii)", "rightText": "Auto immune Disorder"}
        ],
        "stem": "Correctly match column I with column II :-"
    },
    "bio_ch19_q05": {
        "column1Title": "Column-I",
        "column2Title": "Column-II",
        "rows": [
            {"leftKey": "A", "leftText": "Funicle", "rightKey": "(v)", "rightText": "Stalk of ovule"},
            {"leftKey": "B", "leftText": "Hilum", "rightKey": "(iv)", "rightText": "Region where body of ovule fuses with funicle"},
            {"leftKey": "C", "leftText": "Integument", "rightKey": "(iii)", "rightText": "One or two protective envelopes of ovule"},
            {"leftKey": "D", "leftText": "Chalaza", "rightKey": "(ii)", "rightText": "Basal part of ovule"},
            {"leftKey": "E", "leftText": "Nucellus", "rightKey": "(i)", "rightText": "Mass of parenchymatous cells"}
        ],
        "stem": "Match the Column-I with Column-II and select the correct option from the codes given below :-"
    },
    "bio_ch22_q06": {
        "column1Title": "Column-I",
        "column2Title": "Column-II",
        "rows": [
            {"leftKey": "(a)", "leftText": "Genetics", "rightKey": "(iv)", "rightText": "Branch of biology deals with inheritance and variation."},
            {"leftKey": "(b)", "leftText": "Inheritance", "rightKey": "(i)", "rightText": "Passing of characters from parents to progeny"},
            {"leftKey": "(c)", "leftText": "Variation", "rightKey": "(iii)", "rightText": "Degree of differences of progeny from their parents."},
            {"leftKey": "(d)", "leftText": "Mendel", "rightKey": "(ii)", "rightText": "Laws of inheritance"}
        ],
        "stem": "Match Column-I with Column-II:"
    },
    "bio_ch24_q01": {
        "column1Title": "Column-I",
        "column2Title": "Column-II",
        "rows": [
            {"leftKey": "(A)", "leftText": "Weismann", "rightKey": "(iv)", "rightText": "Theory of germ plasm"},
            {"leftKey": "(B)", "leftText": "Hugo de Vries", "rightKey": "(i)", "rightText": "Mutation theory"},
            {"leftKey": "(C)", "leftText": "Ernst Haeckel", "rightKey": "(iii)", "rightText": "Biogenetic law"},
            {"leftKey": "(D)", "leftText": "Lamarck", "rightKey": "(ii)", "rightText": "Inheritance of acquired character"}
        ],
        "stem": "Match the column-I with column-II and choose the correct option ?"
    },
    "bio_ch28_q06": {
        "column1Title": "Column-I & II",
        "column2Title": "Column-III",
        "rows": [
            {"leftKey": "(i)", "leftText": "Biodiversity hot spot — Accelerated habitat loss", "rightKey": "(i)", "rightText": "High biodiversity regions"},
            {"leftKey": "(ii)", "leftText": "Sacred grove — Last refuges for rare & threatened species", "rightKey": "(ii)", "rightText": "Khasi & Jaintia Hills in Meghalaya"},
            {"leftKey": "(iii)", "leftText": "Botanical garden — Off site conservation", "rightKey": "(iii)", "rightText": "Plants taken out from natural habitat for protection"}
        ],
        "stem": "Find out the correct match from the following table :-"
    }
}

count = 0
for q in bio:
    qid = q['id']
    if qid in bio_match_dict:
        m = bio_match_dict[qid]
        q['matchData'] = {
            "column1Title": m["column1Title"],
            "column2Title": m["column2Title"],
            "rows": m["rows"]
        }
        q['match_data'] = q['matchData']
        q['questionText'] = m["stem"]
        q['question_text'] = m["stem"]
        q['questionType'] = "match_following"
        q['question_type'] = "match_following"
        count += 1

with open('data/biology_diwali_questions.json', 'w', encoding='utf-8') as f:
    json.dump(bio, f, indent=2, ensure_ascii=False)

print(f"Successfully configured {count} structured match tables in Biology Diwali Assignment.")

