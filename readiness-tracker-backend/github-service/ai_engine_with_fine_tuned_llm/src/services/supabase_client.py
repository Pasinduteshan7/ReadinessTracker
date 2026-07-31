"""
Supabase client for storing and retrieving analysis results
"""

import os
from supabase import create_client, Client
from datetime import datetime
from typing import Dict, Optional
from src.utils.logger import setup_logger
from src.config.settings import settings

logger = setup_logger(__name__)

class SupabaseClient:
    """Handle all Supabase database operations"""
    
    def __init__(self):
        self.client: Optional[Client] = None
        
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            logger.warning("⚠️ Supabase credentials not configured. Results won't be saved.")
            return
        
        self.client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY
        )
    
    async def store_analysis_result(self, result_dict: Dict) -> bool:
        """
        Store analysis result in Supabase
        
        Args:
            result_dict: Complete analysis result
            
        Returns:
            True if successful, False otherwise
        """
        
        try:
            if not settings.SUPABASE_URL:
                logger.warning("Supabase not configured, skipping storage")
                return False
            
            data = {
                "user_id": result_dict.get("user_id"),
                "github_username": result_dict.get("github_username"),
                "engine_version": result_dict.get("engine_version"),
                "model_name": result_dict.get("model_name"),
                
                # JSON results
                "background_analysis": result_dict.get("background_analysis"),
                "selected_repositories": result_dict.get("selected_repositories"),
                "selection_rationale": result_dict.get("selection_rationale"),
                "deep_analysis_results": result_dict.get("deep_analysis_results"),
                
                # Scores
                "overall_score": result_dict.get("overall_score"),
                "code_quality_score": result_dict.get("code_quality_score"),
                "architecture_score": result_dict.get("architecture_score"),
                "documentation_score": result_dict.get("documentation_score"),
                "testing_score": result_dict.get("testing_score"),
                "best_practices_score": result_dict.get("best_practices_score"),
                
                # Employability
                "employability_percentile": result_dict.get("employability_percentile"),
                "employability_tier": result_dict.get("employability_tier"),
                "professional_readiness": result_dict.get("professional_readiness"),
                "growth_potential": result_dict.get("growth_potential"),
                "recommended_level": result_dict.get("recommended_level"),
                
                # Metadata
                "analysis_duration_seconds": result_dict.get("analysis_duration_seconds"),
                "status": result_dict.get("status", "completed"),
                "error_message": result_dict.get("error_message"),
                "created_at": datetime.utcnow().isoformat()
            }
            
            # Insert to Supabase (Disabled since Java Backend handles it)
            # if self.client is None:
            #     logger.warning("Supabase client unavailable, skipping storage")
            #     return False
            # response = self.client.table("github_analysis_results").insert(data).execute()
            
            # logger.info(f"✅ Stored analysis for {result_dict.get('github_username')}")
            return True
        
        except Exception as e:
            logger.error(f"❌ Failed to store analysis in Supabase: {e}")
            return False
    
    async def get_latest_analysis(self, github_username: str) -> Optional[Dict]:
        """
        Get latest analysis for a GitHub user
        
        Args:
            github_username: GitHub username
            
        Returns:
            Analysis result dict or None
        """
        
        try:
            if not settings.SUPABASE_URL:
                return None
            
            if self.client is None:
                return None

            response = self.client.table("github_analysis_results").select("*").eq(
                "github_username", github_username
            ).eq(
                "engine_version", settings.ENGINE_VERSION
            ).order(
                "created_at", desc=True
            ).limit(1).execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        
        except Exception as e:
            logger.error(f"Error fetching analysis: {e}")
            return None
    
    async def get_user_history(self, github_username: str, limit: int = 10) -> list:
        """
        Get analysis history for a user
        """
        
        try:
            if not settings.SUPABASE_URL:
                return []
            
            if self.client is None:
                return []

            response = self.client.table("github_analysis_results").select("*").eq(
                "github_username", github_username
            ).eq(
                "engine_version", settings.ENGINE_VERSION
            ).order(
                "created_at", desc=True
            ).limit(limit).execute()
            
            return response.data if response.data else []
        
        except Exception as e:
            logger.error(f"Error fetching history: {e}")
            return []

# Global instance
supabase_client = SupabaseClient()
