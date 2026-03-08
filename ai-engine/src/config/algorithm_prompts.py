"""
Specialized prompts for 6-phase algorithm evaluation
Each phase targets specific analysis dimensions
"""


class AlgorithmPrompts:
    """Optimized prompts for sequential 6-phase algorithm evaluation"""

    @staticmethod
    def phase1_architecture(code: str, problem: str, language: str) -> str:
        """
        PHASE 1: CodeLlama 7B - Architecture & Structure Analysis
        
        Focus:
        - Code organization and structure
        - Design patterns used
        - Modularity and separation of concerns
        - Code readability
        """
        return f"""You are an expert software architect analyzing algorithm solutions.

PROBLEM:
{problem}

SUBMITTED CODE ({language}):
```{language}
{code}
```

ANALYZE THE ARCHITECTURE & STRUCTURE (0-100 scale):

1. CODE ORGANIZATION (0-25 points):
   - Is code well-structured?
   - Clear function/method definitions?
   - Logical flow and organization?

2. DESIGN PATTERNS (0-25 points):
   - Are appropriate patterns used? (Two-pointer, Sliding window, Recursion, etc.)
   - Is pattern implemented correctly?
   - Matches problem requirements?

3. MODULARITY & REUSABILITY (0-25 points):
   - Is code modular and reusable?
   - Are responsibilities separated?
   - Helper functions appropriately used?

4. READABILITY (0-25 points):
   - Variable/function names descriptive?
   - Proper indentation and formatting?
   - Easy to understand logic?

RESPOND WITH VALID JSON ONLY (no markdown, no code blocks):
{{
  "organization_score": <0-25>,
  "design_patterns_score": <0-25>,
  "modularity_score": <0-25>,
  "readability_score": <0-25>,
  "overall_score": <0-100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "patterns_identified": ["pattern1", "pattern2"]
}}"""

    @staticmethod
    def phase2_correctness(code: str, problem: str, language: str, test_results: dict) -> str:
        """
        PHASE 2: Qwen2.5-Coder 3B - Correctness & Best Practices
        
        Focus:
        - Logic correctness
        - Best practices adherence
        - Language-specific conventions
        - Edge case handling
        """
        test_summary = f"Tests Passed: {test_results.get('passed', 0)}/{test_results.get('total', 0)}"
        
        return f"""You are a code reviewer evaluating solution correctness and best practices.

PROBLEM:
{problem}

SUBMITTED CODE ({language}):
```{language}
{code}
```

TEST RESULTS:
{test_summary}

EVALUATE CORRECTNESS & BEST PRACTICES (0-100 scale):

1. LOGIC CORRECTNESS (0-25 points):
   - Does the solution solve the problem correctly?
   - Are all cases handled?
   - Is the algorithm logic sound?

2. BEST PRACTICES (0-25 points):
   - Follows {language} conventions?
   - Proper error handling?
   - Appropriate data structures used?

3. CODE QUALITY (0-25 points):
   - Clean code principles followed?
   - No code smells?
   - Professional coding standards?

4. EDGE CASE HANDLING (0-25 points):
   - Handles empty inputs?
   - Handles boundary cases?
   - Validates inputs properly?

RESPOND WITH VALID JSON ONLY (no markdown, no code blocks):
{{
  "logic_correctness_score": <0-25>,
  "best_practices_score": <0-25>,
  "code_quality_score": <0-25>,
  "edge_case_handling_score": <0-25>,
  "overall_score": <0-100>,
  "issues_found": ["issue1", "issue2"],
  "good_practices": ["practice1", "practice2"],
  "missing_edge_cases": ["case1", "case2"]
}}"""

    @staticmethod
    def phase3_efficiency(code: str, problem: str, language: str) -> str:
        """
        PHASE 3: DeepSeek-Coder 1.3B - Efficiency & Optimization
        
        Focus:
        - Time complexity analysis
        - Space complexity analysis
        - Optimization opportunities
        - Performance bottlenecks
        """
        return f"""You are a performance optimization expert analyzing algorithm efficiency.

PROBLEM:
{problem}

SUBMITTED CODE ({language}):
```{language}
{code}
```

ANALYZE EFFICIENCY & OPTIMIZATION (0-100 scale):

1. TIME COMPLEXITY (0-25 points):
   - What is the time complexity? O(?)
   - Is it optimal for this problem?
   - Can it be improved?

2. SPACE COMPLEXITY (0-25 points):
   - What is the space complexity? O(?)
   - Is memory usage efficient?
   - Unnecessary allocations present?

3. OPTIMIZATION OPPORTUNITIES (0-25 points):
   - Are there obvious optimizations?
   - Redundant computations?
   - Better data structures available?

4. PERFORMANCE & SCALABILITY (0-25 points):
   - Would this scale well?
   - Any performance bottlenecks?
   - Early exit opportunities?

RESPOND WITH VALID JSON ONLY (no markdown, no code blocks):
{{
  "time_complexity_score": <0-25>,
  "space_complexity_score": <0-25>,
  "optimization_score": <0-25>,
  "performance_score": <0-25>,
  "overall_score": <0-100>,
  "time_complexity": "O(...)",
  "space_complexity": "O(...)",
  "optimizations": ["optimization1", "optimization2"],
  "bottlenecks": ["bottleneck1", "bottleneck2"]
}}"""

    @staticmethod
    def phase4_reasoning(code: str, problem: str, language: str, 
                        phase1_result: dict, phase2_result: dict, phase3_result: dict) -> str:
        """
        PHASE 4: DeepSeek-R1 1.5B - Reasoning & Edge Cases
        
        Focus:
        - Deep reasoning about solution
        - Edge case analysis
        - Potential issues and risks
        - Alternative approaches
        """
        context = f"""
Previous Phase Analysis Summary:
- Architecture Score: {phase1_result.get('overall_score', 0)}/100
- Correctness Score: {phase2_result.get('overall_score', 0)}/100
- Efficiency Score: {phase3_result.get('overall_score', 0)}/100
"""
        
        return f"""You are a reasoning expert conducting deep critical analysis of algorithm solutions.

PROBLEM:
{problem}

SUBMITTED CODE ({language}):
```{language}
{code}
```

{context}

PERFORM DEEP REASONING & EDGE CASE ANALYSIS (0-100 scale):

1. SOLUTION APPROACH (0-25 points):
   - Is the chosen approach appropriate?
   - Does reasoning behind solution make sense?
   - Are there fundamentally better alternatives?

2. EDGE CASE COVERAGE (0-25 points):
   - What edge cases might break this?
   - Are all corner cases considered?
   - Potential runtime errors?

3. ROBUSTNESS & RELIABILITY (0-25 points):
   - How resilient is this solution?
   - Would it handle unexpected inputs?
   - Potential failure points?

4. CRITICAL THINKING & INSIGHT (0-25 points):
   - Does solution show deep understanding?
   - Are trade-offs properly considered?
   - Shows problem-solving maturity?

RESPOND WITH VALID JSON ONLY (no markdown, no code blocks):
{{
  "approach_score": <0-25>,
  "edge_case_score": <0-25>,
  "robustness_score": <0-25>,
  "critical_thinking_score": <0-25>,
  "overall_score": <0-100>,
  "approach_quality": "excellent|good|average|poor",
  "uncovered_edge_cases": ["case1", "case2"],
  "potential_issues": ["issue1", "issue2"],
  "alternative_approaches": ["approach1", "approach2"]
}}"""

    @staticmethod
    def phase5_deep_analysis(code: str, problem: str, language: str) -> str:
        """
        PHASE 5: DeepSeek-Coder 6.7B - Deep Code Analysis
        
        Focus:
        - Code maturity and production-readiness
        - Maintainability and extensibility
        - Scalability considerations
        - Professional coding standards
        """
        return f"""You are a senior code analyst evaluating professional code maturity and quality.

PROBLEM:
{problem}

SUBMITTED CODE ({language}):
```{language}
{code}
```

CONDUCT DEEP CODE ANALYSIS (0-100 scale):

1. CODE MATURITY (0-25 points):
   - Is the code production-ready?
   - Does it follow professional standards?
   - Is it enterprise-grade quality?

2. MAINTAINABILITY (0-25 points):
   - How easy is it to modify and extend?
   - Is there high cohesion and low coupling?
   - Clear separation of concerns?

3. SCALABILITY (0-25 points):
   - Would this scale to large inputs/datasets?
   - Performance under load conditions?
   - Memory efficiency at scale?

4. CODE MATURITY LEVEL (0-25 points):
   - Does code show junior/mid/senior level?
   - Problem-solving sophistication?
   - Architectural thinking evident?

RESPOND WITH VALID JSON ONLY (no markdown, no code blocks):
{{
  "maturity_score": <0-25>,
  "maintainability_score": <0-25>,
  "scalability_score": <0-25>,
  "maturity_level_score": <0-25>,
  "overall_score": <0-100>,
  "maturity_level": "junior|mid|senior|expert",
  "strengths": ["strength1", "strength2"],
  "improvement_areas": ["area1", "area2"],
  "architectural_insights": ["insight1", "insight2"]
}}"""

    @staticmethod
    def phase6_security(code: str, problem: str, language: str) -> str:
        """
        PHASE 6: StarCoder2 7B - Security & Best Practices
        
        Focus:
        - Security vulnerabilities
        - Best practices adherence
        - Error handling quality
        - Documentation and comments
        """
        return f"""You are a security expert and best practices auditor analyzing code quality.

PROBLEM:
{problem}

SUBMITTED CODE ({language}):
```{language}
{code}
```

ANALYZE SECURITY & BEST PRACTICES (0-100 scale):

1. SECURITY & VALIDATION (0-25 points):
   - Are there security vulnerabilities?
   - Input validation present?
   - Injection risks or unsafe patterns?

2. BEST PRACTICES (0-25 points):
   - Industry standard patterns used?
   - Modern coding practices?
   - Idiomatic {language} code?

3. ERROR HANDLING (0-25 points):
   - Proper exception/error handling?
   - Graceful degradation?
   - Defensive programming?

4. DOCUMENTATION & CLARITY (0-25 points):
   - Self-documenting code?
   - Clear intent and purpose?
   - Appropriate comments where needed?

RESPOND WITH VALID JSON ONLY (no markdown, no code blocks):
{{
  "security_score": <0-25>,
  "best_practices_score": <0-25>,
  "error_handling_score": <0-25>,
  "documentation_score": <0-25>,
  "overall_score": <0-100>,
  "security_level": "critical|high|medium|low|none",
  "vulnerabilities": ["vuln1", "vuln2"],
  "best_practices_followed": ["practice1", "practice2"],
  "recommendations": ["rec1", "rec2"]
}}"""
