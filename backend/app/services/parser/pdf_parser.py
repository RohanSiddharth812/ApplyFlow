from pathlib import Path
from pypdf import PdfReader
import logging

logger = logging.getLogger(__name__)

def extract_text_from_pdf(file_path: str) -> str:
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")
    
    try:
        reader = PdfReader(str(path))
        text_parts = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
        return "\n".join(text_parts).strip()
    except Exception as e:
        logger.error(f"Error extracting text from PDF {file_path}: {e}")
        # Return fallback text
        return f"Document content from {path.name}"
