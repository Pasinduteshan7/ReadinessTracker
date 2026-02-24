import spacy
from spacy.matcher import PhraseMatcher

# 1. Load the NLP model
nlp = spacy.load("en_core_web_sm")

# 2. Define the languages we want to track (The "Dictionary")
languages = [
    # Programming Languages
    "Python", "Java", "JavaScript", "C++", "C#", "Go", "Rust", "TypeScript", "SQL", "Ruby", "PHP", "Kotlin", "Swift", "Scala", "R", "Objective-C", "Groovy", "Perl", "Lua", "Elixir", "Clojure", "Haskell", "F#",
    
    # Frontend Frameworks & Libraries
    "React", "Angular", "Vue", "Node.js", "Express", "Svelte", "Next.js", "Nuxt", "Gatsby", "Ember", "Backbone", "jQuery", "Bootstrap", "Tailwind", "Material UI", "Webpack", "Vite",
    
    # Backend Frameworks
    "Django", "Flask", "Spring Boot", "Spring", "FastAPI", "Fastify", "NestJS", "ASP.NET", "ASP.NET Core", "Ruby on Rails", "Laravel", "Symfony", "Gin", "Echo", "Actix", "Rocket",
    
    # Databases & Data Management
    "PostgreSQL", "MongoDB", "MySQL", "Redis", "Oracle", "Cassandra", "DynamoDB", "Elasticsearch", "Firebase", "Firestore", "SQLite", "MariaDB", "CouchDB", "Neo4j", "Memcached", "InfluxDB", "BigQuery",
    
    # Cloud Platforms & Services
    "AWS", "Azure", "GCP", "Google Cloud", "IBM Cloud", "DigitalOcean", "Heroku", "Alibaba Cloud", "Oracle Cloud",
    
    # AWS Specific Services
    "EC2", "S3", "Lambda", "RDS", "DynamoDB", "CloudFront", "Route53", "IAM", "VPC",
    
    # DevOps & Infrastructure
    "Docker", "Kubernetes", "Jenkins", "Git", "GitLab", "GitHub", "Terraform", "Ansible", "Chef", "Puppet", "Helm", "CircleCI", "Travis CI", "GitLab CI", "GitHub Actions", "ArgoCD", "Vagrant",
    
    # Monitoring & Logging
    "Prometheus", "Grafana", "ELK Stack", "Splunk", "Datadog", "New Relic", "CloudWatch", "Sentry",
    
    # API & Web Technologies
    "REST", "GraphQL", "gRPC", "WebSocket", "SOAP", "OpenAPI", "Postman", "Insomnia", "Swagger",
    
    # Message Queues & Streaming
    "Kafka", "RabbitMQ", "ActiveMQ", "AWS SQS", "AWS SNS", "Apache Pulsar", "NATS",
    
    # Data & ML
    "Pandas", "NumPy", "TensorFlow", "PyTorch", "Scikit-learn", "Keras", "XGBoost", "LightGBM", "Spark", "Hadoop", "Airflow", "Dask", "Plotly", "Matplotlib", "Seaborn", "Jupyter", "Anaconda",
    
    # Testing & QA
    "Selenium", "Cypress", "Jest", "Mocha", "Pytest", "JUnit", "TestNG", "Jasmine", "RSpec", "PHPUnit", "NUnit",
    
    # Version Control & Collaboration
    "Git", "Mercurial", "SVN", "Perforce", "GitHub", "GitLab", "Bitbucket", "Azure DevOps",
    
    # Agile & Project Management
    "Jira", "Confluence", "Trello", "Asana", "Monday.com", "Slack", "MS Teams",
    
    # Security & Authentication
    "OAuth", "JWT", "SAML", "Okta", "Auth0", "Keycloak", "SSL", "TLS", "HTTPS", "Vault",
    
    # Virtualization & Containerization
    "VirtualBox", "VMware", "Hyper-V", "Docker", "Kubernetes", "Docker Compose", "Podman",
    
    # Blockchain & Web3
    "Ethereum", "Solidity", "Bitcoin", "Blockchain", "Smart Contracts", "Web3", "NFT",
    
    # Mobile Development
    "React Native", "Flutter", "Swift", "Kotlin", "Xamarin", "Ionic", "Cordova", "Android", "iOS",
    
    # Game Development
    "Unity", "Unreal Engine", "Godot", "Cocos2d",
    
    # Low-Code/No-Code
    "Salesforce", "ServiceNow", "Microsoft Power Platform", "OutSystems", "Mendix",
    
    # CMS & Content Management
    "WordPress", "Drupal", "Joomla", "Magento", "Shopify", "Contentful", "Strapi",
    
    # Documentation & Knowledge
    "Markdown", "AsciiDoc", "Sphinx", "MkDocs", "Gitbook",
    
    # Continuous Integration/Deployment
    "CI/CD", "GitOps", "Blue Green Deployment", "Canary Deployment",
]

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