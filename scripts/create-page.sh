#!/usr/bin/env bash
# ❌ DEPRECATED / DOES NOT WORK — kept only as a record.
# Verified 2026-06-12 on mirza-asca with a valid app token: SHOPLINE's public Admin API
# has NO `pages` resource. REST `…/pages.json` → 404; the full GraphQL Admin schema (96
# mutations) has NO page mutation. This script's POST will 404. See LEARNINGS.md and
# docs/ops/pages-and-records.md. Pages must be created via the Admin UI or by capturing/
# replaying SHOPLINE's internal (session-authed) admin API — NOT this token-based call.
#
# (Original intent, left for context:)
# Create a SHOPLINE online-store page via the Admin REST API, linking a template via template_suffix.
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
