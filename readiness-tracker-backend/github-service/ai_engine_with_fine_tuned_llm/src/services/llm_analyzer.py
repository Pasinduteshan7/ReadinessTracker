"""
Fine-Tuned LLM for code analysis
"""

import json
import httpx
from typing import Dict, Optional
from src.utils.logger import setup_logger
from src.config.settings import settings
from src.config.prompts import ANALYSIS_PROMPT
import re

logger = setup_logger(__name__)

class FineTunedLLMAnalyzer:
    """Analyze code using fine-tuned LLM"""
    
    def __init__(self):
        self.model_name = settings.LLM_MODEL_NAME
        self.provider = settings.LLM_PROVIDER
        self.api_key = settings.LLM_API_KEY
        self.temperature = settings.LLM_TEMPERATURE
        self.max_tokens = settings.LLM_MAX_TOKENS
    
    async def analyze_repository_code(self, repo_name: str, code_content: str) -> Dict:
        """
        Analyze code using fine-tuned LLM
        
        Returns:
            {
                "code_quality": 0-100,
                "architecture": 0-100,
                "documentation": 0-100,
                "testing": 0-100,
                "best_practices": 0-100,
                "summary": "...",
                "strengths": [...],
                "improvements": [...]
            }
        """
        
        logger.info(f"🧠 Analyzing code for {repo_name} with {self.provider}...")
        
        try:
            prompt = ANALYSIS_PROMPT.format(code=code_content[:settings.CODE_SNIPPET_MAX_LENGTH])
            
            if self.provider == "together":
                result = await self._call_together_ai(repo_name, prompt)
            elif self.provider == "openai":
                result = await self._call_openai(repo_name, prompt)
            elif self.provider == "ollama":
                result = await self._call_ollama(repo_name, prompt)
            elif self.provider == "huggingface":
                result = await self._call_huggingface(repo_name, prompt)
            else:
                raise ValueError(f"Unknown provider: {self.provider}")
            
            return result
        
        except Exception as e:
            logger.error(f"❌ LLM analysis failed for {repo_name}: {e}")
            return self._default_scores()
    
    async def _call_together_ai(self, repo_name: str, prompt: str) -> Dict:
        """Call Together.ai fine-tuned model"""
        
        try:
            async with httpx.AsyncClient(timeout=settings.LLM_TIMEOUT) as client:
                response = await client.post(
                    "https://api.together.xyz/inference",
                    json={
                        "model": self.model_name,
                        "prompt": prompt,
                        "max_tokens": self.max_tokens,
                        "temperature": self.temperature,
                        "top_p": 0.7
                    },
                    headers={"Authorization": f"Bearer {self.api_key}"}
                )
            
            if response.status_code != 200:
                raise Exception(f"Together.ai error: {response.text}")
            
            result = response.json()
            output_text = result.get("output", {}).get("choices", [{}])[0].get("text", "{}")
            
            return self._parse_json_response(repo_name, output_text)
        
        except Exception as e:
            logger.error(f"Together.ai call failed for {repo_name}: {e}")
            return self._default_scores()
    
    async def _call_openai(self, repo_name: str, prompt: str) -> Dict:
        """Call OpenAI fine-tuned model"""
        
        try:
            async with httpx.AsyncClient(timeout=settings.LLM_TIMEOUT) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    json={
                        "model": self.model_name,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": self.temperature,
                        "max_tokens": self.max_tokens
                    },
                    headers={"Authorization": f"Bearer {self.api_key}"}
                )
            
            if response.status_code != 200:
                raise Exception(f"OpenAI error: {response.text}")
            
            result = response.json()
            output_text = result["choices"][0]["message"]["content"]
            
            return self._parse_json_response(repo_name, output_text)
        
        except Exception as e:
            logger.error(f"OpenAI call failed for {repo_name}: {e}")
            return self._default_scores()
    
    async def _call_ollama(self, repo_name: str, prompt: str) -> Dict:
        """Call local Ollama model"""
        
        try:
            async with httpx.AsyncClient(timeout=settings.LLM_TIMEOUT) as client:
                response = await client.post(
                    "http://localhost:11434/api/generate",
                    json={
                        "model": self.model_name,
                        "prompt": prompt,
                        "stream": False,
                        "temperature": self.temperature,
                        "format": "json"
                    }
                )
            
            if response.status_code != 200:
                raise Exception(f"Ollama error: {response.text}")
            
            result = response.json()
            output_text = result.get("response", "{}")
            
            return self._parse_json_response(repo_name, output_text)
        
        except Exception as e:
            logger.error(f"Ollama call failed for {repo_name}: {e}")
            return self._default_scores()
    
    async def _call_huggingface(self, repo_name: str, prompt: str) -> Dict:
        """Call Hugging Face Inference API"""
        
        try:
            async with httpx.AsyncClient(timeout=settings.LLM_TIMEOUT) as client:
                response = await client.post(
                    f"https://api-inference.huggingface.co/models/{self.model_name}",
                    json={"inputs": prompt},
                    headers={"Authorization": f"Bearer {self.api_key}"}
                )
            
            if response.status_code != 200:
                raise Exception(f"HuggingFace error: {response.text}")
            
            result = response.json()
            if isinstance(result, list):
                output_text = result[0].get("generated_text", "{}")
            else:
                output_text = result.get("generated_text", "{}")
            
            return self._parse_json_response(repo_name, output_text)
        
        except Exception as e:
            logger.error(f"HuggingFace call failed for {repo_name}: {e}")
            return self._default_scores()
    
    def _parse_json_response(self, repo_name: str, text: str) -> Dict:
        """Extract JSON from LLM response"""
        
        try:
            # Try direct JSON parse
            return json.loads(text)
        except json.JSONDecodeError:
            pass
        
        # Try to extract JSON from markdown code block
        match = re.search(r"```(?:json)?\s*(.*?)\s*```", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass
        
        # Try to extract JSON object from text
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass
        
        logger.warning(f"Failed to parse LLM response for {repo_name}: {text[:200]}")
        return self._default_scores()
    
    def _default_scores(self) -> Dict:
        """Return default scores when analysis fails"""
        return {
            "code_quality": 50,
            "architecture": 50,
            "documentation": 50,
            "testing": 50,
            "best_practices": 50,
            "summary": "Analysis completed with default scores",
            "strengths": ["Unable to complete analysis"],
            "improvements": ["Please review code manually"]
        }

# Global instance
llm_analyzer = FineTunedLLMAnalyzer()
