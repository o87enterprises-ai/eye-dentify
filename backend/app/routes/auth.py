from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services import auth_service
from app.middleware.auth import get_current_user, get_optional_user
from app.models.user import User
from app.middleware.rate_limiter import limiter
from app.utils.validators import sanitize_text

router = APIRouter(prefix="/auth", tags=["Authentication"])


# === Request/Response Schemas ===

class RegisterRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class ResendVerificationRequest(BaseModel):
    email: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: str


class MessageResponse(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    detail: str


# === Endpoints ===

@router.post("/register", response_model=MessageResponse)
@limiter.limit("5/minute")
async def register(
    request: RegisterRequest,
    req: object = None,  # For rate limiter
    db: AsyncSession = Depends(get_db),
):
    """
    Register a new user account.
    Sends a verification email upon successful registration.
    """
    email = sanitize_text(request.email, max_length=255)
    password = request.password

    user, error = await auth_service.register_user(db, email, password)

    if error:
        raise HTTPException(status_code=400, detail=error)

    if user and user.email_verified:
        return MessageResponse(message="Account already exists and is verified. Please log in.")

    return MessageResponse(message="Registration successful. Please check your email to verify your account.")


@router.get("/verify-email", response_model=MessageResponse)
async def verify_email(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Verify a user's email address using the token from the verification email.
    """
    user, error = await auth_service.verify_email(db, token)

    if error:
        raise HTTPException(status_code=400, detail=error)

    return MessageResponse(message="Email verified successfully. You can now log in.")


@router.post("/login", response_model=AuthResponse)
@limiter.limit("10/minute")
async def login(
    request: LoginRequest,
    req: object = None,  # For rate limiter
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticate a user and return a JWT access token.
    """
    email = sanitize_text(request.email, max_length=255)
    password = request.password

    token, error = await auth_service.login_user(db, email, password)

    if error:
        raise HTTPException(status_code=401, detail=error)

    return AuthResponse(access_token=token, email=email)


@router.post("/resend-verification", response_model=MessageResponse)
@limiter.limit("3/minute")
async def resend_verification(
    request: ResendVerificationRequest,
    req: object = None,  # For rate limiter
    db: AsyncSession = Depends(get_db),
):
    """
    Resend the email verification link.
    """
    email = sanitize_text(request.email, max_length=255)

    success, error = await auth_service.resend_verification(db, email)

    if error:
        raise HTTPException(status_code=400, detail=error)

    return MessageResponse(message="Verification email sent. Please check your inbox.")


@router.get("/me", response_model=dict)
async def get_current_user_info(user: User = Depends(get_current_user)):
    """
    Get the current authenticated user's info.
    """
    return {
        "id": str(user.id),
        "email": user.email,
        "email_verified": user.email_verified,
        "daily_analysis_count": user.daily_analysis_count,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }
