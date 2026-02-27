# Job Tracker - ATS Sync Application

Automatically sync job applications from ATS systems (Greenhouse, Workday) and track them in a unified dashboard.

## Features

✅ **ATS Integration**
- Greenhouse Harvest API sync
- Encrypted credential storage
- Automatic application syncing

✅ **Dashboard**
- View all synced applications
- Status tracking (applied, interviewing, offer, rejected)
- Source indicators (ATS vs manual)

✅ **Security**
- JWT authentication
- PBKDF2 password hashing (100k iterations)
- Encrypted ATS credentials
- User data isolation

## Tech Stack

**Backend:**
- FastAPI (Python)
- PostgreSQL
- SQLAlchemy ORM
- JWT authentication

**Frontend:**
- React 18
- TypeScript
- TanStack Query
- Vite

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL 16+

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Generate secrets
python setup.py

# Update .env with your database URL
# DATABASE_URL=postgresql://username@localhost/jobtracker

# Start server
python -m uvicorn app.main:app --reload
```

Backend runs at: http://localhost:8000

**API Docs:** http://localhost:8000/docs

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy .env.example to .env (already configured for local dev)
cp .env.example .env

# Start dev server
npm run dev
```

Frontend runs at: http://localhost:5173

### Database Setup

```bash
# Install PostgreSQL
brew install postgresql@16
brew services start postgresql@16

# Create database
createdb jobtracker
```

## Usage

### 1. Register Account
- Go to http://localhost:5173
- Click "Create Account"
- Fill in email + password (min 8 chars)

### 2. Connect Greenhouse
- Click "+ Connect ATS"
- Get API key from Greenhouse:
  - Configure → Dev Center → API Credential Management
  - Create "Harvest API" credential
- Paste API key + company name
- Click "Connect Greenhouse"

### 3. Sync Applications
- Dashboard shows connected Greenhouse account
- Click "Sync Now"
- Applications populate in table

## Project Structure

```
job-tracker/
├── backend/
│   ├── app/
│   │   ├── api/              # API endpoints
│   │   ├── models/           # Database models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── integrations/     # ATS integrations
│   │   └── utils/            # Security, helpers
│   ├── requirements.txt
│   └── setup.py
├── frontend/
│   ├── src/
│   │   ├── api/              # API client
│   │   ├── pages/            # React pages
│   │   ├── hooks/            # React hooks
│   │   └── types/            # TypeScript types
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get JWT token
- `GET /api/auth/me` - Current user info

### Applications
- `GET /api/applications` - List all applications
- `GET /api/applications/{id}` - Get application details

### ATS Integration
- `POST /api/ats/greenhouse/connect` - Connect Greenhouse account
- `GET /api/ats/accounts` - List connected accounts
- `POST /api/ats/greenhouse/sync/{id}` - Sync applications
- `DELETE /api/ats/accounts/{id}` - Disconnect account

## Documentation

- **Backend Setup:** `backend/LOCAL_SETUP.md`
- **Quick Start:** `backend/QUICKSTART.md`
- **Testing Guide:** `markdown notes/TESTING_GUIDE.md`
- **ATS Integration:** `markdown notes/GREENHOUSE_INTEGRATION.md`

## Development

### Backend
```bash
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm run dev
```

### Run Tests
```bash
cd backend
./test_flow.sh
```

## Security

- Passwords: PBKDF2-HMAC-SHA256 (100k iterations)
- API Keys: Fernet symmetric encryption
- Tokens: JWT with 30-minute expiration
- Database: User data isolation enforced
- See: `backend/SECURITY_AUDIT.md`

## Future Features

- [ ] Workday integration
- [ ] Background sync (periodic)
- [ ] Manual application entry
- [ ] Status update notifications
- [ ] Email alerts
- [ ] Application analytics

## License

MIT

## Support

For issues or questions, see documentation in `markdown notes/` folder.
