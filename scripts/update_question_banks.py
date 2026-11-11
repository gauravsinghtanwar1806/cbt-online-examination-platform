"""
Update question banks with clean diagram paths, recovered options, table data for Q34,
and remove any empty/duplicate image paths.
"""
import json

# 1. Update Achiever Minor Test 02
with open('data/achiever_minor_test_02_questions.json', 'r', encoding='utf-8') as f:
    achiever = json.load(f)

# List of all question numbers that have diagrams
valid_diagram_qns = {
    2, 3, 4, 5, 6, 7, 8, 15, 17, 19, 20, 21, 23, 25, 26, 28, 29, 30, 31, 
    37, 38, 39, 40, 41, 42, 43, 44, 87, 156, 161, 164, 173, 177
}

for q in achiever:
    qn = q['question_number']
    
    # Set diagram path if genuine diagram exists, otherwise clear it completely
    if qn in valid_diagram_qns:
        diag_url = f'/images/achiever/diag_q{qn}.png'
        q['imageUrl'] = diag_url
        q['image_url'] = diag_url
    else:
        q['imageUrl'] = ''
        q['image_url'] = ''

    # Question specific fixes
    if qn == 17:
        q['imageUrl'] = '/images/achiever/diag_q17.png'
        q['image_url'] = '/images/achiever/diag_q17.png'

    elif qn == 20:
        q['imageUrl'] = '/images/achiever/diag_q20.png'
        q['image_url'] = '/images/achiever/diag_q20.png'

    elif qn == 28:
        q['imageUrl'] = '/images/achiever/diag_q28.png'
        q['image_url'] = '/images/achiever/diag_q28.png'
        q['questionText'] = 'The reading of the ammeter as per figure shown is :'
        q['question_text'] = 'The reading of the ammeter as per figure shown is :'
        q['options'] = ['1/8 A', '3/4 A', '1/2 A', '1/4 A']
        q['officialAnswer'] = 1
        q['official_answer'] = 1

    elif qn == 31:
        q['imageUrl'] = '/images/achiever/diag_q31.png'
        q['image_url'] = '/images/achiever/diag_q31.png'

    elif qn == 34:
        q['questionText'] = 'On placing a dielectric slab between the plates of a charged condenser, determine the variation in its parameters:'
        q['question_text'] = 'On placing a dielectric slab between the plates of a charged condenser, determine the variation in its parameters:'
        q['tableData'] = {
            'headers': ['Option', 'Capacity', 'Charge', 'Potential Difference', 'Energy stored'],
            'rows': [
                ['(1)', 'decreases', 'remains unchanged', 'decreases', 'increases'],
                ['(2)', 'increases', 'remains unchanged', 'increases', 'increases'],
                ['(3)', 'increases', 'remains unchanged', 'decreases', 'decreases'],
                ['(4)', 'decreases', 'remains unchanged', 'increases', 'decreases']
            ]
        }
        q['table_data'] = q['tableData']
        q['options'] = [
            'Capacity decreases, Charge remains unchanged, Potential difference decreases, Energy stored increases',
            'Capacity increases, Charge remains unchanged, Potential difference increases, Energy stored increases',
            'Capacity increases, Charge remains unchanged, Potential difference decreases, Energy stored decreases',
            'Capacity decreases, Charge remains unchanged, Potential difference increases, Energy stored decreases'
        ]
        q['officialAnswer'] = 3
        q['official_answer'] = 3

    elif qn == 40:
        q['imageUrl'] = '/images/achiever/diag_q40.png'
        q['image_url'] = '/images/achiever/diag_q40.png'

    elif qn == 89:
        q['options'] = ['Λeq = 3Λm', 'Λeq = Λm / 6', 'Λeq = Λm', 'Λeq = Λm / 3']
        q['officialAnswer'] = 2
        q['official_answer'] = 2

    elif qn == 177:
        q['imageUrl'] = '/images/achiever/diag_q177.png'
        q['image_url'] = '/images/achiever/diag_q177.png'
        q['options'] = [
            'Telophase - Nuclear envelope reforms, Golgi complex reforms',
            'Late anaphase - Chromosomes move away from the equatorial plate, Golgi complex is not present.',
            'Cytokinesis - Cell plate formed and mitochondria is distributed between two daughter cells.',
            'Telophase - Endoplasmic reticulum and nucleolus is not reformed yet.'
        ]
        q['officialAnswer'] = 1
        q['official_answer'] = 1

with open('data/achiever_minor_test_02_questions.json', 'w', encoding='utf-8') as f:
    json.dump(achiever, f, indent=2, ensure_ascii=False)

print('Updated data/achiever_minor_test_02_questions.json successfully!')

# 2. Update Biology Diwali Assignment
with open('data/biology_diwali_questions.json', 'r', encoding='utf-8') as f:
    bio = json.load(f)

valid_bio_diagrams = {
    'bio_ch01_q01', 'bio_ch03_q13', 'bio_ch05_q09', 'bio_ch06_q12', 'bio_ch06_q22',
    'bio_ch10_q10', 'bio_ch14_q01', 'bio_ch26_q05', 'bio_ch27_q05', 'bio_ch27_q16'
}

for q in bio:
    qid = q['id']
    if qid in valid_bio_diagrams:
        parts = qid.split('_')
        img_url = f'/images/biology_diwali/{parts[1]}_{parts[2]}.png'
        q['imageUrl'] = img_url
        q['image_url'] = img_url
    else:
        q['imageUrl'] = ''
        q['image_url'] = ''

with open('data/biology_diwali_questions.json', 'w', encoding='utf-8') as f:
    json.dump(bio, f, indent=2, ensure_ascii=False)

print('Updated data/biology_diwali_questions.json successfully!')
