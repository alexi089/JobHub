# Testing Guide - ATS Sync

**Status:** ✅ Ready to test  
**Backend:** http://localhost:8000 (running)  
**Frontend:** http://localhost:5173 (running)

---

## Quick Test Flow

### 1. Create Account
1. Open http://localhost:5173
2. Click "Create Account"
3. Fill in: name, email, password
4. Click "Create Account"
5. ✅ Should redirect to dashboard

### 2. Connect Greenhouse
1. On dashboard, click "+ Connect ATS"
2. Enter:
   - **Company Name:** Your company (e.g., "Test Company")
   - **API Key:** Your Greenhouse Harvest API key
3. Click "Connect Greenhouse"
4. ✅ Should redirect to dashboard showing connected account

### 3. Sync Applications
1. In the "Connected Accounts" section, find your Greenhouse account
2. Click "Sync Now"
3. ✅ Applications should appear in the table below
4. ✅ "Last synced" timestamp updates

### 4. View Synced Applications
- Table shows all synced applications
- Status badges (applied, interviewing, offer, rejected)
- Source badge shows "Greenhouse" for synced apps

---

## Getting Your Greenhouse API Key

### Option 1: Greenhouse Trial Account
1. Go to https://www.greenhouse.io/demo
2. Request a demo/trial
3. Once logged in:
   - Configure → Dev Center → API Credential Management
   - Create "Harvest API" credential
   - Copy the API key

### Option 2: Existing Greenhouse Account
If you already have access to a Greenhouse account:
1. Log in
2. Configure → Dev Center → API Credential Management
3. Create new "Harvest API" key
4. Copy and paste into our app

---

## Manual API Testing (If Needed)

### 1. Get JWT Token
```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'

# Save the access_token from response
```

### 2. Connect Greenhouse
```bash
TOKEN="your-jwt-token-here"
GREENHOUSE_KEY="your-greenhouse-api-key"

curl -X POST http://localhost:8000/api/ats/greenhouse/connect \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"api_key\": \"$GREENHOUSE_KEY\",
    \"company_name\": \"Test Company\"
  }"

# Save the account ID from response
```

### 3. Sync Applications
```bash
ACCOUNT_ID="uuid-from-connect-response"

curl -X POST http://localhost:8000/api/ats/greenhouse/sync/$ACCOUNT_ID \
  -H "Authorization: Bearer $TOKEN"
```

### 4. List Applications
```bash
curl http://localhost:8000/api/applications \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

---

## What to Look For

### ✅ Success Indicators
- [ ] Connected Greenhouse account appears on dashboard
- [ ] "Sync Now" button works without errors
- [ ] Applications appear in table after sync
- [ ] Status badges display correctly
- [ ] "Greenhouse" badge shows for synced apps
- [ ] "Last synced" timestamp updates

### ❌ Common Issues

**"Failed to connect Greenhouse account"**
- Check API key is correct
- Ensure it's a "Harvest API" key (not Job Board API)
- Verify key has proper permissions

**"Failed to fetch applications"**
- API key might be expired
- Greenhouse account might not have applications yet
- Check backend logs for detailed error

**Backend errors**
```bash
# Check backend logs
cd projects/job-tracker/backend
# Logs should show in the terminal running uvicorn
```

---

## Expected API Responses

### Connect Success
```json
{
  "id": "uuid-here",
  "platform": "greenhouse",
  "company_name": "Test Company",
  "last_synced": null,
  "sync_enabled": true,
  "created_at": "2026-02-27T..."
}
```

### Sync Success
```json
{
  "success": true,
  "applications_synced": 5,
  "message": "Successfully synced 5 new applications from Greenhouse"
}
```

### Application Data
```json
{
  "id": "uuid",
  "user_id": "user-uuid",
  "ats_account_id": "ats-uuid",
  "job_title": "Software Engineer",
  "company_name": "Test Company",
  "status": "interviewing",
  "applied_at": "2026-01-15T10:00:00Z",
  "last_updated": "2026-02-27T...",
  "job_url": null,
  "job_data": {...},  // Full Greenhouse JSON
  "notes": null
}
```

---

## Features Implemented

✅ **Backend**
- Greenhouse API client
- Connect Greenhouse account
- Sync applications endpoint
- List ATS accounts
- Encrypted API key storage

✅ **Frontend**
- Clean, modern UI (Shopify-inspired)
- Connect Greenhouse page
- Dashboard with ATS accounts section
- Applications table with status badges
- Sync button with loading state
- Source indicators (Greenhouse vs Manual)

✅ **Security**
- API keys encrypted at rest
- JWT authentication
- User-scoped data

---

## Next Steps After Testing

1. ✅ Verify Greenhouse sync works
2. Add Workday integration (if needed)
3. Add background sync (periodic auto-sync)
4. Add manual application entry (future)
5. Add status update notifications
6. Deploy to production

---

## Troubleshooting

### Frontend won't load
```bash
cd frontend
npm install  # Reinstall dependencies
npm run dev
```

### Backend errors
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt  # Reinstall deps
python -m uvicorn app.main:app --reload
```

### Database issues
```bash
# Check PostgreSQL is running
brew services list | grep postgresql

# Restart if needed
brew services restart postgresql@16
```

---

**Ready to test!** Once you have your Greenhouse API key, paste it into the Connect Greenhouse page and click Sync Now. 🚀
