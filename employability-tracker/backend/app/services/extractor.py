"""
Extractor v3 — clean, consolidated parsing for LinkedIn-style resumes.
"""
import re
from app.data.skill_taxonomy import SKILL_TAXONOMY
from app.data.cert_db import CERT_DB, get_cert_meta


# ============================================================
# SECTION SPLITTING
# ============================================================

SECTION_HEADERS = {
    "summary":        ["summary", "profile", "objective", "about"],
    "skills":         ["skills", "technical skills", "top skills",
                       "competencies", "technologies", "tech stack"],
    "certifications": ["certifications", "certificates", "licenses",
                       "certification", "certificate"],
    "education":      ["education", "academic", "qualifications"],
    "experience":     ["experience", "work experience", "employment",
                       "professional experience", "work history"],
    "projects":       ["projects", "personal projects", "academic projects",
                       "selected projects", "key projects"],
    "awards":         ["awards", "honors", "achievements"],
    "languages":      ["languages", "language proficiency"],
}


def split_sections(text: str) -> dict:
    lines = text.split("\n")
    sections = {"header": []}
    current = "header"
    for line in lines:
        stripped = line.strip()
        if not stripped:
            sections.setdefault(current, []).append("")
            continue
        low = stripped.lower().rstrip(":").strip()
        matched = None
        if len(stripped) < 45:
            for section, keywords in SECTION_HEADERS.items():
                if any(kw == low or low.startswith(kw) for kw in keywords):
                    matched = section
                    break
        if matched:
            current = matched
            sections.setdefault(current, [])
        else:
            sections.setdefault(current, []).append(stripped)
    return {k: "\n".join(v).strip() for k, v in sections.items()}


# ============================================================
# SKILLS
# ============================================================

def extract_skills(text: str) -> list[str]:
    text_low = text.lower()
    found = set()
    for skill in SKILL_TAXONOMY:
        pattern = r"(?<![a-zA-Z0-9])" + re.escape(skill) + r"(?![a-zA-Z0-9])"
        if re.search(pattern, text_low):
            found.add(skill)
    return sorted(found)


def extract_soft_skills(text: str) -> list[str]:
    return [s for s in extract_skills(text)
            if SKILL_TAXONOMY[s]["category"] == "Soft"]


# ============================================================
# CERTIFICATIONS
# ============================================================

