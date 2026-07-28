#!/usr/bin/env bash
set -Eeuo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
# shellcheck source=deploy/lib.sh
. "${SCRIPT_DIR}/lib.sh"

require_root
detect_os
[[ "$(uname -m)" == "x86_64" ]] || die "this installer currently supports x86_64 only"
df -P /var | awk 'NR==2 && $4 < 2097152 { exit 1 }' || die "at least 2 GiB free space is required"

install_ubuntu() {
  export DEBIAN_FRONTEND=noninteractive
  apt-get update
  apt-get install -y ca-certificates curl gnupg git nginx rsync openssl
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
  install -d -m 0755 /usr/share/keyrings
  curl -fsSL "https://pgp.mongodb.com/server-${MONGODB_MAJOR}.asc" |
    gpg --dearmor --yes -o "/usr/share/keyrings/mongodb-server-${MONGODB_MAJOR}.gpg"
  local codename
  codename="$({ . /etc/os-release; printf '%s' "${VERSION_CODENAME}"; })"
  printf 'deb [ arch=amd64 signed-by=/usr/share/keyrings/mongodb-server-%s.gpg ] https://repo.mongodb.org/apt/ubuntu %s/mongodb-org/%s multiverse\n' \
    "${MONGODB_MAJOR}" "${codename}" "${MONGODB_MAJOR}" \
    >"/etc/apt/sources.list.d/mongodb-org-${MONGODB_MAJOR}.list"
  apt-get update
  apt-get install -y mongodb-org
}

install_rocky() {
  dnf install -y ca-certificates curl git nginx rsync openssl policycoreutils-python-utils
  curl -fsSL "https://rpm.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  dnf install -y nodejs
  cat >"/etc/yum.repos.d/mongodb-org-${MONGODB_MAJOR}.repo" <<EOF
[mongodb-org-${MONGODB_MAJOR}]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/${OS_VERSION}/mongodb-org/${MONGODB_MAJOR}/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://pgp.mongodb.com/server-${MONGODB_MAJOR}.asc
EOF
  dnf install -y mongodb-org
}

log "installing system dependencies for ${OS_ID} ${OS_VERSION}"
if [[ "${OS_ID}" == "ubuntu" ]]; then install_ubuntu; else install_rocky; fi
require_commands node npm nginx mongod mongodump curl rsync

if ! id "${APP_USER}" >/dev/null 2>&1; then
  useradd --system --home-dir "${APP_DIR}" --shell /usr/sbin/nologin "${APP_USER}"
fi

install -d -m 0755 "${APP_DIR}"
rsync -a --delete \
  --exclude='.git/' --exclude='.env' --exclude='.env.*' \
  --exclude='node_modules/' --exclude='dist/' --exclude='deploy/backups/' \
  "${REPO_ROOT}/" "${APP_DIR}/"
touch "${APP_DIR}/.stress-relief-managed"

if [[ ! -f "${APP_DIR}/backend/.env" ]]; then
  jwt_secret="$(openssl rand -hex 32)"
  sed "s|replace-with-at-least-32-random-characters|${jwt_secret}|" \
    "${APP_DIR}/backend/.env.example" >"${APP_DIR}/backend/.env"
  chmod 0600 "${APP_DIR}/backend/.env"
fi

npm --prefix "${APP_DIR}/backend" ci --omit=dev
npm --prefix "${APP_DIR}/frontend" ci
npm --prefix "${APP_DIR}/frontend" run build
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}/backend"

install -m 0644 "${SCRIPT_DIR}/stress-relief-backend.service" /etc/systemd/system/stress-relief-backend.service
if [[ "${OS_ID}" == "ubuntu" ]]; then
  install -m 0644 "${SCRIPT_DIR}/nginx.conf" /etc/nginx/sites-available/stress-relief
  ln -sfn /etc/nginx/sites-available/stress-relief /etc/nginx/sites-enabled/stress-relief
  rm -f /etc/nginx/sites-enabled/default
else
  install -m 0644 "${SCRIPT_DIR}/nginx.conf" /etc/nginx/conf.d/stress-relief.conf
  semanage fcontext -a -t httpd_sys_content_t "${APP_DIR}/frontend/dist(/.*)?" 2>/dev/null ||
    semanage fcontext -m -t httpd_sys_content_t "${APP_DIR}/frontend/dist(/.*)?"
  restorecon -RF "${APP_DIR}/frontend/dist"
  setsebool -P httpd_can_network_connect 1
  if systemctl is-active --quiet firewalld; then
    firewall-cmd --permanent --add-service=http
    firewall-cmd --reload
  fi
fi

nginx -t
systemctl daemon-reload
systemctl enable --now mongod
systemctl enable --now stress-relief-backend
systemctl enable --now nginx
systemctl restart stress-relief-backend nginx
health_check
log "deployment PASS: http://$(hostname -I | awk '{print $1}')/"
