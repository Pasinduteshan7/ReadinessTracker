"""
Job Category Analyzer — embedding-based job fit scoring.

Approach:
  1. Combine profile text (skills + certs + experience + projects) into one string
  2. Encode with sentence-transformers (384-dim vector)
  3. Cosine similarity against each category's description vector
  4. Boost score if student has category's core skills
  5. Return {category: match_percentage}
"""

import re
import numpy as np
from sentence_transformers import SentenceTransformer
from app.data.job_categories import JOB_CATEGORIES


# ============================================================
# LAZY MODEL LOADING — loads once, reused for all calls
# ============================================================

_MODEL = None
_CATEGORY_VECS = None


def _get_model():
    global _MODEL
    if _MODEL is None:
        print("🔄 Loading sentence-transformer model (first time ~5-10s)...")
        _MODEL = SentenceTransformer("all-MiniLM-L6-v2")
    return _MODEL


def _get_category_vectors():
    """Encode category descriptions once at startup."""
    global _CATEGORY_VECS
    if _CATEGORY_VECS is None:
        model = _get_model()
        _CATEGORY_VECS = {}
        for cat, meta in JOB_CATEGORIES.items():
            vec = model.encode(meta["description"], normalize_embeddings=True)
            _CATEGORY_VECS[cat] = vec
    return _CATEGORY_VECS


# ============================================================
# BUILD STUDENT TEXT
# ============================================================

def _build_student_text(profile: dict) -> str:
    """
    Combine the most job-relevant parts of the profile into one searchable text.
    """
    parts = []

    skills = profile.get("skills", [])
    if skills:
        parts.append("Skills: " + ", ".join(skills))

    certs = profile.get("certifications", [])
    if certs:
        parts.append("Certifications: " + ", ".join(certs))

    # Experience — role + first 200 chars of description (avoid huge text)
    exp_texts = []
    for e in profile.get("experience", []):
        role = e.get("role", "")
        desc = (e.get("description", "") or "")[:200]
        exp_texts.append(f"{role} {desc}")
    if exp_texts:
        parts.append("Experience: " + " | ".join(exp_texts))

    # Projects — title + tech
    proj_texts = []
    for p in profile.get("projects", []):
        title = p.get("title", "")
        tech = ", ".join(p.get("tech", []))
        proj_texts.append(f"{title} ({tech})")
    if proj_texts:
        parts.append("Projects: " + " | ".join(proj_texts))

    # Education field
    edu_texts = []
    for e in profile.get("education", []):
        if e.get("field"):
            edu_texts.append(e["field"])
    if edu_texts:
        parts.append("Education: " + ", ".join(edu_texts))

    return "  ".join(parts) if parts else "empty profile"


# ============================================================
# CORE-SKILL BOOST
# ============================================================

# ============================================================
# CORE-SKILL MATCHING
# ============================================================

def _count_core_matches(profile: dict, category: str) -> tuple[int, int]:
    """
    Returns (direct_matches, indirect_matches) for a category.
    """
    meta = JOB_CATEGORIES[category]
    core = set(meta["core_skills"])
    student_skills = set(s.lower() for s in profile.get("skills", []))

    # Full profile text for substring matching
    full_text = " ".join([
        " ".join(profile.get("skills", [])),
        " ".join(profile.get("certifications", [])),
        " ".join(e.get("role", "") + " " + (e.get("description", "") or "")
                 for e in profile.get("experience", [])),
        " ".join(p.get("title", "") + " " + p.get("description", "")
                 for p in profile.get("projects", [])),
    ]).lower()

    direct = 0
    indirect = 0
    for cs in core:
        if cs in student_skills:
            direct += 1
        elif re.search(r"\b" + re.escape(cs), full_text):
            indirect += 1

    return direct, indirect


# ============================================================
# MAIN
# ============================================================

def job_fit_scores(profile: dict) -> dict:
    """
    Final score = 40% semantic similarity + 60% core-skill evidence.
    No core skills → heavy penalty (halves the score).
    """
    model = _get_model()
    cat_vecs = _get_category_vectors()

    student_text = _build_student_text(profile)
    student_vec = model.encode(student_text, normalize_embeddings=True)

    raw_scores = {}
    for cat, cat_vec in cat_vecs.items():
        # 1. Semantic similarity
        cos = float(np.dot(student_vec, cat_vec))
        # Normalize: cos=0.15 → 0%, cos=0.65 → 100% (harder to reach 100)
        semantic_pct = max(0.0, min(100.0, (cos - 0.15) / 0.50 * 100))

        # 2. Core-skill evidence
        direct, indirect = _count_core_matches(profile, cat)
        evidence = direct * 1.0 + indirect * 0.5
        # 3 hits → full evidence credit (100)
        evidence_pct = min(evidence / 3.0, 1.0) * 100

        # 3. Weighted combination
        if direct == 0 and indirect == 0:
            # No evidence at all → cap the score very low
            final = semantic_pct * 0.20
        else:
            final = 0.40 * semantic_pct + 0.60 * evidence_pct

        # 4. Category weight adjustment (industry demand multiplier)
        final *= (0.85 + 0.15 * JOB_CATEGORIES[cat]["weight"])

        raw_scores[cat] = round(min(100.0, final), 1)

    return dict(sorted(raw_scores.items(), key=lambda x: -x[1]))

def top_job_matches(profile: dict, n: int = 3) -> list[tuple[str, float]]:
    """Convenience — returns top-N (category, score) tuples."""
    scores = job_fit_scores(profile)
    return list(scores.items())[:n]


# ============================================================
# CLI TEST
# ============================================================

if __name__ == "__main__":
    import sys, json
    from app.services.pdf_parser import extract_text, clean_text
    from app.services.extractor import extract_profile

    if len(sys.argv) < 2:
        print("Usage: python -m app.services.category_classifier <path_to_pdf>")
        sys.exit(1)

    raw = clean_text(extract_text(sys.argv[1]))
    profile = extract_profile(raw)

    print("\n" + "=" * 60)
    print(f"🎯 JOB CATEGORY FIT — {profile['name']}")
    print("=" * 60)

    scores = job_fit_scores(profile)
    for cat, pct in scores.items():
        bar_len = int(pct / 5)
        bar = "█" * bar_len + "░" * (20 - bar_len)
        print(f"  {cat:22s}  {bar}  {pct:5.1f}%")

    print("=" * 60)
    print("\nTop 3 recommendations:")
    for cat, pct in top_job_matches(profile, 3):
        print(f"  🏆 {cat}  ({pct}%)")

    print("\n--- Full JSON ---")
    print(json.dumps(scores, indent=2))