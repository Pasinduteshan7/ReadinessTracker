"""
PDF Parser — extracts clean text from PDF resumes.
Uses PyMuPDF (fast, handles most layouts) with pdfplumber as fallback.
"""

import os
import fitz  # PyMuPDF
import pdfplumber


def extract_text_pymupdf(pdf_path: str) -> str:
    """Primary extractor — fast and reliable."""
    doc = fitz.open(pdf_path)
    pages = []
    for page_num, page in enumerate(doc):
        text = page.get_text("text")
        pages.append(f"\n----- Page {page_num + 1} -----\n{text}")
    doc.close()
    return "\n".join(pages)


def extract_text_pdfplumber(pdf_path: str) -> str:
    """Fallback extractor — better for table-heavy or unusual layouts."""
    pages = []
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages):
            text = page.extract_text() or ""
            pages.append(f"\n----- Page {page_num + 1} -----\n{text}")
    return "\n".join(pages)


def extract_text(pdf_path: str) -> str:
    """
    Main function — tries PyMuPDF first, falls back to pdfplumber if empty.
    Returns raw text.
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    text = extract_text_pymupdf(pdf_path)

    # If PyMuPDF got very little text (scanned PDF?), try pdfplumber
    if len(text.strip()) < 200:
        print("⚠️  PyMuPDF extracted very little — trying pdfplumber...")
        text_alt = extract_text_pdfplumber(pdf_path)
        if len(text_alt.strip()) > len(text.strip()):
            text = text_alt

    return text


def clean_text(text: str) -> str:
    """Basic cleanup — normalize line endings, collapse excessive whitespace."""
    # Remove the page marker we added (keep for debugging if needed)
    lines = text.split("\n")
    cleaned = []
    for line in lines:
        # Collapse multiple spaces into one
        line = " ".join(line.split())
        cleaned.append(line)
    return "\n".join(cleaned)


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python pdf_parser.py <path_to_pdf>")
        sys.exit(1)

    path = sys.argv[1]
    raw = extract_text(path)
    cleaned = clean_text(raw)
    print(f"✅ Extracted {len(cleaned)} characters from {path}")
    print("\n--- First 1500 chars ---\n")
    print(cleaned[:1500])