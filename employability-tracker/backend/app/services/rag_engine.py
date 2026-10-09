"""
RAG Recommendation Engine — uses Gemini to analyze profile vs target job role
and generate a structured learning path.
"""
import os
import json
import re
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai
import time
load_dotenv()

# Configure Gemini
_api_key = os.getenv("GEMINI_API_KEY")
if _api_key:
    genai.configure(api_key=_api_key)

_MODEL = None


# Preferred Gemini models — first available wins
PREFERRED_MODELS = [
    "gemini-3.8-flash",           # newest stable — best quality
    "gemini-3.5-flash",           # newer
    "gemini-2.5-flash",           # proven working with our code
    "gemini-flash-latest",        # auto-alias → current best flash
    "gemini-2.5-flash-lite",      # fallback — high rate limit (30/min)
    "gemini-flash-lite-latest",   # lite auto-alias
]


def _pick_available_model() -> str:
    """Ask Google which models are available, pick the best one."""
    try:
        available = {
            m.name.replace("models/", "")
            for m in genai.list_models()
            if "generateContent" in m.supported_generation_methods
        }
        for candidate in PREFERRED_MODELS:
            if candidate in available:
                print(f"✅ Using Gemini model: {candidate}")
                return candidate
        # Fallback — first available gemini flash
        for name in sorted(available):
            if "gemini" in name and "flash" in name:
                print(f"⚠️  Using fallback model: {name}")
                return name
        raise RuntimeError(f"No usable Gemini model. Available: {sorted(available)}")
    except Exception as e:
        print(f"⚠️  list_models failed ({e}); defaulting to gemini-2.5-flash")
        return "gemini-2.5-flash"


def _get_model():
    global _MODEL
    if _MODEL is None:
        model_name = _pick_available_model()
        _MODEL = genai.GenerativeModel(model_name)
    return _MODEL

# ============================================================
# LOAD JOB ROLES KNOWLEDGE BASE
# ============================================================

_ROLES_PATH = Path(__file__).parent.parent.parent / "data" / "job_roles.json"


