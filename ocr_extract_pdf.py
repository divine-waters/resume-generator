import pytesseract
from pdf2image import convert_from_path
import os

# If Tesseract is not in your PATH, specify the path below:
pytesseract.pytesseract.tesseract_cmd = r'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'

pdf_path = "divine-waters.pdf"
all_text = ""

# Specify the path to the poppler bin directory
poppler_path = r"C:\\poppler\\Library\\bin"  # <-- Update this if your path is different

# Convert PDF pages to images
images = convert_from_path(pdf_path, poppler_path=poppler_path)

for i, img in enumerate(images):
    text = pytesseract.image_to_string(img, lang='eng')
    all_text += f"--- Page {i+1} ---\n{text}\n"

print(all_text)

# Optionally, save to a file
with open("divine-waters-ocr.txt", "w", encoding="utf-8") as f:
    f.write(all_text)
