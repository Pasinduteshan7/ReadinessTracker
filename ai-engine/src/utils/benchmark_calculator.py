"""
Benchmark Calculator Module

Handles employability percentage calculation based on student scores
relative to professional developer benchmarks.

Scoring Logic:
- Compares individual scores to benchmark percentiles
- Maps scores to employability percentages (0-100%)
- Supports multi-category scoring (repo quality, github metrics, algorithm, overall)

Benchmark Percentiles:
- 90th percentile and above: 100% employability
- 75th percentile: 90% employability  
- 50th percentile (median): 60% employability
- 25th percentile: 40% employability
- Below 25th: <40% employability
"""

import logging
from typing import Dict, Tuple, Optional
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class BenchmarkThresholds:
    """Benchmark percentile thresholds for a score category"""
    percentile_90: float
    percentile_75: float
    percentile_50: float
    percentile_25: float
    
    # Corresponding employability percentages
    emp_90_plus: float = 100.0  # >= 90th percentile
    emp_75_to_90: float = 90.0  # 75-90th percentile
    emp_50_to_75: float = 70.0  # 50-75th percentile
    emp_25_to_50: float = 50.0  # 25-50th percentile
    emp_below_25: float = 30.0  # < 25th percentile


class BenchmarkCalculator:
    """
    Calculates employability percentages based on score benchmarks
    """
    
    def __init__(self):
        """Initialize benchmark calculator with default benchmarks"""
        self.benchmarks: Dict[str, BenchmarkThresholds] = {}
        self._initialize_default_benchmarks()
    
    def _initialize_default_benchmarks(self):
        """Initialize default benchmark thresholds"""
        
        # Repository Quality Benchmark
        self.benchmarks["REPO_QUALITY"] = BenchmarkThresholds(
            percentile_90=85.0,
            percentile_75=75.0,
            percentile_50=65.0,
            percentile_25=50.0,
            emp_90_plus=100.0,
            emp_75_to_90=90.0,
            emp_50_to_75=70.0,
            emp_25_to_50=50.0,
            emp_below_25=30.0
        )
        
        # GitHub Metrics Benchmark
        self.benchmarks["GITHUB_METRICS"] = BenchmarkThresholds(
            percentile_90=80.0,
            percentile_75=70.0,
            percentile_50=60.0,
            percentile_25=45.0,
            emp_90_plus=95.0,
            emp_75_to_90=85.0,
            emp_50_to_75=65.0,
            emp_25_to_50=45.0,
            emp_below_25=25.0
        )
        
        # Algorithm Challenge Benchmark
        self.benchmarks["ALGORITHM_SCORE"] = BenchmarkThresholds(
            percentile_90=85.0,
            percentile_75=75.0,
            percentile_50=65.0,
            percentile_25=50.0,
            emp_90_plus=100.0,
            emp_75_to_90=88.0,
            emp_50_to_75=68.0,
            emp_25_to_50=48.0,
            emp_below_25=28.0
        )
        
        # Overall/Combined Benchmark (most important)
        self.benchmarks["OVERALL"] = BenchmarkThresholds(
            percentile_90=85.0,
            percentile_75=75.0,
            percentile_50=65.0,
            percentile_25=50.0,
            emp_90_plus=100.0,
            emp_75_to_90=90.0,
            emp_50_to_75=70.0,
            emp_25_to_50=50.0,
            emp_below_25=30.0
        )
        
        # AI Detection Benchmark (lower is better)
        self.benchmarks["AI_DETECTION"] = BenchmarkThresholds(
            percentile_90=20.0,  # Low AI likelihood = good
            percentile_75=40.0,
            percentile_50=60.0,
            percentile_25=80.0,
            emp_90_plus=100.0,   # No AI detected = no penalty
            emp_75_to_90=95.0,
            emp_50_to_75=85.0,
            emp_25_to_50=70.0,
            emp_below_25=50.0    # High AI detected = major penalty
        )
    
    def calculate_employability(
        self, 
        category: str, 
        raw_score: float
    ) -> Tuple[float, str]:
        """
        Calculate employability percentage for a score
        
        Args:
            category: Score category (e.g., "REPO_QUALITY", "OVERALL")
            raw_score: Raw score value
            
        Returns:
            Tuple of (employability_percentage, percentile_category)
            - employability_percentage: 0-100
            - percentile_category: "EXCELLENT", "VERY_GOOD", "GOOD", "ADEQUATE", "NEEDS_IMPROVEMENT"
        """
        
        if category not in self.benchmarks:
            logger.warning(f"Unknown category: {category}, using default calculation")
            return self._default_calculation(raw_score)
        
        benchmarks = self.benchmarks[category]
        
        # Determine which percentile bracket the score falls into
        if raw_score >= benchmarks.percentile_90:
            employability = benchmarks.emp_90_plus
            percentile_cat = "90+"
        elif raw_score >= benchmarks.percentile_75:
            employability = benchmarks.emp_75_to_90
            percentile_cat = "75-90"
        elif raw_score >= benchmarks.percentile_50:
            employability = benchmarks.emp_50_to_75
            percentile_cat = "50-75"
        elif raw_score >= benchmarks.percentile_25:
            employability = benchmarks.emp_25_to_50
            percentile_cat = "25-50"
        else:
            employability = benchmarks.emp_below_25
            percentile_cat = "<25"
        
        logger.debug(
            f"Calculated employability for {category}: {employability}% "
            f"(raw_score: {raw_score}, percentile: {percentile_cat})"
        )
        
        category_descriptor = self._get_category_descriptor(employability)
        
        return employability, category_descriptor
    
    def calculate_combined_employability(
        self,
        scores: Dict[str, float],
        weights: Optional[Dict[str, float]] = None
    ) -> Tuple[float, str]:
        """
        Calculate combined employability from multiple score categories
        
        Args:
            scores: Dict of {category: score}
            weights: Dict of {category: weight} (must sum to 1.0)
                    Default: repo_quality=0.4, github_metrics=0.3, algorithm=0.2, ai_detection=-0.1
                    
        Returns:
            Tuple of (combined_employability, category_descriptor)
        """
        
        if not weights:
            weights = {
                "REPO_QUALITY": 0.40,
                "GITHUB_METRICS": 0.30,
                "ALGORITHM_SCORE": 0.20,
                "AI_DETECTION": -0.10  # Negative = penalty
            }
        
        combined_score = 0.0
        total_weight = 0.0
        
        for category, score in scores.items():
            if category in weights:
                weight = weights[category]
                category_employability, _ = self.calculate_employability(category, score)
                combined_score += category_employability * weight
                total_weight += abs(weight)
                
                logger.debug(
                    f"Component: {category}={score} -> "
                    f"employability={category_employability}% * weight={weight}"
                )
        
        # Normalize if needed
        if total_weight > 0:
            combined_score = combined_score / total_weight
        
        # Clamp to 0-100
        combined_score = max(0.0, min(100.0, combined_score))
        
        category_descriptor = self._get_category_descriptor(combined_score)
        
        logger.info(
            f"Combined employability: {combined_score}% ({category_descriptor})"
        )
        
        return combined_score, category_descriptor
    
    def _default_calculation(self, raw_score: float) -> Tuple[float, str]:
        """
        Default calculation when benchmark not available
        Uses simple linear scaling with adjustments
        """
        if raw_score >= 90:
            employability = 100.0
        elif raw_score >= 75:
            employability = 90.0
        elif raw_score >= 50:
            employability = 60.0
        elif raw_score >= 25:
            employability = 40.0
        else:
            employability = max(0.0, raw_score * 0.8)
        
        category = self._get_category_descriptor(employability)
        return employability, category
    
    def _get_category_descriptor(self, employability_percentage: float) -> str:
        """
        Get human-readable category descriptor for employability percentage
        """
        if employability_percentage >= 90:
            return "EXCELLENT"
        elif employability_percentage >= 75:
            return "VERY_GOOD"
        elif employability_percentage >= 60:
            return "GOOD"
        elif employability_percentage >= 40:
            return "ADEQUATE"
        else:
            return "NEEDS_IMPROVEMENT"
    
    def get_benchmark_report(
        self,
        student_scores: Dict[str, float]
    ) -> Dict:
        """
        Generate comprehensive benchmark report for a student
        
        Args:
            student_scores: Dict of {category: score}
            
        Returns:
            Comprehensive report with detailed breakdown
        """
        
        report = {
            "scores": {},
            "employability_scores": {},
            "combined": {},
            "summary": {}
        }
        
        # Calculate individual employabilities
        for category, score in student_scores.items():
            report["scores"][category] = score
            employability, descriptor = self.calculate_employability(category, score)
            report["employability_scores"][category] = {
                "employability_percentage": employability,
                "category": descriptor,
                "percentile_rank": self._get_percentile_rank(category, score)
            }
        
        # Calculate combined
        combined_emp, combined_desc = self.calculate_combined_employability(student_scores)
        report["combined"] = {
            "employability_percentage": combined_emp,
            "category": combined_desc
        }
        
        # Summary
        report["summary"] = {
            "overall_employability": combined_emp,
            "rating": combined_desc,
            "rank": self._get_rank_from_employability(combined_emp),
            "employment_readiness": "HIGH" if combined_emp >= 70 else "MEDIUM" if combined_emp >= 50 else "LOW"
        }
        
        logger.info(f"Generated benchmark report: {combined_emp}% employability")
        
        return report
    
    def _get_percentile_rank(self, category: str, score: float) -> str:
        """Get percentile rank descriptor"""
        if category not in self.benchmarks:
            return "UNKNOWN"
        
        benchmarks = self.benchmarks[category]
        
        if score >= benchmarks.percentile_90:
            return "90th percentile +"
        elif score >= benchmarks.percentile_75:
            return "75-90th percentile"
        elif score >= benchmarks.percentile_50:
            return "50-75th percentile"
        elif score >= benchmarks.percentile_25:
            return "25-50th percentile"
        else:
            return "Below 25th percentile"
    
    def _get_rank_from_employability(self, employability: float) -> str:
        """Get employment tier/rank"""
        if employability >= 90:
            return "TIER_1_HIGH"
        elif employability >= 75:
            return "TIER_2_VERY_GOOD"
        elif employability >= 60:
            return "TIER_3_GOOD"
        elif employability >= 40:
            return "TIER_4_ADEQUATE"
        else:
            return "TIER_5_NEEDS_IMPROVEMENT"
