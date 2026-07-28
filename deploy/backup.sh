#!/usr/bin/env bash
set -Eeuo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=deploy/lib.sh
. "${SCRIPT_DIR}/lib.sh"
require_commands mongodump
destination="${1:-${PWD}/stress-relief-$(date +%Y%m%d-%H%M%S).archive.gz}"
umask 077
mongodump --uri="${MONGODB_URI:-mongodb://127.0.0.1:27017/stress-relief}" \
  --archive="${destination}" --gzip
[[ -s "${destination}" ]] || die "backup file is empty"
log "backup PASS: ${destination}"
