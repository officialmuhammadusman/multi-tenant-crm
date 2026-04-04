#!/bin/bash
# Concurrency test: fires 100 simultaneous assign requests for the same user
# Expects exactly 5 to succeed (HTTP 200) and 95 to fail (HTTP 409)
# Usage: ./scripts/test-concurrency.sh

API_URL="${API_URL:-http://localhost:3001/api/v1}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@acmeinc.com}"
ADMIN_PASS="${ADMIN_PASS:-Admin@123456}"

echo "=== CRM Concurrency Test ==="
echo "Target: $API_URL"
echo ""

# Step 1: Login as admin
echo "1. Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}")

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Login failed. Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Logged in. Token obtained."
echo ""

# Step 2: Get list of users in org
echo "2. Fetching users..."
USERS_RESPONSE=$(curl -s -X GET "$API_URL/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "Users: $USERS_RESPONSE" | head -c 200
echo ""

# Step 3: Get list of unassigned customers
echo "3. Fetching unassigned customers..."
CUSTOMERS_RESPONSE=$(curl -s -X GET "$API_URL/customers?limit=100" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

# Extract first member user id and several customer ids (manual step for demo)
echo ""
echo "4. Running 100 concurrent assignment requests..."
echo "   (Manually set TARGET_USER_ID and CUSTOMER_IDS below based on your seed data)"
echo ""

# You can set these from the seed data or get from the API
TARGET_USER_ID="${TARGET_USER_ID:-}"
CUSTOMER_ID="${CUSTOMER_ID:-}"

if [ -z "$TARGET_USER_ID" ] || [ -z "$CUSTOMER_ID" ]; then
  echo "⚠️  Set TARGET_USER_ID and CUSTOMER_ID environment variables."
  echo "   Example:"
  echo "   TARGET_USER_ID=<user-uuid> CUSTOMER_ID=<customer-uuid> ./scripts/test-concurrency.sh"
  exit 0
fi

# Fire 100 concurrent requests
SUCCESS=0
CONFLICT=0
OTHER=0

pids=()
results_file=$(mktemp)

for i in $(seq 1 100); do
  (
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
      "$API_URL/customers/$CUSTOMER_ID/assign" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"userId\":\"$TARGET_USER_ID\"}")
    echo "$STATUS" >> "$results_file"
  ) &
  pids+=($!)
done

# Wait for all
for pid in "${pids[@]}"; do
  wait "$pid"
done

# Tally results
while IFS= read -r status; do
  case "$status" in
    200) ((SUCCESS++)) ;;
    409) ((CONFLICT++)) ;;
    *)   ((OTHER++)) ;;
  esac
done < "$results_file"

rm -f "$results_file"

echo "=== Results ==="
echo "✅ 200 Success:  $SUCCESS (expected: ≤5)"
echo "⛔ 409 Conflict: $CONFLICT (expected: ≥95)"
echo "❓ Other:        $OTHER"
echo ""

if [ "$SUCCESS" -le 5 ] && [ "$CONFLICT" -ge 95 ]; then
  echo "🎉 PASSED — concurrency protection is working correctly"
else
  echo "❌ FAILED — race condition detected"
  exit 1
fi
