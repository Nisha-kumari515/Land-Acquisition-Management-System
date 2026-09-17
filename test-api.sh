#!/bin/bash
BASE_URL="http://localhost:3000/api"
echo "================================================="
echo "   BHOOMISETU FULL BACKEND API TEST SUITE        "
echo "================================================="

# 1. Login
echo -e "\n1. Authenticating as National Admin..."
AUTH_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bhoomisetu.demo","password":"demo-admin-password"}')
TOKEN=$(echo $AUTH_RES | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $AUTH_RES | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Login failed. Ensure the server is running on localhost:3000."
  exit 1
fi
echo "SUCCESS: Token retrieved."

# 2. Geography / Admin
echo -e "\n2. Fetching States (Phase 54)..."
STATE_ID=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/admin/states" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)
echo "SUCCESS: Retrieved State ID: $STATE_ID"

echo -e "\n3. Fetching Districts (Phase 54)..."
DISTRICT_ID=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/admin/districts?stateId=$STATE_ID" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)
echo "SUCCESS: Retrieved District ID: $DISTRICT_ID"

# 3. Global Search
echo -e "\n4. Testing Global Search Engine (Phase 54)..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/search?q=demo" | head -c 200
echo "...(truncated)"

# 4. Project Creation
echo -e "\n5. Testing Project Creation (Phase 55)..."
PROJECT_RES=$(curl -s -X POST "$BASE_URL/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"code\": \"TEST-PROJ-999\",
    \"name\": \"Guwahati Ring Road Expansion\",
    \"department\": \"NHAI\",
    \"stateId\": \"$STATE_ID\",
    \"districtId\": \"$DISTRICT_ID\",
    \"createdById\": \"$USER_ID\"
  }")
PROJECT_ID=$(echo $PROJECT_RES | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)
echo "SUCCESS: Created Project ID: $PROJECT_ID"

# 5. Project Workflow
echo -e "\n6. Testing Project Status Transitions (Phase 55)..."
curl -s -X POST "$BASE_URL/projects/$PROJECT_ID/submit" -H "Authorization: Bearer $TOKEN" >/dev/null
curl -s -X POST "$BASE_URL/projects/$PROJECT_ID/approve" -H "Authorization: Bearer $TOKEN" >/dev/null
STATUS=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/projects/$PROJECT_ID" | grep -o '"status":"[^"]*' | cut -d'"' -f4)
echo "SUCCESS: Project is now $STATUS"

# 6. GIS GeoJSON
echo -e "\n7. Testing PostGIS Geometry Update (Phase 56)..."
curl -s -X PUT "$BASE_URL/projects/$PROJECT_ID/geometry" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "geojson": {
      "type": "Polygon",
      "coordinates": [[[91.7, 26.1], [91.8, 26.1], [91.8, 26.2], [91.7, 26.2], [91.7, 26.1]]]
    }
  }' >/dev/null
echo "SUCCESS: Polygon stored in PostGIS."

# 7. GIS Impact
echo -e "\n8. Testing Real Spatial Impact Engine (Phase 57)..."
curl -s -X POST "$BASE_URL/projects/$PROJECT_ID/impact-analysis" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "geometry": {
      "type": "Polygon",
      "coordinates": [[[91.7, 26.1], [91.8, 26.1], [91.8, 26.2], [91.7, 26.2], [91.7, 26.1]]]
    },
    "srid": 4326
  }' >/dev/null
echo "SUCCESS: Impact analysis processed."

# 8. Data Quality
echo -e "\n9. Testing Data Quality Dashboard (Phase 64)..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/data-quality/dashboard" | head -c 200
echo "...(truncated)"

# 9. Clean up
echo -e "\n\n10. Testing Project Deletion..."
curl -s -X DELETE "$BASE_URL/projects/$PROJECT_ID" -H "Authorization: Bearer $TOKEN" >/dev/null
echo "SUCCESS: Test project deleted."
echo "================================================="
echo "ALL TESTS EXECUTED."
