from pathlib import Path
from docx import Document
import logging

logger = logging.getLogger(__name__)

def extract_text_from_docx(file_path: str) -> str:
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")
    
    try:
        doc = Document(str(path))
        text_parts = []
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                text_parts.append(paragraph.text.strip())
        for table in doc.tables:
            for row in table.rows:
                row_text = " | ".join([cell.text.strip() for cell in row.cells if cell.text.strip()])
                if row_text:
                    text_parts.append(row_text)
        return "\n".join(text_parts).strip()
    except Exception as e:
        logger.error(f"Error extracting text from DOCX {file_path}: {e}")
        return f"Document content from {path.name}"