def _load_job_roles() -> dict:
    with open(_ROLES_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


# ============================================================
# RETRIEVE — pick the role doc for the top category
# ============================================================

def _retrieve_role_context(category: str) -> dict:
    roles = _load_job_roles()
    return roles.get(category, {})


# ============================================================
# BUILD PROMPT
# ============================================================

PROMPT_TEMPLATE = """You are an employability advisor for IT students in Sri Lanka.

STUDENT PROFILE:
- Name: {name}
- Skills: {skills}
- Certifications: {certifications}
- Experience: {experience_summary}
- Education: {education_summary}
- Projects: {projects_summary}

TARGET JOB CATEGORY: {category}
TARGET ROLE EXAMPLES: {titles}

INDUSTRY REQUIREMENTS FOR THIS CATEGORY:
- Required skills: {required_skills}
- Nice-to-have skills: {nice_to_have}
- Typical entry-level projects: {typical_projects}
- Entry-level requirements: {entry_reqs}

TASK: Analyze this student's readiness for the target role. Return STRICT JSON ONLY
(no markdown, no explanation, no code fences) with EXACTLY this schema:

{{
  "readiness_for_role": <integer 0-100>,
  "strengths": [<3-5 short strings>],
  "skill_gaps": [<4-6 short strings, missing critical skills>],
  "recommended_certifications": [
    {{"name": "<cert>", "provider": "<issuer>", "reason": "<1 sentence>"}}
  ],
  "recommended_projects": [
    {{"title": "<project>", "tech": ["<t1>", "<t2>"], "reason": "<1 sentence>"}}
  ],
  "learning_path": [
    {{"step": 1, "action": "<concrete action>", "duration": "<weeks>"}}
  ],
  "estimated_time_to_ready_months": <integer 1-12>
}}

Rules:
- recommended_certifications: 2-3 items
- recommended_projects: 2-3 items
- learning_path: 3-5 steps
- Be SPECIFIC to this student's actual profile. Do not give generic advice.
"""


def _format_experience(experience: list[dict]) -> str:
    if not experience:
        return "None"
    parts = []
    for e in experience[:4]:  # top 4
        role = e.get("role", "")
        months = e.get("duration_months", 0)
        is_it = "IT" if e.get("is_it") else "non-IT"
        parts.append(f"{role} ({months}mo, {is_it})")
    return "; ".join(parts)


def _format_education(education: list[dict]) -> str:
    if not education:
        return "None"
    parts = []
    for e in education[:2]:
        parts.append(e.get("degree") or e.get("field") or e.get("institution") or "")
    return "; ".join([p for p in parts if p])


def _format_projects(projects: list[dict]) -> str:
    if not projects:
        return "None"
    return "; ".join(p.get("title", "") for p in projects[:3])


# ============================================================
# MAIN — GENERATE RECOMMENDATIONS
# ============================================================

def generate_recommendations(profile: dict, top_category: str) -> dict:
    """
    Takes the extracted profile and the top job category,
    returns structured recommendation JSON from Gemini.
    """
    role = _retrieve_role_context(top_category)
    if not role:
        return {"error": f"No job role data for category: {top_category}"}

    prompt = PROMPT_TEMPLATE.format(
        name=profile.get("name", "Student"),
        skills=", ".join(profile.get("skills", [])) or "None",
        certifications=", ".join(profile.get("certifications", [])) or "None",
        experience_summary=_format_experience(profile.get("experience", [])),
        education_summary=_format_education(profile.get("education", [])),
        projects_summary=_format_projects(profile.get("projects", [])),
        category=top_category,
        titles=", ".join(role.get("titles", [])),
        required_skills=", ".join(role.get("required_skills", [])),
        nice_to_have=", ".join(role.get("nice_to_have", [])),
        typical_projects=", ".join(role.get("typical_projects", [])),
        entry_reqs=role.get("entry_level_requirements", ""),
    )

    model = _get_model()

    # Retry up to 2 times on rate-limit / transient errors
    last_error = None
    for attempt in range(3):
        try:
            response = model.generate_content(prompt)
            raw = response.text.strip()
            raw = re.sub(r"^```(?:json)?\s*", "", raw)
            raw = re.sub(r"\s*```$", "", raw)
            return json.loads(raw)

        except json.JSONDecodeError as e:
            return {
                "error": "Gemini returned non-JSON",
                "raw_response": raw[:500],
                "detail": str(e),
            }

        except Exception as e:
            err_str = str(e)
            last_error = err_str

            # Rate limit (429) — extract retry delay, or default 40s
            if "429" in err_str or "quota" in err_str.lower():
                m = re.search(r"retry in (\d+(?:\.\d+)?)s", err_str)
                wait = float(m.group(1)) + 2 if m else 40.0
                if attempt < 2:
                    print(f"⏳ Rate limit hit — waiting {wait:.0f}s "
                          f"(attempt {attempt + 1}/3)...")
                    time.sleep(wait)
                    continue
                # Exhausted retries → fallback
                print("⚠️  Gemini unavailable — using rule-based fallback.")
                return _rule_based_fallback(profile, top_category, role)

            # Other errors — don't retry
            return {"error": f"Gemini call failed: {err_str}"}

    print("⚠️  Gemini unavailable — using rule-based fallback.")
    return _rule_based_fallback(profile, top_category, role)


# ============================================================
# RULE-BASED FALLBACK (no LLM) — used when Gemini is unavailable
# ============================================================

def _rule_based_fallback(profile: dict, top_category: str, role: dict) -> dict:
    """
    Deterministic recommendations based on the profile vs role requirements.
    Used when Gemini API is unavailable (rate limit, network, etc.).
    """
    student_skills = set(s.lower() for s in profile.get("skills", []))
    required = [s.lower() for s in role.get("required_skills", [])]
    nice = [s.lower() for s in role.get("nice_to_have", [])]

    # Compute readiness for this role
    have_required = [s for s in required if s in student_skills]
    have_nice = [s for s in nice if s in student_skills]
    missing_required = [s for s in required if s not in student_skills]

    req_score = len(have_required) / max(len(required), 1)
    nice_score = len(have_nice) / max(len(nice), 1)
    readiness = int(100 * (0.75 * req_score + 0.25 * nice_score))
    readiness = min(readiness, 95)

    # Strengths — existing skills + certs + IT experience
    strengths = []
    if have_required:
        strengths.append("Has core skills: " + ", ".join(have_required[:5]))
    if have_nice:
        strengths.append("Bonus skills: " + ", ".join(have_nice[:3]))
    it_exp = [e for e in profile.get("experience", []) if e.get("is_it")]
    if it_exp:
        strengths.append(f"{len(it_exp)} IT-related role(s)")
    if profile.get("certifications"):
        strengths.append("Certifications: " +
                         ", ".join(profile["certifications"][:2]))
    if not strengths:
        strengths = ["Profile being built — focus on foundational skills."]

    # Skill gaps
    skill_gaps = []
    for s in missing_required[:5]:
        skill_gaps.append(f"Missing required: {s}")
    if not skill_gaps:
        skill_gaps = ["No critical gaps — focus on deepening existing skills."]

    # Recommended certifications — map from role
    cert_map = {
        "AI/ML Engineering": [
            {"name": "TensorFlow Developer Certificate",
             "provider": "Google",
             "reason": "Validates core ML engineering skills."},
            {"name": "AWS Certified Cloud Practitioner",
             "provider": "AWS",
             "reason": "Cloud deployment is essential for ML systems."},
        ],
        "Web Development": [
            {"name": "Meta Front-End Developer Certificate",
             "provider": "Coursera",
             "reason": "Covers modern HTML/CSS/JS/React stack."},
            {"name": "AWS Cloud Practitioner",
             "provider": "AWS",
             "reason": "Deployment knowledge strengthens full-stack profile."},
        ],
        "Software Engineering": [
            {"name": "AWS Certified Developer",
             "provider": "AWS",
             "reason": "Backend deployment is a core engineering skill."},
        ],
        "Data Science": [
            {"name": "Google Data Analytics",
             "provider": "Google",
             "reason": "Strong fundamentals in data workflows."},
        ],
    }
    recs = cert_map.get(top_category, [
        {"name": "AWS Cloud Practitioner", "provider": "AWS",
         "reason": "General cloud literacy is valuable across roles."},
    ])

    # Recommended projects — use role's typical projects
    typical = role.get("typical_projects", ["A portfolio project"])[:3]
    recommended_projects = [
        {"title": t, "tech": have_required[:3] or ["relevant stack"],
         "reason": "Directly matches entry-level expectations for this role."}
        for t in typical
    ]

    # Learning path — priority order for missing required skills
    learning_path = []
    for i, s in enumerate(missing_required[:4], 1):
        learning_path.append({
            "step": i,
            "action": f"Learn and practice {s}",
            "duration": "2-3 weeks",
        })
    if not learning_path:
        learning_path = [{
            "step": 1,
            "action": "Build 2 portfolio projects with current skills",
            "duration": "6 weeks",
        }]

    # Estimated time
    months = max(2, min(12, len(missing_required) * 2))

    return {
        "readiness_for_role": readiness,
        "strengths": strengths,
        "skill_gaps": skill_gaps,
        "recommended_certifications": recs,
        "recommended_projects": recommended_projects,
        "learning_path": learning_path,
        "estimated_time_to_ready_months": months,
        "_source": "rule-based fallback (Gemini unavailable)",
    }

# ============================================================
# CLI TEST
# ============================================================

if __name__ == "__main__":
    import sys
    from app.services.pdf_parser import extract_text, clean_text
    from app.services.extractor import extract_profile
    from app.services.category_classifier import top_job_matches

    if len(sys.argv) < 2:
        print("Usage: python -m app.services.rag_engine <path_to_pdf>")
        sys.exit(1)

    raw = clean_text(extract_text(sys.argv[1]))
    profile = extract_profile(raw)

    top_cat, score = top_job_matches(profile, 1)[0]
    print(f"\n🎯 Top category: {top_cat} ({score}%)")
    print(f"🔄 Calling Gemini for recommendations...\n")

    recs = generate_recommendations(profile, top_cat)
    print(json.dumps(recs, indent=2, ensure_ascii=False))