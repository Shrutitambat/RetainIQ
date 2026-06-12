# database.py
# ─────────────────────────────────────────────
# Sets up SQLAlchemy connection to PostgreSQL.
# SQLAlchemy is an ORM (Object Relational Mapper)
# meaning we write Python classes instead of raw SQL.
# ─────────────────────────────────────────────

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# create_engine: creates the actual DB connection
engine = create_engine(DATABASE_URL)

# SessionLocal: a factory that creates DB sessions
# Each request gets its own session, then closes it
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base: all our DB models (tables) inherit from this
Base = declarative_base()

# Dependency function — used in every route that needs DB
# FastAPI calls this automatically and injects the session
def get_db():
    db = SessionLocal()
    try:
        yield db        # give the session to the route
    finally:
        db.close()      # always close after request finishes