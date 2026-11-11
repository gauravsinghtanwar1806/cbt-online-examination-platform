import fitz
import json
import re

doc = fitz.open('source_pdfs/Achiever Minor Test 02.pdf')

# Let's inspect all 180 questions
# We want to know for each question:
# 1. Which page does it start on?
# 2. What y-coordinate does it start on?
# 3. Where does it end?
# 4. Does it cross pages?
# 5. What text does it have across all its pages?
# 6. What option images does it have?

# Let's write a script to find the start marker of every question:
# Physics: 1) to 45) on pages 0..13
# Chemistry: 1) to 45) on pages 13..22
# Biology: 1) to 90) on pages 22..39

# Let's detect each question precisely!

