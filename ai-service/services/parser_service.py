import fitz  # PyMuPDF

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = ""
        
        for page in doc:
            page_text = page.get_text()
            text += page_text
        
        doc.close()
        text = text.strip()
        print(f"Extracted {len(text)} characters")
        
        if len(text) < 50:
            print("WARNING: Scanned PDF detected — text extraction failed")
            return ""
            
        return text
        
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return ""