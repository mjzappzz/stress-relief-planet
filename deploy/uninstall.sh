#!/usr/bin/env bash
set -Eeuo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=deploy/lib.sh
. "${SCRIPT_DIR}/lib.sh"
require_root
detect_os
[[ "${CONFIRM_UNINSTALL:-}" == "YES" ]] || die "set CONFIRM_UNINSTALL=YES"
[[ -f "${APP_DIR}/.stress-relief-managed" ]] ||
  die "${APP_DIR} is not marked as a managed stress-relief deployment"

backup_path="/var/backups/stress-relief/final-$(date +%Y%m%d-%H%M%S).archive.gz"
install -d -m 0700 "$(dirname "${backup_path}")"
"${SCRIPT_DIR}/backup.sh" "${backup_path}"
systemctl disable --now stress-relief-backend || true
rm -f /etc/systemd/system/stress-relief-backend.service
if [[ "${OS_ID}" == "ubuntu" ]]; then
  rm -f /etc/nginx/sites-enabled/stress-relief /etc/nginx/sites-available/stress-relief
else
  rm -f /etc/nginx/conf.d/stress-relief.conf
fi
systemctl daemon-reload
nginx -t && systemctl reload nginx
rm -rf --one-file-system /var/www/html
if [[ "${PURGE_MONGODB_DATA:-NO}" == "YES" ]]; then
  systemctl disable --now mongod || true
  rm -rf --one-file-system /var/lib/mongo /var/log/mongodb
fi
log "uninstall PASS; final database backup: ${backup_path}"
