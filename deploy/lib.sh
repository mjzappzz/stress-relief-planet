#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="/var/www/html"
APP_USER="stress-relief"
MONGODB_MAJOR="${MONGODB_MAJOR:-8.0}"
NODE_MAJOR="${NODE_MAJOR:-22}"

log() { printf '[stress-relief] %s\n' "$*"; }
die() { printf '[stress-relief] ERROR: %s\n' "$*" >&2; exit 1; }
require_root() { [[ ${EUID} -eq 0 ]] || die "run as root"; }

detect_os() {
  [[ -r /etc/os-release ]] || die "/etc/os-release not found"
  # shellcheck disable=SC1091
  . /etc/os-release
  OS_ID="${ID}"
  OS_VERSION="${VERSION_ID%%.*}"
  case "${OS_ID}:${OS_VERSION}" in
    ubuntu:22|ubuntu:24|rocky:8|rocky:9) ;;
    *) die "supported systems: Ubuntu 22.04/24.04 and Rocky Linux 8/9; detected ${ID} ${VERSION_ID}" ;;
  esac
}

require_commands() {
  local command_name
  for command_name in "$@"; do
    command -v "${command_name}" >/dev/null || die "missing command: ${command_name}"
  done
}

health_check() {
  systemctl is-active --quiet mongod
  systemctl is-active --quiet stress-relief-backend
  systemctl is-active --quiet nginx
  curl -fsS http://127.0.0.1:5000/api/health >/dev/null
  curl -fsS http://127.0.0.1/ >/dev/null
}
