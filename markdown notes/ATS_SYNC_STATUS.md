# ATS Sync Implementation Status

**Goal:** Pull job applications FROM Greenhouse/Workday and display in dashboard  
**Status:** ✅ Greenhouse Backend Complete | 🔄 Frontend In Progress

---

## What's Built

### ✅ Backend - Greenhouse Integration (COMPLETE)

**1. Greenhouse API Client** (`app/integrations/greenhouse.py`)
- Connects using API key authentication
- Fetches applications from Greenhouse Harvest API
- Maps Greenhouse status → our internal status
- Extracts application data for storage

**2. ATS API Endpoints** (`app/api/ats.py`)
- `POST /api/ats/greenhouse/connect` - Connect Greenhouse account
- `GET /api/ats/accounts` - List connected ATS accounts
- `POST /api/ats/greenhouse/sync/{account_id}` - Trigger sync
- `DELETE /api/ats/accounts/{account_id}` - Disconnect account

**3. Data Flow**
```
User → Provides API Key → Backend Tests Connection → Stores Encrypted
Backend → Fetches Applications → Maps Data → Stores in DB
Frontend → Displays Synced Applications → Shows Sync Status
```

---

## How It Works

### Phase 1: Connect Greenhouse Account

**User Action:**
1. User goes to "Connect ATS" page
2. Gets their Greenhouse API key from Greenhouse Settings
3. Pastes API key + company name
4. Backend validates and stores encrypted

**API Call:**
```bash
POST /api/ats/greenhouse/connect
{
  "api_key": "your-greenhouse-api-key",
  "company_name": "Your Company"
}
```

**Backend:**
- Tests API key with Greenhouse
- Stores encrypted in `ats_accounts` table
- Returns account ID

### Phase 2: Sync Applications

**User Action:**
1. Clicks "Sync Now" button
2. Backend fetches applications from Greenhouse
3. Applications appear in dashboard

**API Call:**
```bash
POST /api/ats/greenhouse/sync/{account_id}
```

**Backend:**
- Decrypts API key
- Calls Greenhouse Harvest API
- Fetches all applications
- Stores in `applications` table with `ats_account_id` link
- Returns sync count

**Greenhouse Data → Our Model:**
```python
{
  "job_title": "Software Engineer",
  "company_name": "User's Company",
  "status": "interviewing",  # mapped from Greenhouse status
  "applied_at": "2026-02-27T12:00:00Z",
  "job_data": {...},  # full Greenhouse JSON stored
  "ats_account_id": "uuid-of-ats-account"
}
```

### Phase 3: Display Applications

**Dashboard shows:**
- All synced applications
- Last sync time
- "Sync Now" button
- ATS source indicator

---

## API Endpoints

### Connect Greenhouse
```http
POST /api/ats/greenhouse/connect
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "api_key": "your-api-key-here",
  "company_name": "Your Company Name"
}

Response 200:
{
  "id": "uuid",
  "platform": "greenhouse",
  "company_name": "Your Company",
  "last_synced": null,
  "sync_enabled": true,
  "created_at": "2026-02-27T..."
}
```

### List ATS Accounts
```http
GET /api/ats/accounts
Authorization: Bearer {jwt_token}

Response 200:
[
  {
    "id": "uuid",
    "platform": "greenhouse",
    "company_name": "Company A",
    "last_synced": "2026-02-27T13:30:00Z",
    "sync_enabled": true,
    "created_at": "..."
  }
]
```

### Sync Applications
```http
POST /api/ats/greenhouse/sync/{account_id}
Authorization: Bearer {jwt_token}

Response 200:
{
  "success": true,
  "applications_synced": 15,
  "message": "Successfully synced 15 new applications from Greenhouse"
}
```

### Disconnect Account
```http
DELETE /api/ats/accounts/{account_id}
Authorization: Bearer {jwt_token}

Response 200:
{
  "message": "ATS account disconnected successfully"
}
```

---

## Frontend TODO

The frontend I built earlier needs to be updated to focus on ATS sync:

