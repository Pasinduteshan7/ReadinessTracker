"""
Quick Test Script - Verifies your setup is working
Run this before trying to scrape real websites
"""

print("=" * 70)
print("🧪 TESTING YOUR JOB SCRAPER SETUP")
print("=" * 70)

# Test 1: Check spaCy
print("\n[1/4] Testing spaCy...")
try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
    print("    ✅ spaCy is working!")
except Exception as e:
    print(f"    ❌ spaCy error: {e}")
    print("    Fix: Run 'python -m spacy download en_core_web_sm'")

# Test 2: Check Skill Extractor
print("\n[2/4] Testing Skill Extractor...")
try:
    import importlib.util
    spec = importlib.util.spec_from_file_location("skill_extractor", "Skill Extractor.py")
    skill_extractor = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(skill_extractor)
    
    test_text = "Looking for a developer with Python and JavaScript experience."
    skills = skill_extractor.extract_skills(test_text)
    print(f"    ✅ Skill Extractor works! Found: {skills}")
except Exception as e:
    print(f"    ❌ Skill Extractor error: {e}")

# Test 3: Check Playwright
print("\n[3/4] Testing Playwright...")
try:
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        browser.close()
    print("    ✅ Playwright is working!")
except Exception as e:
    print(f"    ❌ Playwright error: {e}")
    print("    Fix: Run 'playwright install chromium'")

# Test 4: Check Pandas
print("\n[4/4] Testing Pandas...")
try:
    import pandas as pd
    test_data = {'Job': ['Test'], 'Skills': ['Python']}
    df = pd.DataFrame(test_data)
    print("    ✅ Pandas is working!")
except Exception as e:
    print(f"    ❌ Pandas error: {e}")

# Final Summary
print("\n" + "=" * 70)
print("🎯 SETUP STATUS")
print("=" * 70)
print("\nIf all tests passed (✅), you're ready to scrape!")
print("If any test failed (❌), follow the fix instructions above.")
print("\n📖 Next steps:")
print("   1. Read SETUP_GUIDE.md for detailed instructions")
print("   2. Run: python job_scraper.py")
print("   3. Paste a job posting URL when prompted")
print("=" * 70)
