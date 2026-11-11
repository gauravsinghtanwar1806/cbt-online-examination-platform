import fitz
import json
import re

doc = fitz.open('source_pdfs/Achiever Minor Test 02.pdf')

# Let's inspect the 22 questions that have formula images in options
special_q = [1, 2, 10, 15, 16, 18, 19, 21, 22, 27, 28, 33, 37, 38, 39, 45, 50, 51, 57, 69, 70, 75]

print(f"Inspecting {len(special_q)} questions...")

# We can find all embedded images or render precise bounding boxes for each of the 4 options!
# Notice in Achiever PDF, each option has a marker `(1)`, `(2)`, `(3)`, `(4)`.
# Let's see the text and layout of each of these 22 questions.
for q_num in special_q:
    print(f"\n=================== QUESTION {q_num} ===================")
    # find where in test_new_extractor it was
