#!/usr/bin/env bash
set -Eeuo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
# shellcheck source=deploy/lib.sh
. "${SCRIPT_DIR}/lib.sh"
require_root
detect_os
require_commands rsync npm systemctl curl

backup_dir="/var/backups/stress-relief/pre-update-$(date +%Y%m%d-%H%M%S)"
install -d -m 0700 "${backup_dir}"
rsync -a --exclude='node_modules/' --exclude='dist/' "${APP_DIR}/" "${backup_dir}/app/"
"${SCRIPT_DIR}/backup.sh" "${backup_dir}/mongodb.archive.gz"

rollback() {
  log "update failed; restoring ${backup_dir}"
  rsync -a "${backup_dir}/app/" "${APP_DIR}/"
  systemctl restart stress-relief-backend nginx || true
}
trap rollback ERR

rsync -a --delete \
  --exclude='.git/' --exclude='.env' --exclude='.env.*' \
  --exclude='node_modules/' --exclude='dist/' --exclude='deploy/backups/' \
  "${REPO_ROOT}/" "${APP_DIR}/"
npm --prefix "${APP_DIR}/backend" ci --omit=dev
npm --prefix "${APP_DIR}/frontend" ci
npm --prefix "${APP_DIR}/frontend" run build
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}/backend"
systemctl restart stress-relief-backend
nginx -t
systemctl reload nginx
health_check
trap - ERR
log "update PASS; rollback data: ${backup_dir}"
