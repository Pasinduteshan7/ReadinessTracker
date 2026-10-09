"""
Certification Database — tiers and provider weights.
Tier: 1 (basic) to 4 (professional/expert) — reflects industry recognition.
Provider weight: 0.0-1.0 — how respected the issuer is.
Max score per cert = tier * provider = 4 * 1.0 = 4.0
"""

CERT_DB = {
    # ============ Cloud (Tier 4 = Professional) ============
    "aws certified solutions architect":       {"tier": 4, "provider": 1.0, "category": "Cloud"},
    "aws certified developer":                 {"tier": 3, "provider": 1.0, "category": "Cloud"},
    "aws certified cloud practitioner":        {"tier": 2, "provider": 1.0, "category": "Cloud"},
    "google cloud professional":               {"tier": 4, "provider": 1.0, "category": "Cloud"},
    "google cloud associate":                  {"tier": 2, "provider": 1.0, "category": "Cloud"},
    "microsoft azure administrator":           {"tier": 3, "provider": 1.0, "category": "Cloud"},
    "microsoft azure ai engineer":             {"tier": 3, "provider": 1.0, "category": "Cloud"},
    "microsoft azure fundamentals":            {"tier": 1, "provider": 1.0, "category": "Cloud"},

    # ============ AI/ML (Tier 3 = industry-recognized) ============
    "tensorflow developer certificate":        {"tier": 3, "provider": 0.9, "category": "AI/ML"},
    "deeplearning.ai specialization":          {"tier": 3, "provider": 0.8, "category": "AI/ML"},
    "deep learning specialization":            {"tier": 3, "provider": 0.8, "category": "AI/ML"},
    "machine learning specialization":         {"tier": 3, "provider": 0.8, "category": "AI/ML"},
    "ai for everyone":                         {"tier": 1, "provider": 0.8, "category": "AI/ML"},
    "ibm ai engineering":                      {"tier": 3, "provider": 0.85, "category": "AI/ML"},
    "ai/ml engineer stage 1":                  {"tier": 1, "provider": 0.5, "category": "AI/ML"},
    "ai/ml engineer stage 2":                  {"tier": 2, "provider": 0.5, "category": "AI/ML"},
    "ai/ml engineer stage 3":                  {"tier": 3, "provider": 0.5, "category": "AI/ML"},
    # Add these at end of CERT_DB dict:
    "agile project management":                {"tier": 2, "provider": 0.7, "category": "Soft"},
    "hugging face agents course":              {"tier": 2, "provider": 0.7, "category": "AI/ML"},

    # ============ Networking ============
    "cisco ccna":                              {"tier": 3, "provider": 0.9, "category": "Networking"},
    "ccna":                                    {"tier": 3, "provider": 0.9, "category": "Networking"},
    "ccnp":                                    {"tier": 4, "provider": 0.9, "category": "Networking"},
    "comptia network+":                        {"tier": 2, "provider": 0.85, "category": "Networking"},

    # ============ Cybersecurity ============
    "comptia security+":                       {"tier": 3, "provider": 0.9, "category": "Cyber"},
    "ceh":                                     {"tier": 4, "provider": 0.9, "category": "Cyber"},
    "certified ethical hacker":                {"tier": 4, "provider": 0.9, "category": "Cyber"},
    "cissp":                                   {"tier": 4, "provider": 1.0, "category": "Cyber"},

    # ============ Programming / General ============
    "sololearn python developer":              {"tier": 1, "provider": 0.4, "category": "Software"},
    "sololearn python":                        {"tier": 1, "provider": 0.4, "category": "Software"},
    "coursera python":                         {"tier": 2, "provider": 0.7, "category": "Software"},
    "python for everybody":                    {"tier": 2, "provider": 0.75, "category": "Software"},
    "cs50":                                    {"tier": 2, "provider": 0.85, "category": "Software"},
    "freecodecamp":                            {"tier": 1, "provider": 0.6, "category": "Software"},
    "meta frontend developer":                 {"tier": 3, "provider": 0.85, "category": "Web"},
    "meta backend developer":                  {"tier": 3, "provider": 0.85, "category": "Web"},
    "ibm data science":                        {"tier": 3, "provider": 0.85, "category": "Data"},
    "google data analytics":                   {"tier": 3, "provider": 0.9, "category": "Data"},

    # ============ Project Management / Agile ============
    "scrum master":                            {"tier": 3, "provider": 0.85, "category": "Soft"},
    "pmp":                                     {"tier": 4, "provider": 1.0, "category": "Soft"},
}

# Fallback for unrecognized certifications
DEFAULT_CERT = {"tier": 1, "provider": 0.5, "category": "Other"}

# Keywords to detect certifications that aren't in the DB above
CERT_KEYWORDS = [
    "certificate", "certification", "certified", "specialization",
    "professional certificate", "nanodegree", "diploma in",
]


def get_cert_meta(cert_name: str) -> dict:
    """Fuzzy lookup — returns metadata or default."""
    key = cert_name.lower().strip()
    # Exact match first
    if key in CERT_DB:
        return CERT_DB[key]
    # Substring match
    for db_key, meta in CERT_DB.items():
        if db_key in key or key in db_key:
            return meta
    return DEFAULT_CERT


if __name__ == "__main__":
    print(f"✅ Total certs in DB: {len(CERT_DB)}")
    categories = set(m["category"] for m in CERT_DB.values())
    print(f"   Categories: {sorted(categories)}")