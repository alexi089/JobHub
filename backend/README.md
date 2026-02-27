# Job Tracker Backend

FastAPI backend for the Job Application Tracker.

## Features

- ✅ User authentication (JWT tokens)
- ✅ CRUD operations for job applications
- ✅ Application status tracking
- ✅ Encrypted ATS credential storage
- ✅ PostgreSQL database
- ✅ Security best practices (password hashing, HTTPS headers, rate limiting ready)

## Tech Stack

- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **PostgreSQL** - Relational database
- **JWT** - Stateless authentication
- **Bcrypt** - Password hashing
- **Fernet** - Symmetric encryption for ATS tokens

## Setup

### 1. Install Dependencies

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Generate Secrets

Run the setup script to create `.env` file with secure secrets:

```bash
python setup.py
```

This generates:
- JWT secret key
- Encryption key for ATS credentials

### 3. Configure Database

Edit `.env` and update the `DATABASE_URL`:

```bash
# Local PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/jobtracker

# Or use a hosted service (Supabase, Railway, etc.)
DATABASE_URL=postgresql://user:pass@host.com:5432/dbname
```

### 4. Create Database

If using local PostgreSQL:

```bash
createdb jobtracker
```

Or use your hosting provider's dashboard to create a database.

### 5. Run Migrations

```bash
# Initialize Alembic (only needed once)
alembic init alembic

# Create initial migration
alembic revision --autogenerate -m "Initial tables"

# Run migrations
alembic upgrade head
```

### 6. Start Server

Development mode (with auto-reload):

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Production mode:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Applications

- `POST /api/applications` - Create application
- `GET /api/applications` - List applications (with filters)
- `GET /api/applications/{id}` - Get application with updates
- `PATCH /api/applications/{id}` - Update application
- `DELETE /api/applications/{id}` - Delete application
- `POST /api/applications/{id}/updates` - Add status update
- `GET /api/applications/{id}/updates` - Get update history

## Testing with cURL

### Register User

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alex@example.com",
    "password": "securepassword123",
    "name": "Alex"
  }'
```

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alex@example.com",
    "password": "securepassword123"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

### Create Application

```bash
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:8000/api/applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "job_title": "Senior Software Engineer",
    "company_name": "Google",
    "status": "applied",
    "applied_at": "2026-02-27T12:00:00Z",
    "job_url": "https://careers.google.com/jobs/123",
    "notes": "Looks like a great opportunity"
  }'
```

### List Applications

```bash
curl -X GET http://localhost:8000/api/applications \
  -H "Authorization: Bearer $TOKEN"
```

### Get Application with Updates

```bash
curl -X GET http://localhost:8000/api/applications/{application_id} \
  -H "Authorization: Bearer $TOKEN"
```

## Interactive API Docs

FastAPI provides automatic interactive documentation:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── api/               # API route handlers
│   │   ├── auth.py        # Authentication endpoints
│   │   └── applications.py # Application CRUD
│   ├── models/            # SQLAlchemy models
│   │   ├── user.py
│   │   ├── ats_account.py
│   │   └── application.py
│   ├── schemas/           # Pydantic schemas
│   │   ├── user.py
│   │   ├── auth.py
│   │   └── application.py
│   ├── utils/             # Utilities
│   │   └── security.py    # JWT, encryption, hashing
│   ├── config.py          # Settings from .env
│   ├── database.py        # DB connection
│   └── main.py            # FastAPI app
├── requirements.txt
├── setup.py               # Generate secrets
├── .env                   # Environment variables (DO NOT COMMIT)
├── .env.example           # Template
└── .gitignore
```

## Security

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens with expiration
- ✅ ATS credentials encrypted with Fernet
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS configured
- ✅ Security headers enabled
- ✅ `.env` files in `.gitignore`

## Database Models

### User
- id, email, name, emails (list), hashed_password
- Relationships: applications, ats_accounts

### ATSAccount
- id, user_id, platform, company_name, encrypted credentials
- Relationship: applications

### Application
- id, user_id, ats_account_id
- job_title, company_name, status, applied_at
- job_url, job_data (JSON), notes
- Relationship: updates

### ApplicationUpdate
- id, application_id, status, note, created_at

## Next Steps

1. ✅ Backend foundation complete
2. 🔄 Add Alembic migrations
3. 🔄 Integrate Greenhouse API
4. 🔄 Add background sync jobs (Celery)
5. 🔄 Build frontend

## Deployment

### Railway

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Create project: `railway init`
4. Add PostgreSQL: `railway add postgresql`
5. Deploy: `railway up`

### Render

1. Create new Web Service
2. Connect GitHub repo
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add PostgreSQL database
6. Set environment variables from `.env`

---

**Built with ❤️ and security in mind** 🔒
