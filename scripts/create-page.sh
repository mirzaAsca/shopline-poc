#!/usr/bin/env bash
# Create a SHOPLINE online-store page from the terminal via the Admin REST API.
# Links the page to a CLI-built theme template via template_suffix (e.g. page.about-us.json -> "about-us").
#
# One-time setup: get a token in Admin > Settings > Staff Settings > (admin staff) > API Auth > Generate
#   (authorize the "pages"/write_content scope). Then export it:
#     export SL_TOKEN="eyJ..."
#
# Usage:
#   ./scripts/create-page.sh "About Us" about-us "<p>Optional body HTML</p>"
#
set -euo pipefail
STORE="${SL_STORE:-0f5667.myshopline.com}"
VERSION="${SL_API_VERSION:-v20260901}"
TITLE="${1:?title required}"
SUFFIX="${2:-}"           # template suffix, e.g. about-us  (empty = default page template)
BODY="${3:-}"

: "${SL_TOKEN:?Set SL_TOKEN to your Admin API access token}"

curl --fail --silent --show-error \
  --request POST \
  --url "https://${STORE}/admin/openapi/${VERSION}/pages.json" \
  --header "Authorization: Bearer ${SL_TOKEN}" \
  --header "Content-Type: application/json; charset=utf-8" \
  --data "$(cat <<JSON
{ "page": { "title": $(printf '%s' "$TITLE" | python3 -c 'import json,sys;print(json.dumps(sys.stdin.read()))'),
            "body_html": $(printf '%s' "$BODY" | python3 -c 'import json,sys;print(json.dumps(sys.stdin.read()))'),
            "template_suffix": $(printf '%s' "$SUFFIX" | python3 -c 'import json,sys;print(json.dumps(sys.stdin.read()))') } }
JSON
)" | python3 -m json.tool
