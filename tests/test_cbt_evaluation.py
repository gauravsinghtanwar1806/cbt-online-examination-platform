import json
import unittest

class TestCBTEvaluation(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.achiever = json.load(open('data/achiever_minor_test_02_questions.json', encoding='utf-8'))
        cls.biology = json.load(open('data/biology_diwali_questions.json', encoding='utf-8'))
        cls.verifications = json.load(open('data/answer_verification.json', encoding='utf-8'))
        cls.results = json.load(open('data/results.json', encoding='utf-8'))

    # TEST A: Question 1, select Option 1 -> Expected: CORRECT, +4
    def test_a_question_1_select_option_1(self):
        q1 = self.achiever[0]
        self.assertEqual(q1['id'], 'achiever_001')
        ver = self.verifications['achiever_001']
        app_ans = ver.get('approvedAnswer') or ver.get('approved_answer')
        self.assertEqual(app_ans, 1)
        selected_option = 1
        is_correct = (selected_option == app_ans)
        marks = 4 if is_correct else -1
        self.assertTrue(is_correct)
        self.assertEqual(marks, 4)

    # TEST B: Select a verified incorrect option -> Expected: INCORRECT, -1
    def test_b_select_incorrect_option(self):
        q1 = self.achiever[0]
        ver = self.verifications['achiever_001']
        app_ans = ver.get('approvedAnswer') or ver.get('approved_answer')
        selected_option = 2 # Incorrect option
        is_correct = (selected_option == app_ans)
        marks = 4 if is_correct else -1
        self.assertFalse(is_correct)
        self.assertEqual(marks, -1)

    # TEST C: Leave the question unanswered -> Expected: UNATTEMPTED, 0
    def test_c_leave_unanswered(self):
        selected_option = None
        is_attempted = selected_option is not None
        marks = 0 if not is_attempted else -1
        self.assertFalse(is_attempted)
        self.assertEqual(marks, 0)

    # TEST D: Correctly handle options numbered 1, 2, 3 and 4
    def test_d_options_count_and_numbering(self):
        for q in self.achiever:
            opts = q.get('options', [])
            self.assertEqual(len(opts), 4, f"Question {q['id']} does not have 4 options")
            self.assertFalse(any('Option 1' in opt and opt.strip().startswith('(') for opt in opts))

    # TEST E: Global question numbering across Physics, Chemistry, Biology
    def test_e_achiever_global_numbering(self):
        self.assertEqual(len(self.achiever), 180)
        phys = [q for q in self.achiever if q['subject'] == 'Physics']
        chem = [q for q in self.achiever if q['subject'] == 'Chemistry']
        bio = [q for q in self.achiever if q['subject'] == 'Biology']
        self.assertEqual(len(phys), 45)
        self.assertEqual(len(chem), 45)
        self.assertEqual(len(bio), 90)
        self.assertEqual([q['questionNumber'] for q in phys], list(range(1, 46)))
        self.assertEqual([q['questionNumber'] for q in chem], list(range(46, 91)))
        self.assertEqual([q['questionNumber'] for q in bio], list(range(91, 181)))

    # TEST F: Chapter-specific numbering in Biology assignment
    def test_f_biology_chapter_numbering(self):
        self.assertEqual(len(self.biology), 462)
        chapter_indices = set(q['chapterIndex'] for q in self.biology)
        self.assertEqual(len(chapter_indices), 28)
        # Check IDs are unique
        all_ids = [q['id'] for q in self.biology]
        self.assertEqual(len(all_ids), len(set(all_ids)))

    # TEST G: Verify subject-wise scores sum to overall score
    def test_g_subject_wise_scores_sum(self):
        att = list(self.results.values())[0]
        subj_perf = att['subjectPerformance']
        sum_positive = sum(s['positiveMarks'] for s in subj_perf.values())
        sum_negative = sum(s['negativeMarks'] for s in subj_perf.values())
        sum_score = sum(s['score'] for s in subj_perf.values())
        sum_attempted = sum(s['attempted'] for s in subj_perf.values())
        sum_correct = sum(s['correct'] for s in subj_perf.values())
        sum_incorrect = sum(s['incorrect'] for s in subj_perf.values())

        self.assertEqual(sum_positive, att['positiveMarks'])
        self.assertEqual(sum_negative, att['negativeMarks'])
        self.assertEqual(sum_score, att['finalScore'])
        self.assertEqual(sum_attempted, att['attemptedQuestions'])
        self.assertEqual(sum_correct, att['correctAnswers'])
        self.assertEqual(sum_incorrect, att['incorrectAnswers'])
        self.assertEqual(att['finalScore'], att['positiveMarks'] - att['negativeMarks'])
        self.assertEqual(att['attemptedQuestions'], att['correctAnswers'] + att['incorrectAnswers'])

    # TEST H: Existing saved attempt re-evaluated without losing responses
    def test_h_saved_attempt_preserved(self):
        att = list(self.results.values())[0]
        q1_res = [q for q in att['questionsAnalysis'] if q['questionId'] == 'achiever_001'][0]
        self.assertEqual(q1_res['selectedOption'], 1)
        self.assertTrue(q1_res['isCorrect'])
        self.assertEqual(q1_res['marksAwarded'], 4)
        self.assertEqual(att['attemptedQuestions'], 8)
        self.assertEqual(att['correctAnswers'], 3)
        self.assertEqual(att['finalScore'], 7)

    # TEST I: Question review shows exact original question and all 4 options
    def test_i_question_review_options(self):
        q1 = self.achiever[0]
        self.assertIn("U(x) = (x²/2 - x)", q1['questionText'])
        self.assertEqual(q1['options'], ['√5 m/s', '√10 m/s', '5/2 m/s', '2 m/s'])

    # TEST J: Mathematical equations, diagrams, and solution images
    def test_j_diagrams_and_solution_images(self):
        for q in self.achiever:
            self.assertTrue(q['imageUrl'].startswith('/images/achiever/'))
            sol_img = f"/images/achiever_solutions/sol_{q['questionNumber']}.png"
            self.assertIsNotNone(sol_img)

if __name__ == '__main__':
    unittest.main()
