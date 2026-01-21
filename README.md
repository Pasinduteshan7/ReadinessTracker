# ReadinessTracker - Real-Time Employability Readiness Tracker

**Real-Time Employability Readiness Tracker for Computer Engineering Undergraduates**

A full-stack web application built with React + TypeScript + Vite (frontend) and Spring Boot + MySQL (backend) to help Computer Engineering students track their employability readiness and career development.

---

## 🚀 **TECH STACK**

### **Frontend**
- React 18 + TypeScript
- Vite (fast build tool)
- Tailwind CSS (styling)
- Lucide Icons (UI icons)
- Axios (API client)

### **Backend**
- Spring Boot 4.0.1 (Java 17)
- Gradle 9.2.1 (build tool)
- Hibernate ORM 7.2.0
- MySQL 8.0.42 (database)

---

## 📋 **PROJECT STRUCTURE**

```
ReadinessTracker/
├── Frontend (React/TypeScript)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── StudentDashboard.tsx     (7 analysis tabs)
│   │   │   ├── AdvisorDashboard.tsx     (student metrics)
│   │   │   ├── AdminDashboard.tsx       (system overview)
│   │   │   ├── LoginPage.tsx            (authentication)
│   │   │   ├── SignupPage.tsx           (registration)
│   │   │   └── LandingPage.tsx          (home page)
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx          (auth state management)
│   │   ├── lib/
│   │   │   └── backend-api.ts           (API client)
│   │   └── App.tsx                      (routing & layout)
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
└── Backend (Spring Boot)
    ├── src/main/java/com/example/readinesstrackerbackend/
    │   ├── controller/
    │   │   ├── StudentController.java
    │   │   ├── AdvisorController.java
    │   │   └── AdminController.java
    │   ├── service/
    │   │   ├── StudentService.java
    │   │   ├── AdvisorService.java
    │   │   └── AdminService.java
    │   ├── entity/
    │   │   ├── Student.java
    │   │   ├── Advisor.java
    │   │   └── Admin.java
    │   ├── repository/
    │   │   ├── StudentRepository.java
    │   │   ├── AdvisorRepository.java
    │   │   └── AdminRepository.java
    │   └── ReadinessTrackerBackendApplication.java
    ├── resources/
    │   └── application.properties
    └── build.gradle
```

---

## ✨ **FEATURES**

### **StudentDashboard** (7 Analysis Tabs)
1. **Overview** - Total students, GPA, current year stats
2. **My Profile** - Full student profile information
3. **All Students** - Table of all students in the system
4. **GitHub Analysis** - Repository score, repos, stars, contributions
5. **Social Media Analysis** - LinkedIn, Facebook profiles & presence score
6. **Modules** - Course progress tracking with completion status
7. **Industry Demand** - Skill match, trending skills analysis

### **AdvisorDashboard**
- Advisor profile and specialization
- Student list with GPA metrics
- Statistics: Total students, Average GPA, High performers
- Color-coded GPA badges

### **AdminDashboard**
- System overview with user counts
- Student, Advisor, Admin statistics
- Student-to-advisor ratio analysis
- System health status

### **Authentication**
- Role-based login (Student/Advisor/Admin)
- User registration with role selection
- Secure session management via localStorage
- Password validation

---

## 🔧 **API ENDPOINTS**

### **Student Endpoints**
- `POST /api/students/register` - Register new student
- `POST /api/students/login` - Authenticate student
- `GET /api/students` - Get all students
- `GET /api/students/{id}` - Get student by ID

### **Advisor Endpoints**
- `POST /api/advisors/register` - Register new advisor
- `POST /api/advisors/login` - Authenticate advisor
- `GET /api/advisors` - Get all advisors
- `GET /api/advisors/{id}` - Get advisor by ID

### **Admin Endpoints**
- `POST /api/admins/register` - Register new admin
- `POST /api/admins/login` - Authenticate admin
- `GET /api/admins` - Get all admins
- `GET /api/admins/{id}` - Get admin by ID

---

## 🗄️ **DATABASE SCHEMA**

### **Students Table**
```sql
CREATE TABLE students (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  registration_number VARCHAR(50),
  current_year VARCHAR(10),
  current_gpa DECIMAL(3,2),
  github_username VARCHAR(255),
  linkedin_url VARCHAR(500),
  facebook_url VARCHAR(500),
  created_at BIGINT
);
```

### **Advisors Table**
```sql
CREATE TABLE advisors (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  specialization VARCHAR(255),
  department VARCHAR(255),
  created_at BIGINT
);
```

### **Admins Table**
```sql
CREATE TABLE admins (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  department VARCHAR(255),
  created_at BIGINT
);
```

---

## 🚀 **HOW TO RUN LOCALLY**

### **Prerequisites**
- Java 17+
- MySQL 8.0+
- Node.js 16+ & npm
- Git

### **Setup Backend**

```bash
cd "d:\PROJECTS\group\Readiness tracker\readiness-tracker-backend"

# Configure application.properties
# - Set MySQL connection: jdbc:mysql://localhost:3306/readiness_tracker
# - Set username: root
# - Set password: 20001890

# Run the backend
gradle bootRun
# Backend will start on http://localhost:8080
```

### **Setup Frontend**

```bash
cd "d:\PROJECTS\group\Rediness tracker\project"

# Install dependencies
npm install

# Start development server
npm run dev
# Frontend will start on http://localhost:5174
```

### **Test the Application**

1. Open browser: `http://localhost:5174`
2. Click "Get Started" to register or "Login" to sign in
3. Use these test credentials:
   - **Email:** any email (auto-created)
   - **Password:** any password
   - **Role:** Choose Student/Advisor/Admin

---

## 📊 **DATA FLOW**

```
Frontend (React)
  ↓ (HTTP Request)
Vite Dev Server (http://localhost:5174)
  ↓ (API Call via backend-api.ts)
Spring Boot Backend (http://localhost:8080)
  ↓ (JPA Query)
MySQL Database (localhost:3306)
  ↓ (Returns data)
Spring Boot (Response)
  ↓ (JSON)
Frontend (Renders Dashboard)
```

---

## 🔐 **SECURITY FEATURES**

- ✅ CORS enabled for frontend communication
- ✅ Role-based access control (RBAC)
- ✅ Session persistence via localStorage
- ✅ Password validation on registration
- ✅ Email uniqueness enforcement

---

## 📝 **CONTRIBUTORS**

- **Pasindu Teshan (Pasinduteshan7)** - 60%
  - Backend Setup & Database
  - Backend API Endpoints
  - Dashboard Pages & Analysis

- **Developer 2** - 20%
- **Developer 3** - 15%
- **Developer 4** - 5%

---

## 📄 **LICENSE**

This project is open source and available under the MIT License.

---

## 🤝 **SUPPORT**

For issues, questions, or contributions, please open an issue on GitHub or contact the development team.

**Repository:** https://github.com/Pasinduteshan7/ReadinessTracker

