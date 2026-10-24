import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import check_db_connection, engine, Base
import app.models
from app.routers import (
    auth,
    athletes,
    sessions,
    twin,
    metrics,
    trends,
    anomalies,
    recommendations,
    demo,
)

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-initialize database tables on first boot in production / cloud PaaS
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized or confirmed.")
    except Exception as e:
        logger.warning(f"Could not auto-create tables on startup: {e}")
    yield

app = FastAPI(
    title="Personal Sports Digital Twin API",
    description="Authoritative backend for the Personal Sports Digital Twin system — tracking longitudinal athlete evolution, personal baselines, deviations, and grounded AI insights.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware configured for cross-domain web deployment (Vercel) and local dev
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",  # Matches any HTTP/HTTPS origin including localhost and Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory for web video playback
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Health & Status Endpoint
@app.get("/health", tags=["Health"])
def health_check():
    """System health check endpoint verifying database connectivity and operational status."""
    db_ok = check_db_connection()
    return {
        "status": "HEALTHY" if db_ok else "DEGRADED",
        "database_connected": db_ok,
        "environment": settings.ENVIRONMENT,
        "gemini_api_configured": bool(settings.GEMINI_API_KEY)
    }

# Mount API Routers
api_prefix = "/api/v1"
app.include_router(auth.router, prefix=api_prefix)
app.include_router(athletes.router, prefix=api_prefix)
app.include_router(sessions.router, prefix=api_prefix)
app.include_router(twin.router, prefix=api_prefix)
app.include_router(metrics.router, prefix=api_prefix)
app.include_router(trends.router, prefix=api_prefix)
app.include_router(anomalies.router, prefix=api_prefix)
app.include_router(recommendations.router, prefix=api_prefix)
app.include_router(demo.router, prefix=api_prefix)

# Custom global exception handler for unexpected server errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"An internal server error occurred: {str(exc)}"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
