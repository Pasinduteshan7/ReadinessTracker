"""
analyze.py  –  Analyze scraped jobs_data.csv and produce a summary report
Run AFTER job_scraper.py has collected data:
    python analyze.py
"""

import pandas as pd
import json
from collections import Counter
from pathlib import Path

CSV_FILE = Path("jobs_data.csv")


def load_data() -> pd.DataFrame:
    if not CSV_FILE.exists():
        raise FileNotFoundError(f"❌ {CSV_FILE} not found. Run job_scraper.py first!")
    df = pd.read_csv(CSV_FILE)
    df["Detected_Skills"] = df["Detected_Skills"].fillna("")
    print(f"✅ Loaded {len(df)} jobs from {CSV_FILE}\n")
    return df


def analyze_top_skills(df: pd.DataFrame, top_n: int = 20):
    all_skills = []
    for s in df["Detected_Skills"]:
        all_skills.extend([x.strip() for x in s.split(",") if x.strip()])

    counts  = Counter(all_skills)
    top     = counts.most_common(top_n)
    total   = len(df)

    print(f"{'─'*50}")
    print(f"  TOP {top_n} IN-DEMAND SKILLS  ({total} jobs analyzed)")
    print(f"{'─'*50}")
    for rank, (skill, count) in enumerate(top, 1):
        pct = count / total * 100
        bar = "█" * int(pct / 2)
        print(f"  {rank:2}. {skill:<28} {count:3} jobs  ({pct:5.1f}%)  {bar}")
    print()
    return counts


def analyze_by_company(df: pd.DataFrame):
    print(f"{'─'*50}")
    print("  JOBS BY SOURCE")
    print(f"{'─'*50}")
    for company, count in df["Company"].value_counts().items():
        print(f"  {company:<35} {count} jobs")
    print()


def analyze_skill_categories(df: pd.DataFrame):
    if "Skill_Categories" not in df.columns:
        return

    cat_skill_counts: dict[str, Counter] = {}
    for raw in df["Skill_Categories"].fillna("{}"):
        try:
            cats = json.loads(raw)
        except Exception:
            continue
        for cat, skills in cats.items():
            if cat not in cat_skill_counts:
                cat_skill_counts[cat] = Counter()
            for s in skills:
                cat_skill_counts[cat][s] += 1

    print(f"{'─'*50}")
    print("  SKILLS BY CATEGORY")
    print(f"{'─'*50}")
    for cat, counter in sorted(cat_skill_counts.items()):
        top3 = ", ".join(s for s, _ in counter.most_common(3))
        print(f"  {cat:<20}  top: {top3}")
    print()


def skill_gap_report(df: pd.DataFrame, student_skills: list[str]):
    all_skills = []
    for s in df["Detected_Skills"]:
        all_skills.extend([x.strip() for x in s.split(",") if x.strip()])
    counts     = Counter(all_skills)
    top30      = {s for s, _ in counts.most_common(30)}
    student_set = set(student_skills)

    matched = sorted(top30 & student_set)
    missing = sorted(top30 - student_set)
    pct     = len(matched) / len(top30) * 100 if top30 else 0

    print(f"{'─'*50}")
    print(f"  SKILL GAP ANALYSIS  (match vs top 30 industry skills)")
    print(f"{'─'*50}")
    print(f"  Match score   : {pct:.1f}%  ({'High ✅' if pct>=60 else 'Medium ⚠️' if pct>=35 else 'Low ❌'})")
    print(f"  Your skills   : {sorted(student_set)}")
    print(f"  ✅ Matched     : {matched}")
    print(f"  ❗ Top missing : {missing[:10]}")
    print()


def save_summary(df: pd.DataFrame, counts: Counter):
    """Save a clean summary CSV for easy import into reports."""
    summary = pd.DataFrame(counts.most_common(50), columns=["Skill", "Job_Count"])
    summary["Demand_%"] = (summary["Job_Count"] / len(df) * 100).round(1)
    out = Path("skill_demand_summary.csv")
    summary.to_csv(out, index=False)
    print(f"💾 Summary saved to {out}")


# ---------------------------------------------------------------------------

if __name__ == "__main__":
    df     = load_data()
    counts = analyze_top_skills(df, top_n=20)
    analyze_by_company(df)
    analyze_skill_categories(df)

    # 👇 Replace with YOUR actual skills to see your personal gap
    my_skills = ["Python", "Java", "React", "MySQL", "Spring Boot", "Git", "Docker"]
    skill_gap_report(df, my_skills)

    save_summary(df, counts)
    print("✅ Analysis complete!")
