"""
Job Category Taxonomy — descriptions used for embedding-based matching.
Each category has:
  - description: rich text for semantic similarity
  - core_skills: high-signal skills (boost if present)
  - weight: relative importance in IT industry (for recommendation)
"""

JOB_CATEGORIES = {
    "AI/ML Engineering": {
        "description": (
            "Machine learning engineer, deep learning, neural networks, "
            "TensorFlow, PyTorch, Keras, CNN, RNN, transformers, LLM, "
            "NLP, computer vision, model training, MLOps, scikit-learn, "
            "feature engineering, hyperparameter tuning, model deployment, "
            "Hugging Face, LangChain, RAG, agentic AI."
        ),
        "core_skills": ["tensorflow", "pytorch", "keras", "cnn", "rnn",
                        "transformer", "llm", "nlp", "machine learning",
                        "deep learning", "scikit-learn", "computer vision",
                        "opencv", "hugging face"],
        "weight": 1.00,
    },
    "Data Science": {
        "description": (
            "Data scientist, data analyst, statistics, pandas, numpy, "
            "SQL, data visualization, matplotlib, seaborn, Power BI, "
            "Tableau, ETL, data warehouse, big data, Spark, hypothesis "
            "testing, A/B testing, predictive modeling, business intelligence."
        ),
        "core_skills": ["pandas", "numpy", "sql", "matplotlib", "jupyter",
                        "data science", "statistics"],
        "weight": 0.92,
    },
    "Software Engineering": {
        "description": (
            "Software engineer, backend developer, OOP, data structures, "
            "algorithms, design patterns, Java, C++, C#, Python, Go, Rust, "
            "REST API, microservices, testing, Git, code review, "
            "software architecture, system design."
        ),
        "core_skills": ["python", "java", "c++", "c#", "go", "rust",
                        "git", "github", "rest api", "software", "developer"],
        "weight": 0.95,
    },
    "Web Development": {
        "description": (
            "Full stack web developer, frontend, backend, HTML, CSS, "
            "JavaScript, TypeScript, React, Angular, Vue, Node.js, "
            "Express, Django, Flask, FastAPI, Spring Boot, MongoDB, "
            "PostgreSQL, responsive design, REST API, GraphQL."
        ),
        "core_skills": ["react", "angular", "vue", "node.js", "nodejs",
                        "express", "django", "flask", "fastapi",
                        "html", "css", "javascript", "typescript",
                        "tailwind", "bootstrap"],
        "weight": 0.90,
    },
    "Mobile Development": {
        "description": (
            "Mobile app developer, Android, iOS, Flutter, React Native, "
            "Swift, Kotlin, Dart, mobile UI/UX, app store deployment, "
            "cross-platform development, native mobile apps."
        ),
        "core_skills": ["flutter", "react native", "android", "ios",
                        "swift", "kotlin", "dart"],
        "weight": 0.80,
    },
    "Cloud/DevOps": {
        "description": (
            "Cloud engineer, DevOps engineer, AWS, Azure, GCP, "
            "Docker, Kubernetes, Terraform, CI/CD, Jenkins, GitLab CI, "
            "GitHub Actions, Linux, infrastructure as code, monitoring, "
            "Prometheus, Grafana, cloud architecture, serverless."
        ),
        "core_skills": ["aws", "azure", "gcp", "google cloud", "docker",
                        "kubernetes", "terraform", "ci/cd", "jenkins",
                        "linux", "devops"],
        "weight": 0.95,
    },
    "Networking": {
        "description": (
            "Network engineer, CCNA, CCNP, routing, switching, TCP/IP, "
            "subnetting, Cisco, firewall, VPN, LAN, WAN, wireless, "
            "network security, network administration."
        ),
        "core_skills": ["ccna", "ccnp", "cisco", "networking", "tcp/ip",
                        "routing", "switching", "firewall", "vpn"],
        "weight": 0.75,
    },
    "Cybersecurity": {
        "description": (
            "Security analyst, penetration tester, ethical hacker, "
            "Kali Linux, Wireshark, SIEM, SOC, vulnerability assessment, "
            "incident response, cryptography, threat intelligence, "
            "compTIA Security+, CEH, CISSP."
        ),
        "core_skills": ["cybersecurity", "penetration testing",
                        "ethical hacking", "wireshark", "kali linux",
                        "siem", "cryptography"],
        "weight": 0.90,
    },
}


def get_category_names() -> list[str]:
    return list(JOB_CATEGORIES.keys())


if __name__ == "__main__":
    print(f"✅ Total job categories: {len(JOB_CATEGORIES)}")
    for name, meta in JOB_CATEGORIES.items():
        print(f"   {name:22s}  weight={meta['weight']:.2f}  "
              f"core_skills={len(meta['core_skills'])}")