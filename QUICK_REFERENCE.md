# LinkedIn Scraper - Quick Reference Card

## Installation (Copy & Paste)

```powershell
# Step 1: Install dependencies
pip install -r requirements.txt

# Step 2: Download language model
python -m spacy download en_core_web_sm

# Step 3: Verify setup
python test_linkedin_setup.py
```

---

## Quick Start

```powershell
python linkedin_scraper.py
```

Then:
1. Enter LinkedIn profile URL: `https://www.linkedin.com/in/username`
2. Let it scrape (watch the browser)
3. View results in terminal
4. Save to CSV:points: `y`
5. Open CSV in Excel

---

## LinkedIn URL Format

✅ **Correct:**
```
https://www.linkedin.com/in/john-doe
https://www.linkedin.com/in/jane-smith/
```

❌ **Wrong:**
```
linkedin.com/in/john (missing https://www)
https://www.linkedin.com/company/google/ (company, not person)
```

---

## What Gets Extracted

| Item | Example |
|------|---------|
| **Name** | John Smith |
| **Headline** | Senior Engineer at Google |
| **Skills** | Python, AWS, Docker, Kubernetes |
| **Certifications** | AWS Solutions Architect, Google Cloud Expert |
| **Courses** | Advanced Python, Cloud Computing |
| **Education** | BS Computer Science from MIT |
| **Experience** | Worked as engineer for 5+ years |

---

## Output Files

**Main Output:**
```
linkedin_profiles_data.csv
```

Columns: Profile_ID, Full_Name, Headline, Detected_Skills, Skills_Count, Certifications, Certifications_Count, Courses, Courses_Count, Education, Profile_URL, Scraped_Date

---

## Common Commands

| Action | Command |
|--------|---------|
| **Run Scraper** | `python linkedin_scraper.py` |
| **Test Setup** | `python test_linkedin_setup.py` |
| **View Files** | `dir` or `ls` |
| **View CSV** | `Start linkedin_profiles_data.csv` |
| **Python Analysis** | `python -c "import pandas as pd; print(pd.read_csv('linkedin_profiles_data.csv'))"` |

---

## Python Quick Scripts

### View Your Data
```python
import pandas as pd
df = pd.read_csv('linkedin_profiles_data.csv')
print(df)
```

### Most Common Skills
```python
import pandas as pd
df = pd.read_csv('linkedin_profiles_data.csv')
all_skills = ' '.join(df['Detected_Skills']).split(', ')
from collections import Counter
print(Counter(all_skills).most_common(10))
```

### Export Specific Columns
```python
import pandas as pd
df = pd.read_csv('linkedin_profiles_data.csv')
df[['Full_Name', 'Headline', 'Detected_Skills']].to_csv('skills_only.csv')
```

---

## Scraping Tips

