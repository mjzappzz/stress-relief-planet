#!/usr/bin/env bash
set -Eeuo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=deploy/lib.sh
. "${SCRIPT_DIR}/lib.sh"
require_commands mongorestore
archive="${1:-}"
[[ -n "${archive}" && -s "${archive}" ]] || die "usage: $0 /path/to/backup.archive.gz"
[[ "${CONFIRM_RESTORE:-}" == "YES" ]] || die "set CONFIRM_RESTORE=YES; restore replaces matching collections"
mongorestore --uri="${MONGODB_URI:-mongodb://127.0.0.1:27017/stress-relief}" \
  --archive="${archive}" --gzip --drop
log "restore PASS: ${archive}"
