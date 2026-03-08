import logging
from typing import List, Dict, Tuple, Any
from datetime import datetime
import requests
from src.models.schemas import Repository
from src.config.settings import settings

logger = logging.getLogger(__name__)

class CacheManager:
    def __init__(self):
        self.backend_url = "http://localhost:8080/api/cache"

    def get_cached_analysis(self, username: str, repo_name: str) -> Tuple[bool, Dict[str, Any]]:
        try:
            response = requests.get(
                f"{self.backend_url}/get",
                params={"username": username, "repo_name": repo_name},
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                if data:
                    logger.info(f"Cache hit for {repo_name}")
                    return True, data
        except Exception as e:
            logger.warning(f"Cache lookup error: {str(e)}")
        return False, {}

    def save_cached_analysis(self, username: str, repo_name: str, github_url: str,
                            commit_hash: str, score: float, authenticity: float,
                            substance: float, quality: float, maturity: float,
                            tier: str, commits: int, size: float) -> bool:
        try:
            payload = {
                "username": username,
                "repo_name": repo_name,
                "github_url": github_url,
                "last_commit_hash": commit_hash,
                "analysis_score": score,
                "authenticity_score": authenticity,
                "substance_score": substance,
                "quality_score": quality,
                "maturity_score": maturity,
                "tier": tier,
                "total_commits": commits,
                "repository_size": size
            }
            response = requests.post(
                f"{self.backend_url}/save",
                json=payload,
                timeout=5
            )
            return response.status_code == 200
        except Exception as e:
            logger.warning(f"Cache save error: {str(e)}")
            return False

    def should_refresh_cache(self, username: str, repo_name: str, current_commit: str) -> bool:
        try:
            response = requests.get(
                f"{self.backend_url}/should-refresh",
                params={
                    "username": username,
                    "repo_name": repo_name,
                    "current_commit": current_commit
                },
                timeout=5
            )
            if response.status_code == 200:
                return response.json().get("should_refresh", True)
        except Exception as e:
            logger.warning(f"Refresh check error: {str(e)}")
        return True

    def clear_cache(self, username: str, repo_name: str) -> bool:
        try:
            response = requests.delete(
                f"{self.backend_url}/clear",
                params={"username": username, "repo_name": repo_name},
                timeout=5
            )
            return response.status_code == 200
        except Exception as e:
            logger.warning(f"Cache clear error: {str(e)}")
            return False


class BackgroundAnalyzer:
    GITHUB_API_BASE = "https://api.github.com"
    cache_manager = CacheManager()

    @staticmethod
    def get_github_latest_commit(username: str, repo_name: str) -> str:
        try:
            url = f"{BackgroundAnalyzer.GITHUB_API_BASE}/repos/{username}/{repo_name}/commits"
            response = requests.get(url, timeout=10, params={"per_page": 1})
            if response.status_code == 200:
                commits = response.json()
                if commits:
                    return commits[0].get("sha", "")
        except Exception as e:
            logger.warning(f"Failed to get latest commit for {repo_name}: {e}")
        return ""

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
        open_issues = repo_data.get("open_issues_count", 0)
        forks_count = repo_data.get("forks_count", 0)
        if open_issues > 0:
            score += 10
        if forks_count > 0:
            score += 15
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
            score -= 35
            logger.debug("Very small repository: -35")
        return max(0, score)

    @staticmethod
    def calculate_quality_score(repo_data: Dict, commits: List[Dict]) -> float:
        score = 100.0
        language = repo_data.get("language", "").lower()
        quality_languages = ["python", "javascript", "typescript", "java", "go", "rust", "c#"]
        if language in quality_languages:
            score += 20
            logger.debug(f"Quality language {language}: +20")
        stargazers = repo_data.get("stargazers_count", 0)
        if stargazers > 1000:
            score += 30
            logger.debug(f"Popular repo ({stargazers} stars): +30")
        elif stargazers > 100:
            score += 15
            logger.debug(f"Known repo ({stargazers} stars): +15")
        elif stargazers > 10:
            score += 5
            logger.debug(f"Some stars ({stargazers}): +5")
        watchers = repo_data.get("watchers_count", 0)
        if watchers > 100:
            score += 10
            logger.debug(f"Watched repo ({watchers} watchers): +10")
        if repo_data.get("topics"):
            score += 5
            logger.debug("Has topics: +5")
        has_license = repo_data.get("license") is not None
        if has_license:
            score += 10
            logger.debug("Has license: +10")
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
        logger.info(f"🔍 Checking cache for {len(repositories)} repos...")
        repo_scores = []
        analyzed_count = 0
        cached_count = 0
        
        for i, repo in enumerate(repositories, 1):
            logger.info(f"[{i}/{len(repositories)}] Checking: {repo.name}")
            
            latest_commit = BackgroundAnalyzer.get_github_latest_commit(username, repo.name)
            is_cached, cached_data = BackgroundAnalyzer.cache_manager.get_cached_analysis(username, repo.name)
            
            if is_cached and not BackgroundAnalyzer.cache_manager.should_refresh_cache(username, repo.name, latest_commit):
                cached_count += 1
                logger.info(f"✓ Cache hit for {repo.name}")
                repo_scores.append({
                    "name": repo.name,
                    "url": repo.url,
                    "language": repo.language,
                    "stars": repo.stars,
                    "background_score": cached_data.get("analysis_score", 0.0),
                    "tier": cached_data.get("tier", "UNKNOWN"),
                    "commits": cached_data.get("total_commits", 0),
                    "size_kb": cached_data.get("repository_size", 0),
                    "has_issues": False,
                    "forks": 0,
                    "description": "",
                    "from_cache": True
                })
                continue
            
            analyzed_count += 1
            logger.info(f"⚡ Analyzing (new/updated): {repo.name}")
            repo_data = BackgroundAnalyzer.fetch_detailed_repo_data(username, repo.name)
            commits = BackgroundAnalyzer.fetch_commits_data(username, repo.name)
            
            if not repo_data:
                logger.warning(f"Could not fetch data for {repo.name}")
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
                    "description": "",
                    "from_cache": False
                })
                continue
            
            score, tier = BackgroundAnalyzer.calculate_background_score(repo_data, commits)
            authenticity = BackgroundAnalyzer.calculate_authenticity_score(repo_data, commits)
            substance = BackgroundAnalyzer.calculate_substance_score(repo_data)
            quality = BackgroundAnalyzer.calculate_quality_score(repo_data, commits)
            maturity = BackgroundAnalyzer.calculate_maturity_score(repo_data)
            
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
                "description": repo_data.get("description", "")[:100],
                "from_cache": False
            })
            
            BackgroundAnalyzer.cache_manager.save_cached_analysis(
                username, repo.name, repo.url, latest_commit, score,
                authenticity, substance, quality, maturity, tier,
                len(commits), repo_data.get("size", 0) / 1024
            )
        
        repo_scores.sort(key=lambda x: x["background_score"], reverse=True)
        tier1 = [r for r in repo_scores if "TIER 1" in r.get("tier", "")]
        tier2 = [r for r in repo_scores if "TIER 2" in r.get("tier", "")]
        tier3 = [r for r in repo_scores if "TIER 3" in r.get("tier", "")]
        skip = [r for r in repo_scores if r.get("tier") == "SKIP"]
        
        logger.info(f"📊 Summary - Cached: {cached_count}, Analyzed: {analyzed_count}, " +
                   f"TIER 1: {len(tier1)}, TIER 2: {len(tier2)}, TIER 3: {len(tier3)}, SKIP: {len(skip)}")
        
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
            cache_indicator = " (cached)" if repo.get("from_cache") else " (fresh)"
            logger.info(f"  {i}. {repo.get('name', 'unknown')} (Score: {repo.get('background_score', 0):.1f}){cache_indicator}")
        return selected