**For Better Results:**
- Use public profiles (private ones won't work)
- Verify URL in browser first
- Have steady internet connection
- Don't scrape if you see CloudFlare/verification pages

**To Avoid Rate Limiting:**
- Scrape 5-10 profiles per session
- Wait 1-2 hours between sessions
- Use longer delays if needed (edit code: `time.sleep(10)`)
- Don't scrape in loops all day

---

## If Something Goes Wrong

| Error | Fix |
|-------|-----|
| `ModuleNotFoundError: playwright` | `pip install playwright` |
| `ModuleNotFoundError: spacy` | `pip install spacy` && `python -m spacy download en_core_web_sm` |
| `Timed out waiting` | Increase wait time in code (line ~30) |
| `Could not extract profile data` | Profile might be private or URL wrong |
| `LinkedIn blocking` | Wait 1-2 hours, try with longer delays |

---

## File Structure

```
📁 ReadinessTracker/
├── 📄 linkedin_scraper.py              ← MAIN SCRIPT
├── 📄 test_linkedin_setup.py           ← Run this first
├── 📄 Skill Extractor.py               ← NLP for skills
├── 📄 requirements.txt                 ← Dependencies
├── 📄 SETUP_GUIDE_LINKEDIN.md          ← Installation help
├── 📄 README_LINKEDIN.md               ← Full documentation
├── 📄 NEXT_STEPS_LINKEDIN.md           ← Usage guide
├── 📄 CONVERSION_SUMMARY.md            ← What changed
└── 📄 linkedin_profiles_data.csv       ← YOUR DATA (after scraping)
```

---

## Customization

### Change Wait Time
**File**: `linkedin_scraper.py`, Line ~30
```python
page.wait_for_timeout(10000)  # 10 seconds instead of 5
```

### Change Delay Between Profiles
**File**: `linkedin_scraper.py`, Line ~145
```python
time.sleep(10)  # 10 seconds instead of 3
```

### Change Output Filename
**File**: `linkedin_scraper.py`, Line ~235
```python
filename = "my_profiles.csv"  # Custom name
```

### Hide Browser Window
**File**: `linkedin_scraper.py`, Line ~26
```python
browser = p.chromium.launch(headless=True)  # No window
```

---

## Legal/Safety Notes

⚠️ **Before Scraping:**
- ✓ Check LinkedIn Terms of Service
- ✓ Use for authorized, ethical purposes only
- ✓ Only scrape public profiles
- ✓ Respect rate limiting (don't overload servers)
- ✓ Don't use for spam, harassment, or selling data
- ✓ Consider GDPR if in EU

---

## Keyboard Shortcuts in Terminal

| Key | Action |
|-----|--------|
| `Ctrl+C` | Stop scraper (use if something goes wrong) |
| `Ctrl+V` | Paste LinkedIn URL |
| `Tab` | Auto-complete filenames |
| `Up Arrow` | Previous command |

---

## Need Help?

📖 **Resources:**
1. `SETUP_GUIDE_LINKEDIN.md` - Installation & setup
2. `README_LINKEDIN.md` - Full documentation & features
3. `NEXT_STEPS_LINKEDIN.md` - Usage examples & troubleshooting
4. `CONVERSION_SUMMARY.md` - What changed from old version

💬 **Common Questions:**
- Q: Can I scrape private profiles? → A: No
- Q: Is it legal? → A: Check LinkedIn ToS, use ethically
- Q: How many can I scrape? → A: 5-10 per session recommended
- Q: What if blocked? → A: Wait 1-2 hours

---

## Data Privacy Checklist

Before sharing/storing your CSV:
- [ ] Have permission from profile owners?
- [ ] Storing securely (not in public folder)?
- [ ] Using data for intended purpose only?
- [ ] Will delete when no longer needed?
- [ ] Not resharing with unauthorized parties?

---

## Success Indicators ✅

You'll know it's working when:
- [ ] `test_linkedin_setup.py` shows all checks passed
- [ ] Browser opens and shows LinkedIn
- [ ] Profile name appears in terminal output
- [ ] Skills are detected and printed
- [ ] CSV file is created in your folder
- [ ] CSV opens in Excel with data

---

## One-Minute Setup

```powershell
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python test_linkedin_setup.py
python linkedin_scraper.py
# Paste LinkedIn URL when prompted
# Watch it work!
```

---

## Important Numbers to Remember

| Metric | Value |
|--------|-------|
| **Python Version** | 3.8+ required |
| **Wait Time** | 5000ms default |
| **Delay Between** | 3 seconds default |
| **Profiles/Session** | 5-10 recommended |
| **Break Between Sessions** | 1-2 hours recommended |
| **CSV Columns** | 14+ per profile |

---

## Files You'll Create

After running scraper:
```
linkedin_profiles_data.csv  ← Main output file
```

All your scraped data is here! Open in Excel, Google Sheets, or Python.

---

## Performance Expectations

- ⏱️ Single profile: 5-10 seconds
- ⏱️ 10 profiles: 1-2 minutes
- ⏱️ 50 profiles: 5-10 minutes
- 📊 Data quality: Very good (name, skills, certs, courses, education)

---

## Final Checklist Before You Start

- [ ] Python installed? (`python --version`)
- [ ] In correct folder? (`cd ReadinessTracker`)
- [ ] Dependencies installed? (`pip install -r requirements.txt`)
- [ ] SpaCy model downloaded? (`python -m spacy download en_core_web_sm`)
- [ ] Setup verified? (`python test_linkedin_setup.py`)
- [ ] Ready to scrape? (`python linkedin_scraper.py`)

---

**Happy Scraping! 🚀**

Save this quick reference for future use!

---

*Last Updated: February 25, 2026*
