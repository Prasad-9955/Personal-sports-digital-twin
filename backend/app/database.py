import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

logger = logging.getLogger(__name__)

# Ensure correct driver prefix for PostgreSQL or fallback to SQLite if unconfigured
raw_url = (settings.DATABASE_URL or "").strip()
if not raw_url or raw_url == "postgresql://postgres:postgres@localhost:5432/sports_twin":
    # If in cloud production and no external database URL is supplied, fallback safely
    if settings.ENVIRONMENT == "production":
        logger.warning("DATABASE_URL not configured in production environment. Using safe local sqlite fallback.")
        db_url = "sqlite:///./sports_twin_fallback.db"
    else:
        db_url = raw_url or "sqlite:///./sports_twin_dev.db"
elif raw_url.startswith("postgres://"):
    db_url = raw_url.replace("postgres://", "postgresql://", 1)
else:
    db_url = raw_url

connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}

engine = create_engine(
    db_url,
    pool_pre_ping=True,
    connect_args=connect_args,
    **({} if db_url.startswith("sqlite") else {"pool_size": 10, "max_overflow": 20}),
    echo=(settings.ENVIRONMENT == "debug"),
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency that yields a database session and safely closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def check_db_connection() -> bool:
    """Utility to test database connectivity."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        return False
