"""
job_scraper.py  –  Scrape job postings and extract skills + job details
CSV columns: Job_ID, Company, Job_Title, Location, Job_Type,
             Experience_Level, Salary_Range, Detected_Skills,
             Skills_Count, Skill_Categories, Scraped_Date

Usage:
    python job_scraper.py          # interactive mode
    python job_scraper.py --auto   # run built-in URL list automatically
"""

import re
import sys
import time
import csv
import json
import html
import argparse
from datetime import datetime
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

from skill_extractor import extract_skills, get_skill_categories

# ---------------------------------------------------------------------------
# 📋  BUILT-IN JOB URLS  — edit this list to add your own
# ---------------------------------------------------------------------------
DEFAULT_JOB_URLS = [
    {"url": "https://itjobs.lk/"},
    {"url": "https://itpro.lk/"},
    {"url": "https://topjobs.lk/applicant/vacancybyfunctionalarea.jsp;jsessionid=TcxsIVr7IWfvzeC6EG7TNkuO?FA=SDQ"},
    {"url": "https://www.indeed.com/?json=1&from=rnonboarding"},
    {"url": "https://weworkremotely.com/remote-jobs/search?term=frontend",          "company": "We Work Remotely"},
    {"url": "https://weworkremotely.com/remote-jobs/search?term=fullstack",         "company": "We Work Remotely"},
    {"url": "https://weworkremotely.com/remote-jobs/search?term=devops",            "company": "We Work Remotely"},
    {"url": "https://remotive.com/remote-jobs/software-dev",                        "company": "Remotive"},
    {"url": "https://remotive.com/remote-jobs/data",                                "company": "Remotive"},
    {"url": "https://remotive.com/remote-jobs/software-dev/backend",                "company": "Remotive"},
    {"url": "https://remotive.com/remote-jobs/software-dev/frontend",               "company": "Remotive"},
    {"url": "https://remotive.com/remote-jobs/software-dev/full-stack",             "company": "Remotive"},
    {"url": "https://arc.dev/remote-jobs",                                           "company": "Arc.dev"},
    {"url": "https://lk.indeed.com/jobs?q=software+engineer&l=Sri+Lanka",           "company": "Indeed LK"},
    {"url": "https://lk.indeed.com/jobs?q=java+developer&l=Sri+Lanka",              "company": "Indeed LK"},
    {"url": "https://lk.indeed.com/jobs?q=python+developer&l=Sri+Lanka",            "company": "Indeed LK"},
    {"url": "https://lk.indeed.com/jobs?q=react+developer&l=Sri+Lanka",             "company": "Indeed LK"},
    {"url": "https://www.topjobs.lk/applicant/vacancybyfunctionalarea.jsp?FA=ITE",  "company": "TopJobs LK"},
]

# ---------------------------------------------------------------------------
# Public API sources for more reliable, near-real-time demand data
# ---------------------------------------------------------------------------
PUBLIC_API_SOURCES = [
    {"name": "Remotive", "url": "https://remotive.com/api/remote-jobs?category=software-dev"},
    {"name": "RemoteOK", "url": "https://remoteok.com/api"},
    {"name": "Arbeitnow", "url": "https://www.arbeitnow.com/api/job-board-api"},
]

# ---------------------------------------------------------------------------
# CSS selectors for title / description
# ---------------------------------------------------------------------------
TITLE_SELECTORS = [
    "h1", "[class*='job-title']", "[class*='jobTitle']",
    "[data-testid*='title']", "[class*='position']",
]

DESCRIPTION_SELECTORS = [
    "[class*='description']", "[class*='job-description']",
    "[class*='jobDescription']", "[class*='job-details']",
    "article", "main", ".content", "#job-description",
]

# ---------------------------------------------------------------------------
# 🔍  FEATURE EXTRACTORS
# Each function receives the full job description text and returns a string.
# ---------------------------------------------------------------------------

