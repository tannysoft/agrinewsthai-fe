#!/usr/bin/env bash
# Copy the local D1 database (filled by `pnpm migrate:wp`) to the Cloudflare D1
# database in wrangler.jsonc. Run once, against an EMPTY remote database —
# the dump contains the schema, the Payload migrations table and all content.
#
#   pnpm push:db            # export + import
#   pnpm push:db --dry-run  # export only, show the file size
set -euo pipefail
cd "$(dirname "$0")/.."

DB=agrinewsthai-cms
OUT=.migrate/cms-export.sql
mkdir -p .migrate

echo "→ exporting local D1 to $OUT"
npx wrangler d1 export "$DB" --local --output "$OUT"
ls -lh "$OUT"

if [[ "${1:-}" == "--dry-run" ]]; then exit 0; fi

TABLES=$(npx wrangler d1 execute "$DB" --remote --json --command "SELECT count(*) AS n FROM sqlite_master WHERE type='table' AND name NOT LIKE '\_cf\_%' ESCAPE '\\' AND name <> 'sqlite_sequence'" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s)[0].results[0].n))')
if [[ "$TABLES" != "0" ]]; then
  echo "✗ remote database $DB already has $TABLES tables. Use an empty database (or delete and recreate it)." >&2
  exit 1
fi

echo "→ importing into remote D1 ($DB)"
npx wrangler d1 execute "$DB" --remote --file "$OUT" -y
npx wrangler d1 execute "$DB" --remote --command "PRAGMA optimize"
echo "✓ done"
