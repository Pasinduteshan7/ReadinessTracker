"""
JobDemandModule - Standalone Python module for job scraping and analysis
Designed to be imported and used by other parts of the ReadinessTracker project

Usage:
    from job_demand import JobDemandCollector
    
    collector = JobDemandCollector(mysql_config)
    jobs = collector.collect_jobs()
    collector.save_to_database(jobs)
"""

import os
import sys
import json
import logging
import csv
from typing import List, Dict, Optional
from datetime import datetime
import re
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from skill_extractor import extract_skills, get_skill_categories

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class JobDemandCollector:
    """
    Main API for job collection, enrichment, and storage
    Can be imported from anywhere in the project
    """
    
    def __init__(self, mysql_config: Optional[Dict] = None, csv_output: bool = True):
        """
        Initialize JobDemandCollector
        
        Args:
            mysql_config: Dict with keys: host, user, password, database
            csv_output: If True, also save to CSV for backwards compatibility
        """
        self.mysql_config = mysql_config
        self.csv_output = csv_output
        self.jobs_collection = []
        self.mysql_connection = None
        
        if mysql_config:
            self._init_mysql_connection()
    
    def _init_mysql_connection(self):
        """Initialize MySQL connection if config provided"""
        try:
            import mysql.connector
            self.mysql_connection = mysql.connector.connect(**self.mysql_config)
            logger.info("MySQL connection established")
        except ImportError:
            logger.warning("mysql-connector-python not installed. Install with: pip install mysql-connector-python")
        except Exception as e:
            logger.error(f"Failed to connect to MySQL: {e}")
    
    def collect_jobs_from_apis(self, sources: List[str] = None, limit_per_source: int = 50) -> List[Dict]:
        """
        Collect jobs from public APIs
        
        Args:
            sources: List of API sources to use (default: all)
            limit_per_source: Max jobs per API source
            
        Returns:
            List of job dictionaries with enriched data
        """
        if sources is None:
            sources = ['remotive', 'remoteok', 'arbeitnow']
        
        logger.info(f"Collecting jobs from API sources: {sources}")
        
        try:
            # Import the job scraper module (support both job_scraper.py and job_scraper (1).py)
            collect_public_api_jobs = self._load_collect_public_api_jobs()
            
            jobs = collect_public_api_jobs(sources=sources, limit=limit_per_source)
            self.jobs_collection = jobs
            logger.info(f"Collected {len(jobs)} jobs total")
            return jobs
            
        except Exception as e:
            logger.error(f"Error collecting jobs from APIs: {e}")
            return []

    def _load_collect_public_api_jobs(self):
        """Load collect_public_api_jobs from the existing scraper file."""
        try:
            from job_scraper import JobScraper

            def _run_scraper(*, sources=None, limit=25):
                scraper = JobScraper()
                scraper.collect_public_api_jobs(limit_per_source=limit)
                return scraper.jobs

            return _run_scraper
        except Exception:
            import importlib.util

            scraper_candidates = sorted(Path(__file__).parent.glob("job_scraper*.py"))
            for scraper_path in scraper_candidates:
                spec = importlib.util.spec_from_file_location("job_scraper_dynamic", scraper_path)
                if spec and spec.loader:
                    module = importlib.util.module_from_spec(spec)
                    spec.loader.exec_module(module)
                    if hasattr(module, "JobScraper"):

                        def _run_scraper(*, sources=None, limit=25, _module=module):
                            scraper = _module.JobScraper()
                            scraper.collect_public_api_jobs(limit_per_source=limit)
                            return scraper.jobs

                        return _run_scraper

            raise ImportError("Could not locate collect_public_api_jobs in any job_scraper*.py file")
    
    def enrich_jobs_with_skills(self, jobs: List[Dict]) -> List[Dict]:
        """
        Add detected skills to each job
        
        Args:
            jobs: List of job dictionaries
            
        Returns:
            Jobs with skills_detected and skill_categories added
        """
        logger.info("Enriching jobs with skill detection")
        
        for job in jobs:
            # Extract skills from job title + description
            job_text = f"{job.get('job_title', '')} {job.get('job_description', '')}"
            skills = extract_skills(job_text)
            
            job['detected_skills'] = ', '.join(skills) if skills else ""
            job['skills_count'] = len(skills)
            
            # Get skill categories
            categories = get_skill_categories(skills)
            job['skill_categories'] = ', '.join(categories) if categories else ""
        
        logger.info("Skill enrichment complete")
        return jobs
    
    def save_to_database(self, jobs: List[Dict]) -> bool:
        """
        Save jobs to MySQL database
        
        Args:
            jobs: List of job dictionaries
            
        Returns:
            True if successful, False otherwise
        """
        if not self.mysql_connection:
            logger.warning("MySQL not configured, skipping database save")
            return False
        
        try:
            import mysql.connector
            cursor = self.mysql_connection.cursor(dictionary=True)
            
            logger.info(f"Saving {len(jobs)} jobs to MySQL")
            
            for job in jobs:
                # Parse salary if available
                salary_min, salary_max = self._parse_salary_range(job.get('salary_range', ''))
                
                query = """
                    INSERT INTO jobs_data 
                    (job_id, company, job_title, location, job_type, experience_level, 
                     salary_range, salary_min, salary_max, detected_skills, skills_count, 
                     skill_categories, scraped_date)
                    VALUES (%(job_id)s, %(company)s, %(job_title)s, %(location)s, %(job_type)s, 
                            %(experience_level)s, %(salary_range)s, %(salary_min)s, %(salary_max)s,
                            %(detected_skills)s, %(skills_count)s, %(skill_categories)s, %(scraped_date)s)
                    ON DUPLICATE KEY UPDATE
                        updated_at = CURRENT_TIMESTAMP
                """
                
                cursor.execute(query, {
                    'job_id': job.get('job_id', ''),
                    'company': job.get('company', '')[:255],
                    'job_title': job.get('job_title', '')[:255],
                    'location': job.get('location', '')[:255],
                    'job_type': job.get('job_type', '')[:50],
                    'experience_level': job.get('experience_level', '')[:50],
                    'salary_range': job.get('salary_range', ''),
                    'salary_min': salary_min,
                    'salary_max': salary_max,
                    'detected_skills': job.get('detected_skills', ''),
                    'skills_count': job.get('skills_count', 0),
                    'skill_categories': job.get('skill_categories', ''),
                    'scraped_date': datetime.now()
                })
            
            self.mysql_connection.commit()
            logger.info(f"Successfully saved {len(jobs)} jobs to MySQL")
            return True
            
        except Exception as e:
            logger.error(f"Error saving to MySQL: {e}")
            if self.mysql_connection:
                self.mysql_connection.rollback()
            return False
    
    def save_to_csv(self, filename: str = 'jobs_data.csv') -> bool:
        """
        Save jobs to CSV file
        
        Args:
            filename: Output CSV filename
            
        Returns:
            True if successful, False otherwise
        """
        try:
            if not self.jobs_collection:
                logger.warning("No jobs available to save to CSV")
                return False

            fieldnames = list(self.jobs_collection[0].keys())
            try:
                with open(filename, "w", newline="", encoding="utf-8") as f:
                    writer = csv.DictWriter(f, fieldnames=fieldnames)
                    writer.writeheader()
                    writer.writerows(self.jobs_collection)
            except PermissionError:
                fallback = Path(filename).with_name(f"{Path(filename).stem}_fallback.csv")
                with open(fallback, "w", newline="", encoding="utf-8") as f:
                    writer = csv.DictWriter(f, fieldnames=fieldnames)
                    writer.writeheader()
                    writer.writerows(self.jobs_collection)
                logger.warning(f"Permission denied for {filename}; wrote fallback CSV to {fallback}")
            logger.info(f"Saved {len(self.jobs_collection)} jobs to {filename}")
            return True
        except Exception as e:
            logger.error(f"Error saving to CSV: {e}")
            return False
    
    def get_top_demanded_jobs(self, n: int = 5) -> List[Dict]:
        """
        Get top N most demanded job titles
        
        Args:
            n: Number of top jobs to return
            
        Returns:
            List of top job objects with counts and skills
        """
        if not self.mysql_connection:
            logger.error("MySQL not available")
            return []
        
        try:
            import mysql.connector
            cursor = self.mysql_connection.cursor(dictionary=True)
            
            query = f"""
                SELECT 
                    job_title,
                    COUNT(*) as count,
                    AVG(salary_min) as avg_salary_min,
                    AVG(salary_max) as avg_salary_max,
                    GROUP_CONCAT(DISTINCT detected_skills SEPARATOR '|') as all_skills
                FROM jobs_data
                GROUP BY job_title
                ORDER BY count DESC
                LIMIT {n}
            """
            
            cursor.execute(query)
            results = cursor.fetchall()
            logger.info(f"Retrieved top {n} demanded jobs")
            return results
            
        except Exception as e:
            logger.error(f"Error retrieving top demanded jobs: {e}")
            return []
    
    def get_top_languages(self, n: int = 10) -> List[Dict]:
        """
        Get top N programming languages across jobs
        
        Args:
            n: Number of top languages to return
            
        Returns:
            List of languages with counts
        """
        if not self.mysql_connection:
            logger.error("MySQL not available")
            return []
        
        try:
            import mysql.connector
            cursor = self.mysql_connection.cursor(dictionary=True)
            
            query = """
                SELECT 
                    skill_name,
                    count,
                    percentage
                FROM skills_demand
                WHERE category = 'Language'
                ORDER BY count DESC
                LIMIT %s
            """
            
            cursor.execute(query, (n,))
            results = cursor.fetchall()
            logger.info(f"Retrieved top {n} languages")
            return results
            
        except Exception as e:
            logger.error(f"Error retrieving top languages: {e}")
            return []
    
    @staticmethod
    def _parse_salary_range(salary_str: str) -> tuple:
        """
        Parse salary string and return min, max as integers
        
        Returns:
            (salary_min, salary_max) tuple
        """
        if not salary_str:
            return None, None
        
        try:
            # Extract numbers (handle k suffix for thousands)
            matches = re.findall(r'(\d+(?:k|K)?)', salary_str.lower())
            if not matches:
                return None, None
            
            values = []
            for match in matches[:2]:  # Take first 2 matches
                val = int(match.lower().replace('k', ''))
                if 'k' in match.lower():
                    val *= 1000
                values.append(val)
            
            if len(values) == 2:
                return min(values), max(values)
            elif len(values) == 1:
                return values[0], values[0]
        except Exception as e:
            logger.error(f"Error parsing salary: {e}")
        
        return None, None
    
    def run_full_collection_pipeline(self) -> Dict:
        """
        Execute complete pipeline: collect → enrich → save
        
        Returns:
            Dictionary with execution summary
        """
        logger.info("Starting full collection pipeline")
        
        summary = {
            'timestamp': datetime.now().isoformat(),
            'jobs_collected': 0,
            'jobs_saved_to_db': False,
            'jobs_saved_to_csv': False,
            'errors': []
        }
        
        try:
            # Collect
            jobs = self.collect_jobs_from_apis()
            summary['jobs_collected'] = len(jobs)
            
            if not jobs:
                summary['errors'].append('No jobs collected from APIs')
                return summary
            
            # Enrich
            jobs = self.enrich_jobs_with_skills(jobs)
            
            # Save to both destinations
            if self.mysql_connection:
                summary['jobs_saved_to_db'] = self.save_to_database(jobs)
            
            if self.csv_output:
                summary['jobs_saved_to_csv'] = self.save_to_csv()
            
            logger.info(f"Pipeline complete: {summary}")
            return summary
            
        except Exception as e:
            logger.error(f"Pipeline failed: {e}")
            summary['errors'].append(str(e))
            return summary


