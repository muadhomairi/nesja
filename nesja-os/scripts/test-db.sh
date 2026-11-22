#!/usr/bin/env bash
# Runs every migration and SQL test against a throwaway local PostgreSQL 16 cluster.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PGBIN="${PGBIN:-$(ls -d /usr/lib/postgresql/*/bin | sort -V | tail -1)}"
WORK="$(mktemp -d)"; PORT="${PGPORT_TEST:-54329}"
cleanup() { "$PGBIN/pg_ctl" -D "$WORK/data" stop -m fast >/dev/null 2>&1 || true; rm -rf "$WORK"; }
trap cleanup EXIT
RUNAS=""; if [ "$(id -u)" = "0" ]; then chown -R postgres "$WORK"; RUNAS="runuser -u postgres --"; fi
$RUNAS "$PGBIN/initdb" -D "$WORK/data" -U postgres -A trust >/dev/null
$RUNAS "$PGBIN/pg_ctl" -D "$WORK/data" -o "-p $PORT -k $WORK -c listen_addresses=''" -l "$WORK/log" start >/dev/null
PSQL=(psql -h "$WORK" -p "$PORT" -U postgres -d postgres -v ON_ERROR_STOP=1 -q)
"${PSQL[@]}" -f "$ROOT/supabase/tests/00_local_supabase_stubs.sql"
for m in "$ROOT"/supabase/migrations/*.sql; do echo "migrate $(basename "$m")"; "${PSQL[@]}" -f "$m"; done
for t in "$ROOT"/supabase/tests/[1-9]*_test.sql; do echo "test $(basename "$t")"; "${PSQL[@]}" -f "$t" 2>&1; done
