import pandas as pd
from playwright.sync_api import sync_playwright
import time
from datetime import datetime
import sys
import os
import re

# Skills list for keyword-based extraction (no spacy dependency)
SKILLS_LIST = [
    # Programming Languages
    "Python", "Java", "JavaScript", "C++", "C#", "Go", "Rust", "TypeScript", "SQL", "Ruby", "PHP", "Kotlin", "Swift", "Scala", "R",
    # Frameworks & Libraries
    "React", "Angular", "Vue", "Node.js", "Express", "Django", "Flask", "Spring Boot", "FastAPI", "NestJS", "ASP.NET",
    # Databases
    "PostgreSQL", "MongoDB", "MySQL", "Redis", "Oracle", "DynamoDB", "Firebase", "Elasticsearch",
    # Cloud
    "AWS", "Azure", "GCP", "Google Cloud", "Heroku", "DigitalOcean",
    # DevOps
    "Docker", "Kubernetes", "Jenkins", "Git", "GitLab", "GitHub", "Terraform", "Ansible",
    # Other
    "REST", "GraphQL", "Kafka", "RabbitMQ", "Spark", "Hadoop", "TensorFlow", "PyTorch", "Pandas", "NumPy"
]

def extract_skills(text):
    """Simple keyword-based skill extractor (no spacy needed)"""
    if not text:
        return []
    
    found_skills = set()
    text_lower = text.lower()
    
    for skill in SKILLS_LIST:
        if skill.lower() in text_lower:
            found_skills.add(skill)
    
    return list(found_skills)

