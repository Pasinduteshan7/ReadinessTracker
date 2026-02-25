"""
LinkedIn Scraper - Setup Verification Script
This script checks if all dependencies are properly installed
"""

import sys
import subprocess

def check_python_version():
    """Check if Python version is 3.8 or higher"""
    version = sys.version_info
    print(f"✓ Python Version: {version.major}.{version.minor}.{version.micro}")
    
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Python 3.8 or higher required. You have Python {version.major}.{version.minor}")
        return False
    return True

def check_package(package_name, import_name=None):
    """Check if a Python package is installed"""
    if import_name is None:
        import_name = package_name
    
    try:
        __import__(import_name)
        print(f"✓ {package_name} is installed")
        return True
    except ImportError:
        print(f"❌ {package_name} is NOT installed")
        print(f"   Install with: pip install {package_name}")
        return False

def check_spacy_model():
    """Check if spacy English model is downloaded"""
    try:
        import spacy
        nlp = spacy.load("en_core_web_sm")
        print(f"✓ spaCy English model is downloaded")
        return True
    except:
        print(f"❌ spaCy English model is NOT downloaded")
        print(f"   Install with: python -m spacy download en_core_web_sm")
        return False

def check_linkedin_scraper():
    """Check if linkedin_scraper.py file exists"""
    import os
    if os.path.exists("linkedin_scraper.py"):
        print(f"✓ linkedin_scraper.py found")
        return True
    else:
        print(f"❌ linkedin_scraper.py NOT found")
        return False

def check_skill_extractor():
    """Check if Skill Extractor.py file exists"""
    import os
    if os.path.exists("Skill Extractor.py"):
        print(f"✓ Skill Extractor.py found")
        return True
    else:
        print(f"❌ Skill Extractor.py NOT found")
        return False

def main():
    print("\n" + "="*60)
    print("LinkedIn Scraper - Setup Verification")
    print("="*60 + "\n")
    
    checks = {
        "Python Version": check_python_version,
        "Pandas Package": lambda: check_package("pandas"),
        "Playwright Package": lambda: check_package("playwright"),
        "spaCy Package": lambda: check_package("spacy"),
        "spaCy English Model": check_spacy_model,
        "LinkedIn Scraper Script": check_linkedin_scraper,
        "Skill Extractor Script": check_skill_extractor,
    }
    
    results = {}
    for check_name, check_func in checks.items():
        print(f"\n📋 Checking {check_name}...")
        try:
            results[check_name] = check_func()
        except Exception as e:
            print(f"❌ Error during check: {str(e)}")
            results[check_name] = False
    
    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    print(f"\n✓ Passed: {passed}/{total}")
    
    if passed == total:
        print("\n✅ All checks passed! Your setup is ready!")
        print("\nYou can now run:")
        print("   python linkedin_scraper.py")
        return 0
    else:
        print(f"\n❌ {total - passed} issue(s) found. Please fix them above.")
        print("\nCommon fixes:")
        print("   1. Install pandas: pip install pandas")
        print("   2. Install playwright: pip install playwright")
        print("   3. Install spacy: pip install spacy")
        print("   4. Download spacy model: python -m spacy download en_core_web_sm")
        print("   5. Ensure linkedin_scraper.py is in the current directory")
        return 1

if __name__ == "__main__":
    sys.exit(main())
