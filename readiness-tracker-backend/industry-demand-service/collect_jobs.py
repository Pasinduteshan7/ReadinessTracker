"""Collect job descriptions, aggregate skill demand, and sync to Spring Boot."""

from __future__ import annotations

import hashlib
import logging
from collections import Counter
from html.parser import HTMLParser
from typing import Any

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from skill_extractor import extract_skills, get_skill_category


REMOTIVE_URL = "https://remotive.com/api/remote-jobs"
THE_MUSE_URL = "https://www.themuse.com/api/public/jobs"
INDUSTRY_SKILLS_SYNC_URL = "http://localhost:8080/api/industry-skills/sync"
REMOTIVE_CATEGORIES = ("software-dev", "data", "devops", "mobile", "testing")
MUSE_CATEGORIES = ("Engineering", "Data Science", "IT")
REQUEST_TIMEOUT_SECONDS = 25

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


class _HTMLTextExtractor(HTMLParser):
    """Convert HTML markup to readable plain text."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._parts: list[str] = []

    def handle_data(self, data: str) -> None:
        self._parts.append(data)

    def get_text(self) -> str:
        return " ".join(" ".join(self._parts).split())


def strip_html(value: Any) -> str:
    """Strip HTML tags from an API description, preserving readable spacing."""
    if not isinstance(value, str) or not value:
        return ""
    parser = _HTMLTextExtractor()
    parser.feed(value)
    parser.close()
    return parser.get_text()


def _create_session() -> requests.Session:
    retry = Retry(
        total=3,
        connect=3,
        read=3,
        backoff_factor=0.5,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=frozenset(("GET", "POST")),
        respect_retry_after_header=True,
    )
    adapter = HTTPAdapter(max_retries=retry)
    session = requests.Session()
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    session.headers.update({"User-Agent": "EmployabilityReadinessTracker/1.0"})
    return session


def _job_key(source: str, job: dict[str, Any], description: str) -> str:
    identifier = job.get("id")
    url = job.get("url")
    refs = job.get("refs")
    if not url and isinstance(refs, dict):
        url = refs.get("landing_page")
    if identifier is not None:
        return f"{source}:id:{identifier}"
    if url:
        return f"{source}:url:{url}"

    title = str(job.get("title") or "").strip().casefold()
    digest = hashlib.sha256(description.encode("utf-8")).hexdigest()
    return f"{source}:content:{title}:{digest}"


def _fetch_json(
    session: requests.Session,
    url: str,
    params: dict[str, Any],
    context: str,
) -> dict[str, Any] | None:
    try:
        response = session.get(url, params=params, timeout=REQUEST_TIMEOUT_SECONDS)
        response.raise_for_status()
        payload = response.json()
        if not isinstance(payload, dict):
            logger.warning("Unexpected response format for %s; skipping it.", context)
            return None
        return payload
    except (requests.RequestException, ValueError) as exc:
        logger.warning("Could not fetch %s: %s", context, exc)
        return None


def fetch_jobs(session: requests.Session) -> list[str]:
    """Fetch and clean job descriptions from Remotive and The Muse."""
    descriptions: list[str] = []
    seen_jobs: set[str] = set()

    for category in REMOTIVE_CATEGORIES:
        payload = _fetch_json(
            session,
            REMOTIVE_URL,
            {"category": category, "limit": 40},
            f"Remotive ({category})",
        )
        if payload is None:
            continue

        jobs = payload.get("jobs", [])
        if not isinstance(jobs, list):
            logger.warning("Unexpected jobs list from Remotive (%s).", category)
            continue
        for job in jobs:
            if not isinstance(job, dict):
                continue
            description = strip_html(job.get("description"))
            if not description:
                continue
            key = _job_key("remotive", job, description)
            if key not in seen_jobs:
                seen_jobs.add(key)
                descriptions.append(description)

    for category in MUSE_CATEGORIES:
        for page in range(1, 6):
            payload = _fetch_json(
                session,
                THE_MUSE_URL,
                {"category": category, "page": page},
                f"The Muse ({category}, page {page})",
            )
            if payload is None:
                continue

            jobs = payload.get("results", [])
            if not isinstance(jobs, list):
                logger.warning("Unexpected results list from The Muse (%s, page %s).", category, page)
                continue
            for job in jobs:
                if not isinstance(job, dict):
                    continue
                description = strip_html(job.get("contents"))
                if not description:
                    continue
                key = _job_key("the-muse", job, description)
                if key not in seen_jobs:
                    seen_jobs.add(key)
                    descriptions.append(description)

    return descriptions


def calculate_skill_demand(descriptions: list[str]) -> list[dict[str, Any]]:
    """Calculate per-skill job frequency and normalized demand weights."""
    total_jobs = len(descriptions)
    if total_jobs == 0:
        return []

    frequencies: Counter[str] = Counter()
    for description in descriptions:
        # extract_skills returns distinct skills, so each skill contributes at most
        # once per job even if it appears repeatedly in the description.
        frequencies.update(extract_skills(description))

    skill_records = [
        {
            "skillName": skill,
            "category": get_skill_category(skill),
            "frequencyCount": frequency,
            "weight": round(frequency / total_jobs, 4),
        }
        for skill, frequency in frequencies.items()
    ]
    return sorted(skill_records, key=lambda record: (-record["weight"], record["skillName"].casefold()))


def sync_skills(session: requests.Session, skills: list[dict[str, Any]]) -> tuple[bool, int]:
    """POST skill demand records; return success and the reported synced count."""
    if not skills:
        logger.warning("No skills were found; skipping sync request.")
        return False, 0

    try:
        response = session.post(
            INDUSTRY_SKILLS_SYNC_URL,
            json=skills,
            headers={"Content-Type": "application/json"},
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        logger.error("Industry skills sync failed: %s", exc)
        return False, 0

    try:
        saved_records = response.json()
        synced_count = len(saved_records) if isinstance(saved_records, list) else len(skills)
    except ValueError:
        synced_count = len(skills)
    return True, synced_count


def main() -> None:
    session = _create_session()
    try:
        descriptions = fetch_jobs(session)
        skills = calculate_skill_demand(descriptions)

        print("\nIndustry Demand Collection Summary")
        print("----------------------------------")
        print(f"Total jobs fetched: {len(descriptions)}")
        print(f"Total unique skills found: {len(skills)}")
        print("Top 10 skills by weight:")
        if skills:
            for record in skills[:10]:
                percentage = record["weight"] * 100
                print(
                    f"  {record['skillName']}: {percentage:.2f}% "
                    f"({record['frequencyCount']} jobs, {record['category']})"
                )
        else:
            print("  No skills found.")

        succeeded, synced_count = sync_skills(session, skills)
        if succeeded:
            print(f"Spring Boot sync: SUCCEEDED ({synced_count} skills synced)")
        else:
            print("Spring Boot sync: FAILED")
    finally:
        session.close()


if __name__ == "__main__":
    main()
