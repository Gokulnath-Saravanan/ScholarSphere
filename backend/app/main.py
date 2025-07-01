from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from app.routes import search, analytics

app = FastAPI(
    title="ScholarSphere API",
    description="API for ScholarSphere - Academic Research Network Platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",  # local frontend dev port
        "https://your-frontend.netlify.app"
    ],  # Or ["*"] for all, but not recommended for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(search.router)
app.include_router(analytics.router)

# Health check endpoint
@app.get("/health")
async def health_check():
    return JSONResponse(
        content=jsonable_encoder({"status": "healthy", "message": "API is running"}),
        status_code=200
    )

# Import and include routers here
# Example:
# from app.routes import faculty, publications
# app.include_router(faculty.router)
# app.include_router(publications.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)