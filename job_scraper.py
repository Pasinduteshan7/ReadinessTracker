import pandas as pd
from playwright.sync_api import sync_playwright
import time
from datetime import datetime
import sys
import os

# Import extract_skills from your Skill Extractor file
sys.path.append(os.path.dirname(__file__))
import importlib.util
spec = importlib.util.spec_from_file_location("skill_extractor", "Skill Extractor.py")
skill_extractor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(skill_extractor)
extract_skills = skill_extractor.extract_skills

class JobScraper:
    def __init__(self):
        self.jobs_data = []
        
    def scrape_job_page(self, url, company_name="Unknown"):
        """
        Scrape a single job posting page
        Args:
            url: The URL of the job posting
            company_name: Name of the company (optional)
        """
        print(f"\n🔍 Scraping: {url}")
        
        with sync_playwright() as p:
            # Launch browser (set headless=False to see the browser in action)
            browser = p.chromium.launch(headless=False)
            page = browser.new_page()
            
            try:
                # Navigate to the page
                page.goto(url, timeout=60000)
                
                # Wait for content to load (adjust selector based on the site)
                page.wait_for_timeout(3000)  # Wait 3 seconds for dynamic content
                
                # Extract the job title
                # These are common selectors - adjust based on the website
                job_title = self._extract_text(page, [
                    'h1',
                    '[class*="job-title"]',
                    '[class*="jobTitle"]',
                    '[data-testid*="title"]'
                ])
                
                # Extract the full job description
                job_description = self._extract_text(page, [
                    '[class*="description"]',
                    '[class*="job-description"]',
                    '[class*="jobDescription"]',
                    'article',
                    'main',
                    '.content'
                ])
                
                if not job_description:
                    print("⚠️ Could not find job description. Using full page text...")
                    job_description = page.inner_text('body')
                
                # Extract skills using your NLP function
                detected_skills = extract_skills(job_description)
                
                # Store the data
                job_data = {
                    'Job_ID': f"JOB_{len(self.jobs_data) + 1:03d}",
                    'Company': company_name,
                    'Job_Title': job_title or "Unknown Position",
                    'URL': url,
                    'Detected_Skills': ', '.join(detected_skills),
                    'Skills_Count': len(detected_skills),
                    'Description_Length': len(job_description),
                    'Scraped_Date': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                }
                
                self.jobs_data.append(job_data)
                
                print(f"✅ Found: {job_title}")
                print(f"📊 Skills: {detected_skills}")
                
            except Exception as e:
                print(f"❌ Error scraping {url}: {str(e)}")
                
            finally:
                browser.close()
    
    def _extract_text(self, page, selectors):
        """
        Try multiple CSS selectors and return the first match
        """
        for selector in selectors:
            try:
                element = page.locator(selector).first
                if element.count() > 0:
                    return element.inner_text()
            except:
                continue
        return ""
    
    def scrape_multiple_jobs(self, job_list):
        """
        Scrape multiple job postings
        Args:
            job_list: List of dictionaries with 'url' and 'company' keys
                     Example: [{'url': 'https://...', 'company': 'Google'}]
        """
        print(f"\n🚀 Starting to scrape {len(job_list)} job postings...")
        
        for idx, job in enumerate(job_list, 1):
            print(f"\n[{idx}/{len(job_list)}]")
            self.scrape_job_page(job['url'], job.get('company', 'Unknown'))
            time.sleep(2)  # Be polite - wait 2 seconds between requests
        
        print(f"\n✅ Scraping complete! Total jobs scraped: {len(self.jobs_data)}")
    
    def save_to_csv(self, filename='jobs_data.csv'):
        """
        Save the scraped data to a CSV file
        """
        if not self.jobs_data:
            print("⚠️ No data to save!")
            return
        
        df = pd.DataFrame(self.jobs_data)
        df.to_csv(filename, index=False, encoding='utf-8')
        print(f"\n💾 Data saved to: {filename}")
        print(f"📋 Total records: {len(df)}")
        
        # Display summary
        print("\n📊 Summary Statistics:")
        print(f"   - Average skills per job: {df['Skills_Count'].mean():.1f}")
        print(f"   - Most common company: {df['Company'].mode().values[0] if len(df) > 0 else 'N/A'}")
        
        return df
    
    def display_results(self):
        """
        Display the scraped data in a formatted table
        """
        if not self.jobs_data:
            print("⚠️ No data to display!")
            return
        
        df = pd.DataFrame(self.jobs_data)
        print("\n" + "="*80)
        print("SCRAPED JOB POSTINGS")
        print("="*80)
        print(df[['Job_ID', 'Company', 'Job_Title', 'Detected_Skills', 'Skills_Count']].to_string(index=False))


# =============================================================================
# EXAMPLE USAGE - Customize this section for your needs
# =============================================================================

if __name__ == "__main__":
    # Create scraper instance
    scraper = JobScraper()
    
    # Option 1: Scrape a single job posting
    print("\n" + "="*80)
    print("JOB SCRAPER - Single URL Mode")
    print("="*80)
    
    # Example: Replace with any job posting URL
    single_job_url = input("\n🔗 Enter a job posting URL (or press Enter to use example URLs): ").strip()
    
    if single_job_url:
        company = input("🏢 Enter company name (optional): ").strip() or "Unknown"
        scraper.scrape_job_page(single_job_url, company)
    else:
        # Option 2: Scrape multiple jobs from a list
        print("\n📋 Using example job URLs for demonstration...")
        
        # Example job URLs - Replace these with real URLs you want to scrape
        job_urls = [
            {
                'url': 'https://careers.google.com/jobs/results/123456789/',
                'company': 'Google'
            },
            {
                'url': 'https://careers.microsoft.com/example-job',
                'company': 'Microsoft'
            },
            # Add more URLs here
        ]
        
        print("\n⚠️ Note: Example URLs may not work. Please provide real job posting URLs.")
        print("You can:")
        print("1. Edit the 'job_urls' list in this script")
        print("2. Or run the script again and paste a URL when prompted")
        
        choice = input("\nDo you want to continue with example URLs? (y/n): ").lower()
        if choice == 'y':
            scraper.scrape_multiple_jobs(job_urls)
    
    # Display results
    scraper.display_results()
    
    # Save to CSV
    if scraper.jobs_data:
        save = input("\n💾 Save results to CSV? (y/n): ").lower()
        if save == 'y':
            filename = input("Enter filename (default: jobs_data.csv): ").strip() or "jobs_data.csv"
            scraper.save_to_csv(filename)
