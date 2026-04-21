#!/bin/bash

BASE_URL="http://localhost:8080"
PASS=0
FAIL=0
TOKEN=""
CLUB_ID=""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}   $1${NC}"
    echo -e "${CYAN}========================================${NC}"
}

request() {
    local METHOD="$1"
    local URL="$2"
    local DATA="$3"
    local AUTH="$4"

    local TMP_BODY
    TMP_BODY=$(mktemp)

    local ARGS=(-s -S -o "$TMP_BODY" -w "%{http_code}" -X "$METHOD" \
        -H "Content-Type: application/json" \
        --max-time 10)

    if [ -n "$AUTH" ]; then
        ARGS+=(-H "Authorization: Bearer $AUTH")
    fi

    if [ -n "$DATA" ]; then
        ARGS+=(-d "$DATA")
    fi

    HTTP_CODE=$(curl "${ARGS[@]}" "$URL")
    BODY=$(cat "$TMP_BODY")
    rm -f "$TMP_BODY"

    echo "$HTTP_CODE|$BODY"
}

LAST_BODY=""

test_endpoint() {
    local METHOD="$1"
    local URL="$2"
    local DATA="$3"
    local DESCRIPTION="$4"
    local EXPECTED="$5"
    local AUTH="$6"

    RESULT=$(request "$METHOD" "$URL" "$DATA" "$AUTH")

    HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1)
    LAST_BODY=$(echo "$RESULT" | cut -d'|' -f2-)

    if [ "$HTTP_CODE" == "$EXPECTED" ]; then
        echo -e "  ${GREEN}PASS${NC} [$METHOD] $DESCRIPTION ($HTTP_CODE)"
        PASS=$((PASS + 1))
    else
        echo -e "  ${RED}FAIL${NC} [$METHOD] $DESCRIPTION (expected $EXPECTED got $HTTP_CODE)"
        echo -e "       ${YELLOW}Response: $LAST_BODY${NC}"
        FAIL=$((FAIL + 1))
    fi
}

# ==========================================
# 0. Infrastructure
# ==========================================
print_header "Infrastructure Checks"

echo -n "Postgres (5432): "
if nc -z localhost 5432; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}DOWN${NC}"
fi

echo -n "Backend (8080): "
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/actuator/health" --max-time 5)
if [ "$HEALTH" == "200" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${YELLOW}WARN ($HEALTH)${NC}"
fi

echo -n "Frontend (3000): "
FRONT=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000" --max-time 5)
if [ "$FRONT" != "000" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${YELLOW}DOWN${NC}"
fi

# ==========================================
# 1. Auth
# ==========================================
print_header "Auth"

TIMESTAMP=$(date +%s)
EMAIL="test_${TIMESTAMP}@mail.com"
PASSWORD="Test1234!"

test_endpoint "POST" "$BASE_URL/api/auth/register" \
"{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
"Register user" "200"

test_endpoint "POST" "$BASE_URL/api/auth/login" \
"{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
"Login user" "200"

TOKEN=$(echo "$LAST_BODY" | jq -r '.accessToken // empty')

if [ -n "$TOKEN" ]; then
    echo -e "  ${GREEN}Token extracted${NC}"
else
    echo -e "  ${YELLOW}No token found${NC}"
fi

test_endpoint "POST" "$BASE_URL/api/auth/login" \
"{\"email\":\"$EMAIL\",\"password\":\"wrong\"}" \
"Invalid login" "401"

# ==========================================
# 2. Clubs
# ==========================================
print_header "Clubs"

test_endpoint "POST" "$BASE_URL/api/clubs" \
"{\"name\":\"Test Club\",\"category\":\"Tech\",\"description\":\"Test\"}" \
"Create club" "200" "$TOKEN"

CLUB_ID=$(echo "$LAST_BODY" | jq -r '.id // empty')

echo "Club ID: $CLUB_ID"

test_endpoint "GET" "$BASE_URL/api/clubs" "" \
"List clubs" "200" "$TOKEN"

test_endpoint "GET" "$BASE_URL/api/clubs/$CLUB_ID" "" \
"Get club" "200" "$TOKEN"

test_endpoint "GET" "$BASE_URL/api/clubs/999999" "" \
"Invalid club" "404" "$TOKEN"

# ==========================================
# 3. Members
# ==========================================
print_header "Members"

test_endpoint "GET" "$BASE_URL/api/clubs/$CLUB_ID/members" "" \
"List members" "200" "$TOKEN"

test_endpoint "POST" "$BASE_URL/api/clubs/$CLUB_ID/members" \
"{\"role\":\"member\",\"status\":\"active\"}" \
"Add member" "200" "$TOKEN"

# ==========================================
# 4. Events
# ==========================================
print_header "Events"

test_endpoint "GET" "$BASE_URL/api/clubs/$CLUB_ID/events" "" \
"List events" "200" "$TOKEN"

test_endpoint "POST" "$BASE_URL/api/clubs/$CLUB_ID/events" \
"{\"name\":\"Event\",\"description\":\"Test\",\"location\":\"Room\",\"capacity\":50}" \
"Create event" "200" "$TOKEN"

# ==========================================
# 5. Finance
# ==========================================
print_header "Finance"

test_endpoint "GET" "$BASE_URL/api/clubs/$CLUB_ID/transactions" "" \
"List transactions" "200" "$TOKEN"

test_endpoint "POST" "$BASE_URL/api/clubs/$CLUB_ID/transactions" \
"{\"type\":\"income\",\"category\":\"fee\",\"amount\":100}" \
"Create transaction" "200" "$TOKEN"

# ==========================================
# 6. Documents
# ==========================================
print_header "Documents"

test_endpoint "GET" "$BASE_URL/api/clubs/$CLUB_ID/documents" "" \
"List documents" "200" "$TOKEN"

test_endpoint "POST" "$BASE_URL/api/clubs/$CLUB_ID/documents" \
"{\"title\":\"Doc\",\"category\":\"report\",\"filePath\":\"/file.pdf\"}" \
"Upload document" "200" "$TOKEN"

# ==========================================
# 7. Unauthorized
# ==========================================
print_header "Unauthorized"

test_endpoint "GET" "$BASE_URL/api/clubs" "" \
"No token clubs" "401"

test_endpoint "GET" "$BASE_URL/api/clubs/$CLUB_ID/events" "" \
"No token events" "401"

# ==========================================
# Summary
# ==========================================
print_header "Summary"

TOTAL=$((PASS + FAIL))
echo "Total: $TOTAL"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"

if [ "$FAIL" -gt 0 ]; then
    exit 1
fi

exit 0