# ── 1. Salary / Pay Range ──────────────────────────────────────────────────
SALARY_PATTERNS = [
    # $120,000 - $150,000  /  $120k–$150k  /  USD 80k
    r'\$[\d,]+(?:k|K)?\s*[-–to]+\s*\$[\d,]+(?:k|K)?',
    r'USD\s*[\d,]+(?:k|K)?\s*[-–to]*\s*(?:USD\s*)?[\d,]*(?:k|K)?',
    r'£[\d,]+(?:k|K)?\s*[-–to]+\s*£[\d,]+(?:k|K)?',
    r'€[\d,]+(?:k|K)?\s*[-–to]+\s*€[\d,]+(?:k|K)?',
    # "salary: 100,000" / "up to $120k" / "competitive salary"
    r'(?:salary|compensation|pay)[:\s]+[\$£€]?[\d,]+(?:k|K)?(?:\s*[-–]\s*[\$£€]?[\d,]+(?:k|K)?)?',
    r'up to\s+[\$£€][\d,]+(?:k|K)?',
    r'[\d,]+(?:k|K)?\s*(?:USD|GBP|EUR|LKR)\s*(?:per\s+(?:year|month|annum))?',
    r'competitive\s+salary',
    r'LKR\s*[\d,]+(?:\s*[-–]\s*LKR\s*[\d,]+)?',
]

def extract_salary(text: str) -> str:
    for pattern in SALARY_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(0).strip()
    return "Not specified"


# ── 2. Job Type (Remote / Hybrid / Onsite) ────────────────────────────────
def extract_job_type(text: str) -> str:
    text_lower = text.lower()

    # Order matters: check hybrid before remote (some posts say "hybrid remote")
    if re.search(r'\bhybrid\b', text_lower):
        return "Hybrid"
    if re.search(r'\b(fully\s+remote|100%\s+remote|remote\s+first|remote-first|work\s+from\s+home|wfh)\b', text_lower):
        return "Remote"
    if re.search(r'\bremote\b', text_lower):
        return "Remote"
    if re.search(r'\b(on[- ]?site|in[- ]?office|on[- ]?premise|in[- ]?person)\b', text_lower):
        return "Onsite"
    return "Not specified"


# ── 3. Experience Level (Junior / Mid / Senior) ───────────────────────────
def extract_experience_level(text: str) -> str:
    text_lower = text.lower()

    # Explicit labels
    if re.search(r'\b(senior|sr\.?|lead|principal|staff)\b', text_lower):
        return "Senior"
    if re.search(r'\b(junior|jr\.?|entry[- ]level|entry level|graduate|fresh|intern)\b', text_lower):
        return "Junior"
    if re.search(r'\b(mid[- ]level|mid level|intermediate|associate)\b', text_lower):
        return "Mid"

    # Infer from years of experience mentioned
    years_match = re.search(r'(\d+)\+?\s*(?:to\s*\d+)?\s*years?\s*(?:of\s*)?experience', text_lower)
    if years_match:
        yrs = int(years_match.group(1))
        if yrs >= 5:
            return "Senior"
        elif yrs >= 2:
            return "Mid"
        else:
            return "Junior"

    return "Not specified"


# ── 4. Location / Country ─────────────────────────────────────────────────
# Common countries / regions mentioned in job posts
KNOWN_LOCATIONS = [
    "United States", "USA", "US", "United Kingdom", "UK", "Canada", "Australia",
    "Germany", "France", "Netherlands", "Singapore", "India", "Sri Lanka",
    "New Zealand", "Ireland", "Sweden", "Norway", "Denmark", "Finland",
    "Remote", "Worldwide", "Global", "Anywhere",
]

LOCATION_SELECTORS = [
    "[class*='location']", "[class*='job-location']",
    "[data-testid*='location']", "[class*='city']", "[class*='country']",
]

def extract_location(text: str, page=None) -> str:
    # Try to get from dedicated location element first
    if page:
        for sel in LOCATION_SELECTORS:
            try:
                el = page.locator(sel).first
                if el.count() > 0:
                    loc = el.inner_text(timeout=2000).strip()
                    if loc and len(loc) < 100:
                        return loc
            except Exception:
                pass

    # Fall back to regex scan of text
    for loc in KNOWN_LOCATIONS:
        if re.search(rf'\b{re.escape(loc)}\b', text, re.IGNORECASE):
            return loc

    # Try to find "Location: XYZ" pattern
    match = re.search(r'location[:\s]+([A-Za-z ,]+)', text, re.IGNORECASE)
    if match:
        return match.group(1).strip()[:60]

    return "Not specified"


def strip_html(text: str) -> str:
    """Convert API HTML snippets into plain text."""
    if not text:
        return ""
    text = html.unescape(text)
    text = re.sub(r"<script.*?</script>", " ", text, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r"<style.*?</style>", " ", text, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def fetch_json(url: str, timeout: int = 20):
    """Fetch JSON from a public API with a browser-like user agent."""
    request = Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            "Accept": "application/json,text/plain,*/*",
        },
    )
    with urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


