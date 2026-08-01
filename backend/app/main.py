from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, product, scanner, dashboard, ai, comparison, gamification, admin

app = FastAPI(
    title="AquaPrint AI API",
    description="Backend API for the AquaPrint AI platform",
    version="1.0.0",
)

origins = [origin.strip() for origin in settings.cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "environment": settings.environment}

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(product.router, prefix="/api/v1/products", tags=["Products"])
app.include_router(scanner.router, prefix="/api/v1/scanner", tags=["Scanner"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["AI Assistant"])
app.include_router(comparison.router, prefix="/api/v1/comparison", tags=["Comparison"])
app.include_router(gamification.router, prefix="/api/v1/gamification", tags=["Gamification"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])

