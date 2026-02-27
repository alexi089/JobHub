# Greenhouse API Integration Plan

## Overview
Integrate with Greenhouse Harvest API to sync job applications automatically.

## Greenhouse API Types

### 1. Harvest API (What We Need)
- **Purpose:** Retrieve candidate applications
- **Auth:** API key (simpler than OAuth)
- **Endpoints:**
  - `GET /v1/candidates` - List all candidates
  - `GET /v1/applications` - List applications per candidate
  - `GET /v1/candidates/{id}` - Get candidate details
  - `GET /v1/applications/{id}` - Get application details

### 2. Job Board API
- **Purpose:** For job boards to pull job postings
- **Not needed:** We want applications, not job listings

## Authentication

**API Key Method (Easiest):**
1. User gets API key from Greenhouse Settings → API Credential Management
2. They paste it into our app
3. We store encrypted API key
4. Use it in requests: `Authorization: Basic <base64(api_key:)>`

**Note:** Key format is `api_key:` (colon at end, no password)

## Implementation Steps

### Backend

1. **Add Greenhouse Client (`app/integrations/greenhouse.py`)**
   - API client with authentication
   - Methods to fetch candidates and applications
   - Error handling

2. **Add Sync Endpoint (`POST /api/ats/greenhouse/sync`)**
   - Accepts user's ATS account ID
   - Fetches applications from Greenhouse
   - Stores in database with `ats_account_id` link
   - Returns sync status

3. **Background Sync (Future)**
   - Celery or similar job queue
   - Periodic sync (every hour)
   - Update existing applications

### Frontend

1. **ATS Connection Page**
   - Form to enter Greenhouse API key
   - "Connect Account" button
   - Stores encrypted in backend

2. **Dashboard Updates**
   - Show connected ATS accounts
   - "Sync Now" button
   - Display synced applications
   - Show last sync time

## API Key Storage

```python
# In ats_accounts table:
{
  "platform": "greenhouse",
  "platform_id": null,  # Not needed for API key auth
  "company_name": "User's Company",
  "credentials": encrypt(api_key),  # Encrypted with Fernet
  "last_synced": datetime,
  "sync_enabled": True
}
```

## Greenhouse Data Mapping

**Greenhouse Application → Our Application Model:**

```python
{
  "job_title": application['job']['name'],
  "company_name": ats_account.company_name,
  "status": map_greenhouse_status(application['status']),
  "applied_at": application['applied_at'],
  "job_url": application['job']['url'],
  "job_data": application,  # Store full JSON
  "ats_account_id": ats_account.id,
}
```

**Status Mapping:**
- `active` → `interviewing`
- `hired` → `offer`
- `rejected` → `rejected`
- `pending` → `applied`

## Testing Plan

1. **Get Greenhouse Test Account**
   - Sign up for Greenhouse trial
   - Get API key
   - Create test candidates

2. **Test Sync Endpoint**
   ```bash
   # Connect account
   POST /api/ats/greenhouse/connect
   {
     "api_key": "...",
     "company_name": "Test Company"
   }
   
   # Trigger sync
   POST /api/ats/greenhouse/sync/{account_id}
   
   # View synced applications
   GET /api/applications
   ```

3. **Verify Data**
   - Applications appear in dashboard
   - Data matches Greenhouse
   - Updates sync correctly

## Next Steps

1. ✅ Plan complete
2. Build Greenhouse client
3. Add sync endpoint
4. Update frontend
5. Test with real Greenhouse account

## Resources

- Greenhouse Harvest API Docs: https://developers.greenhouse.io/harvest.html
- Authentication: https://developers.greenhouse.io/harvest.html#authentication
- Applications endpoint: https://developers.greenhouse.io/harvest.html#get-list-applications