### 🔄 Pages to Update/Add

1. **Connect Greenhouse Page** (`/ats/connect`)
   - Form with API key + company name fields
   - Test connection button
   - Instructions on getting API key

2. **Dashboard Updates** (`/dashboard`)
   - Show connected ATS accounts
   - "Sync Now" button per account
   - Last sync timestamp
   - Synced application indicator

3. **Remove Manual Create** (for now)
   - Keep the application list view
   - Remove "+ New Application" button
   - Focus on viewing synced data

### Frontend Code Changes Needed:

```typescript
// Add to api/client.ts
export const atsApi = {
  connectGreenhouse: async (data: {
    api_key: string;
    company_name: string;
  }) => {
    return await api.post('/api/ats/greenhouse/connect', data);
  },
  
  listAccounts: async () => {
    return await api.get('/api/ats/accounts');
  },
  
  syncGreenhouse: async (accountId: string) => {
    return await api.post(`/api/ats/greenhouse/sync/${accountId}`);
  },
  
  disconnect: async (accountId: string) => {
    return await api.delete(`/api/ats/accounts/${accountId}`);
  },
};
```

---

## Testing Plan

### 1. Get Greenhouse Test Account
- Sign up: https://www.greenhouse.io/demo
- OR use Greenhouse developer sandbox

### 2. Get API Key
1. Login to Greenhouse
2. Configure → Dev Center → API Credential Management
3. Create "Harvest API" credential
4. Copy API key

### 3. Test Backend

```bash
# 1. Connect account
curl -X POST http://localhost:8000/api/ats/greenhouse/connect \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "YOUR_GREENHOUSE_API_KEY",
    "company_name": "Test Company"
  }'

# 2. List accounts
curl http://localhost:8000/api/ats/accounts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Trigger sync (use account ID from step 1)
curl -X POST http://localhost:8000/api/ats/greenhouse/sync/ACCOUNT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 4. View synced applications
curl http://localhost:8000/api/applications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Test Frontend
1. Register/login
2. Navigate to Connect ATS page
3. Enter Greenhouse API key
4. Click Sync Now
5. Verify applications appear in dashboard

---

## What's Next

### Immediate (To Test ATS Sync)
1. ✅ Backend Greenhouse client - DONE
2. ✅ ATS endpoints - DONE
3. 🔄 Update frontend for ATS connection
4. 🔄 Test with real Greenhouse account

### Future Enhancements
- Background sync (periodic automatic sync)
- Workday integration
- Add manual applications (secondary feature)
- Status update sync (bi-directional)
- Email notifications on new applications

---

## Current Architecture

```
User
  ↓
Frontend (React)
  ↓
Backend API (FastAPI)
  ↓
Greenhouse Client (httpx)
  ↓
Greenhouse Harvest API
  ↓
Applications stored in PostgreSQL
  ↓
Displayed in Dashboard
```

**Key Point:** We're pulling FROM Greenhouse (read-only for now), not pushing TO Greenhouse.

---

## Files Changed/Added

**Backend:**
```
app/integrations/greenhouse.py      # NEW - Greenhouse API client
app/api/ats.py                      # NEW - ATS endpoints
app/main.py                         # MODIFIED - Added ATS router
```

**Docs:**
```
GREENHOUSE_INTEGRATION.md           # NEW - Integration plan
ATS_SYNC_STATUS.md                  # NEW - This file
```

**Frontend:**
```
(To be updated - see Frontend TODO section above)
```

---

## Summary

✅ **Backend is ready for ATS sync testing**
- Greenhouse API client implemented
- Endpoints for connect/sync/disconnect
- Data mapping and storage complete
- Encrypted credential storage

🔄 **Frontend needs updating**
- Add Connect ATS page
- Update dashboard for ATS accounts
- Add sync button
- Show synced application indicators

🧪 **Ready to test with real Greenhouse account**
- Need API key from Greenhouse
- Can test full sync flow
- Verify applications sync correctly

**Next step:** Either test backend with Greenhouse API key, or update frontend to support ATS connection flow.
