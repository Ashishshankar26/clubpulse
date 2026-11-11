import fitz # PyMuPDF
import os

pdf_path = r'E:\next.js project sem 5\docs\ClubPulse_Report_Preview.pdf'
out_dir = r'E:\next.js project sem 5\docs\rendered_pages'
os.makedirs(out_dir, exist_ok=True)

doc = fitz.open(pdf_path)
print(f"Total pages in PDF: {len(doc)}")

for i, page in enumerate(doc):
    pix = page.get_pixmap(dpi=150)
    out_file = os.path.join(out_dir, f"page_{i+1}.png")
    pix.save(out_file)
    print(f"Rendered Page {i+1} -> {out_file} (w: {pix.width}, h: {pix.height})")

print("Rendering complete!")

