"""
LLM Prompts for code analysis
"""

SYSTEM_PROMPT = """You are an expert code reviewer and software engineer. 
Analyze the provided code repositories and provide detailed assessments.
Be objective, fair, and constructive in your feedback.
Always return responses in valid JSON format."""

ANALYSIS_PROMPT = """Analyze this GitHub repository code and provide scores for:
1. Code Quality (0-100): How clean, readable, and maintainable is the code?
2. Architecture (0-100): Is the code well-structured and organized?
3. Documentation (0-100): Is the code well-documented with comments/README?
4. Testing (0-100): Are there adequate tests? Is code testable?
5. Best Practices (0-100): Does it follow language best practices?

Do not favor longer code — concise, efficient solutions should score as well as verbose ones.

Use the following strict grading rubric as a baseline for all scores (0-100):
- 90-100 (Exceptional): Production-ready, enterprise-grade architecture. Flawless error handling, exhaustive tests, perfectly modular (FAANG Senior Engineer level).
- 70-89 (Strong): Great code structure, handles edge cases well, decent tests, easily maintainable (Solid Mid-Level Engineer).
- 50-69 (Average): Code works but is messy. Monolithic files, missing tests, hardcoded values (Bootcamp Grad / Junior Developer).
- 0-49 (Poor): Broken logic, massive security flaws, unreadable spaghetti code.

Also provide:
- Summary: 2-3 sentence overview
- Strengths: List 3 main strengths
- Improvements: List 3 areas to improve

IMPORTANT: Respond ONLY with valid JSON, no markdown code blocks.

{{
    "code_quality": 75,
    "architecture": 80,
    "documentation": 70,
    "testing": 65,
    "best_practices": 72,
    "summary": "...",
    "strengths": ["...", "...", "..."],
    "improvements": ["...", "...", "..."]
}}

Here is the code to analyze:
{code}
"""

BACKGROUND_ANALYSIS_PROMPT = """Based on this GitHub user's profile and repository metadata:
- Public repos count
- Followers and following
- Repository stars and forks
- Repository descriptions and sizes
- Recent activity

Rate on a scale of 0-100:
1. Authenticity (0-100): Is this a genuine developer with real projects?
2. Substance (0-100): Do the projects have real, meaningful code?
3. Community (0-100): Do projects have community engagement (stars, forks)?
4. Activity (0-100): Is the developer actively maintaining projects?
5. Diversity (0-100): Does the developer work on diverse projects?

Respond in JSON format only:
{
    "authenticity_score": 70,
    "substance_score": 75,
    "community_score": 60,
    "activity_score": 80,
    "diversity_score": 65,
    "overall_background_score": 70
}"""

FINAL_SCORING_PROMPT = """Based on the following analysis of a GitHub developer:

Background Metrics:
- Account age and activity
- Repository count and quality
- Community engagement (stars, forks, followers)

Deep Code Analysis Results:
- Code Quality Average: {code_quality}
- Architecture Average: {architecture}
- Documentation Average: {documentation}
- Testing Average: {testing}

Provide an overall employability assessment:
1. Overall Code Competency (0-100)
2. Professional Readiness (0-100)
3. Growth Potential (0-100)
4. Recommended Level: Junior/Mid/Senior

Respond only with valid JSON:
{
    "code_competency": 75,
    "professional_readiness": 70,
    "growth_potential": 80,
    "recommended_level": "Mid",
    "final_score": 75
}"""
