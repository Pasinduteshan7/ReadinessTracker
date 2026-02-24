# Sample Job URLs for Testing

# Copy and paste these into job_scraper.py or use them individually

## Beginner-Friendly Sites (Start Here)

### RemoteOK

# https://remoteok.com/remote-jobs/software-developer

# https://remoteok.com/remote-jobs/python

# https://remoteok.com/remote-jobs/javascript

### We Work Remotely

# https://weworkremotely.com/remote-jobs/search?term=python

# https://weworkremotely.com/remote-jobs/search?term=javascript

# https://weworkremotely.com/remote-jobs/search?term=java

### Indeed (Pick any job and copy the URL)

# Template: https://www.indeed.com/viewjob?jk=XXXXXXXXXX

# Example: Search for "software engineer" on Indeed.com, open any job, copy URL

### Glassdoor (Pick any job and copy the URL)

# Template: https://www.glassdoor.com/job-listing/XXXXX

# Example: Search for jobs on Glassdoor.com, open any job, copy URL

---

## How to Use These URLs

### Method 1: Interactive Mode (One at a time)

1. Run: python job_scraper.py
2. Paste one URL when prompted
3. Enter company name
4. View results

### Method 2: Batch Mode (Multiple at once)

1. Open job_scraper.py in a text editor
2. Find the section around line 150 that says "job_urls = ["
3. Replace with your URLs like this:

job_urls = [
{
'url': 'YOUR_FIRST_URL_HERE',
'company': 'Google'
},
{
'url': 'YOUR_SECOND_URL_HERE',
'company': 'Microsoft'
},
]

---

## Tips for Finding Good URLs:

1. **LinkedIn Jobs** (Medium difficulty)
   - Go to linkedin.com/jobs
   - Search: "software engineer"
   - Click on any job posting
   - Copy the full URL (it's LONG - that's normal)
2. **Indeed** (Easy)
   - Go to indeed.com
   - Search: "python developer"
   - Click any job
   - Copy URL from address bar

3. **Company Career Pages** (Medium-Hard)
   - Google: careers.google.com
   - Microsoft: careers.microsoft.com
   - Meta: metacareers.com
   - Apple: jobs.apple.com
   - Amazon: amazon.jobs

4. **Tech Job Boards** (Easy-Medium)
   - StackOverflow: stackoverflow.com/jobs
   - GitHub Jobs: (discontinued, but check for alternatives)
   - AngelList: angel.co/jobs
   - Dice: dice.com

---

## Building Your URL List

### Goal: 50-100 Job Postings

**Recommended Mix:**

- 20 from Indeed (Easy to scrape)
- 15 from Glassdoor
- 10 from We Work Remotely
- 10 from RemoteOK
- 5 from company career pages (Google, Microsoft, etc.)

**Pro Tip:** Focus on one site first (e.g., Indeed) to get 20 URLs quickly,
then move to others.

---

## Example Batch Scraping Template

Copy this into job_scraper.py around line 150:

```python
job_urls = [
    # Indeed Jobs
    {'url': 'https://www.indeed.com/viewjob?jk=abc123', 'company': 'TechCorp'},
    {'url': 'https://www.indeed.com/viewjob?jk=def456', 'company': 'StartupXYZ'},

    # LinkedIn Jobs
    {'url': 'https://www.linkedin.com/jobs/view/1234567890', 'company': 'Google'},
    {'url': 'https://www.linkedin.com/jobs/view/0987654321', 'company': 'Microsoft'},

    # Company Career Pages
    {'url': 'https://careers.google.com/jobs/results/123456789/', 'company': 'Google'},
    {'url': 'https://careers.microsoft.com/example-job/', 'company': 'Microsoft'},

    # Remote Job Boards
    {'url': 'https://weworkremotely.com/remote-jobs/12345', 'company': 'RemoteCo'},
    {'url': 'https://remoteok.com/remote-jobs/67890', 'company': 'DistributedTeam'},
]
```

Replace the URLs with real ones you find!

---

## Quick Start Action Plan

### Day 1 (Today):

1. Test with 3-5 URLs from Indeed
2. Verify CSV output is correct
3. Check skills are being detected

### Day 2-3:

1. Collect 20 URLs from Indeed
2. Run batch scraper overnight (or over lunch)
3. Review and clean data

### Day 4-5:

1. Add 15 URLs from Glassdoor
2. Add 10 URLs from remote job boards
3. Total: 45+ jobs scraped

### Week 2:

1. Upload CSV to Google Colab
2. Analyze trends
3. Create visualizations

---

Ready to start? Pick 3 URLs and test your scraper!
