"""
Intelligent Repository Selection Service

Algorithmic (non-LLM) filtering and scoring of repositories for deep analysis.
Selects the best repositories based on quality metrics before feeding them to
the 6-phase LLM evaluation pipeline.

Scoring Factors (0-100 total):
- Stars (0-20): Repository popularity/recognition
- Languages (0-20): Multi-language diversity
- Commits (0-20): Project maturity/activity
- Recency (0-20): Active maintenance
- Size (0-20): Code complexity
- Bonuses (0-15): README + Original work
"""

import logging
from typing import List, Dict, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class RepositorySelector:
    """
    Intelligent repository selection for deep 6-phase analysis
    
    Uses algorithmic scoring to identify the best repositories
    without requiring LLM analysis - fast and deterministic.
    """
    
    def __init__(self, min_score_threshold: float = 40.0):
        """
        Initialize the repository selector
        
        Args:
            min_score_threshold: Minimum score to consider repo (0-100)
        """
        self.min_score_threshold = min_score_threshold
    
    def select_repos_for_analysis(
        self,
        all_repos: List[Dict],
        top_n: int = 5,
        apply_filters: bool = True
    ) -> List[Dict]:
        """
        Select best repositories for deep 6-phase analysis
        
        Args:
            all_repos: List of all repositories with metadata
            top_n: Number of top repos to select (default: 5-10)
            apply_filters: Whether to apply quality filters
            
        Returns:
            List of selected repositories sorted by quality score
            
        Example:
            all_repos = [
                {
                    'name': 'awesome-project',
                    'stars': 150,
                    'languages': ['Python', 'JavaScript'],
                    'commits': 250,
                    'last_updated': datetime.now(),
                    'file_count': 150,
                    'has_readme': True,
                    'is_fork': False
                },
                ...
            ]
            
            selected = selector.select_repos_for_analysis(all_repos, top_n=5)
        """
        
        if not all_repos:
            logger.warning("No repositories provided for selection")
            return []
        
        logger.info(f"🔍 Repository Selection: Analyzing {len(all_repos)} repositories")
        
        scored_repos = []
        
        # Score each repository
        for repo in all_repos:
            try:
                score = self._calculate_selection_score(repo)
                repo_with_score = {**repo, 'selection_score': score}
                scored_repos.append(repo_with_score)
                
                logger.debug(f"   Scored '{repo.get('name', 'unknown')}': {score:.1f}/100")
                
            except Exception as e:
                logger.warning(f"   Error scoring repo {repo.get('name', 'unknown')}: {e}")
                continue
        
        if not scored_repos:
            logger.error("No repositories could be scored")
            return []
        
        # Apply minimum threshold filter
        if apply_filters:
            filtered_repos = [
                r for r in scored_repos
                if r['selection_score'] >= self.min_score_threshold
            ]
            
            logger.info(f"   Filtered: {len(filtered_repos)} repos above {self.min_score_threshold} threshold")
            
            if not filtered_repos:
                logger.warning(f"   No repos above threshold, using top {top_n} anyway")
                filtered_repos = scored_repos
        else:
            filtered_repos = scored_repos
        
        # Sort by score descending
        sorted_repos = sorted(
            filtered_repos,
            key=lambda r: r['selection_score'],
            reverse=True
        )
        
        # Select top N
        selected = sorted_repos[:top_n]
        
        logger.info(f"✅ Selected {len(selected)} repositories for deep analysis")
        
        # Log selections
        for i, repo in enumerate(selected, 1):
            logger.info(
                f"   {i}. {repo.get('name', 'unknown'):30s} "
                f"Score: {repo['selection_score']:5.1f}/100"
            )
        
        return selected
    
    def _calculate_selection_score(self, repo: Dict) -> float:
        """
        Calculate repository quality score (0-100)
        
        Scoring breakdown:
        - Stars (0-20): Popularity and recognition
        - Languages (0-20): Technology diversity  
        - Commits (0-20): Project maturity/activity
        - Recency (0-20): Active maintenance
        - Size (0-20): Code complexity
        - Bonuses (0-15): README + original work
        
        Args:
            repo: Repository dictionary with metadata
            
        Returns:
            Quality score from 0-100
        """
        
        score = 0.0
        
        # 1. STARS (0-20 points) - Authority & Recognition
        # Reasoning: More stars = more popular/trusted
        stars = repo.get('stars', 0)
        star_score = min(stars / 100 * 20, 20)  # 100 stars = full 20 points
        score += star_score
        
        # 2. LANGUAGES (0-20 points) - Diversity & Expertise
        # Reasoning: Multi-language projects show broader skills
        languages = repo.get('languages', [])
        if isinstance(languages, list):
            lang_count = len(languages)
        else:
            lang_count = 1
        
        # Each language = 5 points, capped at 4+ languages (20 points)
        lang_score = min(lang_count * 5, 20)
        score += lang_score
        
        # 3. COMMITS (0-20 points) - Project Maturity
        # Reasoning: More commits = more developed, established project
        commits = repo.get('commits', 0)
        commit_score = min(commits / 50 * 20, 20)  # 50+ commits = full 20 points
        score += commit_score
        
        # 4. RECENCY (0-20 points) - Active Maintenance
        # Reasoning: Recently maintained code is more valuable
        last_updated = repo.get('last_updated')
        if last_updated:
            # Convert to datetime if string
            if isinstance(last_updated, str):
                try:
                    last_updated = datetime.fromisoformat(last_updated.replace('Z', '+00:00'))
                except:
                    last_updated = None
            
            if last_updated:
                days_ago = (datetime.now(last_updated.tzinfo) if last_updated.tzinfo else datetime.now() - last_updated.replace(tzinfo=None)).days
                
                if days_ago < 30:
                    score += 20  # Very recent
                elif days_ago < 90:
                    score += 15  # Recent
                elif days_ago < 180:
                    score += 10  # Somewhat maintained
                elif days_ago < 365:
                    score += 5   # Old but has activity
                else:
                    score += 0   # Abandoned/archived
            else:
                score += 5  # Assume moderate maintenance
        else:
            score += 5  # Unknown, assume moderate
        
        # 5. SIZE/COMPLEXITY (0-20 points) - Code Base Maturity
        # Reasoning: Larger codebase shows more experience
        file_count = repo.get('file_count', 0)
        complexity_score = min(file_count / 100 * 20, 20)  # 100+ files = full 20 points
        score += complexity_score
        
        # BONUS 1: HAS README (5 extra points) - Professional Quality
        # Reasoning: README shows communication/documentation skills
        if repo.get('has_readme', False):
            score += 5
        
        # BONUS 2: NOT A FORK (10 extra points) - Original Work
        # Reasoning: Original projects demonstrate more capability
        if not repo.get('is_fork', False):
            score += 10
        
        # Cap at 100
        final_score = min(score, 100.0)
        
        return final_score
    
    def get_repo_quality_tier(self, score: float) -> str:
        """
        Get the quality tier for a repository score
        
        Args:
            score: Repository quality score (0-100)
            
        Returns:
            Tier name: 'TIER_1_EXCELLENT', 'TIER_2_GOOD', 'TIER_3_FAIR', 'TIER_4_POOR'
        """
        
        if score >= 85:
            return 'TIER_1_EXCELLENT'
        elif score >= 70:
            return 'TIER_2_GOOD'
        elif score >= 50:
            return 'TIER_3_FAIR'
        else:
            return 'TIER_4_POOR'
    
    def generate_selection_report(self, selected_repos: List[Dict]) -> str:
        """
        Generate a human-readable report of selected repositories
        
        Args:
            selected_repos: List of selected repositories with scores
            
        Returns:
            Formatted report string
        """
        
        report = "\n" + "="*80 + "\n"
        report += "📊 REPOSITORY SELECTION REPORT\n"
        report += "="*80 + "\n\n"
        
        report += f"Total Repositories Selected: {len(selected_repos)}\n\n"
        
        for i, repo in enumerate(selected_repos, 1):
            score = repo.get('selection_score', 0)
            tier = self.get_repo_quality_tier(score)
            
            report += f"{i}. {repo.get('name', 'Unknown Repository')}\n"
            report += f"   Quality Score: {score:.1f}/100 [{tier}]\n"
            report += f"   Stars: {repo.get('stars', 0):,}  |  "
            report += f"Languages: {len(repo.get('languages', []))}  |  "
            report += f"Commits: {repo.get('commits', 0)}\n"
            report += f"   Last Updated: {repo.get('last_updated', 'Unknown')}\n"
            report += f"   Files: {repo.get('file_count', 0):,}  |  "
            report += f"Fork: {repo.get('is_fork', False)}  |  "
            report += f"README: {repo.get('has_readme', False)}\n\n"
        
        report += "="*80 + "\n"
        
        return report


# Example usage
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Sample repositories
    sample_repos = [
        {
            'name': 'awesome-project',
            'stars': 250,
            'languages': ['Python', 'JavaScript', 'TypeScript'],
            'commits': 350,
            'last_updated': datetime.now() - timedelta(days=5),
            'file_count': 180,
            'has_readme': True,
            'is_fork': False
        },
        {
            'name': 'another-repo',
            'stars': 50,
            'languages': ['Python'],
            'commits': 75,
            'last_updated': datetime.now() - timedelta(days=200),
            'file_count': 35,
            'has_readme': False,
            'is_fork': True
        },
        {
            'name': 'excellent-code',
            'stars': 400,
            'languages': ['Java', 'Python', 'C++', 'Go'],
            'commits': 500,
            'last_updated': datetime.now() - timedelta(days=1),
            'file_count': 250,
            'has_readme': True,
            'is_fork': False
        }
    ]
    
    # Create selector and select repos
    selector = RepositorySelector()
    selected = selector.select_repos_for_analysis(sample_repos, top_n=2)
    
    # Generate report
    report = selector.generate_selection_report(selected)
    print(report)
