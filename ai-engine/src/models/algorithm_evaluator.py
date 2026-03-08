"""
Complete 6-phase sequential algorithm evaluation pipeline
Uses 6 different LLM models to analyze submissions from different perspectives
Final score computed using MEDIAN of all 6 phase scores
"""

import time
import gc
import statistics
import logging
from typing import Dict, List

from .phase_analyzers import (
    Phase1Analyzer,
    Phase2Analyzer,
    Phase3Analyzer,
    Phase4Analyzer,
    Phase5Analyzer,
    Phase6Analyzer
)

logger = logging.getLogger(__name__)


class AlgorithmEvaluator:
    """
    Complete algorithm evaluation using 6-phase sequential LLM analysis
    
    Pipeline:
    1. Phase 1 (CodeLlama 7B): Architecture & Structure
    2. Phase 2 (Qwen2.5-Coder 3B): Correctness & Best Practices
    3. Phase 3 (DeepSeek-Coder 1.3B): Efficiency & Optimization
    4. Phase 4 (DeepSeek-R1 1.5B): Reasoning & Edge Cases
    5. Phase 5 (DeepSeek-Coder 6.7B): Deep Code Analysis
    6. Phase 6 (StarCoder2 7B): Security & Best Practices
    
    Final Score: MEDIAN of all 6 phase scores
    """
    
    def __init__(self):
        # Initialize all phase analyzers
        self.phase1 = Phase1Analyzer()  # CodeLlama 7B
        self.phase2 = Phase2Analyzer()  # Qwen2.5-Coder 3B
        self.phase3 = Phase3Analyzer()  # DeepSeek-Coder 1.3B
        self.phase4 = Phase4Analyzer()  # DeepSeek-R1 1.5B
        self.phase5 = Phase5Analyzer()  # DeepSeek-Coder 6.7B
        self.phase6 = Phase6Analyzer()  # StarCoder2 7B
    
    def evaluate_submission(
        self,
        code: str,
        problem_description: str,
        language: str = "python",
        test_results: Dict = None
    ) -> Dict:
        """
        Complete 6-phase evaluation of algorithm submission
        
        Args:
            code: Submitted code/solution
            problem_description: Problem statement
            language: Programming language (python, java, cpp, js)
            test_results: Results from test cases {'passed': int, 'total': int}
            
        Returns:
            Dict with complete evaluation including all 6 phases, final score, and feedback
        """
        
        if test_results is None:
            test_results = {'passed': 0, 'total': 0}
        
        logger.info("\n" + "="*80)
        logger.info("🚀 ALGORITHM EVALUATION - 6-PHASE SEQUENTIAL ANALYSIS")
        logger.info("="*80)
        logger.info(f"Language: {language}")
        logger.info(f"Code length: {len(code)} characters")
        logger.info(f"Test results: {test_results.get('passed', 0)}/{test_results.get('total', 0)} passed")
        logger.info("")
        
        overall_start = time.time()
        
        # PHASE 1: Architecture Analysis (CodeLlama 7B)
        logger.info("🏗️  PHASE 1: Architecture & Structure Analysis")
        logger.info(f"    Model: CodeLlama 7B")
        logger.info("")
        phase1_result = self.phase1.analyze_architecture(
            code, problem_description, language
        )
        self._cleanup_vram()
        
        # PHASE 2: Correctness Analysis (Qwen2.5-Coder 3B)
        logger.info("")
        logger.info("✅ PHASE 2: Correctness & Best Practices")
        logger.info(f"    Model: Qwen2.5-Coder 3B")
        logger.info("")
        phase2_result = self.phase2.analyze_correctness(
            code, problem_description, language, test_results
        )
        self._cleanup_vram()
        
        # PHASE 3: Efficiency Analysis (DeepSeek-Coder 1.3B)
        logger.info("")
        logger.info("⚡ PHASE 3: Efficiency & Optimization Analysis")
        logger.info(f"    Model: DeepSeek-Coder 1.3B")
        logger.info("")
        phase3_result = self.phase3.analyze_efficiency(
            code, problem_description, language
        )
        self._cleanup_vram()
        
        # PHASE 4: Reasoning Analysis (DeepSeek-R1 1.5B)
        logger.info("")
        logger.info("🧠 PHASE 4: Reasoning & Edge Cases Analysis")
        logger.info(f"    Model: DeepSeek-R1 1.5B")
        logger.info("")
        phase4_result = self.phase4.analyze_reasoning(
            code, problem_description, language,
            phase1_result, phase2_result, phase3_result
        )
        self._cleanup_vram()
        
        # PHASE 5: Deep Code Analysis (DeepSeek-Coder 6.7B)
        logger.info("")
        logger.info("🔬 PHASE 5: Deep Code Analysis")
        logger.info(f"    Model: DeepSeek-Coder 6.7B")
        logger.info("")
        phase5_result = self.phase5.analyze_deep_code(
            code, problem_description, language
        )
        self._cleanup_vram()
        
        # PHASE 6: Security & Best Practices Analysis (StarCoder2 7B)
        logger.info("")
        logger.info("🔒 PHASE 6: Security & Best Practices Analysis")
        logger.info(f"    Model: StarCoder2 7B")
        logger.info("")
        phase6_result = self.phase6.analyze_security(
            code, problem_description, language
        )
        self._cleanup_vram()
        
        # Calculate final score using MEDIAN
        logger.info("")
        logger.info("📊 Calculating Final Score (MEDIAN of 6 phases)...")
        final_result = self._calculate_final_score(
            phase1_result,
            phase2_result,
            phase3_result,
            phase4_result,
            phase5_result,
            phase6_result,
            test_results
        )
        
        overall_time = time.time() - overall_start
        
        logger.info("")
        logger.info("="*80)
        logger.info("✅ EVALUATION COMPLETE")
        logger.info(f"   Final Score: {final_result['final_score']:.1f}/100")
        logger.info(f"   Time Taken: {overall_time:.1f}s")
        logger.info("="*80)
        logger.info("")
        
        return final_result
    
    def _calculate_final_score(
        self,
        phase1: Dict,
        phase2: Dict,
        phase3: Dict,
        phase4: Dict,
        phase5: Dict,
        phase6: Dict,
        test_results: Dict
    ) -> Dict:
        """
        Calculate final score from all 6 phases using MEDIAN
        
        Scoring Strategy:
        - Test Cases: 40% (objective correctness measure)
        - LLM Quality (Median): 60% (subjective quality assessment)
          └─ Median of 6 phase scores for robustness
        
        The median approach is more robust than mean because it:
        - Avoids skewing from outlier model assessments
        - Represents the "middle ground" of expert opinions
        - Works better with more evaluators (6 > 4)
        """
        
        # Get individual phase scores
        phase_scores = [
            phase1.get('overall_score', 50),
            phase2.get('overall_score', 50),
            phase3.get('overall_score', 50),
            phase4.get('overall_score', 50),
            phase5.get('overall_score', 50),
            phase6.get('overall_score', 50)
        ]
        
        # Calculate MEDIAN of LLM scores (this is the key metric)
        llm_median = statistics.median(phase_scores)
        
        # Calculate mean for reference
        llm_mean = statistics.mean(phase_scores)
        
        # Calculate standard deviation for confidence measure
        llm_std_dev = statistics.stdev(phase_scores) if len(phase_scores) > 1 else 0
        
        # Test case score (0-100 based on pass rate)
        test_pass_rate = test_results.get('passed', 0) / max(test_results.get('total', 1), 1)
        test_score = test_pass_rate * 100
        
        # FINAL SCORE: 40% test cases + 60% LLM quality (median)
        final_score = (test_score * 0.40) + (llm_median * 0.60)
        
        # Confidence score (lower std dev = higher confidence)
        # Convert std dev to 0-100 confidence (lower variance = higher confidence)
        confidence = 100 - min(llm_std_dev * 20, 50)
        
        logger.info(f"   Phase Scores: {phase_scores[0]}, {phase_scores[1]}, {phase_scores[2]}, {phase_scores[3]}, {phase_scores[4]}, {phase_scores[5]}")
        logger.info(f"   Median (LLM): {llm_median:.1f}/100")
        logger.info(f"   Mean (Reference): {llm_mean:.1f}/100")
        logger.info(f"   Test Pass Rate: {test_pass_rate*100:.1f}%")
        logger.info(f"   Final Score: ({test_score:.1f} × 0.40) + ({llm_median:.1f} × 0.60) = {final_score:.1f}/100")
        
        return {
            # Final Score
            'final_score': round(final_score, 2),
            
            # Component Scores
            'test_score': round(test_score, 2),
            'llm_quality_score': round(llm_median, 2),  # MEDIAN - the key metric
            
            # Phase Breakdown
            'phase_scores': {
                'phase1_architecture': phase1.get('overall_score', 0),
                'phase2_correctness': phase2.get('overall_score', 0),
                'phase3_efficiency': phase3.get('overall_score', 0),
                'phase4_reasoning': phase4.get('overall_score', 0),
                'phase5_deep_analysis': phase5.get('overall_score', 0),
                'phase6_security': phase6.get('overall_score', 0)
            },
            
            # Complete Phase Details
            'phase1_details': phase1,
            'phase2_details': phase2,
            'phase3_details': phase3,
            'phase4_details': phase4,
            'phase5_details': phase5,
            'phase6_details': phase6,
            
            # Statistical Analysis
            'llm_statistics': {
                'median': round(llm_median, 2),
                'mean': round(llm_mean, 2),
                'std_dev': round(llm_std_dev, 2),
                'confidence': round(confidence, 2),
                'all_scores': phase_scores,
                'num_phases': 6
            },
            
            # Test Results
            'test_results': test_results,
            'test_pass_rate': round(test_pass_rate, 3),
            
            # Weights Used
            'weights': {
                'test_cases': 0.40,
                'llm_quality': 0.60,
                'scoring_method': 'MEDIAN of 6 phases (robust consensus)'
            }
        }
    
    def _cleanup_vram(self):
        """Clean VRAM between phases"""
        gc.collect()
        time.sleep(0.5)  # Allow VRAM to be released
    
    def get_detailed_feedback(self, evaluation_result: Dict) -> str:
        """
        Generate human-readable feedback from evaluation
        
        Args:
            evaluation_result: Result from evaluate_submission()
            
        Returns:
            Formatted feedback string
        """
        
        phase1 = evaluation_result['phase1_details']
        phase2 = evaluation_result['phase2_details']
        phase3 = evaluation_result['phase3_details']
        phase4 = evaluation_result['phase4_details']
        
        p1_score = evaluation_result['phase_scores']['phase1_architecture']
        p2_score = evaluation_result['phase_scores']['phase2_correctness']
        p3_score = evaluation_result['phase_scores']['phase3_efficiency']
        p4_score = evaluation_result['phase_scores']['phase4_reasoning']
        final = evaluation_result['final_score']
        
        feedback = f"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                    ALGORITHM EVALUATION FEEDBACK                             ║
