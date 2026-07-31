# 🚀 Employability Readiness Tracker

An intelligent, multi-layered platform designed to track, analyze, and benchmark the employability readiness of 800+ students. The system integrates a modern web dashboard, a robust enterprise backend, and an advanced AI engine powered by fine-tuned local Large Language Models (LLMs).

---

## 🏗️ Architecture & Tech Stack

This project is organized as a unified monorepo containing three core services:

* **Frontend (`/project`)**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons.
* **Backend (`/readiness-tracker-backend`)**: Spring Boot (Java), Spring Security (JWT), Hibernate, PostgreSQL.
* **AI Engine (`/readiness-tracker-backend/github-service/ai_engine_with_fine_tuned_llm`)**: Python, FastAPI, Ollama (Local LLMs), GitHub GraphQL API.

---

## 📊 Core Analysis Modules

The system provides a comprehensive admin dashboard divided into four distinct analysis modules to evaluate student readiness from every angle:

### 1. 🐙 GitHub Analysis
The crown jewel of the tracker. This module fetches student repositories using the GitHub GraphQL API and feeds the raw code into our locally hosted, fine-tuned LLMs (like `qwen2:7b`).
* **Code Quality Scoring**: Analyzes software architecture, best practices, and maintainability.
* **Algorithm Evaluation**: A 6-phase evaluation pipeline checking logic, edge cases, and time/space complexity.
* **Mass Benchmarking**: Capable of processing and scoring up to 800 student accounts automatically in the background.

### 2. 📱 Social Media
Tracks and evaluates student professional presence across networking platforms like LinkedIn.
* Evaluates networking reach, professional interactions, and content sharing.
* Generates an engagement score to measure industry visibility and personal branding.

### 3. 📚 Modules
Monitors academic performance and skill acquisition across various curriculum modules.
* Tracks course completion rates, assignment scores, and practical assessments.
* Highlights specific skill gaps and provides targeted areas for student improvement.

### 4. 🏢 Industry Demand
Aligns student profiles with current job market trends and real-world requirements.
* Analyzes the most in-demand technologies and frameworks in the industry.
* Maps a student's current skill set against the market demand to calculate a highly accurate "Employability Match Score".

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18+)
* **Java 17+** & Maven/Gradle
* **PostgreSQL** (Running locally on port 5432)
* **Python 3.10+**
* **Ollama** (Installed locally with your chosen LLM)

### 1. Database Setup
Ensure PostgreSQL is running and create a database named `readiness_tracker`.
The Spring Boot backend will automatically run all database migrations located in the `database/migrations/` folder on startup.

### 2. Environment Variables
You need to configure the environment variables for the backend and AI engine:
* **Backend**: Configure `readiness-tracker-backend/src/main/resources/application.properties` with your database credentials and JWT secret.
* **AI Engine**: Copy `.env.example` to `.env` inside the `ai_engine_with_fine_tuned_llm` folder and add your **GitHub Personal Access Token** (Requires `repo` and `read:user` permissions).

### 3. Running the Project
We have provided a unified startup script that launches all three services (Frontend, Backend, and AI Engine) simultaneously!

Simply open a terminal in the root directory and run:
```bash
.\start-all.bat
```
*(Or `./start-all.sh` if using macOS/Linux)*

This will automatically:
1. Start the **Spring Boot Backend** on `http://localhost:8080`
2. Start the **Python AI Engine** on `http://localhost:8000`
3. Start the **React Frontend** on `http://localhost:5173`

---

## 🧠 AI Engine Setup (Local LLMs)
For the intelligent GitHub Analysis to work, you must have the required LLM installed via Ollama. By default, the system looks for `qwen2:7b`.

Open a new terminal and run:
```bash
ollama run qwen2:7b
```
Make sure the Ollama app is running in your system tray before launching the AI Engine!
