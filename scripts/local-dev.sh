#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_DIR="$ROOT_DIR/backend"
STATE_DIR="$ROOT_DIR/.local-dev"
LOG_DIR="$STATE_DIR/logs"

FRONTEND_PORT="${FRONTEND_PORT:-5173}"
BACKEND_PORT="${BACKEND_PORT:-5000}"
MYSQL_CONTAINER="${MYSQL_CONTAINER:-stress-relief-mysql}"
STOP_MYSQL="${STOP_MYSQL:-1}"

mkdir -p "$LOG_DIR"

log() {
  printf '[local-dev] %s\n' "$*"
}

fail() {
  printf '[local-dev] FAIL: %s\n' "$*" >&2
  exit 1
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "missing command: $1"
}

check_deps() {
  need_cmd node
  need_cmd npm
  need_cmd curl
  need_cmd lsof

  [ -d "$FRONTEND_DIR/node_modules" ] || fail "frontend/node_modules missing; run: cd frontend && npm install"
  [ -d "$BACKEND_DIR/node_modules" ] || fail "backend/node_modules missing; run: cd backend && npm install"
}

port_pids() {
  lsof -tiTCP:"$1" -sTCP:LISTEN 2>/dev/null || true
}

is_project_pid() {
  local pid="$1"
  local cwd=""
  local cmd=""

  cwd="$(readlink "/proc/$pid/cwd" 2>/dev/null || true)"
  cmd="$(ps -p "$pid" -o args= 2>/dev/null || true)"

  [[ "$cwd" == "$ROOT_DIR"* ]] && return 0
  [[ "$cmd" == *"$ROOT_DIR"* ]] && return 0
  return 1
}

stop_pid_file() {
  local pid_file="$1"
  [ -f "$pid_file" ] || return 0

  local pid
  pid="$(cat "$pid_file" 2>/dev/null || true)"
  if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
    log "stopping process group $pid"
    kill "-$pid" 2>/dev/null || kill "$pid" 2>/dev/null || true
  fi
  rm -f "$pid_file"
}

free_port_for_project() {
  local port="$1"
  local pids
  pids="$(port_pids "$port")"
  [ -n "$pids" ] || return 0

  local pid
  for pid in $pids; do
    if is_project_pid "$pid"; then
      log "stopping existing project process on port $port: pid $pid"
      kill "$pid" 2>/dev/null || true
      sleep 1
    else
      ps -p "$pid" -o pid,ppid,args=
      fail "port $port is used by non-project process; stop it or set a different port"
    fi
  done
}

stop_port_for_project() {
  local port="$1"
  local pids
  pids="$(port_pids "$port")"
  [ -n "$pids" ] || return 0

  local pid
  for pid in $pids; do
    if is_project_pid "$pid"; then
      log "stopping project process on port $port: pid $pid"
      kill "$pid" 2>/dev/null || true
    else
      log "skip non-project process on port $port: pid $pid"
    fi
  done

  sleep 1
}

start_mysql_if_available() {
  if ! command -v docker >/dev/null 2>&1; then
    log "docker not found; skip MySQL container start"
    return 0
  fi

  if ! docker ps -a --format '{{.Names}}' 2>/dev/null | grep -Fxq "$MYSQL_CONTAINER"; then
    log "docker container $MYSQL_CONTAINER not found or docker inaccessible; skip MySQL container start"
    return 0
  fi

  if docker ps --format '{{.Names}}' | grep -Fxq "$MYSQL_CONTAINER"; then
    log "MySQL container already running: $MYSQL_CONTAINER"
  else
    log "starting MySQL container: $MYSQL_CONTAINER"
    docker start "$MYSQL_CONTAINER" >/dev/null
  fi

  wait_mysql_ready
}

wait_mysql_ready() {
  local attempt
  local health

  if command -v docker >/dev/null 2>&1 && docker ps --format '{{.Names}}' 2>/dev/null | grep -Fxq "$MYSQL_CONTAINER"; then
    for attempt in $(seq 1 60); do
      health="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$MYSQL_CONTAINER" 2>/dev/null || true)"
      if [ "$health" = "healthy" ] || [ "$health" = "none" ]; then
        log "MySQL container ready: $MYSQL_CONTAINER ($health)"
        return 0
      fi
      sleep 1
    done
  fi

  for attempt in $(seq 1 30); do
    if (echo >"/dev/tcp/127.0.0.1/3306") >/dev/null 2>&1; then
      log "MySQL port ready: 127.0.0.1:3306"
      return 0
    fi
    sleep 1
  done

  fail "MySQL not ready: $MYSQL_CONTAINER"
}

