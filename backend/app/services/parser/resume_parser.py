import re
from pathlib import Path
from typing import Dict, Any, List
from app.services.parser.pdf_parser import extract_text_from_pdf
from app.services.parser.docx_parser import extract_text_from_docx

COMMON_SKILLS = [
    # AI / ML / GenAI
    "Python", "PyTorch", "TensorFlow", "Keras", "Scikit-Learn", "Machine Learning",
    "Deep Learning", "Natural Language Processing", "NLP", "Computer Vision",
    "GenAI", "Generative AI", "LLMs", "RAG", "LangChain", "LlamaIndex", "Hugging Face",
    "Vector Databases", "ChromaDB", "Pinecone", "FAISS", "Embeddings",
    # Backend & DB
    "FastAPI", "Flask", "Django", "Node.js", "Express", "REST APIs", "GraphQL",
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "SQLAlchemy", "ORM",
    "System Design", "Microservices",
    # Frontend
    "JavaScript", "TypeScript", "React", "Next.js", "Vue", "Tailwind CSS", "HTML5", "CSS3",
    # Cloud & DevOps
    "AWS", "GCP", "Azure", "Docker", "Kubernetes", "CI/CD", "Git", "GitHub", "Linux",
    "Terraform", "Kafka", "RabbitMQ", "Celery",
    # Data & Analytics
    "Pandas", "NumPy", "Apache Spark", "Power BI", "Tableau", "Data Analysis", "SQL"
]

def parse_resume_file(file_path: str) -> Dict[str, Any]:
    path = Path(file_path)
    extension = path.suffix.lower()

    if extension == ".pdf":
        text = extract_text_from_pdf(file_path)
    elif extension in [".docx", ".doc"]:
        text = extract_text_from_docx(file_path)
    else:
        # plain text or unsupported
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
        except Exception:
            text = f"Content for {path.name}"

    sections = extract_sections(text)
    detected_skills = extract_skills_from_text(text)
    
    return {
        "text": text,
        "sections": sections,
        "skills": detected_skills,
        "contact_info": extract_contact_info(text)
    }

def extract_contact_info(text: str) -> Dict[str, str]:
    email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
    phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    
    emails = re.findall(email_pattern, text)
    phones = re.findall(phone_pattern, text)
    
    return {
        "email": emails[0] if emails else "",
        "phone": phones[0] if phones else ""
    }

def extract_skills_from_text(text: str) -> List[str]:
    found = set()
    text_lower = f" {text.lower()} "
    for skill in COMMON_SKILLS:
        # Match word boundary
        pattern = r'(?i)\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found.add(skill)
    return sorted(list(found))

def extract_sections(text: str) -> List[Dict[str, str]]:
    section_patterns = {
        "summary": r'(?i)(professional summary|summary|objective|about me)',
        "experience": r'(?i)(work experience|experience|employment history|professional experience)',
        "education": r'(?i)(education|academic background|qualifications)',
        "projects": r'(?i)(projects|academic projects|key projects|personal projects)',
        "skills": r'(?i)(skills|technical skills|technologies|core competencies)',
        "certifications": r'(?i)(certifications|licenses|courses)'
    }

    # Split text into lines
    lines = text.split("\n")
    sections: List[Dict[str, str]] = []
    current_section = None
    current_title = "Header"
    current_lines = []

    for line in lines:
        cleaned_line = line.strip()
        if not cleaned_line:
            continue

        # Check if this line looks like a section header
        matched_section_type = None
        for stype, spattern in section_patterns.items():
            if len(cleaned_line) < 40 and re.fullmatch(spattern, cleaned_line):
                matched_section_type = stype
                break

        if matched_section_type:
            if current_lines:
                sections.append({
                    "section_type": current_section or "summary",
                    "title": current_title,
                    "content": "\n".join(current_lines).strip()
                })
                current_lines = []
            current_section = matched_section_type
            current_title = cleaned_line
        else:
            current_lines.append(cleaned_line)

    if current_lines:
        sections.append({
            "section_type": current_section or "general",
            "title": current_title,
            "content": "\n".join(current_lines).strip()
        })

    return sections
