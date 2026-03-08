"""
Individual phase analyzers for the 4-phase sequential evaluation pipeline
Each phase uses a specific LLM model for targeted analysis
"""

import requests
import json
import time
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)


class PhaseAnalyzer:
    """Base class for phase analyzers"""
    
    def __init__(self, model_name: str, phase_name: str):
        self.model_name = model_name
        self.phase_name = phase_name
        self.base_url = "http://localhost:11434"
    
    def analyze(self, prompt: str, max_retries: int = 3) -> Optional[Dict]:
        """
        Execute analysis with retry logic
        
        Args:
            prompt: Analysis prompt
            max_retries: Number of retry attempts
            
        Returns:
            Dict with analysis results or None
        """
        
        for attempt in range(max_retries):
            try:
                logger.info(f"  {self.phase_name}: Analyzing with {self.model_name} (attempt {attempt + 1})")
                
                start_time = time.time()
                
                # Call Ollama API
                response = requests.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model_name,
                        "prompt": prompt,
                        "stream": False,
                        "temperature": 0.2
                    },
                    timeout=120
                )
                
                response.raise_for_status()
                result = response.json()
                
                elapsed = time.time() - start_time
                
                # Parse response
                parsed = self._parse_response(result.get("response", ""))
                
                if parsed:
                    logger.info(f"  ✓ {self.phase_name} complete in {elapsed:.1f}s - Score: {parsed.get('overall_score', 0)}/100")
                    parsed['execution_time'] = elapsed
                    parsed['phase'] = self.phase_name
                    parsed['model'] = self.model_name
                    return parsed
                else:
                    logger.warning(f"  Failed to parse response, retrying...")
                
            except Exception as e:
                logger.error(f"  {self.phase_name} error: {str(e)}")
                
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt
                    logger.info(f"  Retrying in {wait_time}s...")
                    time.sleep(wait_time)
        
        # All retries failed
        logger.error(f"  ✗ {self.phase_name} failed after {max_retries} attempts")
        return self._get_default_result()
    
    def _parse_response(self, response: str) -> Optional[Dict]:
        """Parse JSON response from LLM"""
        
        try:
            # Clean response
            response = response.strip()
            
            # Remove markdown code blocks if present
            if '```json' in response:
                response = response.split('```json')[1].split('```')[0].strip()
            elif '```' in response:
                response = response.split('```')[1].split('```')[0].strip()
            
            # Parse JSON
            data = json.loads(response)
            
            # Validate required fields
            if 'overall_score' not in data:
                logger.warning("Response missing overall_score")
                return None
            
            return data
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error: {e}")
            logger.debug(f"Raw response: {response[:300]}")
            return None
        except Exception as e:
            logger.error(f"Parse error: {e}")
            return None
    
    def _get_default_result(self) -> Dict:
        """Return default result when analysis fails"""
        
        return {
            'overall_score': 50,
            'phase': self.phase_name,
            'model': self.model_name,
            'error': True,
            'execution_time': 0
        }


class Phase1Analyzer(PhaseAnalyzer):
    """
    PHASE 1: CodeLlama 7B - Architecture & Structure Analysis
    
    Evaluates:
    - Code organization
    - Design patterns
    - Modularity
    - Readability
    """
    
    def __init__(self):
        super().__init__(
            model_name='codellama:7b',
            phase_name='PHASE 1: Architecture'
        )
    
    def analyze_architecture(self, code: str, problem: str, language: str) -> Dict:
        """Analyze code architecture and structure"""
        
        from ..config.algorithm_prompts import AlgorithmPrompts
        prompt = AlgorithmPrompts.phase1_architecture(code, problem, language)
        return self.analyze(prompt)


class Phase2Analyzer(PhaseAnalyzer):
    """
    PHASE 2: Qwen2.5-Coder 3B - Correctness & Best Practices
    
    Evaluates:
    - Logic correctness
    - Best practices
    - Code quality
    - Edge case handling
    """
    
    def __init__(self):
        super().__init__(
            model_name='qwen2.5-coder:3b',
            phase_name='PHASE 2: Correctness'
        )
    
    def analyze_correctness(self, code: str, problem: str, language: str, 
                           test_results: Dict) -> Dict:
        """Analyze code correctness and best practices"""
        
        from ..config.algorithm_prompts import AlgorithmPrompts
        prompt = AlgorithmPrompts.phase2_correctness(
            code, problem, language, test_results
        )
        return self.analyze(prompt)


class Phase3Analyzer(PhaseAnalyzer):
    """
    PHASE 3: DeepSeek-Coder 1.3B - Efficiency & Optimization
    
    Evaluates:
    - Time complexity
    - Space complexity
    - Optimization opportunities
    - Performance bottlenecks
    """
    
    def __init__(self):
        super().__init__(
            model_name='deepseek-coder:1.3b',
            phase_name='PHASE 3: Efficiency'
        )
    
    def analyze_efficiency(self, code: str, problem: str, language: str) -> Dict:
        """Analyze algorithm efficiency and optimization"""
        
        from ..config.algorithm_prompts import AlgorithmPrompts
        prompt = AlgorithmPrompts.phase3_efficiency(code, problem, language)
        return self.analyze(prompt)


class Phase4Analyzer(PhaseAnalyzer):
    """
    PHASE 4: DeepSeek-R1 1.5B - Reasoning & Edge Cases
    
    Evaluates:
    - Solution approach quality
    - Edge case coverage
    - Robustness
    - Critical thinking
    """
    
    def __init__(self):
        super().__init__(
            model_name='deepseek-r1:1.5b',
            phase_name='PHASE 4: Reasoning'
        )
    
    def analyze_reasoning(self, code: str, problem: str, language: str,
                         phase1_result: Dict, phase2_result: Dict, 
                         phase3_result: Dict) -> Dict:
        """Perform deep reasoning analysis considering other phases"""
        
        from ..config.algorithm_prompts import AlgorithmPrompts
        prompt = AlgorithmPrompts.phase4_reasoning(
            code, problem, language,
            phase1_result, phase2_result, phase3_result
        )
        return self.analyze(prompt)


class Phase5Analyzer(PhaseAnalyzer):
    """
    PHASE 5: DeepSeek-Coder 6.7B - Deep Code Analysis
    
    Evaluates:
    - Code maturity level
    - Maintainability
    - Scalability
    - Professional standards
    """
    
    def __init__(self):
        super().__init__(
            model_name='deepseek-coder:6.7b',
            phase_name='PHASE 5: Deep Analysis'
        )
    
    def analyze_deep_code(self, code: str, problem: str, language: str) -> Dict:
        """Perform deep code maturity and maintainability analysis"""
        
        from ..config.algorithm_prompts import AlgorithmPrompts
        prompt = AlgorithmPrompts.phase5_deep_analysis(code, problem, language)
        return self.analyze(prompt)


class Phase6Analyzer(PhaseAnalyzer):
    """
    PHASE 6: StarCoder2 7B - Security & Best Practices
    
    Evaluates:
    - Security vulnerabilities
    - Industry best practices
    - Error handling quality
    - Documentation completeness
    """
    
    def __init__(self):
        super().__init__(
            model_name='starcoder2:7b',
            phase_name='PHASE 6: Security & Practices'
        )
    
    def analyze_security(self, code: str, problem: str, language: str) -> Dict:
        """Analyze security, best practices, and error handling"""
        
        from ..config.algorithm_prompts import AlgorithmPrompts
        prompt = AlgorithmPrompts.phase6_security(code, problem, language)
        return self.analyze(prompt)
