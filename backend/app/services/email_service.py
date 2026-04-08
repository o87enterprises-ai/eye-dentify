from abc import ABC, abstractmethod
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

import httpx
from loguru import logger

from app.config import get_settings

settings = get_settings()


class EmailProvider(ABC):
    """Abstract base class for email providers."""

    @abstractmethod
    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        """Send an email. Returns True on success."""
        pass


class MockEmailProvider(EmailProvider):
    """Mock provider for development/testing. Logs emails instead of sending."""

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        logger.info(f"[MOCK EMAIL] To: {to_email} | Subject: {subject}")
        logger.info(f"[MOCK EMAIL] Content preview: {html_content[:200]}...")
        return True


class ResendProvider(EmailProvider):
    """Resend.com email provider. Free tier: 3000 emails/month."""

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        if not settings.RESEND_API_KEY:
            logger.error("RESEND_API_KEY not configured")
            return False

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "from": f"Eye-Dentify <{settings.SMTP_FROM}>",
                        "to": [to_email],
                        "subject": subject,
                        "html": html_content,
                        "text": text_content or html_content,
                    },
                )

                if response.status_code in (200, 201):
                    logger.info(f"Email sent to {to_email} via Resend")
                    return True
                else:
                    logger.error(f"Resend API error: {response.status_code} - {response.text}")
                    return False

        except Exception as e:
            logger.error(f"Failed to send email via Resend: {e}")
            return False


class SMTPProvider(EmailProvider):
    """Standard SMTP email provider. Works with Gmail, SendGrid, etc."""

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.error("SMTP credentials not configured")
            return False

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.SMTP_FROM
            msg["To"] = to_email

            if text_content:
                msg.attach(MIMEText(text_content, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            if settings.SMTP_USE_TLS:
                server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
                server.starttls()
            else:
                server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)

            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
            server.quit()

            logger.info(f"Email sent to {to_email} via SMTP")
            return True

        except Exception as e:
            logger.error(f"Failed to send email via SMTP: {e}")
            return False


def get_email_provider() -> EmailProvider:
    """Factory function to get the configured email provider."""
    provider_type = settings.EMAIL_PROVIDER.lower()

    providers = {
        "mock": MockEmailProvider,
        "resend": ResendProvider,
        "smtp": SMTPProvider,
    }

    provider_class = providers.get(provider_type, MockEmailProvider)
    return provider_class()


async def send_verification_email(to_email: str, verification_token: str) -> bool:
    """Send email verification link."""
    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Inter', system-ui, sans-serif; background: #0B1A2A; color: #EAF2F8; padding: 40px 20px; }}
            .container {{ max-width: 500px; margin: 0 auto; background: #121C26; border: 1px solid #D4AF37; border-radius: 12px; padding: 40px; }}
            .logo {{ text-align: center; margin-bottom: 24px; }}
            h1 {{ color: #D4AF37; font-size: 24px; margin-bottom: 16px; }}
            p {{ color: #EAF2F8; line-height: 1.6; margin-bottom: 16px; }}
            .btn {{ display: inline-block; background: #D4AF37; color: #0B1A2A; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; margin: 24px 0; }}
            .link {{ color: #00D1FF; word-break: break-all; font-size: 12px; }}
            .footer {{ color: #7F8C9A; font-size: 12px; margin-top: 32px; text-align: center; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">
                <img src="{settings.FRONTEND_URL}/logo.png" alt="Eye-Dentify" style="width: 64px; height: 64px;" />
            </div>
            <h1>Verify Your Email</h1>
            <p>Welcome to Eye-Dentify! Please verify your email address to start analyzing videos.</p>
            <p style="text-align: center;">
                <a href="{verify_url}" class="btn">Verify Email Address</a>
            </p>
            <p style="font-size: 12px; color: #7F8C9A;">Or copy this link:</p>
            <p class="link">{verify_url}</p>
            <p style="font-size: 12px; color: #7F8C9A;">This link expires in 24 hours.</p>
            <div class="footer">
                <p>Eye-Dentify — Integrity. Insight. Identification.</p>
                <p>&copy; 2026 087 Software Development</p>
            </div>
        </div>
    </body>
    </html>
    """

    text_content = f"""
    Welcome to Eye-Dentify!

    Please verify your email address by clicking the link below:
    {verify_url}

    This link expires in 24 hours.

    Eye-Dentify — Integrity. Insight. Identification.
    """

    provider = get_email_provider()
    return await provider.send_email(
        to_email=to_email,
        subject="Verify Your Email — Eye-Dentify",
        html_content=html_content,
        text_content=text_content,
    )
