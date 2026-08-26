import os
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from formseva_app.core.config import settings
from formseva_app.api import auth, forms, submissions, operators, otp, payments, admin, feedback

# ── Production Swagger / OpenAPI Gating (FS-M4) ──
is_prod = settings.ENVIRONMENT.lower() == "production"

app = FastAPI(
    title="Form_Seva API — Gujarat Citizen Certificate Assisted-Filing Platform",
    description=(
        "Official Assisted-Filing Backend for Gujarat Government Certificates. "
        "Provides dynamic form schemas, multi-step validation, in-app assisted OTP relay, "
        "operator assignment, Stripe payment processing, and DPDP-compliant data handling."
    ),
    version=settings.VERSION,
    docs_url=None if is_prod else "/docs",
    redoc_url=None if is_prod else "/redoc",
    openapi_url=None if is_prod else "/openapi.json",
)

# ── Security Headers Middleware (FS-M3) ──
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        if is_prod:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# ── CORS Middleware (FS-M6) ──
_cors_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
_cors_origins = [o.strip() for o in _cors_origins_raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ── Global Exception Handler for Error Sanitization (FS-M4) ──
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Sanitizes unhandled 500 errors to prevent leaking stack traces and environment internals."""
    # If the exception is already an HTTPException, FastAPI handles it automatically.
    # Unhandled runtime exceptions:
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again or contact support."}
    )

# ── Register API Routers ──
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
        "docs": None if is_prod else "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
