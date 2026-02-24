# Job Scraper Setup Guide

## 📋 Prerequisites

- Python 3.8 or higher installed
- Internet connection

## 🚀 Installation Steps

### Step 1: Install Required Packages

Open your terminal/PowerShell in this directory and run:

```bash
pip install spacy pandas playwright
```

### Step 2: Download spaCy Language Model

```bash
python -m spacy download en_core_web_sm
```

### Step 3: Install Playwright Browsers

```bash
playwright install chromium
```

## ▶️ How to Run

### Option A: Interactive Mode (Recommended for beginners)

Simply run:

```bash
python job_scraper.py
```

Then follow the prompts:

1. Enter a job posting URL when asked
2. Enter the company name
3. Review the extracted skills
4. Save to CSV when prompted

### Option B: Script Mode (For bulk scraping)

1. Open `job_scraper.py` in a text editor
2. Find the `job_urls` list around line 150
3. Replace the example URLs with real job posting URLs:
   ```python
   job_urls = [
       {
           'url': 'https://actual-job-url.com/posting1',
           'company': 'Google'
       },
       {
           'url': 'https://actual-job-url.com/posting2',
           'company': 'Microsoft'
       },
   ]
   ```
4. Run: `python job_scraper.py`

## 📊 Output

The scraper will create a CSV file (`jobs_data.csv`) with these columns:

- **Job_ID**: Unique identifier
- **Company**: Company name
- **Job_Title**: Position title
- **URL**: Original job posting URL
- **Detected_Skills**: Comma-separated list of programming languages found
- **Skills_Count**: Number of skills detected
- **Description_Length**: Length of job description
- **Scraped_Date**: When the data was collected

## 🔧 Troubleshooting

### "Module not found" error

```bash
pip install --upgrade spacy pandas playwright
```

### Browser doesn't open

```bash
playwright install --force
```

### Skills not detected

- Make sure `Skill Extractor.py` is in the same folder
- Check that the spaCy model is downloaded: `python -m spacy download en_core_web_sm`

### "Could not find job description"

- The website structure might be different
- Try adjusting the CSS selectors in `job_scraper.py`
- Open an issue with the URL you're trying to scrape

## 💡 Tips for Success

1. **Start Small**: Test with 1-2 URLs first
2. **Be Polite**: The scraper waits 2 seconds between requests - don't reduce this
3. **Check robots.txt**: Some sites don't allow scraping
4. **Use Developer Tools**: Press F12 in your browser to inspect job posting structure
5. **Dynamic vs Static**: This scraper handles dynamic content (JavaScript-rendered pages)

## 🎯 Recommended Job Sites to Start With

**Easier (Static Content):**

- Stack Overflow Jobs
- AngelList
- We Work Remotely

**Medium Difficulty:**

- LinkedIn (requires login)
- Indeed
- Glassdoor

**Advanced (Anti-bot measures):**

- Google Careers
- Microsoft Careers
- Meta Careers

## 📈 Next Steps

After collecting 50-100 job postings:

1. Upload `jobs_data.csv` to Google Colab
2. Perform analysis (most in-demand skills, trends, etc.)
3. Build ML models for demand forecasting
4. Create visualizations

## 🆘 Need Help?

If you encounter issues:

1. Check the terminal output for error messages
2. Try running with `headless=False` to see the browser
3. Verify the URL is accessible in your regular browser first
