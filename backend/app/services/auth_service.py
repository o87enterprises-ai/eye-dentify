from datetime import timedelta
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from app.models.user import User
from app.utils.jwt import create_access_token
from app.services.email_service import send_verification_email
from app.utils.validators import validate_email, validate_password


async def register_user(
    db: AsyncSession,
    email: str,
    password: str,
) -> tuple[Optional[User], Optional[str]]:
    """
    Register a new user.
    Returns (user, error_message).
    """
    # Validate email
    is_valid, error = validate_email(email)
    if not is_valid:
        return None, error

    # Validate password
    is_valid, error = validate_password(password)
    if not is_valid:
        return None, error

    email = email.strip().lower()

    # Check if user already exists
    result = await db.execute(select(User).where(User.email == email))
    existing = result.scalar_one_or_none()
    if existing:
        if existing.email_verified:
            return None, "An account with this email already exists"
        else:
            # Re-send verification for unverified accounts
            token = existing.generate_verification_token()
            await db.commit()
            await send_verification_email(existing.email, token)
            return existing, None

    # Create new user
    user = User(email=email)
    user.set_password(password)
    token = user.generate_verification_token()

    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Send verification email
    await send_verification_email(user.email, token)
    logger.info(f"New user registered: {email}")

    return user, None


async def verify_email(
    db: AsyncSession,
    token: str,
) -> tuple[Optional[User], Optional[str]]:
    """
    Verify a user's email with the provided token.
    Returns (user, error_message).
    """
    if not token:
        return None, "Verification token is required"

    result = await db.execute(select(User).where(User.verification_token == token))
    user = result.scalar_one_or_none()

    if not user:
        return None, "Invalid verification token"

    if user.email_verified:
        return user, None  # Already verified

    user.email_verified = True
    user.verification_token = None  # Invalidate token after use
    await db.commit()

    logger.info(f"Email verified: {user.email}")
    return user, None


async def login_user(
    db: AsyncSession,
    email: str,
    password: str,
) -> tuple[Optional[str], Optional[str]]:
    """
    Authenticate a user and return a JWT token.
    Returns (access_token, error_message).
    """
    email = email.strip().lower()

    # Validate email format
    is_valid, error = validate_email(email)
    if not is_valid:
        return None, error

    # Find user
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        return None, "Invalid email or password"

    if not user.check_password(password):
        return None, "Invalid email or password"

    if not user.email_verified:
        return None, "Please verify your email before logging in"

    # Generate JWT token
    token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=timedelta(hours=24),
    )

    logger.info(f"User logged in: {email}")
    return token, None


async def resend_verification(
    db: AsyncSession,
    email: str,
) -> tuple[bool, Optional[str]]:
    """
    Resend verification email to a user.
    Returns (success, error_message).
    """
    email = email.strip().lower()

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        return False, "No account found with this email"

    if user.email_verified:
        return False, "Email is already verified"

    # Generate new token
    token = user.generate_verification_token()
    await db.commit()

    await send_verification_email(user.email, token)
    return True, None
