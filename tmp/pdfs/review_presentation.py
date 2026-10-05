from pathlib import Path
import fitz
from pypdf import PdfReader

source = Path(r"D:\SIH 26018.pdf")
out = Path(r"D:\sih26018\tmp\pdfs")
out.mkdir(parents=True, exist_ok=True)

reader = PdfReader(str(source))
with (out / "sih26018.txt").open("w", encoding="utf-8") as text_file:
    for number, page in enumerate(reader.pages, start=1):
        text_file.write(f"\n\n===== SLIDE {number} =====\n\n")
        text_file.write(page.extract_text() or "[No extractable text]")

document = fitz.open(source)
thumbs = []
for number, page in enumerate(document, start=1):
    pixmap = page.get_pixmap(matrix=fitz.Matrix(1.2, 1.2), alpha=False)
    pixmap.save(out / f"slide-{number:02d}.png")
    thumbs.append(pixmap)

thumb_width = 480
thumb_height = 270
sheet = fitz.Pixmap(fitz.csRGB, fitz.Rect(0, 0, thumb_width * 2, thumb_height * 3), False)
sheet.clear_with(255)
for index, pixmap in enumerate(thumbs):
    thumbnail = fitz.Pixmap(pixmap, thumb_width, thumb_height)
    x = (index % 2) * thumb_width
    y = (index // 2) * thumb_height
    sheet.copy(thumbnail, fitz.IRect(x, y, x + thumb_width, y + thumb_height))
sheet.save(out / "slide-overview.png")
print(f"pages={len(document)}")
