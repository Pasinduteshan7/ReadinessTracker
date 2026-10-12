"""
SQLite database — stores analyzed profiles and score history.
"""
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime, JSON
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "data" / "employability.db"
DB_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DB_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


class Student(Base):
    __tablename__ = "students"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(120), index=True)
    email         = Column(String(120))
    linkedin      = Column(String(200))
    github        = Column(String(200))
    pdf_filename  = Column(String(200))
    profile_json  = Column(JSON)            # full extracted profile
    readiness     = Column(JSON)            # compute_readiness output
    job_fit       = Column(JSON)            # category_classifier output
    recommendations = Column(JSON)          # Gemini RAG output
    total_score   = Column(Float, index=True)
    created_at    = Column(DateTime, default=datetime.utcnow)
    updated_at    = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
    print(f"✅ DB initialized at: {DB_PATH}")