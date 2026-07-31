"""
GitHub API client for fetching repository data
"""

import httpx
from typing import Dict, List, Optional
import random
from src.utils.logger import setup_logger
from src.config.settings import settings
import asyncio

logger = setup_logger(__name__)

class GitHubAnalyzer:
    """Fetch and analyze GitHub user data"""
    
    def __init__(self, access_token: str):
        self.token = access_token
        self.headers = {
            "Accept": "application/vnd.github+json"
        }
        if access_token and access_token.strip():
            self.headers["Authorization"] = f"Bearer {access_token.strip()}"
        self.base_url = settings.GITHUB_API_BASE
    
    async def background_search(self, username: str) -> Dict:
        """
        Quick background analysis of GitHub account using GraphQL
        """
        logger.info(f"📊 Background search for {username} (GraphQL)")
        
        if "Authorization" not in self.headers:
            logger.warning("No GitHub Token provided. Some advanced metrics (pinned repos, accurate commits) may fail or hit rate limits if we used REST. Requiring token for GraphQL.")
            raise Exception("A valid GitHub Token is required to fetch pinned repositories and commit counts via GraphQL.")

        query = """
        query($login: String!) {
          user(login: $login) {
            login
            name
            bio
            location
            createdAt
            updatedAt
            followers { totalCount }
            following { totalCount }
            repositories(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}) {
              totalCount
              nodes {
                name
                url
                description
                stargazerCount
                forkCount
                diskUsage
                isFork
                primaryLanguage { name }
                updatedAt
                readme: object(expression: "HEAD:README.md") {
                  ... on Blob {
                    byteSize
                  }
                }
                defaultBranchRef {
                  target {
                    ... on Commit {
                      history {
                        totalCount
                      }
                    }
                  }
                }
              }
            }
            pinnedItems(first: 6, types: REPOSITORY) {
              nodes {
                ... on Repository {
                  name
                }
              }
            }
          }
        }
        """
        
        for attempt in range(settings.RETRY_ATTEMPTS):
            try:
                transport = httpx.AsyncHTTPTransport(retries=2)
                async with httpx.AsyncClient(transport=transport, timeout=settings.GITHUB_TIMEOUT) as client:
                    response = await client.post(
                        "https://api.github.com/graphql",
                        headers=self.headers,
                        json={"query": query, "variables": {"login": username}}
                    )
                    
                    if response.status_code != 200:
                        raise Exception(f"GraphQL request failed: {response.text}")
                    
                    data = response.json()
                    if "errors" in data:
                        raise Exception(f"GraphQL errors: {data['errors']}")
                        
                    user_data = data["data"]["user"]
                    if not user_data:
                        raise Exception(f"User not found: {username}")
                        
                    repos_data = user_data["repositories"]["nodes"]
                    pinned_names = {node["name"] for node in user_data["pinnedItems"]["nodes"]}
                    break
            except Exception as e:
                if attempt == settings.RETRY_ATTEMPTS - 1:
                    logger.error(f"Background search failed after {settings.RETRY_ATTEMPTS} attempts: {e}")
                    raise
                logger.warning(f"Background search attempt {attempt + 1} failed: {e}. Retrying...")
                await asyncio.sleep(settings.RETRY_DELAY_SECONDS)
            
        scored_repos = []
        for repo in repos_data:
            commits = 0
            if repo.get("defaultBranchRef") and repo["defaultBranchRef"].get("target") and repo["defaultBranchRef"]["target"].get("history"):
                commits = repo["defaultBranchRef"]["target"]["history"]["totalCount"]
            
            is_pinned = repo["name"] in pinned_names
            readme_size = repo.get("readme", {}).get("byteSize", 0) if repo.get("readme") else 0
            updated_at_str = repo.get("updatedAt")
            
            score = self._score_repository(repo, commits, is_pinned, readme_size, updated_at_str)
            
            scored_repos.append({
                "name": repo["name"],
                "url": repo["url"],
                "description": repo.get("description"),
                "language": repo["primaryLanguage"]["name"] if repo.get("primaryLanguage") else None,
                "stars": repo.get("stargazerCount", 0),
                "forks": repo.get("forkCount", 0),
                "size_kb": repo.get("diskUsage", 0),
                "commits": commits,
                "is_pinned": is_pinned,
                "is_fork": repo.get("isFork", False),
                "background_score": score
            })
        
        scored_repos.sort(key=lambda x: x["background_score"], reverse=True)
        avg_score = sum(r["background_score"] for r in scored_repos) / len(scored_repos) if scored_repos else 0
        
        return {
            "account": {
                "username": user_data.get("login"),
                "name": user_data.get("name"),
                "bio": user_data.get("bio"),
                "location": user_data.get("location"),
                "email": user_data.get("email"),
                "public_repos": user_data["repositories"]["totalCount"],
                "followers": user_data["followers"]["totalCount"],
                "following": user_data["following"]["totalCount"],
                "created_at": user_data.get("createdAt"),
                "updated_at": user_data.get("updatedAt")
            },
            "repos": scored_repos,
            "total_repos": user_data["repositories"]["totalCount"],
            "background_overall_score": avg_score
        }

    def _score_repository(self, repo: Dict, commits: int, is_pinned: bool, readme_size: int = 0, updated_at_str: str = None) -> float:
        """Score repository on background metrics including GraphQL advanced metrics"""
        score = 0.0
        import datetime
        
        # Recency Penalty
        if updated_at_str:
            try:
                updated_at = datetime.datetime.strptime(updated_at_str, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=datetime.timezone.utc)
                now = datetime.datetime.now(datetime.timezone.utc)
                diff_days = (now - updated_at).days
                if diff_days <= 90:
                    score += 15
                elif diff_days <= 365:
                    score += 5
                elif diff_days > 730:
                    score -= 10
            except Exception:
                pass
                
        # Documentation Bonus
        if readme_size > 5000:
            score += 20
        elif readme_size > 1000:
            score += 10
        elif readme_size > 0:
            score += 5
            
        if repo.get("description"):
            score += 10
            
        size = repo.get("diskUsage", 0)
        if size < 10: score += 2
        elif size < 100: score += 5
        elif size < 1000: score += 10
        else: score += 15
        
        stars = repo.get("stargazerCount", 0)
        if stars >= 100: score += 20
        elif stars >= 50: score += 15
        elif stars >= 10: score += 10
        elif stars > 0: score += 5
        
        forks = repo.get("forkCount", 0)
        if forks >= 20: score += 10
        elif forks >= 10: score += 7
        elif forks >= 5: score += 4
        elif forks > 0: score += 2
        
        if repo.get("primaryLanguage"):
            score += 5
            
        if is_pinned:
            score += 20
            
        if commits >= 100: score += 20
        elif commits >= 50: score += 15
        elif commits >= 20: score += 10
        elif commits > 0: score += 5
        
        if not repo.get("isFork"): score += 10
        else: score -= 10
        
        return min(100, max(0, score))
    
    async def select_best_repos(
        self,
        all_repos: List[Dict],
        limit: int = 5,
        min_score: float = 40.0
    ) -> List[Dict]:
        """Select best repos for deep analysis with Tech Stack Diversity"""
        
        logger.info(f"🎯 Selecting top {limit} repos from {len(all_repos)} total (with Tech Stack Diversity)")
        
        # Filter by minimum score and exclude forks
        qualified = [r for r in all_repos if r["background_score"] >= min_score and not r.get("is_fork")]
        
        logger.info(f"   Qualified repos (score >= {min_score}, non-forks): {len(qualified)}")
        
        # Group by language
        from collections import defaultdict
        lang_groups = defaultdict(list)
        for repo in qualified:
            lang = repo.get("language") or "Unknown"
            lang_groups[lang].append(repo)
            
        # Sort each group by score descending
        for lang in lang_groups:
            lang_groups[lang].sort(key=lambda x: x["background_score"], reverse=True)
            
        selected = []
        # Round-robin selection
        while len(selected) < limit and any(lang_groups.values()):
            for lang in list(lang_groups.keys()):
                if len(selected) >= limit:
                    break
                if lang_groups[lang]:
                    selected.append(lang_groups[lang].pop(0))
                    
        return selected
    
    async def fetch_repo_code(
        self,
        owner: str,
        repo: str,
        max_size: int = 50000
    ) -> str:
        """
        Fetch repository code files
        
        Returns concatenated code from primary files
        """
        
        logger.info(f"📥 Fetching code for {owner}/{repo}")
        
        try:
            transport = httpx.AsyncHTTPTransport(retries=2)
            async with httpx.AsyncClient(transport=transport, timeout=settings.GITHUB_TIMEOUT) as client:
                # Get repository tree
                tree_response = await client.get(
                    f"{self.base_url}/repos/{owner}/{repo}/git/trees/main?recursive=1",
                    headers=self.headers
                )
                
                if tree_response.status_code != 200:
                    # Try master branch
                    tree_response = await client.get(
                        f"{self.base_url}/repos/{owner}/{repo}/git/trees/master?recursive=1",
                        headers=self.headers
                    )
                
                if tree_response.status_code != 200:
                    return "Repository code not accessible"
                
                tree = tree_response.json()
                
                # Find code files
                code_files = [
                    item for item in tree.get("tree", [])
                    if item["type"] == "blob" and self._is_code_file(item["path"])
                ]
                
                # Metadata scan
                total_files = len(code_files)
                test_files_count = sum(1 for item in code_files if "test" in item["path"].lower() or "spec" in item["path"].lower())
                has_readme = any(item["path"].lower() == "readme.md" for item in tree.get("tree", []))
                
                for f in code_files:
                    f["score"] = self._score_file(f)
                    
                code_files.sort(key=lambda x: x["score"], reverse=True)
                
                selected_files = code_files[:8]
                remaining_files = code_files[8:]
                
                # Smart Test File Sampling: explicitly grab 1 test file if none in top 8 but tests exist
                has_test_in_selected = any("test" in f["path"].lower() or "spec" in f["path"].lower() for f in selected_files)
                if not has_test_in_selected and test_files_count > 0:
                    for i, f in enumerate(remaining_files):
                        if "test" in f["path"].lower() or "spec" in f["path"].lower():
                            selected_files.append(remaining_files.pop(i))
                            break
                            
                # Fill remaining randomly up to 10 files total
                if remaining_files:
                    spots_left = max(0, 10 - len(selected_files))
                    if spots_left > 0:
                        selected_files.extend(random.sample(remaining_files, min(spots_left, len(remaining_files))))
                
                # Fetch a sample of files
                metadata_header = (
                    f"=== REPOSITORY METADATA SCAN ===\n"
                    f"- Total Code Files: {total_files}\n"
                    f"- Documentation: {'README.md found' if has_readme else 'Missing README'}\n"
                    f"- Tests Found: {'YES (' + str(test_files_count) + ' test files found)' if test_files_count > 0 else 'NO tests found'}\n"
                    f"================================\n\n"
                )
                
                code_content = metadata_header
                total_size = len(metadata_header)
                
                for file_item in selected_files:
                    try:
                        blob_response = await client.get(
                            f"{self.base_url}/repos/{owner}/{repo}/contents/{file_item['path']}",
                            headers={**self.headers, "Accept": "application/vnd.github.v3.raw"}
                        )
                        
                        if blob_response.status_code == 200:
                            content = blob_response.text
                            
                            if file_item['path'].endswith('.ipynb'):
                                try:
                                    import json
                                    nb = json.loads(content)
                                    code_cells = []
                                    for cell in nb.get("cells", []):
                                        if cell.get("cell_type") == "code":
                                            source = cell.get("source", [])
                                            if isinstance(source, list):
                                                code_cells.append("".join(source))
                                            else:
                                                code_cells.append(str(source))
                                    content = "\n\n".join(code_cells)
                                except Exception as e:
                                    logger.warning(f"Failed to parse Jupyter notebook {file_item['path']}: {e}")
                                    continue
                            
                            if len(content) + total_size <= max_size:
                                code_content += f"\n\n# File: {file_item['path']}\n```\n{content}\n```"
                                total_size += len(content)
                            else:
                                break
                    
                    except Exception as e:
                        logger.warning(f"Failed to fetch {file_item['path']}: {e}")
                        continue
                
                return code_content if code_content else "No code files found"
        
        except Exception as e:
            logger.error(f"Failed to fetch repo code: {e}")
            return f"Error fetching code: {str(e)}"
    
    def _score_file(self, item: dict) -> float:
        """Score a file based on importance to architecture"""
        path = item.get("path", "")
        size = item.get("size", 0)
        score = 0.0
        
        path_lower = path.lower()
        basename = path_lower.split("/")[-1]
        
        # Entry points
        entry_points = {"main.py", "server.js", "app.ts", "app.js", "index.html", "index.js", "__init__.py", "main.go", "app.py", "server.go", "app.tsx", "index.tsx", "main.rs"}
        if basename in entry_points:
            score += 50.0
            
        # Core directories
        core_dirs = {"src/", "core/", "app/", "lib/", "backend/", "api/"}
        if any(d in path_lower for d in core_dirs):
            score += 20.0
            
        # Size scoring
        if size < 200:
            score -= 20.0  # Likely config
        elif size > 100000:
            score -= 50.0  # Likely generated
        elif 2000 <= size <= 15000:
            score += 10.0  # Sweet spot
            
        return score

    def _is_code_file(self, path: str) -> bool:
        """Check if file is a code file and not a dependency"""
        
        excluded_dirs = {
            "node_modules", ".venv", "venv", "env", "site-packages",
            "dist", "build", ".next", "vendor", "__pycache__",
            ".git", "target", "bin", "obj", ".idea", ".vscode", "lib"
        }
        parts = path.lower().split("/")
        if any(excluded in parts for excluded in excluded_dirs):
            return False
            
        # Exclude generated/minified/binary files
        if path.lower().endswith(('.min.js', '.min.css', '-lock.json', 'package-lock.json', 'yarn.lock', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.svg', '.lock')):
            return False
            
        code_extensions = {
            ".py", ".js", ".ts", ".java", ".cpp", ".c", ".go", ".rs",
            ".rb", ".php", ".swift", ".kt", ".scala", ".clj",
            ".html", ".css", ".sql", ".r", ".m", ".h", ".hpp", ".ipynb"
        }
        
        return any(path.lower().endswith(ext) for ext in code_extensions)

# Factory function
def create_github_analyzer(token: str) -> GitHubAnalyzer:
    """Create GitHub analyzer instance"""
    return GitHubAnalyzer(token)