╚══════════════════════════════════════════════════════════════════════════════╝

FINAL SCORE: {final}/100

SCORE BREAKDOWN:
├─ Test Cases: {evaluation_result['test_score']:.1f}/100 (40% weight)
└─ Code Quality: {evaluation_result['llm_quality_score']:.1f}/100 (60% weight - MEDIAN of 4 LLMs)

PHASE SCORES (Individual LLM Assessments):
├─ Phase 1 (Architecture):   {p1_score}/100  [CodeLlama 7B]
├─ Phase 2 (Correctness):    {p2_score}/100  [Qwen2.5-Coder 3B]
├─ Phase 3 (Efficiency):     {p3_score}/100  [DeepSeek-Coder 1.3B]
└─ Phase 4 (Reasoning):      {p4_score}/100  [DeepSeek-R1 1.5B]
    └─ MEDIAN: {evaluation_result['llm_statistics']['median']:.1f}/100

ANALYSIS CONFIDENCE: {evaluation_result['llm_statistics']['confidence']:.1f}% (consensus reliability)

────────────────────────────────────────────────────────────────────────────────

🏗️  PHASE 1: ARCHITECTURE & STRUCTURE ({p1_score}/100)
    Model: CodeLlama 7B

    Strengths:
"""
        
        for i, strength in enumerate(phase1.get('strengths', [])[:3], 1):
            feedback += f"    {i}. ✓ {strength}\n"
        
        feedback += "    \n    Areas for Improvement:\n"
        for i, weakness in enumerate(phase1.get('weaknesses', [])[:3], 1):
            feedback += f"    {i}. ✗ {weakness}\n"
        
        feedback += f"""
