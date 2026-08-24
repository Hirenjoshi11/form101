from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from formseva_app.core.config import settings
from formseva_app.api import auth, forms, submissions, operators, otp, payments, admin, feedback

app = FastAPI(
    title="Form_Seva API — Gujarat Citizen Certificate Assisted-Filing Platform",
    description=(
        "Official Assisted-Filing Backend for Gujarat Government Certificates. "
        "Provides dynamic form schemas, multi-step validation, in-app assisted OTP relay, "
        "operator assignment, Stripe payment processing, and DPDP-compliant data handling."
    ),
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

import os

# Enable CORS for Next.js frontend, mobile app, and external clients
# In production, set CORS_ORIGINS env var (comma-separated). Defaults to permissive local dev.
_cors_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
_cors_origins = [o.strip() for o in _cors_origins_raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(forms.router, prefix=settings.API_V1_STR)
app.include_router(submissions.router, prefix=settings.API_V1_STR)
app.include_router(operators.router, prefix=settings.API_V1_STR)
app.include_router(otp.router, prefix=settings.API_V1_STR)
app.include_router(payments.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(feedback.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "service": "Form_Seva Gujarat Certificate Assisted-Filing API",
        "status": "operational",
        "version": settings.VERSION,
        "supported_languages": ["gu", "hi", "en"],
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
