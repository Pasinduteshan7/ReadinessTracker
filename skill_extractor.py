import spacy
from spacy.matcher import PhraseMatcher

# 1. Load the NLP model (fallback to blank English if the model is unavailable)
try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = spacy.blank("en")

# 2. Comprehensive skill dictionary
SKILLS = [
    # Programming Languages
    "Python", "Java", "JavaScript", "C++", "C#", "Go", "Rust", "TypeScript",
    "SQL", "Ruby", "PHP", "Kotlin", "Swift", "Scala", "R", "Perl", "Lua",
    "Elixir", "Haskell", "Dart", "MATLAB", "Bash", "Shell",

    # Frontend Frameworks & Libraries
    "React", "Angular", "Vue", "Node.js", "Express", "Svelte", "Next.js",
    "Nuxt", "Gatsby", "jQuery", "Bootstrap", "Tailwind", "Webpack", "Vite",

    # Backend Frameworks
    "Django", "Flask", "Spring Boot", "Spring", "FastAPI", "NestJS",
    "ASP.NET", "Laravel", "Gin", "Ruby on Rails",

    # Databases
    "PostgreSQL", "MongoDB", "MySQL", "Redis", "Oracle", "Cassandra",
    "DynamoDB", "Elasticsearch", "Firebase", "SQLite", "MariaDB", "BigQuery",

    # Cloud Platforms
    "AWS", "Azure", "GCP", "Google Cloud", "DigitalOcean", "Heroku",
    "EC2", "S3", "Lambda", "RDS", "CloudFront",

    # DevOps & Infrastructure
    "Docker", "Kubernetes", "Jenkins", "Git", "Terraform", "Ansible",
    "Helm", "CircleCI", "GitHub Actions", "ArgoCD",

    # Monitoring
    "Prometheus", "Grafana", "Datadog", "Splunk", "Sentry",

    # API & Web Technologies
    "REST", "GraphQL", "gRPC", "WebSocket", "OpenAPI", "Swagger",

    # Message Queues
    "Kafka", "RabbitMQ", "AWS SQS",

    # Data & ML
    "Pandas", "NumPy", "TensorFlow", "PyTorch", "Scikit-learn", "Keras",
    "XGBoost", "Spark", "Hadoop", "Airflow", "Matplotlib", "Seaborn",
    "Jupyter", "OpenCV", "Hugging Face", "LangChain",

    # Testing
    "Selenium", "Cypress", "Jest", "Pytest", "JUnit", "Mocha",

    # Mobile
    "React Native", "Flutter", "Android", "iOS", "Xamarin",

    # Security
    "OAuth", "JWT", "SAML", "SSL", "TLS",

    # Soft Skills & Concepts (valuable for gap analysis)
    "Agile", "Scrum", "Kanban", "CI/CD", "DevOps", "Microservices",
    "Machine Learning", "Deep Learning", "Data Science", "Blockchain",
    "Cloud Computing", "System Design", "Object Oriented Programming",
    "Data Structures", "Algorithms",
]

# 3. Initialize matcher (case-insensitive)
matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
patterns = [nlp.make_doc(text) for text in SKILLS]
matcher.add("SKILLS", patterns)


def extract_skills(text: str) -> list[str]:
    """Extract skills from a block of text. Returns a deduplicated list."""
    if not text or not text.strip():
        return []
    doc = nlp(text[:1_000_000])  # spaCy limit guard
    matches = matcher(doc)
    found = {doc[start:end].text for _, start, end in matches}
    return sorted(found)


def get_skill_categories(skills: list[str]) -> dict:
    """Categorize a list of skills for richer analysis."""
    categories = {
        "Languages": ["Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Kotlin", "Swift", "Scala", "R", "Dart"],
        "Frontend": ["React", "Angular", "Vue", "Next.js", "Svelte", "jQuery", "Bootstrap", "Tailwind"],
        "Backend": ["Django", "Flask", "Spring Boot", "FastAPI", "NestJS", "Laravel", "Express"],
        "Databases": ["PostgreSQL", "MongoDB", "MySQL", "Redis", "Oracle", "SQLite", "Firebase", "DynamoDB"],
        "Cloud & DevOps": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Jenkins", "GitHub Actions"],
        "Data & ML": ["Pandas", "NumPy", "TensorFlow", "PyTorch", "Scikit-learn", "Spark", "Keras", "Machine Learning", "Deep Learning"],
        "Mobile": ["React Native", "Flutter", "Android", "iOS"],
    }
    result = {}
    for cat, cat_skills in categories.items():
        matched = [s for s in skills if s in cat_skills]
        if matched:
            result[cat] = matched
    return result


# --- Quick test ---
if __name__ == "__main__":
    sample = """
    We are looking for a Senior Software Engineer with strong Python and FastAPI skills.
    You should have experience with React on the frontend and PostgreSQL or MongoDB for databases.
    AWS experience (EC2, S3, Lambda) is a plus. Familiarity with Docker, Kubernetes, and CI/CD pipelines required.
    Machine Learning or Data Science background is a bonus.
    """
    skills = extract_skills(sample)
    print(f"✅ Detected {len(skills)} skills: {skills}")
    print(f"\n📂 By category: {get_skill_categories(skills)}")
