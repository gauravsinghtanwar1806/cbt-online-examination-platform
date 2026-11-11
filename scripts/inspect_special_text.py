import fitz
import json
import re

doc = fitz.open('source_pdfs/Achiever Minor Test 02.pdf')

# Let's inspect the solutions text for these 22 questions to extract exact formula strings
special_22 = [1, 2, 10, 15, 16, 18, 19, 21, 22, 27, 28, 33, 37, 38, 39, 45, 50, 51, 57, 69, 70, 75]

# Let's print out the solutions and surrounding text for each of them
