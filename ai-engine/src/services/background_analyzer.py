import logging
from typing import List, Dict, Tuple
from datetime import datetime
import requests
from src.models.schemas import Repository
from src.config.settings import settings
logger = logging.getLogger(__name__)
class BackgroundAnalyzer:
    GITHUB_API_BASE = "https://api.github.com"
    @staticmethod
    def fetch_detailed_repo_data(username: str, repo_name: str) -> Dict:
        try:
            url = f"{BackgroundAnalyzer.GITHUB_API_BASE}/repos/{username}/{repo_name}"
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                return response.json()
            return {}
        except Exception as e:
            logger.warning(f"Failed to fetch details for {repo_name}: {e}")
            return {}
    @staticmethod
    def fetch_commits_data(username: str, repo_name: str) -> List[Dict]:
        try:
            url = f"{BackgroundAnalyzer.GITHUB_API_BASE}/repos/{username}/{repo_name}/commits"
            response = requests.get(url, timeout=10, params={"per_page": 100})
            if response.status_code == 200:
                return response.json()
            return []
        except Exception as e:
            logger.warning(f"Failed to fetch commits for {repo_name}: {e}")
            return []
    @staticmethod
    def calculate_authenticity_score(repo_data: Dict, commits: List[Dict]) -> float:
        score = 100.0
        if repo_data.get("fork", False):
            total_commits = len(commits)
            if total_commits < 50:
                score -= 50
                logger.debug(f"Fork with few commits: -50")
            else:
                logger.debug(f"Fork with {total_commits} commits: +0 (significant contribution)")
        if repo_data.get("is_template", False):
            score -= 30
            logger.debug("Template repository: -30")
        total_commits = len(commits)
        total_files = repo_data.get("files", {}).get("count", 0) if isinstance(repo_data.get("files"), dict) else 0
        if total_commits < 3 and repo_data.get("size", 0) > 15000:
            score -= 40
            logger.debug(f"Suspicious: {total_commits} commits, large size: -40")
        elif total_commits < 5:
            created_at = repo_data.get("created_at", "")
            repo_age = BackgroundAnalyzer._calculate_age_days(created_at)
            if repo_age > 30:
                score -= 20
                logger.debug(f"Low activity over {repo_age} days: -20")
        if total_commits > 0:
            created_at = repo_data.get("created_at", "")
            pushed_at = repo_data.get("pushed_at", "")
            created_date = BackgroundAnalyzer._parse_date(created_at)
            pushed_date = BackgroundAnalyzer._parse_date(pushed_at)
            if created_date and pushed_date:
                active_days = (pushed_date - created_date).days
                if active_days < 1 and repo_data.get("size", 0) > 10000:
                    score -= 35
                    logger.debug("Created and completed same day (suspicious): -35")
                elif active_days > 30 and total_commits > 10:
                    score += 15
                    logger.debug(f"Active over {active_days} days with {total_commits} commits: +15")
        return max(0, score)
    @staticmethod
    def calculate_substance_score(repo_data: Dict) -> float:
        score = 100.0
        size_kb = repo_data.get("size", 0) / 1024
        if size_kb < 10:
            score -= 50
            logger.debug(f"Size {size_kb:.1f}KB too small: -50")
        elif 10 <= size_kb < 100:
            score -= 20
            logger.debug(f"Small size {size_kb:.1f}KB: -20")
        elif 100 <= size_kb < 10000:
            score += 20
            logger.debug(f"Good size {size_kb:.1f}KB: +20")
        elif size_kb > 10000:
            score += 10
            logger.debug(f"Large size {size_kb:.1f}KB: +10")
        files_count = len(repo_data.get("files", {})) if isinstance(repo_data.get("files"), dict) else 0
        if files_count < 3:
            score -= 40
            logger.debug(f"Few files ({files_count}): -40")
        elif 3 <= files_count < 10:
            score -= 10
            logger.debug(f"Few files ({files_count}): -10")
        elif 10 <= files_count < 50:
            score += 15
            logger.debug(f"Good files ({files_count}): +15")
        elif files_count >= 50:
            score += 25
            logger.debug(f"Substantial files ({files_count}): +25")
        size_estimate = repo_data.get("size", 0)
        if size_estimate < 50:
            score -= 30
        elif size_estimate < 500:
            score += 0
        elif size_estimate < 5000:
            score += 20
        else:
            score += 30
        language = repo_data.get("language")
        if not language:
            score -= 25
            logger.debug("No language detected: -25")
        elif language == "HTML":
            score -= 10
            logger.debug("Only HTML: -10")
        else:
            score += 20
            logger.debug(f"Language {language}: +20")
        return max(0, score)
    @staticmethod
    def calculate_quality_score(repo_data: Dict, commits: List[Dict]) -> float:
        score = 100.0
        total_commits = len(commits)
        created_at = repo_data.get("created_at", "")
        repo_age_days = BackgroundAnalyzer._calculate_age_days(created_at)
        if repo_age_days > 0:
            commit_frequency = total_commits / repo_age_days
            if commit_frequency < 0.1:
                score -= 20
            elif 0.1 <= commit_frequency <= 0.5:
                score += 15
            elif 0.5 < commit_frequency <= 5:
                score += 10
            else:
                score -= 25
            logger.debug(f"Commit freq {commit_frequency:.2f}/day")
        if len(commits) > 2:
            commit_dates = set()
            for commit in commits[:20]:
                try:
                    commit_date = commit.get("commit", {}).get("author", {}).get("date", "")
                    if commit_date:
                        date_obj = BackgroundAnalyzer._parse_date(commit_date)
                        if date_obj:
                            commit_dates.add(date_obj.date())
                except:
                    pass
            if len(commit_dates) == 1 and len(commits) > 5:
                score -= 30
                logger.debug("All commits same day (suspicious): -30")
            elif len(commit_dates) > 5:
                score += 10
                logger.debug(f"Commits spread over {len(commit_dates)} days: +10")
        messages = []
        for commit in commits[:20]:
            msg = commit.get("commit", {}).get("message", "")
            if msg:
                messages.append(msg.split('\n')[0])
        if messages:
            msg_lengths = [len(msg) for msg in messages]
            avg_length = sum(msg_lengths) / len(msg_lengths)
            variance = sum((l - avg_length) ** 2 for l in msg_lengths) / len(msg_lengths)
            if variance < 5:
                score -= 15
                logger.debug("Uniform commit messages (suspicious): -15")
            else:
                score += 10
                logger.debug(f"Varied commit messages: +10")
        branches_count = repo_data.get("branches_count", 1)
        if branches_count == 1:
            score -= 15
        elif 2 <= branches_count <= 5:
            score += 10
        elif branches_count > 5:
            score += 20
        open_issues = repo_data.get("open_issues_count", 0)
        forks_count = repo_data.get("forks_count", 0)
        if open_issues > 0:
            score += 10
        if forks_count > 0:
            score += 15
        return max(0, score)
    @staticmethod
    def calculate_maturity_score(repo_data: Dict) -> float:
        score = 100.0
        has_readme = repo_data.get("readme_size", 0) > 0
        readme_size = repo_data.get("readme_size", 0)
        if not has_readme:
            score -= 15
            logger.debug("No README: -15")
        elif readme_size < 100:
            score -= 10
            logger.debug("Empty README: -10")
        elif 100 <= readme_size < 1000:
            score += 5
        elif 1000 <= readme_size < 5000:
            score += 15
        else:
            score += 25
        license_data = repo_data.get("license")
        if not license_data:
            score -= 5
        else:
            score += 10
        description = repo_data.get("description", "")
        if not description:
            score -= 5
        elif len(description) < 20:
            score -= 2
        else:
            score += 5
        topics = repo_data.get("topics", [])
        if topics and len(topics) > 0:
            score += 10
        return max(0, score)
    @staticmethod
    def calculate_red_flags(repo_data: Dict, commits: List[Dict]) -> float:
        penalties = 0.0
        if len(commits) == 1:
            penalties += 30
            logger.debug("Single commit repo: -30")
        if len(commits) > 5:
            commit_dates = set()
            for commit in commits:
                try:
                    commit_date = commit.get("commit", {}).get("author", {}).get("date", "")
                    date_obj = BackgroundAnalyzer._parse_date(commit_date)
                    if date_obj:
                        commit_dates.add(date_obj.date())
                except:
                    pass
            if len(commit_dates) == 1:
                penalties += 25
                logger.debug("All commits same day: -25")
        if not repo_data.get("language"):
            penalties += 20
        if repo_data.get("fork") and len(commits) < 50:
            penalties += 15
        if repo_data.get("size", 0) < 10:
            penalties += 35
        name = repo_data.get("name", "").lower()
        suspicious_names = ["my-project", "test-repo", "demo-app", "web-application", "python-project"]
        if any(suspicious in name for suspicious in suspicious_names):
            penalties += 15
            logger.debug(f"Suspicious name '{name}': -15")
        return penalties
    @staticmethod
    def calculate_background_score(repo_data: Dict, commits: List[Dict]) -> Tuple[float, str]:
        authenticity = BackgroundAnalyzer.calculate_authenticity_score(repo_data, commits)
        substance = BackgroundAnalyzer.calculate_substance_score(repo_data)
        quality = BackgroundAnalyzer.calculate_quality_score(repo_data, commits)
        maturity = BackgroundAnalyzer.calculate_maturity_score(repo_data)
        red_flags = BackgroundAnalyzer.calculate_red_flags(repo_data, commits)
        score = (
            authenticity * 0.30 +
            substance * 0.25 +
            quality * 0.20 +
            maturity * 0.15
        ) - red_flags
        score = max(0, min(100, score))
        if score > 70:
            tier = "TIER 1 (Deep Analysis)"
        elif score >= 50:
            tier = "TIER 2 (Standard Analysis)"
        elif score >= 30:
            tier = "TIER 3 (Quick Analysis)"
        else:
            tier = "SKIP"
        logger.info(
            f"Repo: {repo_data.get('name', 'unknown')} | "
            f"Score: {score:.1f} | {tier} | "
            f"Auth:{authenticity:.0f} Sub:{substance:.0f} Qual:{quality:.0f} Mat:{maturity:.0f}"
        )
        return score, tier
    @staticmethod
    def _parse_date(date_str: str):
        try:
            return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        except:
            return None
    @staticmethod
    def _calculate_age_days(created_at: str) -> int:
        try:
            created_date = BackgroundAnalyzer._parse_date(created_at)
            if created_date:
                return (datetime.now(created_date.tzinfo) - created_date).days
        except:
            pass
        return 0
    @staticmethod
    def rank_repositories(repositories: List[Repository], username: str) -> List[Dict]:
        logger.info(f"🔍 Starting background analysis for {len(repositories)} repos...")
        repo_scores = []
        for i, repo in enumerate(repositories, 1):
            logger.info(f"[{i}/{len(repositories)}] Analyzing: {repo.name}")
            repo_data = BackgroundAnalyzer.fetch_detailed_repo_data(username, repo.name)
            commits = BackgroundAnalyzer.fetch_commits_data(username, repo.name)
            if not repo_data:
                logger.warning(f"Could not fetch data for {repo.name}")
                # Add default score for repos with no data
                repo_scores.append({
                    "name": repo.name,
                    "url": repo.url,
                    "language": repo.language,
                    "stars": repo.stars,
                    "background_score": 30.0,
                    "tier": "TIER 3 (Quick Analysis)",
                    "commits": 0,
                    "size_kb": 0,
                    "has_issues": False,
                    "forks": 0,
                    "description": ""
                })
                continue
            score, tier = BackgroundAnalyzer.calculate_background_score(repo_data, commits)
            repo_scores.append({
                "name": repo.name,
                "url": repo.url,
                "language": repo.language,
                "stars": repo.stars,
                "background_score": score,
                "tier": tier,
                "commits": len(commits),
                "size_kb": repo_data.get("size", 0) / 1024,
                "has_issues": repo_data.get("open_issues_count", 0) > 0,
                "forks": repo_data.get("forks_count", 0),
                "description": repo_data.get("description", "")[:100]
            })
        repo_scores.sort(key=lambda x: x["background_score"], reverse=True)
        tier1 = [r for r in repo_scores if "TIER 1" in r["tier"]]
        tier2 = [r for r in repo_scores if "TIER 2" in r["tier"]]
        tier3 = [r for r in repo_scores if "TIER 3" in r["tier"]]
        skip = [r for r in repo_scores if r["tier"] == "SKIP"]
        logger.info(f"📊 Repository Analysis Summary: TIER 1: {len(tier1)}, TIER 2: {len(tier2)}, TIER 3: {len(tier3)}, SKIP: {len(skip)}")
        return repo_scores
    @staticmethod
    def select_best_repos(repo_scores: List[Dict], max_count: int = 10) -> List[Dict]:
        if not repo_scores:
            logger.warning("No repository scores available for selection")
            return []
        tier1_repos = [r for r in repo_scores if "TIER 1" in r.get("tier", "")]
        tier2_repos = [r for r in repo_scores if "TIER 2" in r.get("tier", "")]
        selected = tier1_repos[:max_count]
        if len(selected) < max_count:
            selected.extend(tier2_repos[:max_count - len(selected)])
        if not selected:
            selected = repo_scores[:max_count]
        logger.info(f"✅ Selected {len(selected)} repos for deep LLM analysis")
        for i, repo in enumerate(selected, 1):
            logger.info(f"  {i}. {repo.get('name', 'unknown')} (Score: {repo.get('background_score', 0):.1f})")
        return selected
