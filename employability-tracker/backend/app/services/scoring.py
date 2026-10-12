"""
Scoring Engine — computes employability readiness from profile data.
Total = 100 points across 6 dimensions.
"""
from app.data.skill_taxonomy import SKILL_TAXONOMY
from app.data.cert_db import get_cert_meta, DEFAULT_CERT


# ============================================================
# DIMENSION 1: SKILLS (max 30 pts)
# ============================================================

SKILL_DEMAND_TARGET = 6.0   # ~6 high-demand skills → full marks


def score_skills(skills: list[str]) -> float:
    """
    Score based on:
      - Sum of demand weights (75%)
      - Category diversity (25%)
    """
    if not skills:
        return 0.0

    matched = [SKILL_TAXONOMY[s] for s in skills if s in SKILL_TAXONOMY]
    if not matched:
        return 0.0

    # Demand sum — capped at target
    demand_sum = sum(m["demand"] for m in matched)
    base = min(demand_sum / SKILL_DEMAND_TARGET, 1.0)

    # Diversity — how many distinct IT categories (exclude Soft)
    it_categories = {m["category"] for m in matched if m["category"] != "Soft"}
    diversity = min(len(it_categories) / 3.0, 1.0)

    score = 30 * (0.75 * base + 0.25 * diversity)
    return round(score, 2)


# ============================================================
# DIMENSION 2: PROJECTS (max 20 pts)
# ============================================================

PROJECT_SIGNALS = {
    "deployed": 1.0, "hosted": 0.8, "github": 0.6, "api": 0.5,
    "database": 0.5, "machine learning": 0.8, "real-time": 0.7,
    "real time": 0.7, "mobile app": 0.6, "web app": 0.6, "team": 0.4,
    "final year": 0.5, "docker": 0.6, "cloud": 0.6, "backend": 0.5,
    "frontend": 0.5, "full stack": 0.8, "fullstack": 0.8,
    "ml": 0.7, "ai": 0.7, "nlp": 0.7, "cnn": 0.6, "rnn": 0.6,
}

PROJECT_TARGET = 6.0   # ~2 strong projects → full marks


def score_projects(projects: list[dict]) -> float:
    """
    Each project gets a complexity score based on:
      - Signal keywords in title/description (60%)
      - Tech stack depth (40%)
    """
    if not projects:
        return 0.0

    total = 0.0
    for p in projects:
        text = (p.get("title", "") + " " + p.get("description", "")).lower()
        signals = sum(w for k, w in PROJECT_SIGNALS.items() if k in text)
        tech_depth = min(len(p.get("tech", [])) / 4.0, 1.0)

        # Per-project max = 3.0
        project_score = min(0.6 * signals + 0.4 * tech_depth * 2.0, 3.0)
        total += project_score

    return round(20 * min(total / PROJECT_TARGET, 1.0), 2)


# ============================================================
# DIMENSION 3: CERTIFICATIONS (max 15 pts)
# ============================================================

CERT_TARGET = 8.0   # ~2 strong certs (tier*provider ~4 each) → full marks


def score_certifications(certifications: list[str]) -> float:
    """
    Each cert: tier (1-4) * provider_weight (0.4-1.0).
    Best 3 certs count (prevents bulk low-quality spam).
    """
    if not certifications:
        return 0.0

    weighted = []
    for c in certifications:
        meta = get_cert_meta(c)
        weighted.append(meta["tier"] * meta["provider"])

    # Take best 3
    weighted.sort(reverse=True)
    total = sum(weighted[:3])

    return round(15 * min(total / CERT_TARGET, 1.0), 2)


# ============================================================
# DIMENSION 4: EXPERIENCE (max 15 pts)
# ============================================================

EXP_TARGET = 3.0   # 1 year of IT experience → full marks


def score_experience(experience: list[dict]) -> float:
    """
    IT roles count fully; non-IT roles count 35% (soft skills credit).
    Duration factor caps at 12 months per role.
    """
    if not experience:
        return 0.0

    total = 0.0
    for e in experience:
        months = e.get("duration_months", 0)
        duration_factor = min(months / 12.0, 1.0)
        relevance = 1.0 if e.get("is_it", False) else 0.35
        total += duration_factor * relevance * 3.0

    return round(15 * min(total / EXP_TARGET, 1.0), 2)


# ============================================================
# DIMENSION 5: EDUCATION (max 10 pts)
# ============================================================

DEGREE_WEIGHTS = {
    "phd": 1.0, "doctorate": 1.0,
    "master": 0.9, "msc": 0.9, "m.sc": 0.9,
    "bsc": 0.8, "b.sc": 0.8, "beng": 0.8, "b.eng": 0.8,
    "bachelor": 0.8,
    "hnd": 0.6, "higher national diploma": 0.6,
    "diploma": 0.5,
}

