#!/usr/bin/env python3
"""
Setup script to generate secrets and initialize .env file.
Run this once before starting the application.
"""
import secrets
from cryptography.fernet import Fernet
import os


def generate_jwt_secret():
    """Generate a secure JWT secret key."""
    return secrets.token_hex(32)


def generate_encryption_key():
    """Generate a Fernet encryption key."""
    return Fernet.generate_key().decode()


def create_env_file():
    """Create .env file with generated secrets."""
    
    if os.path.exists(".env"):
        print("⚠️  .env file already exists!")
        response = input("Do you want to overwrite it? (yes/no): ")
        if response.lower() != "yes":
            print("Aborted. Your existing .env file is safe.")
            return
    
    jwt_secret = generate_jwt_secret()
    encryption_key = generate_encryption_key()
    
    env_content = f"""# Database (UPDATE THIS with your PostgreSQL URL)
DATABASE_URL=postgresql://user:password@localhost:5432/jobtracker

# JWT Authentication (GENERATED - DO NOT CHANGE)
JWT_SECRET_KEY={jwt_secret}
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Encryption for ATS credentials (GENERATED - DO NOT CHANGE)
ENCRYPTION_KEY={encryption_key}

# Application
ENVIRONMENT=development
DEBUG=True
API_TITLE=Job Tracker API
API_VERSION=1.0.0

# CORS (comma-separated origins)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# ATS API Keys (add as needed)
GREENHOUSE_API_KEY=
WORKDAY_CLIENT_ID=
WORKDAY_CLIENT_SECRET=

# Email (optional, for notifications)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
"""
    
    with open(".env", "w") as f:
        f.write(env_content)
    
    print("✅ .env file created successfully!")
    print("\n🔒 Security reminders:")
    print("1. NEVER commit .env to git")
    print("2. Update DATABASE_URL with your PostgreSQL connection string")
    print("3. Keep JWT_SECRET_KEY and ENCRYPTION_KEY safe")
    print("\n📝 Next steps:")
    print("1. Edit .env and update DATABASE_URL")
    print("2. Install dependencies: pip install -r requirements.txt")
    print("3. Run database migrations: alembic upgrade head")
    print("4. Start server: uvicorn app.main:app --reload")


if __name__ == "__main__":
    print("🚀 Job Tracker Backend Setup\n")
    create_env_file()
