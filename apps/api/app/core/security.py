import datetime
from typing import Any, Union, Optional
import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from app.core.config import settings

# Argon2id password hasher with OWASP-aligned recommended parameters
ph = PasswordHasher(
    time_cost=3,
    memory_cost=65536,  # 64 MB
    parallelism=4,
    hash_len=32,
    salt_len=16
)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against the stored Argon2id hash."""
    try:
        return ph.verify(hashed_password, plain_password)
    except (VerifyMismatchError, Exception):
        return False

def get_password_hash(password: str) -> str:
    """Hashes a password using Argon2id."""
    return ph.hash(password)

def create_access_token(
    subject: Union[str, Any],
    role: str = "USER",
    expires_delta: Optional[datetime.timedelta] = None
) -> str:
    """Creates a signed JWT access token."""
    if expires_delta:
        expire = datetime.datetime.now(datetime.timezone.utc) + expires_delta
    else:
        expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "role": role,
        "iat": datetime.datetime.now(datetime.timezone.utc),
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Optional[dict]:
    """Decodes and validates a JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except (jwt.PyJWTError, Exception):
        return None