RELEVANT_FIELDS = [
    "computer", "software", "information technology", "information systems",
    "electrical", "electronic", "data science", "artificial intelligence",
    "cybersecurity", "network engineering",
]


def score_education(education: list[dict]) -> float:
    if not education:
        return 0.0

    best = 0.0
    for e in education:
        degree_text = (e.get("degree", "") + " " + e.get("field", "") + " " +
                       e.get("institution", "")).lower()

        # Degree weight
        degree_w = 0.3   # default for unknown
        for k, w in DEGREE_WEIGHTS.items():
            if k in degree_text:
                degree_w = max(degree_w, w)

        # Field relevance
        field_w = 1.0 if any(f in degree_text for f in RELEVANT_FIELDS) else 0.5

        # Still studying → 0.9 multiplier
        status_w = 0.9 if ("ug" in degree_text or "undergraduate" in degree_text) else 1.0

        best = max(best, degree_w * field_w * status_w)

    return round(10 * best, 2)


# ============================================================
# DIMENSION 6: EXTRAS (max 10 pts)
# ============================================================

def score_extras(profile: dict) -> float:
    """
    GitHub, LinkedIn, portfolio, languages, soft skills, awards.
    """
    pts = 0.0
    contact = profile.get("contact", {})

    if contact.get("github"):
        pts += 2.5
    if contact.get("linkedin"):
        pts += 1.5

    # Portfolio detection — any personal website in contact area
    # (we don't extract it yet, so skip — reserved for future)

    if len(profile.get("languages", [])) >= 2:
        pts += 1.5

    # Soft skills
    soft = profile.get("soft_skills", [])
    if len(soft) >= 3:
        pts += 1.5
    elif len(soft) >= 1:
        pts += 0.5

    # Awards section presence
    if "awards" in profile.get("raw_sections", []):
        pts += 1.5

    # Profile completeness — has education + experience + skills
    has_edu = bool(profile.get("education"))
    has_exp = bool(profile.get("experience"))
    has_skills = bool(profile.get("skills"))
    if has_edu and has_exp and has_skills:
        pts += 1.5

    return round(min(pts, 10.0), 2)


# ============================================================
# READINESS LEVEL
# ============================================================

def readiness_level(total: float) -> str:
    if total >= 80:
        return "Industry Ready 🟢"
    elif total >= 60:
        return "Nearly Ready 🟡"
    elif total >= 40:
        return "Developing 🟠"
    else:
        return "Beginner 🔴"


# ============================================================
# MAIN
# ============================================================

def compute_readiness(profile: dict) -> dict:
    """
    Main entry — takes profile dict, returns full readiness result.
    """
    breakdown = {
        "skills":         score_skills(profile.get("skills", [])),
        "projects":       score_projects(profile.get("projects", [])),
        "certifications": score_certifications(profile.get("certifications", [])),
        "experience":     score_experience(profile.get("experience", [])),
        "education":      score_education(profile.get("education", [])),
        "extras":         score_extras(profile),
    }
    total = round(sum(breakdown.values()), 2)

    return {
        "total": total,
        "level": readiness_level(total),
        "breakdown": breakdown,
        "max_scores": {
            "skills": 30, "projects": 20, "certifications": 15,
            "experience": 15, "education": 10, "extras": 10,
        },
    }


# ============================================================
# CLI TEST
# ============================================================

if __name__ == "__main__":
    import sys, json
    from app.services.pdf_parser import extract_text, clean_text
    from app.services.extractor import extract_profile

    if len(sys.argv) < 2:
        print("Usage: python -m app.services.scoring <path_to_pdf>")
        sys.exit(1)

    raw = clean_text(extract_text(sys.argv[1]))
    profile = extract_profile(raw)
    result = compute_readiness(profile)

    print("\n" + "=" * 55)
    print("📊 EMPLOYABILITY READINESS REPORT")
    print("=" * 55)
    print(f"Name: {profile['name']}")
    print(f"Total Score: {result['total']} / 100")
    print(f"Level: {result['level']}")
    print("-" * 55)
    print("Dimension Breakdown:")
    for dim, val in result["breakdown"].items():
        max_v = result["max_scores"][dim]
        pct = (val / max_v * 100) if max_v else 0
        bar = "█" * int(pct / 5) + "░" * (20 - int(pct / 5))
        print(f"  {dim:15s} {bar}  {val:5.2f} / {max_v}")
    print("=" * 55)

    print("\n--- Full JSON ---")
    print(json.dumps(result, indent=2))