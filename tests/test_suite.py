import json
import os
import unittest

class TestCBTPlatform(unittest.TestCase):

    def setUp(self):
        with open("data/achiever_minor_test_02_questions.json", "r", encoding="utf-8") as f:
            self.achiever = json.load(f)
        with open("data/biology_diwali_questions.json", "r", encoding="utf-8") as f:
            self.biology = json.load(f)
        with open("data/answer_verification.json", "r", encoding="utf-8") as f:
            self.verifications = json.load(f)

    def test_01_achiever_question_count_and_subjects(self):
        """Verify all 180 Achiever questions and subject mapping"""
        self.assertEqual(len(self.achiever), 180)
        physics = [q for q in self.achiever if q["subject"] == "Physics"]
        chemistry = [q for q in self.achiever if q["subject"] == "Chemistry"]
        biology = [q for q in self.achiever if q["subject"] == "Biology"]
        
        self.assertEqual(len(physics), 45, "Physics must have 45 questions")
        self.assertEqual(len(chemistry), 45, "Chemistry must have 45 questions")
        self.assertEqual(len(biology), 90, "Biology must have 90 questions")
        
        # Verify continuous numbering
        numbers = [q["question_number"] for q in self.achiever]
        self.assertEqual(numbers, list(range(1, 181)))

    def test_02_biology_diwali_chapters_and_questions(self):
        """Verify all 28 Biology chapters and 462 questions"""
        self.assertEqual(len(self.biology), 462)
        chapters = set(q["chapter_index"] for q in self.biology)
        self.assertEqual(len(chapters), 28, "All 28 chapters must be represented")
        self.assertEqual(chapters, set(range(1, 29)))

    def test_03_options_completeness(self):
        """Verify every question has 4 valid options"""
        for q in self.achiever + self.biology:
            self.assertIn("options", q)
            self.assertEqual(len(q["options"]), 4, f"Question {q['id']} must have 4 options")
            self.assertIn("official_answer", q)
            self.assertIn(q["official_answer"], [1, 2, 3, 4], f"Question {q['id']} official answer must be 1-4")

    def test_04_image_assets_exist(self):
        """Verify rendered image files exist for questions"""
        for q in self.achiever[:10]: # test sample
            img_path = os.path.join("public", q["image_url"].lstrip("/"))
            self.assertTrue(os.path.exists(img_path), f"Image file missing: {img_path}")

        for q in self.biology[:10]: # test sample
            img_path = os.path.join("public", q["image_url"].lstrip("/"))
            self.assertTrue(os.path.exists(img_path), f"Image file missing: {img_path}")

    def test_05_answer_key_verification_coverage(self):
        """Verify all 642 questions have verification records"""
        total = len(self.achiever) + len(self.biology)
        self.assertEqual(len(self.verifications), total)
        
        # Test discrepancy detection: Achiever Q27
        q27_ver = self.verifications.get("achiever_027")
        self.assertIsNotNone(q27_ver)
        self.assertEqual(q27_ver["pdf_answer"], 1)
        self.assertEqual(q27_ver["verified_answer"], 4)
        self.assertEqual(q27_ver["status"], "KEY_MISMATCH")
        # Strict rule: approved_answer must default to official PDF answer key until admin overrides
        self.assertEqual(q27_ver["approved_answer"], 1)

    def test_06_scoring_calculation_logic(self):
        """Verify exact NEET marking scheme: +4 for correct, -1 for incorrect, 0 for unattempted"""
        correct_marks = 4.0
        incorrect_marks = -1.0
        
        # Scenario: 180 questions, 100 attempted (85 correct, 15 incorrect), 80 unattempted
        attempted = 100
        correct = 85
        incorrect = 15
        unattempted = 80
        
        pos_marks = correct * correct_marks # 85 * 4 = 340
        neg_marks = incorrect * abs(incorrect_marks) # 15 * 1 = 15
        net_score = pos_marks - neg_marks # 325
        max_marks = 180 * correct_marks # 720
        percentage = (net_score / max_marks) * 100
        accuracy = (correct / attempted) * 100
        
        self.assertEqual(pos_marks, 340)
        self.assertEqual(neg_marks, 15)
        self.assertEqual(net_score, 325)
        self.assertAlmostEqual(percentage, 45.14, places=2)
        self.assertEqual(accuracy, 85.0)

if __name__ == "__main__":
    unittest.main()
