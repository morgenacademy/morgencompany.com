#!/usr/bin/env bash
# Rookproef op de live sites. Gebruik:
#   scripts/smoke-live.sh
#   COMPANY=https://deploy-preview-50--websitemorgencompany.netlify.app scripts/smoke-live.sh
set -u
COMPANY=${COMPANY:-https://morgencompany.com}
ACADEMY=${ACADEMY:-https://academy.morgencompany.com}
fail=0

status() { # verwacht url [methode]
  local got
  got=$(curl -s -o /dev/null -w '%{http_code}' -m 20 -X "${3:-GET}" "$2")
  if [ "$got" = "$1" ]; then echo "ok   $got $2"; else echo "FAIL $got (verwacht $1) $2"; fail=1; fi
}
contains() { # url tekst
  if curl -s -m 20 "$1" | grep -qF -- "$2"; then echo "ok   bevat '$2' $1"; else echo "FAIL mist '$2' $1"; fail=1; fi
}
header() { # url header-fragment
  if curl -sI -m 20 "$1" | grep -qiF -- "$2"; then echo "ok   header '$2' $1"; else echo "FAIL header '$2' ontbreekt $1"; fail=1; fi
}

echo "== company ($COMPANY)"
status 200 "$COMPANY/"
status 200 "$COMPANY/academy/"
status 200 "$COMPANY/projecten/"
status 200 "$COMPANY/blog/chat-zegt-het-toch/"
status 200 "$COMPANY/docs/academy-chat/chat.js"
status 405 "$COMPANY/api/chat"
header "$COMPANY/docs/academy-chat/chat.js" "max-age=2592000"
contains "$COMPANY/" "analytics.ahrefs.com"

echo "== niet publiek"
status 404 "$COMPANY/CLAUDE.md"
status 404 "$COMPANY/docs/superpowers/plans/2026-07-04-academy-ai-chat.md"
status 404 "$COMPANY/docs/schrijfstijl.md"
status 404 "$COMPANY/netlify/functions/chat.mjs"
status 404 "$COMPANY/package.json"

echo "== academy ($ACADEMY)"
status 200 "$ACADEMY/"
contains "$ACADEMY/" '<h1'
contains "$ACADEMY/login" 'id="root"'

echo "== domeinen"
status 301 "https://www.morgencompany.com/"
status 301 "https://www.morgenacademy.nl/"
contains "https://morgenacademy.nl/login" 'id="root"'
contains "https://morgenacademy.nl/portal/pharmapartners" 'id="root"'

exit $fail