def get_mysql_config_from_springboot() -> Optional[Dict]:
    """
    Helper function to load MySQL config from Spring Boot application.properties
    This allows Python to use the same database as Spring Boot
    
    Returns:
        Dictionary with MySQL connection config, or None if not found
    """
    config_path = Path(__file__).parent.parent / 'readiness-tracker-backend' / 'src' / 'main' / 'resources' / 'application.properties'
    
    if not config_path.exists():
        logger.warning(f"Spring Boot config not found at {config_path}")
        return None
    
    try:
        config = {}
        with open(config_path, 'r') as f:
            for line in f:
                if line.startswith('spring.datasource.url'):
                    # Extract host and database from JDBC URL
                    # jdbc:mysql://localhost:3306/readiness_tracker
                    match = re.search(r'//([^:]+):(\d+)/(\w+)', line)
                    if match:
                        config['host'] = match.group(1)
                        config['port'] = int(match.group(2))
                        config['database'] = match.group(3)
                
                elif line.startswith('spring.datasource.username'):
                    config['user'] = line.split('=')[1].strip()
                
                elif line.startswith('spring.datasource.password'):
                    config['password'] = line.split('=')[1].strip()
        
        logger.info(f"Loaded config from Spring Boot: {config.get('database')} @ {config.get('host')}")
        return config if all(k in config for k in ['host', 'database', 'user', 'password']) else None
        
    except Exception as e:
        logger.error(f"Error reading Spring Boot config: {e}")
        return None


if __name__ == "__main__":
    # Example usage when run as a standalone script
    config = get_mysql_config_from_springboot()
    
    collector = JobDemandCollector(
        mysql_config=config,
        csv_output=True
    )
    
    summary = collector.run_full_collection_pipeline()
    print(json.dumps(summary, indent=2))
