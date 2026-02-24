import spacy
from spacy.matcher import PhraseMatcher

# 1. Load the NLP model
nlp = spacy.load("en_core_web_sm")

# 2. Define the languages we want to track (The "Dictionary")
languages = ["Python", "Java", "JavaScript", "C++", "Go", "Rust", "TypeScript", "SQL", "Ruby"]

# 3. Initialize the Matcher
matcher = PhraseMatcher(nlp.vocab, attr="LOWER") # Case-insensitive
patterns = [nlp.make_doc(text) for text in languages]
matcher.add("LANG_LIST", patterns)

def extract_skills(text):
    doc = nlp(text)
    matches = matcher(doc)
    
    # Extract the actual text of the matches and remove duplicates
    found_skills = set([doc[start:end].text.capitalize() for match_id, start, end in matches])
    return list(found_skills)

# --- EXAMPLE USAGE ---
job_description = """
We are seeking a highly skilled Senior Software Engineer to join our growing engineering team. The ideal candidate will have at least 5 years of experience in backend software development using C# and Node.js. Strong knowledge of database technologies such as PostgreSQL or MongoDB is required. Experience with JavaScript frameworks, RESTful API development, and cloud platforms such as AWS or Azure will be considered an advantage.

As part of our ongoing modernization efforts, we are transitioning our backend services to Rust, so familiarity with Rust or willingness to learn modern systems programming languages is highly desirable. The candidate should have experience with microservices architecture, containerization tools such as Docker, and version control systems like Git.
"""

skills = extract_skills(job_description)
print(f"Skills detected: {skills}")