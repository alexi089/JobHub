"""
Security utilities: password hashing, JWT tokens, and encryption.
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from cryptography.fernet import Fernet
import hashlib
import secrets

from app.config import settings

# Fernet cipher for encrypting ATS credentials
cipher = Fernet(settings.ENCRYPTION_KEY.encode())


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    # Hash format: salt$hash
    try:
        salt, stored_hash = hashed_password.split('$')
        password_hash = hashlib.pbkdf2_hmac('sha256', plain_password.encode(), 
                                           bytes.fromhex(salt), 100000).hex()
        return secrets.compare_digest(password_hash, stored_hash)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Hash a password for storage using PBKDF2."""
    salt = secrets.token_hex(16)
    password_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), 
                                        bytes.fromhex(salt), 100000).hex()
    return f"{salt}${password_hash}"


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Dictionary of claims to encode (e.g., {"sub": user_email})
        expires_delta: Token expiration time (defaults to settings value)
    
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    
    return encoded_jwt


def decode_access_token(token: str) -> Optional[str]:
    """
    Decode and verify a JWT token.
    
    Args:
        token: JWT token string
    
    Returns:
        Email (subject) from token, or None if invalid
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        email: str = payload.get("sub")
        return email
    except JWTError:
        return None


def encrypt_credentials(credentials: str) -> str:
    """
    Encrypt ATS credentials for storage.
    
    Args:
        credentials: Plain text credentials (JSON string or token)
    
    Returns:
        Encrypted string
    """
    return cipher.encrypt(credentials.encode()).decode()


def decrypt_credentials(encrypted_credentials: str) -> str:
    """
    Decrypt ATS credentials.
    
    Args:
        encrypted_credentials: Encrypted credentials from database
    
    Returns:
        Decrypted plain text credentials
    """
    return cipher.decrypt(encrypted_credentials.encode()).decode()
