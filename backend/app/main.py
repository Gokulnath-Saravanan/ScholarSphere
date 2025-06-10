from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from .routes import faculty, auth
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ScholarSphere API",
    description="Backend API for ScholarSphere - Faculty Research Network Platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(faculty.router, prefix="/api/v1", tags=["faculty"])

@app.get("/")
async def root():
    return {"message": "Welcome to ScholarSphere API"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0"
    }

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception handler caught: {str(exc)}")
    return {
        "status_code": 500,
        "detail": "Internal server error",
        "message": str(exc)
    } 