from pathlib import Path
import re

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "testimonial-platform-project-documentation.md"
OUTPUT = ROOT / "docs" / "testimonial-platform-project-documentation.pdf"


def clean_inline(text: str) -> str:
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(r"`([^`]+)`", r'<font name="Courier">\1</font>', text)
    return text


def make_styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "DocTitle",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=24,
            leading=30,
            textColor=colors.HexColor("#0f172a"),
            alignment=TA_CENTER,
            spaceAfter=10,
        ),
        "subtitle": ParagraphStyle(
            "DocSubtitle",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=11,
            leading=16,
            textColor=colors.HexColor("#475569"),
            alignment=TA_CENTER,
            spaceAfter=28,
        ),
        "h1": ParagraphStyle(
            "Heading1Custom",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=18,
            leading=23,
            textColor=colors.HexColor("#0f172a"),
            spaceBefore=16,
            spaceAfter=8,
        ),
        "h2": ParagraphStyle(
            "Heading2Custom",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=18,
            textColor=colors.HexColor("#1e293b"),
            spaceBefore=12,
            spaceAfter=6,
        ),
        "body": ParagraphStyle(
            "BodyCustom",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=14,
            textColor=colors.HexColor("#334155"),
            alignment=TA_LEFT,
            spaceAfter=7,
        ),
        "bullet": ParagraphStyle(
            "BulletCustom",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=9.2,
            leading=13,
            leftIndent=16,
            firstLineIndent=-8,
            textColor=colors.HexColor("#334155"),
            spaceAfter=4,
        ),
        "code": ParagraphStyle(
            "CodeCustom",
            parent=base["Code"],
            fontName="Courier",
            fontSize=8.2,
            leading=11,
            textColor=colors.HexColor("#0f172a"),
            backColor=colors.HexColor("#f8fafc"),
            borderColor=colors.HexColor("#e2e8f0"),
            borderWidth=0.5,
            borderPadding=6,
            spaceBefore=4,
            spaceAfter=8,
        ),
    }


def add_footer(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setStrokeColor(colors.HexColor("#e2e8f0"))
    canvas.line(doc.leftMargin, 0.55 * inch, width - doc.rightMargin, 0.55 * inch)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#64748b"))
    canvas.drawString(doc.leftMargin, 0.35 * inch, "Testimonial Collecting Platform")
    canvas.drawRightString(width - doc.rightMargin, 0.35 * inch, f"Page {doc.page}")
    canvas.restoreState()


def parse_markdown(markdown: str, styles):
    story = []
    lines = markdown.splitlines()
    in_code = False
    code_lines = []
    ordered_index = 1

    for raw in lines:
        line = raw.rstrip()

        if line.startswith("```"):
            if in_code:
                story.append(Paragraph("<br/>".join(clean_inline(x) for x in code_lines), styles["code"]))
                code_lines = []
                in_code = False
            else:
                in_code = True
            continue

        if in_code:
            code_lines.append(line)
            continue

        if not line.strip():
            ordered_index = 1
            continue

        if line.startswith("# "):
            story.append(Paragraph(clean_inline(line[2:].strip()), styles["title"]))
            continue

        if line.startswith("## "):
            story.append(Paragraph(clean_inline(line[3:].strip()), styles["subtitle"]))
            continue

        if line.startswith("### "):
            story.append(Paragraph(clean_inline(line[4:].strip()), styles["h1"]))
            continue

        if line.startswith("#### "):
            story.append(Paragraph(clean_inline(line[5:].strip()), styles["h2"]))
            continue

        if line.startswith("- "):
            story.append(Paragraph(f"• {clean_inline(line[2:].strip())}", styles["bullet"]))
            continue

        numbered = re.match(r"^(\d+)\.\s+(.*)$", line)
        if numbered:
            story.append(Paragraph(f"{numbered.group(1)}. {clean_inline(numbered.group(2))}", styles["bullet"]))
            ordered_index += 1
            continue

        story.append(Paragraph(clean_inline(line), styles["body"]))

    return story


def build_pdf():
    styles = make_styles()
    doc = BaseDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        rightMargin=0.65 * inch,
        leftMargin=0.65 * inch,
        topMargin=0.65 * inch,
        bottomMargin=0.75 * inch,
        title="Testimonial Collecting Platform - Project Documentation",
        author="Codex",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=add_footer)])

    markdown = SOURCE.read_text(encoding="utf-8")
    story = parse_markdown(markdown, styles)
    doc.build(story)


if __name__ == "__main__":
    build_pdf()
    print(OUTPUT)
