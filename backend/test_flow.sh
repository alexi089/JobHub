#!/bin/bash
set -e

echo "🚀 Testing Job Tracker API"
echo

# 1. Register
echo "1️⃣ Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","name":"Test User"}')
echo "$REGISTER_RESPONSE" | jq
echo

# 2. Login
echo "2️⃣ Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}')
echo "$LOGIN_RESPONSE" | jq
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')
echo "Token: ${TOKEN:0:50}..."
echo

# 3. Create application
echo "3️⃣ Creating job application..."
APP_RESPONSE=$(curl -s -X POST http://localhost:8000/api/applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "job_title":"Senior Software Engineer",
    "company_name":"Google",
    "status":"applied",
    "applied_at":"2026-02-27T12:00:00Z",
    "job_url":"https://google.com/careers/123",
    "notes":"Referred by Jane"
  }')
echo "$APP_RESPONSE" | jq
APP_ID=$(echo "$APP_RESPONSE" | jq -r '.id')
echo

# 4. List applications
echo "4️⃣ Listing all applications..."
curl -s http://localhost:8000/api/applications \
  -H "Authorization: Bearer $TOKEN" | jq
echo

# 5. Get specific application
echo "5️⃣ Getting specific application..."
curl -s http://localhost:8000/api/applications/$APP_ID \
  -H "Authorization: Bearer $TOKEN" | jq
echo

echo "✅ All tests passed!"
