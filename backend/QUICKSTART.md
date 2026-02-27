# Quick Start Guide

Get the backend running in 5 minutes! 🚀

## Prerequisites

- Python 3.11+ installed
- PostgreSQL database (local or hosted)

## Setup Steps

### 1. Install Dependencies

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Generate Secrets

```bash
python setup.py
```

This creates `.env` with secure JWT and encryption keys.

### 3. Configure Database

Create local database:

```bash
createdb jobtracker
```

Edit `.env` and update this line:

```bash
DATABASE_URL=postgresql://YOUR_USERNAME@localhost/jobtracker
```

Replace `YOUR_USERNAME` with your system username (run `whoami` to check).

**For detailed setup:** See [LOCAL_SETUP.md](./LOCAL_SETUP.md)

### 4. Start Server

```bash
uvicorn app.main:app --reload
```

Server runs at: http://localhost:8000

### 5. Test It!

```bash
./test_api.sh
```

Or visit: http://localhost:8000/docs (interactive API docs)

## Quick Test with cURL

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"pass123","name":"Your Name"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"pass123"}'

# Copy the access_token from response and use it:
TOKEN="paste-token-here"

# Create application
curl -X POST http://localhost:8000/api/applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "job_title":"Software Engineer",
    "company_name":"Google",
    "status":"applied",
    "applied_at":"2026-02-27T12:00:00Z"
  }'

# List applications
curl http://localhost:8000/api/applications \
  -H "Authorization: Bearer $TOKEN"
```

## What's Working

✅ User registration & login  
✅ JWT authentication  
✅ Create/read/update/delete applications  
✅ Application status tracking  
✅ Update history for each application  
✅ Encrypted credential storage (ready for ATS integrations)  
✅ Security headers & CORS  

## Next Steps

1. ✅ Backend done - test with cURL or Swagger UI
2. 🔄 Build React frontend
3. 🔄 Integrate Greenhouse API
4. 🔄 Add background sync jobs

## Troubleshooting

**Error: "Could not connect to database"**
- Check DATABASE_URL in `.env`
- Ensure PostgreSQL is running
- Test connection: `psql $DATABASE_URL`

**Error: "Module not found"**
- Activate venv: `source venv/bin/activate`
- Install deps: `pip install -r requirements.txt`

**Error: "JWT secret not set"**
- Run `python setup.py` to generate `.env`

## File Structure

```
backend/
├── app/
│   ├── api/           # Routes (auth, applications)
│   ├── models/        # Database models
│   ├── schemas/       # Request/response validation
│   ├── utils/         # Security, encryption
│   └── main.py        # FastAPI app
├── requirements.txt   # Dependencies
├── setup.py           # Generate secrets
├── test_api.sh        # Test script
└── .env              # YOUR SECRETS (never commit!)
```

---

**Need help?** Check README.md for detailed docs!