stop_mysql_if_enabled() {
  [ "$STOP_MYSQL" = "1" ] || {
    log "STOP_MYSQL=$STOP_MYSQL; skip MySQL container stop"
    return 0
  }

  if ! command -v docker >/dev/null 2>&1; then
    log "docker not found; skip MySQL container stop"
    return 0
  fi

  if ! docker ps --format '{{.Names}}' 2>/dev/null | grep -Fxq "$MYSQL_CONTAINER"; then
    log "MySQL container not running or docker inaccessible: $MYSQL_CONTAINER"
    return 0
  fi

  log "stopping MySQL container: $MYSQL_CONTAINER"
  docker stop "$MYSQL_CONTAINER" >/dev/null
}

wait_http() {
  local url="$1"
  local name="$2"
  local attempt

  for attempt in $(seq 1 30); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      log "$name PASS: $url"
      return 0
    fi
    sleep 1
  done

  fail "$name not ready: $url"
}

up() {
  check_deps
  start_mysql_if_available

  stop_pid_file "$STATE_DIR/backend.pid"
  stop_pid_file "$STATE_DIR/frontend.pid"

  free_port_for_project "$BACKEND_PORT"
  free_port_for_project "$FRONTEND_PORT"

  log "starting backend on port $BACKEND_PORT"
  (
    cd "$BACKEND_DIR"
    setsid env PORT="$BACKEND_PORT" npm run dev >"$LOG_DIR/backend.log" 2>&1 &
    echo $! >"$STATE_DIR/backend.pid"
  )

  wait_http "http://127.0.0.1:$BACKEND_PORT/api/health" "backend"

  log "starting frontend on fixed port $FRONTEND_PORT"
  (
    cd "$FRONTEND_DIR"
    setsid npm run dev -- --host 0.0.0.0 --port "$FRONTEND_PORT" --strictPort >"$LOG_DIR/frontend.log" 2>&1 &
    echo $! >"$STATE_DIR/frontend.pid"
  )

  wait_http "http://127.0.0.1:$FRONTEND_PORT/" "frontend"
  wait_http "http://127.0.0.1:$FRONTEND_PORT/api/health" "frontend api proxy"

  log "READY"
  log "frontend: http://127.0.0.1:$FRONTEND_PORT"
  log "backend:  http://127.0.0.1:$BACKEND_PORT"
  log "logs:     $LOG_DIR"
}

down() {
  stop_pid_file "$STATE_DIR/frontend.pid"
  stop_pid_file "$STATE_DIR/backend.pid"
  stop_port_for_project "$FRONTEND_PORT"
  stop_port_for_project "$BACKEND_PORT"
  stop_mysql_if_enabled
  log "stopped local dev services"
}

status() {
  log "frontend port $FRONTEND_PORT"
  lsof -iTCP:"$FRONTEND_PORT" -sTCP:LISTEN -Pn 2>/dev/null || true
  log "backend port $BACKEND_PORT"
  lsof -iTCP:"$BACKEND_PORT" -sTCP:LISTEN -Pn 2>/dev/null || true
  curl -fsS "http://127.0.0.1:$BACKEND_PORT/api/health" 2>/dev/null || true
  printf '\n'
  curl -fsS "http://127.0.0.1:$FRONTEND_PORT/api/health" 2>/dev/null || true
  printf '\n'
}

case "${1:-up}" in
  up) up ;;
  down) down ;;
  restart)
    down
    up
    ;;
  status) status ;;
  *)
    cat <<USAGE
Usage: scripts/local-dev.sh [up|down|restart|status]

Defaults:
  FRONTEND_PORT=$FRONTEND_PORT
  BACKEND_PORT=$BACKEND_PORT
  MYSQL_CONTAINER=$MYSQL_CONTAINER
  STOP_MYSQL=$STOP_MYSQL
USAGE
    exit 2
    ;;
esac
