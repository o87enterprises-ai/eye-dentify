import re
import bleach


def validate_email(email: str) -> tuple[bool, str]:
    """
    Validate an email address.
    Returns (is_valid, error_message).
    """
    if not email or not email.strip():
        return False, "Email is required"

    email = email.strip().lower()

    # Basic regex pattern
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        return False, "Invalid email format"

    # Check length
    if len(email) > 255:
        return False, "Email too long (max 255 characters)"

    # Check for common disposable domains (basic check)
    disposable_domains = {
        "tempmail.com", "throwaway.email", "guerrillamail.com",
        "mailinator.com", "yopmail.com", "10minutemail.com",
    }
    domain = email.split("@")[-1]
    if domain in disposable_domains:
        return False, "Disposable email addresses are not allowed"

    return True, ""


def validate_youtube_url(url: str) -> tuple[bool, str]:
    """
    Validate a YouTube URL.
    Returns (is_valid, error_message).
    """
    if not url or not url.strip():
        return False, "URL is required"

    url = url.strip()

    # YouTube URL patterns
    patterns = [
        r'^https?://(www\.)?youtube\.com/watch\?v=[\w-]{11}',
        r'^https?://youtu\.be/[\w-]{11}',
        r'^https?://(www\.)?youtube\.com/shorts/[\w-]{11}',
        r'^https?://(www\.)?youtube\.com/embed/[\w-]{11}',
    ]

    for pattern in patterns:
        if re.match(pattern, url):
            return True, ""

    return False, "Invalid YouTube URL. Please provide a valid youtube.com or youtu.be link."


def sanitize_text(text: str, max_length: int = 1000) -> str:
    """
    Sanitize text input by stripping HTML tags and limiting length.
    """
    if not text:
        return ""

    # Strip HTML tags
    sanitized = bleach.clean(text, tags=[], strip=True)

    # Limit length
    return sanitized[:max_length].strip()


def validate_password(password: str) -> tuple[bool, str]:
    """
    Validate a password.
    Returns (is_valid, error_message).
    """
    if not password:
        return False, "Password is required"

    if len(password) < 8:
        return False, "Password must be at least 8 characters"

    if len(password) > 128:
        return False, "Password too long (max 128 characters)"

    if not re.search(r'[A-Za-z]', password):
        return False, "Password must contain at least one letter"

    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one number"

    return True, ""
