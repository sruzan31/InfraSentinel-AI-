import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

logger = logging.getLogger("infrasentinel.db")

db_url = settings.DATABASE_URL
connect_args = {}

if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

try:
    engine = create_engine(db_url, pool_pre_ping=True, connect_args=connect_args)
    # Test connection
    with engine.connect() as conn:
        logger.info(f"Database successfully connected to {db_url.split('@')[-1] if '@' in db_url else db_url}")
except Exception as e:
    logger.warning(f"Failed to connect to primary DB ({db_url}): {e}. Falling back to SQLite.")
    db_url = "sqlite:///./infrasentinel.db"
    connect_args = {"check_same_thread": False}
    engine = create_engine(db_url, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