────────────────────────────────────────────────────────────────────────────────

✅ PHASE 2: CORRECTNESS & BEST PRACTICES ({p2_score}/100)
    Model: Qwen2.5-Coder 3B
    
    Good Practices:
"""
        
        for i, practice in enumerate(phase2.get('good_practices', [])[:3], 1):
            feedback += f"    {i}. ✓ {practice}\n"
        
        if phase2.get('issues_found'):
            feedback += "    \n    Issues Found:\n"
            for i, issue in enumerate(phase2.get('issues_found', [])[:3], 1):
                feedback += f"    {i}. ✗ {issue}\n"
        
        if phase2.get('missing_edge_cases'):
            feedback += "    \n    Missing Edge Cases:\n"
            for i, case in enumerate(phase2.get('missing_edge_cases', [])[:2], 1):
                feedback += f"    {i}. ⚠️  {case}\n"
        
        feedback += f"""
────────────────────────────────────────────────────────────────────────────────

⚡ PHASE 3: EFFICIENCY & OPTIMIZATION ({p3_score}/100)
    Model: DeepSeek-Coder 1.3B
    
    Complexity Analysis:
    ├─ Time Complexity:  {phase3.get('time_complexity', 'Not analyzed')}
    └─ Space Complexity: {phase3.get('space_complexity', 'Not analyzed')}
