"""Extract categorized technology skills from job text using spaCy PhraseMatcher."""

from __future__ import annotations

from typing import Final

import spacy
from spacy.matcher import PhraseMatcher


SKILL_CATEGORIES: Final[dict[str, tuple[str, ...]]] = {
    "Languages": (
        "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "Go", "Rust",
        "Kotlin", "Swift", "PHP", "Scala", "R",
    ),
    "Frontend": (
        "React", "Angular", "Vue", "Next.js", "Svelte", "jQuery", "Bootstrap",
        "Tailwind", "Webpack", "Vite",
    ),
    "Backend": (
        "Spring Boot", "Django", "FastAPI", "Flask", "Node.js", "Express", "NestJS",
        "Laravel", "ASP.NET",
    ),
    "Databases": (
        "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Firebase", "DynamoDB",
        "Oracle", "Cassandra",
    ),
    "Cloud": (
        "AWS", "Azure", "GCP", "Google Cloud", "Docker", "Kubernetes", "Terraform",
        "Ansible", "Jenkins",
    ),
    "Data & ML": (
        "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn", "Keras", "Spark",
        "Hadoop", "Matplotlib",
    ),
    "DevOps": (
        "GitHub Actions", "CircleCI", "GitLab CI", "ArgoCD", "Prometheus", "Grafana", "Git",
    ),
    "Mobile": ("React Native", "Flutter", "Android", "iOS", "Xamarin"),
    "Security": ("OAuth", "JWT", "SSL", "SAML"),
}

_SKILL_TO_CATEGORY: Final[dict[str, str]] = {
    skill.casefold(): category
    for category, skills in SKILL_CATEGORIES.items()
    for skill in skills
}

try:
    _nlp = spacy.load("en_core_web_sm", disable=["parser", "ner", "lemmatizer"])
except OSError as exc:
    raise RuntimeError(
        'spaCy model "en_core_web_sm" is missing. Install it with '
        '"python -m spacy download en_core_web_sm".'
    ) from exc

_matcher = PhraseMatcher(_nlp.vocab, attr="LOWER")
for _category_skills in SKILL_CATEGORIES.values():
    for _skill in _category_skills:
        _matcher.add(_skill, [_nlp.make_doc(_skill)])


def extract_skills(text: str) -> list[str]:
    """Return distinct skill names found in text, in their first-occurrence order.

    Matching is case-insensitive. When a longer skill phrase overlaps a shorter one
    (for example, "React Native" and "React"), the longer phrase takes precedence.
    """
    if not isinstance(text, str) or not text.strip():
        return []

    doc = _nlp.make_doc(text)
    matches = _matcher(doc)
    spans = sorted(
        ((start, end, _nlp.vocab.strings[match_id]) for match_id, start, end in matches),
        key=lambda match: (match[0], -(match[1] - match[0]), match[2].casefold()),
    )

    results: list[str] = []
    seen: set[str] = set()
    last_end = -1
    for start, end, skill in spans:
        normalized = skill.casefold()
        if start < last_end or normalized in seen:
            continue
        results.append(skill)
        seen.add(normalized)
        last_end = end
    return results


def get_skill_category(skill: str) -> str:
    """Return the configured category for a skill, or ``General`` if unknown."""
    if not isinstance(skill, str):
        return "General"
    return _SKILL_TO_CATEGORY.get(skill.strip().casefold(), "General")