def _normalize(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[-–—/]", " ", s)
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def extract_certifications(text: str) -> list[str]:
    # Roman numeral normalization
    text = re.sub(r"\bStage\s+IV\b", "Stage 4", text, flags=re.IGNORECASE)
    text = re.sub(r"\bStage\s+III\b", "Stage 3", text, flags=re.IGNORECASE)
    text = re.sub(r"\bStage\s+II\b",  "Stage 2", text, flags=re.IGNORECASE)
    text = re.sub(r"\bStage\s+I\b",   "Stage 1", text, flags=re.IGNORECASE)

    # Collapse single line breaks (fixes "Event Management\nCertification")
    text_flat = re.sub(r"\n(?!\n)", " ", text)

    flat_norm = _normalize(re.sub(r"\s+", " ", text_flat).strip())
    found = set()

    # 1. Known certs from DB
    for cert_name in CERT_DB:
        if _normalize(cert_name) in flat_norm:
            found.add(cert_name)

    # 2. Explicit cert patterns
    explicit_patterns = [
        r"(AI/ML\s+Engineer\s*(?:-|–)?\s*Stage\s*\d+)",
        r"(Hugging\s+Face\s+[A-Za-z0-9 ]{2,50}(?:Course|Certification|Certificate))",
        r"(Agile\s+Project\s+Management)",
        r"([A-Z][A-Za-z0-9\.\- ]{2,60}\s+(?:Certificate|Certification))",
        r"((?:Certified)\s+[A-Z][A-Za-z0-9\.\- ]{2,50})",
        r"([A-Z][A-Za-z0-9\.\- ]{2,60}\s+(?:Specialization|Nanodegree))",
    ]
    # Words that should never appear inside a valid cert name
    JUNK_WORDS = ["top skills", "technical skills", "skills ",
                  "certifications", "certificates"]

    for pat in explicit_patterns:
        for m in re.findall(pat, text_flat):
            cleaned = m.strip()
            low = cleaned.lower()

            # Reject obvious header-only strings
            if low in ("certifications", "certificates",
                       "certification", "certificate"):
                continue

            # Reject too short OR too long
            words = cleaned.split()
            if len(words) < 2 or len(words) > 5:
                continue
            if len(cleaned) > 55:
                continue

            # Reject if contains a section-header word (the "top skills …" bug)
            if any(jw in low for jw in JUNK_WORDS):
                continue

            # Reject line-broken junk
            if "\n" in cleaned or "\t" in cleaned:
                continue

            # Reject substrings of longer certs
            if any(low != other.lower() and low in other.lower()
                   for other in found):
                continue

            found.add(low)

    # 3. Drop substrings: if "hugging face agents course" exists, drop "hugging face"
    to_remove = set()
    for a in found:
        for b in found:
            if a != b and a in b and len(a) < len(b):
                to_remove.add(a)
    found -= to_remove

    return sorted(found)


# ============================================================
# CONTACT
# ============================================================

def _dewrap_contact_lines(text: str) -> list[str]:
    """Re-join lines broken mid-URL/email, but stop at NEW contact items."""
    lines = text.split("\n")
    out = []
    section_headers = {
        "contact", "top skills", "skills", "experience", "education",
        "certifications", "certificates", "projects", "summary",
        "profile", "awards", "languages", "interests", "honors",
        "achievements", "competencies", "technologies",
    }
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        starts_contact = re.search(
            r"(@|www\.|https?://|linkedin|github|phone|mobile)",
            line, re.IGNORECASE
        )
        if starts_contact:
            while i + 1 < len(lines):
                nxt = lines[i + 1].strip()
                if not nxt:
                    break
                low_nxt = nxt.lower().rstrip(":")
                if low_nxt in section_headers:
                    break
                if re.match(r"^(https?://|www\.|linkedin\.com|github\.com)",
                            nxt, re.IGNORECASE):
                    break
                if "@" in nxt and len(nxt) > 10:
                    break
                first = nxt[0]
                if first in "•·()[]{}":
                    break
                if first == "-" and len(nxt) > 2:
                    break
                line += nxt
                i += 1
        out.append(line)
        i += 1
    return out


def extract_contact(text: str) -> dict:
    joined = " ".join(_dewrap_contact_lines(text))

    email = re.findall(
        r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", joined
    )
    email = [e for e in email if len(e) < 80]

    phone_candidates = re.findall(r"\+?\d[\d\s\-\(\)]{8,18}\d", joined)
    phone = None
    for p in phone_candidates:
        digits = re.sub(r"\D", "", p)
        if len(digits) < 10:
            continue
        if len(digits) == 8 and re.match(r"^(19|20)\d{2}(19|20)\d{2}$",
                                        digits):
            continue
        phone = p.strip()
        break

    linkedin = re.findall(
        r"linkedin\.com/in/[\w\-]+", joined, re.IGNORECASE
    )
    github_urls = re.findall(
        r"(?:github\.com/[\w\-]+|[\w\-]+\.github\.io)", joined, re.IGNORECASE
    )

    return {
        "email": email[0] if email else None,
        "phone": phone,
        "linkedin": linkedin[0] if linkedin else None,
        "github": github_urls[0] if github_urls else None,
    }


# ============================================================
# NAME
# ============================================================

def extract_name(text: str) -> str:
    lines = [l.strip() for l in text.split("\n")]

    skip_words = {
        "contact", "email", "phone", "mobile", "linkedin", "github",
        "summary", "profile", "experience", "education", "skills",
        "certifications", "certificates", "projects", "top skills",
        "page", "awards", "languages", "interests", "honors",
        "achievements", "competencies", "technologies", "university",
        "department", "district", "province", "branch",
    }
    skill_phrases = {sk.lower() for sk in SKILL_TAXONOMY}
    section_names = {
        "experience", "education", "skills", "certifications",
        "certificates", "projects", "summary", "profile",
    }

    candidates = []
    for i, line in enumerate(lines):
        if not line or len(line) > 50 or len(line) < 4:
            continue
        if re.search(r"[0-9@/:•·\(\)\[\]{}&,|]", line):
            continue
        low = line.lower()
        if any(sw in low for sw in skip_words):
            continue
        if low in skill_phrases:
            continue
        if any(" " in sk and sk in low for sk in skill_phrases):
            continue

        words = line.split()
        if not (2 <= len(words) <= 3):
            continue
        if not all(w and w[0].isupper() and
                   w.replace("-", "").replace(".", "").replace("'", "").isalpha()
                   for w in words):
            continue

        score = 0
        if len(words) == 2:
            score += 3
        elif len(words) == 3:
            score += 1

        nxt = ""
        for j in range(i + 1, min(i + 3, len(lines))):
            if lines[j].strip():
                nxt = lines[j].strip()
                break
        if nxt:
            nxt_low = nxt.lower()
            if any(kw in nxt_low for kw in
                   ["b.sc", "bsc", "b.eng", "beng", "engineer", "developer",
                    "student", "undergraduate", "ug", "master", "bachelor"]):
                score += 5
            if "|" in nxt or "@" in nxt:
                score += 2
            if nxt_low.rstrip(":") in section_names:
                score -= 5

        if i < len(lines) * 0.6:
            score += 1

        candidates.append((score, line))

    if not candidates:
        return "Unknown"
    candidates.sort(key=lambda x: -x[0])
    return candidates[0][1]


# ============================================================
# EDUCATION
# ============================================================

DEGREE_KEYWORDS = [
    "bsc", "b.sc", "b.eng", "beng", "bachelor", "master", "msc", "m.sc",
    "phd", "doctorate", "diploma", "hnd", "higher national diploma",
    "undergraduate", "ug", "hndit", "bict",
]

FIELD_KEYWORDS = [
    "computer engineering", "software engineering", "computer science",
    "information technology", "information systems", "electrical engineering",
    "electronic engineering", "data science", "artificial intelligence",
    "cybersecurity", "network engineering",
]

INSTITUTION_KEYWORDS = [
    "university", "college", "institute", "campus", "academy",
    "ruhuna", "peradeniya", "moratuwa", "jaffna", "kelaniya",
    "sri jayewardenepura", "sliit", "nsbm", "iit", "nibm", "ucsc", "ousl",
]


def extract_education(section_text: str) -> list[dict]:
    if not section_text.strip():
        return []
    lines = [l.strip() for l in section_text.split("\n") if l.strip()]
    lines = [l for l in lines if not re.match(r"^page\s+\d+", l, re.IGNORECASE)]

    entries = []
    current = {}

    def flush():
        nonlocal current
        if current and any(current.get(k) for k in
                           ("degree", "institution", "field")):
            entries.append(current)
        current = {}

    for line in lines:
        low = line.lower()
        degree_hit = any(kw in low for kw in DEGREE_KEYWORDS)
        field_hit = any(kw in low for kw in FIELD_KEYWORDS)
        inst_hit = any(kw in low for kw in INSTITUTION_KEYWORDS)

        if not (degree_hit or field_hit or inst_hit):
            continue

        # (a) new institution while we already have one
        if inst_hit and current.get("institution"):
            STOP = {"university", "college", "institute", "campus", "academy"}
            curr_words = {w for w in current["institution"].lower().split()
                          if len(w) > 4 and w not in STOP}
            new_words = {w for w in line.lower().split()
                         if len(w) > 4 and w not in STOP}
            if curr_words and new_words and not (curr_words & new_words):
                flush()
            elif not curr_words or not new_words:
                flush()

        # (b) new degree line while we already have a degree
        if degree_hit and current.get("degree"):
            flush()

        if inst_hit and not current.get("institution"):
            current["institution"] = line
        if degree_hit and not current.get("degree"):
            current["degree"] = line
        if field_hit and not current.get("field"):
            current["field"] = line

    flush()
    for e in entries:
        for k in list(e.keys()):
            if not e[k]:
                del e[k]
    return entries


# ============================================================
# EXPERIENCE
# ============================================================

MONTH_MAP = {
    "jan": 1, "january": 1, "feb": 2, "february": 2, "mar": 3, "march": 3,
    "apr": 4, "april": 4, "may": 5, "jun": 6, "june": 6, "jul": 7, "july": 7,
    "aug": 8, "august": 8, "sep": 9, "september": 9, "oct": 10, "october": 10,
    "nov": 11, "november": 11, "dec": 12, "december": 12,
}

IT_ROLE_KEYWORDS = [
    "software", "developer", "programmer",
    "ml engineer", "ml engineering", "ai engineer", "ai engineering",
    "ai/ml", "artificial intelligence",
    "machine learning", "deep learning", "data scientist", "data analyst",
    "data engineer", "network engineer", "cybersecurity", "cyber security",
    "devops", "cloud engineer", "full stack", "fullstack",
    "frontend", "backend", "qa engineer", "tester",
    "web developer", "python developer", "java developer",
    "information technology", "computer science",
]

PREFIX_MATCH_KEYWORDS = {
    "software", "developer", "programmer",
    "ml engineer", "ml engineering", "ai engineer", "ai engineering",
    "ai/ml", "artificial intelligence",
}


def _is_it_role(text: str) -> bool:
    low = text.lower()
    for kw in IT_ROLE_KEYWORDS:
        if kw in PREFIX_MATCH_KEYWORDS:
            if kw in low:
                return True
        else:
            if re.search(r"\b" + re.escape(kw) + r"\b", low):
                return True
    return False


def _parse_duration_months(text: str) -> int:
    # 1. Explicit "(N months)"
    m = re.search(r"\((\d+)\s*(?:months?|mos?)\)", text, re.IGNORECASE)
    if m:
        return int(m.group(1))
    # 2. "(N years)" or "(N years M months)"
    m = re.search(r"\((\d+)\s*years?(?:\s+(\d+)\s*months?)?\)",
                  text, re.IGNORECASE)
    if m:
        yrs = int(m.group(1))
        mos = int(m.group(2)) if m.group(2) else 0
        return yrs * 12 + mos
    # 3. Bare "N months"
    m = re.search(r"(?<!years?\s)(\d+)\s*months?\b", text, re.IGNORECASE)
    if m:
        return int(m.group(1))
    # 4. "N years"
    m = re.search(r"(\d+)\s*years?\b", text, re.IGNORECASE)
    if m:
        return int(m.group(1)) * 12
    # 5. Date range
    range_pat = (r"([a-zA-Z]{3,9})\s+(\d{4})\s*[-–to]+\s*"
                 r"([a-zA-Z]{3,9}|present|current)?\s*(\d{4})?")
    m = re.search(range_pat, text, re.IGNORECASE)
    if m:
        m1_name, y1, m2_name, y2 = m.groups()
        m1 = MONTH_MAP.get(m1_name.lower()[:3], MONTH_MAP.get(m1_name.lower()))
        y1_i = int(y1)
        if m2_name and y2:
            m2 = MONTH_MAP.get(m2_name.lower()[:3],
                               MONTH_MAP.get(m2_name.lower()))
            if m1 and m2:
                return max(1, (int(y2) - y1_i) * 12 + (m2 - m1))
        if m2_name and m2_name.lower() in ("present", "current"):
            return 6
        if not m2_name and y2:
            return max(1, (int(y2) - y1_i) * 12)
    return 0


DATE_LINE_PAT = re.compile(
    r"\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}"
    r"|\b\d{4}\s*[-–]\s*(?:\d{4}|present|current)\b",
    re.IGNORECASE,
)


def extract_experience(section_text: str) -> list[dict]:
    if not section_text.strip():
        return []
    lines = [l.strip() for l in section_text.split("\n") if l.strip()]
    lines = [l for l in lines if not re.match(r"^page\s+\d+", l, re.IGNORECASE)]

    date_indices = [i for i, l in enumerate(lines) if DATE_LINE_PAT.search(l)]
    if not date_indices:
        return [_make_entry(lines)]

    entries = []
    for idx, date_i in enumerate(date_indices):
        start = max(0, date_i - 2)
        if idx + 1 < len(date_indices):
            end = max(date_i + 1, date_indices[idx + 1] - 2)
        else:
            end = len(lines)
        block = lines[start:end]
        if block:
            entries.append(_make_entry(block))
    return entries


def _make_entry(lines: list[str]) -> dict:
    if not lines:
        return {"role": "", "duration_months": 0,
                "description": "", "is_it": False}
    full = "\n".join(lines)
    role = lines[1].strip()[:120] if len(lines) >= 2 else lines[0].strip()[:120]
    return {
        "role": role,
        "duration_months": _parse_duration_months(full),
        "description": full,
        "is_it": _is_it_role(full),
    }


# ============================================================
# PROJECTS
# ============================================================

def extract_projects(section_text: str) -> list[dict]:
    if not section_text.strip():
        return []
    blocks = re.split(r"\n\s*\n", section_text.strip())
    projects = []
    for block in blocks:
        block = block.strip()
        if len(block) < 15:
            continue
        lines = [l for l in block.split("\n") if l.strip()]
        title = lines[0][:120] if lines else "Untitled"
        projects.append({
            "title": title,
            "description": block,
            "tech": extract_skills(block),
        })
    return projects


# ============================================================
# MAIN
# ============================================================

def extract_profile(raw_text: str) -> dict:
    sections = split_sections(raw_text)
    profile = {
        "name": extract_name(raw_text),
        "contact": extract_contact(raw_text),
        "skills": extract_skills(raw_text),
        "soft_skills": extract_soft_skills(raw_text),
        "certifications": extract_certifications(raw_text),
        "education": extract_education(sections.get("education", "")),
        "experience": extract_experience(sections.get("experience", "")),
        "projects": extract_projects(sections.get("projects", "")),
        "languages": [],
        "raw_sections": list(sections.keys()),
    }
    lang_text = sections.get("languages", "")
    if lang_text:
        profile["languages"] = [
            l.strip().lower() for l in lang_text.split("\n")
            if l.strip() and len(l.strip()) < 30
        ]
    return profile


if __name__ == "__main__":
    import sys, json
    from app.services.pdf_parser import extract_text, clean_text
    if len(sys.argv) < 2:
        print("Usage: python -m app.services.extractor <path_to_pdf>")
        sys.exit(1)
    raw = clean_text(extract_text(sys.argv[1]))
    print(json.dumps(extract_profile(raw), indent=2, ensure_ascii=False))