# LinkedIn Profile Scraper - Setup Guide

## Quick Start (5 minutes)

### Step 1: Install Python Dependencies

Open PowerShell in your project directory and run:

```powershell
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### Step 2: Run the Scraper

```powershell
python linkedin_scraper.py
```

### Step 3: Enter LinkedIn Profile URL

When prompted, paste a LinkedIn profile URL:
```
🔗 Enter a LinkedIn profile URL: https://www.linkedin.com/in/example-person
```

That's it! The scraper will:
1. Open your browser (you can see it in action)
2. Load the LinkedIn profile
3. Extract all information
4. Display results
5. Ask if you want to save to CSV

---

## Detailed Setup

### Prerequisites

- **Python 3.8 or higher** - Check with: `python --version`
- **pip** (comes with Python) - Check with: `pip --version`
- **Windows/Mac/Linux**

### Installation Steps

#### 1. Install Required Packages

```powershell
# Install all dependencies from requirements.txt
pip install -r requirements.txt

# Download the English language model for spaCy
python -m spacy download en_core_web_sm
```

If you get permission errors, try:
```powershell
pip install --user -r requirements.txt
python -m spacy download en_core_web_sm
```

#### 2. Verify Installation

Test that everything installed correctly:

```powershell
python -c "import playwright; import pandas; import spacy; print('✅ All packages installed successfully!')"
```

### Browser Automation Setup

Playwright automatically downloads browser binaries on first run. If you want to pre-download:

```powershell
python -m playwright install chromium
```

---

## Usage Examples

### Example 1: Scrape One Profile

```powershell
python linkedin_scraper.py
```

Then enter:
```
https://www.linkedin.com/in/satya-nadella
```

### Example 2: Scrape Multiple Profiles

```powershell
python linkedin_scraper.py
```

Then:
- Press Enter when asked for single URL (to skip single mode)
- Enter multiple URLs:
  ```
  https://www.linkedin.com/in/satya-nadella
  https://www.linkedin.com/in/eric-schmidt
  https://www.linkedin.com/in/sheryl-sandberg
  ```
- Press Enter twice when done
- Confirm with `y` to start scraping

---

## What Gets Extracted

For each profile, the scraper extracts:

| Data Point | Example |
|-----------|---------|
| Full Name | John Smith |
| Current Headline | Senior Software Engineer at Google |
| Bio/About | 5+ years in cloud engineering... |
| Skills (auto-detected) | Python, AWS, Kubernetes, Docker |
| Certifications | AWS Certified Solutions Architect |
| Courses | Advanced Python for Data Science |
| Education | BS Computer Science from MIT |
| Experience Summary | Led team of 5 engineers... |

---

## Output: CSV File

After scraping, you get a CSV file with columns:

```
Profile_ID,Full_Name,Headline,Detected_Skills,Skills_Count,Certifications,Certifications_Count,Courses,Courses_Count,Education,Education_Count,Experience_Summary,Profile_URL,Scraped_Date
```

Example row:
```
LI_PROFILE_001,John Smith,Senior Engineer,Python|JavaScript|AWS|Docker,4,AWS Solutions Architect,1,Advanced Python,1,BS Computer Science,1,Led engineering team...,https://linkedin.com/in/johnsmith,2026-02-25 10:30:00
```

---

## Common Issues & Solutions

### ❌ Issue: "ModuleNotFoundError: No module named 'playwright'"

**Solution:**
```powershell
pip install playwright
python -m playwright install chromium
```

### ❌ Issue: "ModuleNotFoundError: No module named 'spacy'"

**Solution:**
```powershell
pip install spacy
python -m spacy download en_core_web_sm
```

### ❌ Issue: LinkedIn profile doesn't load

**Possible causes:**
1. Wrong URL format (should be `https://www.linkedin.com/in/username`)
2. Profile is private (set to private by the user)
3. LinkedIn is blocking automated access (temporary)
4. Network/internet issue

**Solutions:**
- Verify the URL is correct by visiting it in your browser first
- Ask the profile owner to make profile publicly visible
- Wait 5-10 minutes and try again
- Check your internet connection

### ❌ Issue: "Timed out waiting for selector"

**Solution:** LinkedIn might be slow. Try:
1. Edit `linkedin_scraper.py`
2. Find: `page.wait_for_timeout(5000)`
3. Change to: `page.wait_for_timeout(10000)` (10 seconds instead of 5)

### ❌ Issue: LinkedIn blocks automated scraping

**Solution:**
- This is normal if scraping too many profiles too quickly
- Wait 1-2 hours before resuming
- Space out requests with longer delays
- Reduce the number of profiles scrapped in one session

---

## Performance Tips

- **Faster processing**: Close other browser windows to free up resources
- **Avoid blocking**: Space out multiple scraping sessions by 1-2 hours
- **Batch processing**: Scrape 3-5 profiles at a time, not 100+
- **Peak hours**: Avoid LinkedIn's peak hours (9am-5pm business hours)

---

## Customization

### Change Output Filename

Edit `linkedin_scraper.py`:

```python
# Line ~180, change:
filename = "linkedin_profiles_data.csv"
# to:
filename = "my_custom_filename.csv"
```

### Increase Browser Wait Time

Edit `linkedin_scraper.py`:

```python
# Line ~30, change:
page.wait_for_timeout(5000)
# to:
page.wait_for_timeout(10000)  # 10 seconds
```

### Show Browser During Scraping

Browser already opens (headless=False), so you can watch it scrape!

To hide the browser (faster):

```python
# Line ~26, change:
browser = p.chromium.launch(headless=False)
# to:
browser = p.chromium.launch(headless=True)
```

---

## Data Analysis After Scraping

You can analyze the exported CSV:

```python
import pandas as pd

df = pd.read_csv('linkedin_profiles_data.csv')

# Most common skill
print(df['Detected_Skills'].value_counts())

# Average certifications
print(f"Avg certifications: {df['Certifications_Count'].mean():.2f}")

# Profiles by headline
print(df['Headline'].value_counts().head(10))
```

---

## Important Legal Notes

⚠️ **Before Using:**

1. **LinkedIn Terms of Service**: Web scraping may violate LinkedIn's ToS
2. **Ethics**: Only scrape publicly available, non-sensitive data
3. **Consent**: Ideally, have permission from the profile owner
4. **Purpose**: Use for recruiting, research, or analysis - not harassment
5. **Rate Limiting**: Don't scrape excessively (be respectful to LinkedIn's servers)

This tool is for educational and authorized research purposes only.

---

## File Structure After Setup

```
ReadinessTracker/
├── linkedin_scraper.py               # Main script
├── Skill Extractor.py                # Skill detection engine
├── requirements.txt                  # Dependencies
├── README_LINKEDIN.md                # Full documentation
├── SETUP_GUIDE_LINKEDIN.md           # This file
└── linkedin_profiles_data.csv        # Generated output (after first run)
```

---

## Next Steps

1. ✅ Install dependencies (steps above)
2. ✅ Run the scraper: `python linkedin_scraper.py`
3. ✅ Enter LinkedIn URLs
4. ✅ View results in terminal
5. ✅ Save to CSV
6. ✅ Analyze the data!

---

## Support & Feedback

If you encounter issues:
1. Check the "Common Issues" section above
2. Verify all packages installed: `pip list | grep -E "playwright|pandas|spacy"`
3. Ensure Python 3.8+: `python --version`
4. Try running with administrator privileges

Happy scraping! 🚀

---

**Last Updated**: February 2026
