"""
Skill Taxonomy — IT industry skills with demand weights and categories.
Demand: 0.0 (low) to 1.0 (very high) — based on LinkedIn/WEF 2024-25 trends.
Level: foundation / intermediate / advanced — typical proficiency level expected.
"""

SKILL_TAXONOMY = {
    # ============ Programming Languages ============
    "python":          {"category": "Software",   "demand": 1.00, "level": "foundation"},
    "java":            {"category": "Software",   "demand": 0.90, "level": "foundation"},
    "javascript":      {"category": "Software",   "demand": 0.95, "level": "foundation"},
    "typescript":      {"category": "Software",   "demand": 0.85, "level": "intermediate"},
    "c++":             {"category": "Software",   "demand": 0.80, "level": "intermediate"},
    "c#":              {"category": "Software",   "demand": 0.80, "level": "intermediate"},
    "c":               {"category": "Software",   "demand": 0.70, "level": "foundation"},
    "php":             {"category": "Software",   "demand": 0.65, "level": "foundation"},
    "go":              {"category": "Software",   "demand": 0.80, "level": "intermediate"},
    "rust":            {"category": "Software",   "demand": 0.75, "level": "advanced"},
    "kotlin":          {"category": "Mobile",     "demand": 0.75, "level": "intermediate"},
    "swift":           {"category": "Mobile",     "demand": 0.75, "level": "intermediate"},
    "dart":            {"category": "Mobile",     "demand": 0.65, "level": "intermediate"},

    # ============ AI / ML ============
    "tensorflow":      {"category": "AI/ML",      "demand": 0.95, "level": "advanced"},
    "pytorch":         {"category": "AI/ML",      "demand": 0.95, "level": "advanced"},
    "keras":           {"category": "AI/ML",      "demand": 0.85, "level": "advanced"},
    "scikit-learn":    {"category": "AI/ML",      "demand": 0.85, "level": "intermediate"},
    "cnn":             {"category": "AI/ML",      "demand": 0.80, "level": "advanced"},
    "rnn":             {"category": "AI/ML",      "demand": 0.75, "level": "advanced"},
    "lstm":            {"category": "AI/ML",      "demand": 0.75, "level": "advanced"},
    "transformer":     {"category": "AI/ML",      "demand": 0.95, "level": "advanced"},
    "llm":             {"category": "AI/ML",      "demand": 1.00, "level": "advanced"},
    "nlp":             {"category": "AI/ML",      "demand": 0.90, "level": "advanced"},
    "computer vision": {"category": "AI/ML",      "demand": 0.85, "level": "advanced"},
    "opencv":          {"category": "AI/ML",      "demand": 0.80, "level": "intermediate"},
    "machine learning":{"category": "AI/ML",      "demand": 0.95, "level": "intermediate"},
    "deep learning":   {"category": "AI/ML",      "demand": 0.95, "level": "advanced"},
    "pandas":          {"category": "Data",       "demand": 0.90, "level": "foundation"},
    "numpy":           {"category": "Data",       "demand": 0.90, "level": "foundation"},
    "matplotlib":      {"category": "Data",       "demand": 0.75, "level": "foundation"},
    "jupyter":         {"category": "Data",       "demand": 0.80, "level": "foundation"},

    # ============ Web Dev ============
    "react":           {"category": "Web",        "demand": 0.92, "level": "intermediate"},
    "angular":         {"category": "Web",        "demand": 0.75, "level": "intermediate"},
    "vue":             {"category": "Web",        "demand": 0.75, "level": "intermediate"},
    "node.js":         {"category": "Web",        "demand": 0.90, "level": "intermediate"},
    "nodejs":          {"category": "Web",        "demand": 0.90, "level": "intermediate"},
    "express":         {"category": "Web",        "demand": 0.80, "level": "intermediate"},
    "django":          {"category": "Web",        "demand": 0.85, "level": "intermediate"},
    "flask":           {"category": "Web",        "demand": 0.80, "level": "intermediate"},
    "fastapi":         {"category": "Web",        "demand": 0.85, "level": "intermediate"},
    "spring boot":     {"category": "Web",        "demand": 0.80, "level": "intermediate"},
    "html":            {"category": "Web",        "demand": 0.85, "level": "foundation"},
    "css":             {"category": "Web",        "demand": 0.85, "level": "foundation"},
    "tailwind":        {"category": "Web",        "demand": 0.80, "level": "intermediate"},
    "bootstrap":       {"category": "Web",        "demand": 0.70, "level": "foundation"},
    "rest api":        {"category": "Web",        "demand": 0.90, "level": "intermediate"},
    "graphql":         {"category": "Web",        "demand": 0.75, "level": "intermediate"},

    # ============ Databases ============
    "sql":             {"category": "Data",       "demand": 0.95, "level": "foundation"},
    "mysql":           {"category": "Data",       "demand": 0.85, "level": "foundation"},
    "postgresql":      {"category": "Data",       "demand": 0.90, "level": "intermediate"},
    "mongodb":         {"category": "Data",       "demand": 0.80, "level": "intermediate"},
    "sqlite":          {"category": "Data",       "demand": 0.65, "level": "foundation"},
    "redis":           {"category": "Data",       "demand": 0.75, "level": "intermediate"},

    # ============ DevOps / Cloud ============
    "docker":          {"category": "DevOps",     "demand": 0.95, "level": "intermediate"},
    "kubernetes":      {"category": "DevOps",     "demand": 0.90, "level": "advanced"},
    "aws":             {"category": "Cloud",      "demand": 0.95, "level": "intermediate"},
    "azure":           {"category": "Cloud",      "demand": 0.88, "level": "intermediate"},
    "gcp":             {"category": "Cloud",      "demand": 0.80, "level": "intermediate"},
    "google cloud":    {"category": "Cloud",      "demand": 0.80, "level": "intermediate"},
    "ci/cd":           {"category": "DevOps",     "demand": 0.85, "level": "intermediate"},
    "jenkins":         {"category": "DevOps",     "demand": 0.75, "level": "intermediate"},
    "terraform":       {"category": "DevOps",     "demand": 0.85, "level": "advanced"},
    "linux":           {"category": "DevOps",     "demand": 0.90, "level": "foundation"},
    "git":             {"category": "Software",   "demand": 0.98, "level": "foundation"},
    "github":          {"category": "Software",   "demand": 0.95, "level": "foundation"},
    "gitlab":          {"category": "Software",   "demand": 0.75, "level": "intermediate"},

    # ============ Networking ============
    "networking":      {"category": "Networking", "demand": 0.80, "level": "foundation"},
    "tcp/ip":          {"category": "Networking", "demand": 0.80, "level": "foundation"},
    "cisco":           {"category": "Networking", "demand": 0.85, "level": "intermediate"},
    "routing":         {"category": "Networking", "demand": 0.80, "level": "intermediate"},
    "switching":       {"category": "Networking", "demand": 0.80, "level": "intermediate"},
    "ccna":            {"category": "Networking", "demand": 0.85, "level": "intermediate"},
    "firewall":        {"category": "Networking", "demand": 0.80, "level": "intermediate"},
    "vpn":             {"category": "Networking", "demand": 0.75, "level": "intermediate"},

    # ============ Cybersecurity ============
    "cybersecurity":   {"category": "Cyber",      "demand": 0.90, "level": "intermediate"},
    "penetration testing": {"category": "Cyber",  "demand": 0.90, "level": "advanced"},
    "ethical hacking": {"category": "Cyber",      "demand": 0.88, "level": "advanced"},
    "wireshark":       {"category": "Cyber",      "demand": 0.75, "level": "intermediate"},
    "kali linux":      {"category": "Cyber",      "demand": 0.80, "level": "intermediate"},
    "siem":            {"category": "Cyber",      "demand": 0.85, "level": "advanced"},
    "cryptography":    {"category": "Cyber",      "demand": 0.80, "level": "advanced"},

    # ============ Mobile ============
    "flutter":         {"category": "Mobile",     "demand": 0.80, "level": "intermediate"},
    "react native":    {"category": "Mobile",     "demand": 0.80, "level": "intermediate"},
    "android":         {"category": "Mobile",     "demand": 0.80, "level": "intermediate"},
    "ios":             {"category": "Mobile",     "demand": 0.75, "level": "intermediate"},

    # ============ Testing ============
    "selenium":        {"category": "QA",         "demand": 0.75, "level": "intermediate"},
    "junit":           {"category": "QA",         "demand": 0.70, "level": "intermediate"},
    "pytest":          {"category": "QA",         "demand": 0.75, "level": "intermediate"},
    "unit testing":    {"category": "QA",         "demand": 0.80, "level": "intermediate"},

    # ============ Soft skills / Misc ============
    "communication":   {"category": "Soft",       "demand": 0.90, "level": "foundation"},
    "teamwork":        {"category": "Soft",       "demand": 0.90, "level": "foundation"},
    "problem solving": {"category": "Soft",       "demand": 0.92, "level": "foundation"},
    "time management": {"category": "Soft",       "demand": 0.80, "level": "foundation"},
    "leadership":      {"category": "Soft",       "demand": 0.80, "level": "intermediate"},
    "agile":           {"category": "Soft",       "demand": 0.85, "level": "intermediate"},
    "scrum":           {"category": "Soft",       "demand": 0.80, "level": "intermediate"},
}


# Group skills by category — for diversity scoring and job-fit analysis
def group_by_category():
    """Returns {category: [skills]}"""
    groups = {}
    for skill, meta in SKILL_TAXONOMY.items():
        groups.setdefault(meta["category"], []).append(skill)
    return groups


# Get all skills in a specific category
def skills_in_category(category: str) -> list[str]:
    return [s for s, m in SKILL_TAXONOMY.items() if m["category"] == category]


if __name__ == "__main__":
    # Quick sanity check
    print(f"✅ Total skills in taxonomy: {len(SKILL_TAXONOMY)}")
    groups = group_by_category()
    for cat, skills in sorted(groups.items()):
        print(f"   {cat:12s} → {len(skills)} skills")