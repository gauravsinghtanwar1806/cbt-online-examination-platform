import fitz
import json
import re

doc = fitz.open('source_pdfs/Achiever Minor Test 02.pdf')

# First, let's find all questions in the test (pages 0 to 39)
# Let's inspect each page's text and structure
print("Analyzing questions across pages 0 to 39...")

# We know:
# Physics: Q1 to Q45 on pages 0 to 13
# Chemistry: Q1 to Q45 on pages 13 to 22
# Biology: Q1 to Q90 on pages 22 to 39

# Let's write an algorithm that stitches multi-page questions!