class LinkedInProfileScraper:
    def __init__(self):
        self.profiles_data = []
        
    def scrape_profile(self, linkedin_url):
        """
        Scrape a single LinkedIn profile
        Args:
            linkedin_url: The URL of the LinkedIn profile
        """
        print(f"\n🔍 Scraping LinkedIn Profile: {linkedin_url}")
        print("⚠️  LinkedIn requires authentication. A browser will open.")
        print("📌 Please log in to LinkedIn in the browser window.")
        print("⏰ You have 2 minutes to log in. The scraper will continue automatically...\n")
        
        with sync_playwright() as p:
            # Launch browser (set headless=False to see the browser in action)
            browser = p.chromium.launch(headless=False)
            page = browser.new_page()
            
            try:
                # First, navigate to LinkedIn home to allow login
                page.goto("https://www.linkedin.com/", wait_until="domcontentloaded")
                
                # Wait for user to log in (2 minutes)
                print("⏳ Waiting for authentication...")
                time.sleep(120)  # Wait 2 minutes for user to log in
                
                print("📍 Navigating to profile...")
                # Now navigate to the profile with longer timeout
                try:
                    page.goto(linkedin_url, wait_until="domcontentloaded", timeout=120000)
                except:
                    # If goto fails, try waiting for navigation
                    print("⚠️  Page load taking longer than expected, waiting...")
                    page.wait_for_load_state("networkidle", timeout=30000)
                
                # Wait for content to load
                time.sleep(3)  # Wait 3 seconds for dynamic content
                
                # Extract profile information
                profile_data = self._extract_profile_data(page, linkedin_url)
                
                if profile_data:
                    self.profiles_data.append(profile_data)
                    print(f"✅ Successfully scraped profile: {profile_data['Full_Name']}")
                    print(f"📊 Skills extracted: {profile_data['Skills_Count']}")
                    print(f"📜 Certifications: {profile_data['Certifications_Count']}")
                    print(f"📚 Courses: {profile_data['Courses_Count']}")
                else:
                    print("❌ Could not extract profile data")
                    print("   This usually means:")
                    print("   - You are not logged in to LinkedIn")
                    print("   - The profile page didn't load correctly")
                    print("   - The profile is private or has restricted access")
                
            except Exception as e:
                print(f"❌ Error scraping {linkedin_url}: {str(e)}")
                
            finally:
                browser.close()
    
    def _extract_profile_data(self, page, url):
        """
        Extract all profile information from LinkedIn profile page
        """
        try:
            # Get page title first (good indicator of successful load)
            page_title = page.title()
            print(f"📄 Page loaded: {page_title[:50]}...")
            
            # Extract full name - try multiple selectors
            full_name = self._extract_text(page, [
                'h1',
                '[class*="ProfileTopCard"]',
                '[data-test-id="top-card-profile-name"]',
                'h2[class*="name"]',
                '[class*="profile-name"]',
                '.pv-text-details__left-panel h1'
            ])
            
            # If we only got "Join LinkedIn", it means not authenticated
            if full_name and "join" in full_name.lower():
                print("❌ Profile not accessible. Please log in to LinkedIn first.")
                return None
            
            # Extract headline (current position)
            headline = self._extract_text(page, [
                '[class*="headline"]',
                'h2[class*="headline"]',
                '[data-test-id="top-card-headline"]',
                '.text-body-small.inline'
            ])
            
            # Extract about/summary
            about = self._extract_text(page, [
                '[aria-label="About"]',
                '[class*="about"]',
                '.pv-about__summary-text',
                'section[aria-label="About"]'
            ])
            
            # Extract experience
            experience_text = self._extract_text(page, [
                '[aria-label="Experience"]',
                '.pv-position-section',
                '[class*="experience"]',
                'section[aria-label="Experience"]'
            ])
            
            # Extract education
            education_text = self._extract_text(page, [
                '[aria-label="Education"]',
                '.pv-education-section',
                '[class*="education"]',
                'section[aria-label="Education"]'
            ])
            
            # Extract skills section
            skills_text = self._extract_text(page, [
                '[aria-label="Skills"]',
                '.pv-skill-categories-section',
                '[class*="skills"]',
                'section[aria-label="Skills"]'
            ])
            
            # Extract certifications/licenses
            certifications_text = self._extract_text(page, [
                '[aria-label="Licenses & Certifications"]',
                '.pv-certification-section',
                '[class*="certifications"]',
                'section[aria-label="Licenses & Certifications"]'
            ])
            
            # Extract courses
            courses_text = self._extract_text(page, [
                '[aria-label="Courses"]',
                '.pv-courses-section',
                '[class*="courses"]',
                'section[aria-label="Courses"]'
            ])
            
            # Extract recommendation count
            recommendations = self._extract_number_from_text(page, [
                'h4',
                'span',
                'div'
            ], 'recommendation')
            
            # Parse skills using NLP
            full_text = f"{headline} {about} {experience_text} {education_text} {skills_text} {certifications_text} {courses_text}"
            detected_skills = extract_skills(full_text)
            
            # Parse certifications
            certifications = self._extract_list_items(certifications_text)
            
            # Parse courses
            courses = self._extract_list_items(courses_text)
            
            # Parse education
            education = self._extract_list_items(education_text)
            
            profile_data = {
                'Profile_ID': f"LI_PROFILE_{len(self.profiles_data) + 1:04d}",
                'Full_Name': full_name or "Unknown Name",
                'Headline': headline or "N/A",
                'About': about[:500] if about else "N/A",  # Limit to 500 chars
                'Detected_Skills': ', '.join(detected_skills),
                'Skills_Count': len(detected_skills),
                'Certifications': ' | '.join(certifications) if certifications else "None",
                'Certifications_Count': len(certifications),
                'Courses': ' | '.join(courses) if courses else "None",
                'Courses_Count': len(courses),
                'Education': ' | '.join(education) if education else "None",
                'Education_Count': len(education),
                'Experience_Summary': experience_text[:300] if experience_text else "N/A",
                'Profile_URL': str(url),
                'Scraped_Date': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
            return profile_data
            
        except Exception as e:
            print(f"Error extracting profile data: {str(e)}")
            return None
    
    def _extract_text(self, page, selectors):
        """
        Try multiple CSS selectors and return the first match
        """
        for selector in selectors:
            try:
                elements = page.locator(selector)
                if elements.count() > 0:
                    # Try to get text from the first matching element
                    try:
                        text = elements.first.inner_text()
                        if text and text.strip() and "Join LinkedIn" not in text:
                            return text.strip()
                    except:
                        # Try alternative text extraction
                        try:
                            text = elements.first.text_content()
                            if text and text.strip() and "Join LinkedIn" not in text:
                                return text.strip()
                        except:
                            continue
            except:
                continue
        return ""
    
    def _extract_number_from_text(self, page, selectors, keyword):
        """
        Extract a number from text containing a specific keyword
        """
        for selector in selectors:
            try:
                elements = page.locator(selector)
                for i in range(min(elements.count(), 10)):
                    text = elements.nth(i).inner_text()
                    if keyword.lower() in text.lower():
                        # Extract number from text
                        numbers = re.findall(r'\d+', text)
                        if numbers:
                            return int(numbers[0])
            except:
                continue
        return 0
    
    def _extract_list_items(self, text):
        """
        Extract list items from extracted text (separated by newlines or bullet points)
        """
        if not text:
            return []
        
        # Split by common separators
        items = [item.strip() for item in re.split(r'\n|•|·|\|', text) if item.strip()]
        
        # Remove duplicates and sort
        items = list(set(items))[:10]  # Limit to top 10 items
        
        return items
    
    def scrape_multiple_profiles(self, profile_list):
        """
        Scrape multiple LinkedIn profiles
        Args:
            profile_list: List of LinkedIn profile URLs
                         Example: ['https://www.linkedin.com/in/user1', 'https://www.linkedin.com/in/user2']
        """
        print(f"\n🚀 Starting to scrape {len(profile_list)} LinkedIn profiles...")
        
        for idx, url in enumerate(profile_list, 1):
            print(f"\n[{idx}/{len(profile_list)}]")
            self.scrape_profile(url)
            time.sleep(3)  # Be polite - wait 3 seconds between requests (LinkedIn rate limiting)
        
        print(f"\n✅ Scraping complete! Total profiles scraped: {len(self.profiles_data)}")
    
    def save_to_csv(self, filename='linkedin_profiles_data.csv'):
        """
        Save the scraped data to a CSV file
        """
        if not self.profiles_data:
            print("⚠️ No data to save!")
            return
        
        df = pd.DataFrame(self.profiles_data)
        df.to_csv(filename, index=False, encoding='utf-8')
        print(f"\n💾 Data saved to: {filename}")
        print(f"📋 Total profiles: {len(df)}")
        
        # Display summary
        print("\n📊 Summary Statistics:")
        print(f"   - Average skills per profile: {df['Skills_Count'].mean():.1f}")
        print(f"   - Average certifications per profile: {df['Certifications_Count'].mean():.1f}")
        print(f"   - Average courses per profile: {df['Courses_Count'].mean():.1f}")
        print(f"   - Total unique skills detected: {len(set(' '.join(df['Detected_Skills']).split(', ')))}")
        
        return df
    
    def display_results(self):
        """
        Display the scraped data in a formatted table
        """
        if not self.profiles_data:
            print("⚠️ No data to display!")
            return
        
        df = pd.DataFrame(self.profiles_data)
        print("\n" + "="*100)
        print("SCRAPED LINKEDIN PROFILES")
        print("="*100)
        print(df[['Profile_ID', 'Full_Name', 'Headline', 'Detected_Skills', 'Skills_Count', 
                   'Certifications_Count', 'Courses_Count']].to_string(index=False))


# =============================================================================
# EXAMPLE USAGE - Customize this section for your needs
# =============================================================================

if __name__ == "__main__":
    # Create scraper instance
    scraper = LinkedInProfileScraper()
    
    print("\n" + "="*80)
    print("LINKEDIN PROFILE SCRAPER")
    print("="*80)
    print("\n⚠️  IMPORTANT: LinkedIn Requires Login")
    print("─" * 80)
    print("• This scraper opens your browser to access LinkedIn profiles")
    print("• You MUST be logged in to your LinkedIn account")
    print("• The browser will open and wait for you to log in (2 minutes)")
    print("• After logging in, the scraper automatically continues")
    print("• Keep the browser window open during scraping")
    print("─" * 80)
    
    # Option 1: Scrape a single profile
    print("\n📌 Single Profile Mode")
    single_url = input("\n🔗 Enter a LinkedIn profile URL (e.g., https://www.linkedin.com/in/username): ").strip()
    
    if single_url:
        scraper.scrape_profile(single_url)
    else:
        # Option 2: Scrape multiple profiles
        print("\n📋 Multiple Profiles Mode")
        print("📝 Enter LinkedIn profile URLs (one per line, press Enter twice when done):")
        
        profile_urls = []
        while True:
            url = input("🔗 LinkedIn URL: ").strip()
            if not url:
                break
            if url.lower().startswith('http'):
                profile_urls.append(url)
            else:
                print("❌ Please enter a valid URL starting with http")
        
        if profile_urls:
            print(f"\n📊 {len(profile_urls)} profile(s) added for scraping")
            confirm = input("Start scraping? (y/n): ").lower()
            if confirm == 'y':
                scraper.scrape_multiple_profiles(profile_urls)
        else:
            print("⚠️ No valid URLs provided. Please try again.")
    
    # Display results
    if scraper.profiles_data:
        scraper.display_results()
        
        # Save to CSV
        save = input("\n💾 Save results to CSV? (y/n): ").lower()
        if save == 'y':
            filename = input("Enter filename (default: linkedin_profiles_data.csv): ").strip() or "linkedin_profiles_data.csv"
            scraper.save_to_csv(filename)
    else:
        print("⚠️ No profiles were successfully scraped.")