# ---------------------------------------------------------------------------
# CSV field names
# ---------------------------------------------------------------------------
def fieldnames():
    return [
        "Job_ID", "Company", "Job_Title",
        "Location", "Job_Type", "Experience_Level", "Salary_Range",
        "Detected_Skills", "Skills_Count", "Skill_Categories",
        "Scraped_Date",
    ]


# ---------------------------------------------------------------------------
# JobScraper class
# ---------------------------------------------------------------------------
class JobScraper:
    def __init__(self, output_file: str = "jobs_data.csv"):
        self.output_file = Path(output_file)
        self.jobs: list[dict] = []
        self._init_csv()

    def _init_csv(self):
        expected_header = ",".join(fieldnames())
        if not self.output_file.exists():
            with open(self.output_file, "w", newline="", encoding="utf-8") as f:
                csv.DictWriter(f, fieldnames=fieldnames()).writeheader()
            return

        try:
            first_line = self.output_file.read_text(encoding="utf-8").splitlines()[0]
        except Exception:
            first_line = ""

        if first_line != expected_header:
            with open(self.output_file, "w", newline="", encoding="utf-8") as f:
                csv.DictWriter(f, fieldnames=fieldnames()).writeheader()

    def _append_csv(self, row: dict):
        try:
            with open(self.output_file, "a", newline="", encoding="utf-8") as f:
                csv.DictWriter(f, fieldnames=fieldnames()).writerow(row)
        except PermissionError:
            fallback = self.output_file.with_name(f"{self.output_file.stem}_fallback.csv")
            with open(fallback, "a", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames())
                if not fallback.exists() or fallback.stat().st_size == 0:
                    writer.writeheader()
                writer.writerow(row)

    def _save_job_record(
        self,
        *,
        title: str,
        company: str,
        description: str,
        location: str = "Not specified",
        job_type: str = "Not specified",
        experience_level: str = "Not specified",
        salary_range: str = "Not specified",
    ) -> dict:
        title = title or "Unknown Position"
        company = company or "Unknown"
        description = strip_html(description or "")
        combined_text = "\n".join(part for part in [title, description, location] if part)

        location = location if location and location != "Not specified" else extract_location(combined_text)
        job_type = job_type if job_type and job_type != "Not specified" else extract_job_type(combined_text)
        experience_level = experience_level if experience_level and experience_level != "Not specified" else extract_experience_level(combined_text)
        salary_range = salary_range if salary_range and salary_range != "Not specified" else extract_salary(combined_text)

        skills = extract_skills(combined_text)
        categories = get_skill_categories(skills)

        job = {
            "Job_ID": f"JOB_{len(self.jobs) + 1:03d}",
            "Company": company,
            "Job_Title": title,
            "Location": location,
            "Job_Type": job_type,
            "Experience_Level": experience_level,
            "Salary_Range": salary_range,
            "Detected_Skills": ", ".join(skills),
            "Skills_Count": len(skills),
            "Skill_Categories": json.dumps(categories),
            "Scraped_Date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }

        self.jobs.append(job)
        self._append_csv(job)

        print(f"   ✅  Title      : {title}")
        print(f"   📍  Location   : {location}")
        print(f"   🏠  Job Type   : {job_type}")
        print(f"   🎓  Experience : {experience_level}")
        print(f"   💰  Salary     : {salary_range}")
        print(f"   🛠️  Skills     : {skills}")
        return job

    def _get_text(self, page, selectors: list[str]) -> str:
        for sel in selectors:
            try:
                el = page.locator(sel).first
                if el.count() > 0:
                    txt = el.inner_text(timeout=3000).strip()
                    if txt:
                        return txt
            except Exception:
                continue
        return ""

    # ── API collection ─────────────────────────────────────────────────────
    def _normalise_remotive(self, payload) -> list[dict]:
        jobs = payload.get("jobs", []) if isinstance(payload, dict) else []
        results = []
        for item in jobs:
            description = item.get("description", "")
            location = item.get("candidate_required_location") or "Remote"
            results.append({
                "title": item.get("title", "Unknown Position"),
                "company": item.get("company_name", "Unknown"),
                "description": description,
                "location": location,
                "job_type": extract_job_type(f"{location}\n{description}"),
                "experience_level": extract_experience_level(f"{item.get('title', '')}\n{description}"),
                "salary_range": item.get("salary") or extract_salary(description),
            })
        return results

    def _normalise_remoteok(self, payload) -> list[dict]:
        results = []
        rows = payload[1:] if isinstance(payload, list) else []
        for item in rows:
            if not isinstance(item, dict) or not item.get("position"):
                continue
            description = item.get("description", "")
            location = item.get("location") or "Remote"
            results.append({
                "title": item.get("position", "Unknown Position"),
                "company": item.get("company", "Unknown"),
                "description": description,
                "location": location,
                "job_type": extract_job_type(f"{location}\n{description}"),
                "experience_level": extract_experience_level(f"{item.get('position', '')}\n{description}"),
                "salary_range": item.get("salary") or extract_salary(description),
            })
        return results

    def _normalise_arbeitnow(self, payload) -> list[dict]:
        jobs = payload.get("data", []) if isinstance(payload, dict) else []
        results = []
        for item in jobs:
            description = item.get("description", "")
            locations = item.get("locations") or []
            location = ", ".join(locations) if isinstance(locations, list) and locations else item.get("location") or "Remote"
            remote_flag = item.get("remote")
            inferred_type = "Remote" if remote_flag else extract_job_type(f"{location}\n{description}")
            results.append({
                "title": item.get("title", "Unknown Position"),
                "company": item.get("company_name", "Unknown"),
                "description": description,
                "location": location,
                "job_type": inferred_type,
                "experience_level": extract_experience_level(f"{item.get('title', '')}\n{description}"),
                "salary_range": item.get("salary") or extract_salary(description),
            })
        return results

    def collect_public_api_jobs(self, limit_per_source: int = 25):
        print(f"\n🚀  Public API collection — {len(PUBLIC_API_SOURCES)} sources\n{'─'*60}")
        seen = set()
        normalisers = {
            "Remotive": self._normalise_remotive,
            "RemoteOK": self._normalise_remoteok,
            "Arbeitnow": self._normalise_arbeitnow,
        }

        for idx, source in enumerate(PUBLIC_API_SOURCES, 1):
            print(f"\n[{idx}/{len(PUBLIC_API_SOURCES)}] {source['name']}")
            try:
                payload = fetch_json(source["url"], timeout=20)
                rows = normalisers[source["name"]](payload)
                saved = 0
                for row in rows:
                    key = (
                        row["title"].strip().lower(),
                        row["company"].strip().lower(),
                        row["location"].strip().lower(),
                    )
                    if key in seen:
                        continue
                    seen.add(key)
                    self._save_job_record(**row)
                    saved += 1
                    if saved >= limit_per_source:
                        break
                print(f"   ✅  Saved {saved} jobs from {source['name']}")
            except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as e:
                print(f"   ❌  {source['name']} error: {e}")
            except Exception as e:
                print(f"   ❌  {source['name']} error: {e}")

        print(f"\n{'─'*60}")
        print(f"✅  Done! {len(self.jobs)} jobs saved → {self.output_file}")

    # ── Core scrape ────────────────────────────────────────────────────────
    def scrape_one(self, url: str, company: str = "Unknown") -> dict | None:
        print(f"\n🔍  Scraping : {url}")

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            ctx = browser.new_context(
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/124.0.0.0 Safari/537.36"
                )
            )
            page = ctx.new_page()

            try:
                page.goto(url, timeout=20_000, wait_until="domcontentloaded")
                page.wait_for_timeout(1_500)

                # ── Extract base fields ────────────────────────────────────
                title       = self._get_text(page, TITLE_SELECTORS) or "Unknown Position"
                description = self._get_text(page, DESCRIPTION_SELECTORS)
                if not description:
                    description = page.inner_text("body")

                # ── Extract skills ─────────────────────────────────────────
                skills     = extract_skills(description)
                categories = get_skill_categories(skills)

                # ── Extract new custom features ────────────────────────────
                salary     = extract_salary(description)
                job_type   = extract_job_type(description)
                exp_level  = extract_experience_level(description)
                location   = extract_location(description, page)

                job = {
                    "Job_ID":           f"JOB_{len(self.jobs) + 1:03d}",
                    "Company":          company,
                    "Job_Title":        title,
                    "Location":         location,
                    "Job_Type":         job_type,
                    "Experience_Level": exp_level,
                    "Salary_Range":     salary,
                    "Detected_Skills":  ", ".join(skills),
                    "Skills_Count":     len(skills),
                    "Skill_Categories": json.dumps(categories),
                    "Scraped_Date":     datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                }

                self.jobs.append(job)
                self._append_csv(job)

                # ── Console preview ────────────────────────────────────────
                print(f"   ✅  Title      : {title}")
                print(f"   📍  Location   : {location}")
                print(f"   🏠  Job Type   : {job_type}")
                print(f"   🎓  Experience : {exp_level}")
                print(f"   💰  Salary     : {salary}")
                print(f"   🛠️  Skills     : {skills}")
                return job

            except PWTimeout:
                print(f"   ❌  Timeout: {url}")
            except KeyboardInterrupt:
                print(f"   ⚠️  Interrupted: {url}")
            except Exception as e:
                print(f"   ❌  Error: {e}")
            finally:
                try:
                    browser.close()
                except Exception:
                    pass
        return None

    def scrape_many(self, job_list: list[dict], delay: float = 2.5):
        total = len(job_list)
        print(f"\n🚀  Batch scrape — {total} URLs\n{'─'*60}")
        for idx, job in enumerate(job_list, 1):
            print(f"\n[{idx}/{total}]")
            try:
                self.scrape_one(job["url"], job.get("company", "Unknown"))
            except KeyboardInterrupt:
                print("\n⏹️  Batch scrape interrupted by user.")
                break
            except Exception as e:
                print(f"   ❌  Skipped due to error: {e}")
            if idx < total:
                time.sleep(delay)
        print(f"\n{'─'*60}")
        print(f"✅  Done! {len(self.jobs)} jobs saved → {self.output_file}")

    # ── Summary ────────────────────────────────────────────────────────────
    def print_summary(self):
        if not self.jobs:
            print("⚠️  No data collected.")
            return

        from collections import Counter
        total      = len(self.jobs)
        all_skills = []
        for j in self.jobs:
            all_skills.extend([s.strip() for s in j["Detected_Skills"].split(",") if s.strip()])

        top10 = Counter(all_skills).most_common(10)

        # Job type breakdown
        type_counts = Counter(j["Job_Type"] for j in self.jobs)
        exp_counts  = Counter(j["Experience_Level"] for j in self.jobs)

        print(f"\n{'='*60}")
        print(f"  SUMMARY  —  {total} jobs scraped")
        print(f"\n  📊 Job Types    : {dict(type_counts)}")
        print(f"  🎓 Exp Levels   : {dict(exp_counts)}")
        print(f"  💰 Salaries found: {sum(1 for j in self.jobs if j['Salary_Range'] != 'Not specified')}/{total}")
        print(f"\n  🏆 Top 10 Skills:")
        for rank, (skill, count) in enumerate(top10, 1):
            bar = "█" * count
            print(f"     {rank:2}. {skill:<25} {count:3}  {bar}")
        print(f"\n  💾 Saved to: {self.output_file}")
        print(f"{'='*60}\n")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Job Scraper — ReadinessTracker")
    parser.add_argument("--auto",    action="store_true", help="Collect jobs from public APIs")
    parser.add_argument("--web",     action="store_true", help="Run the legacy built-in URL list")
    parser.add_argument("--url",     type=str,            help="Scrape a single URL")
    parser.add_argument("--company", type=str,            default="Unknown")
    parser.add_argument("--output",  type=str,            default="jobs_data.csv")
    parser.add_argument("--limit",    type=int,            default=25, help="Max jobs per API source")
    args = parser.parse_args()

    scraper = JobScraper(output_file=args.output)

    if args.url:
        scraper.scrape_one(args.url, args.company)

    elif args.auto:
        scraper.collect_public_api_jobs(limit_per_source=args.limit)

    elif args.web:
        scraper.scrape_many(DEFAULT_JOB_URLS)

    else:
        print("\n" + "="*60)
        print("  JOB SCRAPER  —  ReadinessTracker")
        print("="*60)
        print("\n  1) Scrape a single URL")
        print("  2) Collect public API jobs (recommended)")
        print("  3) Run legacy built-in URL list")
        print("  4) Exit")
        choice = input("\n  Your choice (1/2/3/4): ").strip()

        if choice == "1":
            url     = input("  Paste job URL   : ").strip()
            company = input("  Company name    : ").strip() or "Unknown"
            scraper.scrape_one(url, company)
        elif choice == "2":
            scraper.collect_public_api_jobs()
        elif choice == "3":
            scraper.scrape_many(DEFAULT_JOB_URLS)
        else:
            print("  Bye!")
            sys.exit(0)

    scraper.print_summary()


if __name__ == "__main__":
    main()