"""
        
        if phase3.get('optimizations'):
            feedback += "    \n    Optimization Opportunities:\n"
            for i, opt in enumerate(phase3.get('optimizations', [])[:3], 1):
                feedback += f"    {i}. 💡 {opt}\n"
        
        if phase3.get('bottlenecks'):
            feedback += "    \n    Performance Bottlenecks:\n"
            for i, bottleneck in enumerate(phase3.get('bottlenecks', [])[:2], 1):
                feedback += f"    {i}. 🔴 {bottleneck}\n"
        
        feedback += f"""
────────────────────────────────────────────────────────────────────────────────

🧠 PHASE 4: REASONING & EDGE CASES ({p4_score}/100)
    Model: DeepSeek-R1 1.5B
    
    Approach Quality: {phase4.get('approach_quality', 'Not rated').upper()}
"""
        
        if phase4.get('uncovered_edge_cases'):
            feedback += "    \n    Uncovered Edge Cases:\n"
            for i, case in enumerate(phase4.get('uncovered_edge_cases', [])[:3], 1):
                feedback += f"    {i}. ⚠️  {case}\n"
        
        if phase4.get('potential_issues'):
            feedback += "    \n    Potential Issues:\n"
            for i, issue in enumerate(phase4.get('potential_issues', [])[:3], 1):
                feedback += f"    {i}. 🔴 {issue}\n"
        
        if phase4.get('alternative_approaches'):
            feedback += "    \n    Alternative Approaches to Consider:\n"
            for i, approach in enumerate(phase4.get('alternative_approaches', [])[:2], 1):
                feedback += f"    {i}. 💡 {approach}\n"
        
        feedback += "\n" + "="*80 + "\n"
        
        return feedback
