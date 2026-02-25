# LinkedIn Profile Scraper

A web scraping tool to extract professional information from LinkedIn profiles, including skills, certifications, courses, education, and more.

## Features

✨ **What it Extracts:**
- **Profile Information**: Name, Headline, Bio/About
- **Skills**: Automatically detected using NLP from profile content
- **Certifications & Licenses**: All certifications and credentials
- **Courses**: Educational courses completed
- **Education**: Universities, degrees, and other educational institutions
- **Experience**: Job titles and employment history
- **Metadata**: Links, extraction date, and more

📊 **Output:**
- Saves results to CSV file with detailed statistics
- Displays summary statistics (average skills per profile, etc.)
- Tabular display of scraped data

## Requirements

- Python 3.8+
- Playwright browser automation
- Pandas for data processing
- spaCy for NLP skill extraction

## Installation

### 1. Clone or extract the project

```bash
cd ReadinessTracker
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

**Note**: On first run, Playwright will download browser binaries (chromium). This is automatic.

## Usage

### Running the LinkedIn Scraper

```bash
python linkedin_scraper.py
```

### Single Profile Scraping

When prompted, paste a LinkedIn profile URL:
```
🔗 Enter a LinkedIn profile URL (e.g., https://www.linkedin.com/in/username): https://www.linkedin.com/in/john-doe
```

### Multiple Profile Scraping

Press Enter without entering a URL to enter multiple profile mode:
```
📋 Multiple Profiles Mode
Enter LinkedIn profile URLs (one per line, press Enter twice when done):
🔗 LinkedIn URL: https://www.linkedin.com/in/profile1
🔗 LinkedIn URL: https://www.linkedin.com/in/profile2
🔗 LinkedIn URL: 
```

### Output Files

The scraper generates:
- `linkedin_profiles_data.csv` - Contains all extracted profile data with columns:
  - Profile_ID
  - Full_Name
  - Headline
  - Detected_Skills
  - Skills_Count
  - Certifications
  - Certifications_Count
  - Courses
  - Courses_Count
  - Education
  - Education_Count
  - Experience_Summary
  - Profile_URL
  - Scraped_Date

## Finding LinkedIn Profile URLs

LinkedIn profile URLs typically follow this format:
```
https://www.linkedin.com/in/username
https://www.linkedin.com/in/username/
```

**How to get a profile URL:**
1. Visit someone's LinkedIn profile
2. Copy the URL from the address bar
3. It should start with `https://www.linkedin.com/in/`

## Important Notes

⚠️ **LinkedIn ToS**
- Always ensure you comply with LinkedIn's Terms of Service
- Use this tool responsibly and ethically
- Respect rate limiting (3-5 second delays between profiles)
- Do not use for spam, harassment, or malicious purposes

🔒 **Privacy & Ethics**
- Only scrape profiles with permission
- Do not scrape private profiles
- Maintain data privacy and security
- Use extracted data ethically and legally

⏱️ **Performance**
- Each profile takes 5-10 seconds to scrape (including wait times)
- 10 profiles ≈ 1-2 minutes
- LinkedIn may rate limit aggressive scraping

## Troubleshooting

### Issue: "Timed out waiting for page to load"
- Solution: Increase the wait timeout in the code (currently 5000ms)
- LinkedIn may be slow to load; try again later

### Issue: "Could not extract profile data"
- This happens if:
  - The profile is private
  - The URL is incorrect
  - The profile is a company page (not a person)
  - LinkedIn is blocking automated access

### Issue: "ModuleNotFoundError: No module named 'spacy'"
- Solution: Run `pip install spacy` and `python -m spacy download en_core_web_sm`

### Issue: Playwright not found
- Solution: Run `pip install playwright` and `python -m playwright install`

## File Structure

```
├── linkedin_scraper.py           # Main LinkedIn scraper
├── Skill Extractor.py            # NLP-based skill detection
├── requirements.txt              # Python dependencies
├── README.md                     # This file
└── linkedin_profiles_data.csv    # Output file (generated)
```

## Skills Detected

The skill extractor recognizes 100+ technical skills including:
- **Languages**: Python, JavaScript, Java, C++, C#, Go, Rust, TypeScript, SQL, etc.
- **Frameworks**: React, Angular, Vue, Node.js, Django, Flask, Spring Boot, etc.
- **Databases**: PostgreSQL, MongoDB, MySQL, Redis, DynamoDB, etc.
- **Cloud**: AWS, Azure, GCP, Heroku, DigitalOcean, etc.
- **DevOps**: Docker, Kubernetes, Jenkins, Git, Terraform, Ansible, etc.
- **Tools & Platforms**: Salesforce, ServiceNow, Jira, Slack, etc.

See `Skill Extractor.py` for the complete list.

## Example Output

```
╔════════════════════════════════════════════════════════════════════════════════════╗
║                        SCRAPED LINKEDIN PROFILES                                  ║
╠════════════════════════════════════════════════════════════════════════════════════╣
║ Profile_ID    │ Full_Name      │ Headline                │ Skills_Count │ Certs │ Courses
║ LI_PROFILE_001│ John Doe       │ Software Engineer @tech │ 12           │ 3     │ 2
║ LI_PROFILE_002│ Jane Smith     │ Product Manager         │ 8            │ 1     │ 4
╚════════════════════════════════════════════════════════════════════════════════════╝

📊 Summary Statistics:
   - Average skills per profile: 10.0
   - Average certifications per profile: 2.0
   - Average courses per profile: 3.0
   - Total unique skills detected: 18
```

## Author Notes

This scraper was created as a tool for:
- Recruiting and talent acquisition research
- Competitive analysis
- Job market analysis
- Professional network analysis

Always use ethically and within legal boundaries!

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Verify your LinkedIn profile URLs are correct
3. Ensure all dependencies are installed
4. Check net internet connection

---

**Last Updated**: February 2026
