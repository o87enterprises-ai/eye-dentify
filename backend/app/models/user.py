from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    Integer,
    Date,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import bcrypt

from app.database import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        Index("idx_users_email", "email", unique=True),
        Index("idx_users_verification_token", "verification_token", unique=True),
        Index("idx_users_created_at", "created_at"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)

    # Email verification
    email_verified = Column(Boolean, default=False, nullable=False)
    verification_token = Column(String(64), unique=True, nullable=True)

    # Free tier usage tracking
    daily_analysis_count = Column(Integer, default=0, nullable=False)
    daily_limit_reset_date = Column(Date, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def set_password(self, password: str) -> None:
        """Hash and store the password using bcrypt."""
        salt = bcrypt.gensalt(rounds=12)
        self.password_hash = bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

    def check_password(self, password: str) -> bool:
        """Verify a password against the stored hash."""
        return bcrypt.checkpw(
            password.encode("utf-8"),
            self.password_hash.encode("utf-8"),
        )

    def generate_verification_token(self) -> str:
        """Generate a new verification token."""
        self.verification_token = uuid.uuid4().hex
        return self.verification_token

    def should_reset_daily_limit(self) -> bool:
        """Check if the daily limit should be reset (new day)."""
        from datetime import date

        if self.daily_limit_reset_date is None:
            return True
        return self.daily_limit_reset_date < date.today()

    def reset_daily_limit(self) -> None:
        """Reset the daily analysis count."""
        from datetime import date

        self.daily_analysis_count = 0
        self.daily_limit_reset_date = date.today()

    def increment_daily_count(self) -> int:
        """Increment the daily analysis count and return the new count."""
        if self.should_reset_daily_limit():
            self.reset_daily_limit()
        self.daily_analysis_count += 1
        return self.daily_analysis_count

    def __repr__(self):
        return f"<User {self.email} (verified={self.email_verified})>"
