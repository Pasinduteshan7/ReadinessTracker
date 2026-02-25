# LinkedIn Scraper - Authentication Guide

## ⚠️ Important: LinkedIn Requires Login

LinkedIn profiles require you to be **logged in** to view them. The scraper opens a real browser window and waits for you to log in before scraping.

## How It Works

1. **Run the scraper**:
   ```powershell
   .venv\Scripts\python linkedin_scraper.py
   ```

2. **Browser opens automatically** - A Chromium browser window will appear

3. **Log in to LinkedIn**:
   - You have **2 minutes** to log in
   - Enter your LinkedIn email/password
   - Complete any 2FA if needed
   - Wait for the page to load

4. **Scraper continues automatically**:
   - After 2 minutes, the browser navigates to the profile URL
   - Data is extracted and displayed
   - Results are shown in the terminal

5. **Keep browser open**: Don't close the browser during scraping

## Example Workflow

```
$ .venv\Scripts\python linkedin_scraper.py

════════════════════════════════════════════════════════════════════════════════
LINKEDIN PROFILE SCRAPER
════════════════════════════════════════════════════════════════════════════════

⚠️  IMPORTANT: LinkedIn Requires Login
────────────────────────────────────────────────────────────────────────────────
• This scraper opens your browser to access LinkedIn profiles
• You MUST be logged in to your LinkedIn account  
• The browser will open and wait for you to log in (2 minutes)
• After logging in, the scraper automatically continues
• Keep the browser window open during scraping
────────────────────────────────────────────────────────────────────────────────

📌 Single Profile Mode

🔗 Enter a LinkedIn profile URL: https://www.linkedin.com/in/satya-nadella/

🔍 Scraping LinkedIn Profile: https://www.linkedin.com/in/satya-nadella/
⚠️  LinkedIn requires authentication. A browser will open.
📌 Please log in to LinkedIn in the browser window.
⏰ You have 2 minutes to log in. The scraper will continue automatically...

⏳ Waiting for authentication...
[Browser opens - LOG IN HERE]
[After 2 minutes, browser navigates to profile]

✅ Successfully scraped profile: Satya Nadella
📊 Skills extracted: 12
📜 Certifications: 3
📚 Courses: 2

💾 Save results to CSV? (y/n): y
```

## Troubleshooting

### ❌ "Profile not accessible. Please log in to LinkedIn first"

**Cause**: The scraper detected you're not logged in

**Fix**:
1. Try again with valid LinkedIn credentials
2. Make sure you can access your LinkedIn account in your browser

### ❌ "Could not extract profile data"

**Possible reasons**:
- Profile is private (locked by owner)
- Profile has restricted access (user can see content, you can't)
- Page didn't load completely - try increasing wait time (edit line 54)
- Network connection issue

**Fix**:
1. Verify you can access the profile manually in your browser
2. Check your internet connection
3. Try a different profile

### ❌ Browser closes immediately

**Cause**: Login took longer than 2 minutes

**Fix**: Increase timeout in the code
- Edit `linkedin_scraper.py`, line 67
- Change `page.wait_for_timeout(120000)` to `page.wait_for_timeout(180000)` (3 minutes)
- Or change to `page.wait_for_timeout(300000)` (5 minutes)

### ❌ "BrowserType.launch: Executable doesn't exist"

**Cause**: Playwright browsers not installed

**Fix**:
```powershell
.venv\Scripts\python -m playwright install
```

## Tips for Better Results

✅ **DO:**
- Use a valid LinkedIn account
- Keep browser window visible and active
- Don't close the browser during scraping
- Log in before the timeout (2 minutes)
- Try public/semi-public profiles first

❌ **DON'T:**
- Close the browser window during scraping
- Use LinkedIn login on mobile
- Scrape too many profiles at once
- Ignore LinkedIn's Terms of Service

## Testing with Public Profiles

Try these public LinkedIn profiles to test:
- https://www.linkedin.com/in/satya-nadella/
- https://www.linkedin.com/in/sergeybryn/
- https://www.linkedin.com/in/linda-yaccarino/

These are corporate leaders with public profiles.

## Data Saved to CSV

After scraping, your data is saved to:
```
linkedin_profiles_data.csv
```

Open in Excel or Google Sheets to view:
- Full Name
- Current Position
- Skills (auto-detected)
- Certifications
- Courses
- Education
- Work Experience Summary
- And more!

## Increase Wait Time for Slow Connections

**Edit `linkedin_scraper.py`**:

Look for line ~67:
```python
page.wait_for_timeout(120000)  # 2 minutes
```

Change to:
```python
page.wait_for_timeout(180000)  # 3 minutes
page.wait_for_timeout(300000)  # 5 minutes
```

## Security Note

⚠️ **Your LinkedIn Login**:
- Credentials are NOT saved anywhere
- They are only used in the browser session
- Session closes when browser closes
- No data is transmitted to external servers

The browser opens locally - your login credentials stay on your computer.

---

**Need help?** Check troubleshooting section above or review the README_LINKEDIN.md file.
