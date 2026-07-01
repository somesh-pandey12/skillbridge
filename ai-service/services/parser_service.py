import fitz  # PyMuPDF

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        print(f"PyMuPDF extracted {len(text)} characters")
        return text.strip()
    except Exception as e:
        print(f"PyMuPDF error: {e}")
        return ""