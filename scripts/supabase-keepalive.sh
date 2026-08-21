#!/usr/bin/env bash
# Supabase keep-alive.
#
# Free-tier проект уходит в авто-паузу примерно после 7 дней без активности,
# что валит вход и по почте, и через Telegram (общий GoTrue).
# Скрипт раз в несколько часов делает реальный запрос к PostgREST — этого
# достаточно, чтобы проект считался активным.
#
# Установка на VM: crontab -e →  0 */6 * * * /home/kudinow/supabase-keepalive.sh
set -uo pipefail

readonly ENV_FILE="${SUPABASE_KEEPALIVE_ENV:-/home/kudinow/app/.env.local}"
readonly LOG_FILE="${SUPABASE_KEEPALIVE_LOG:-/home/kudinow/logs/supabase-keepalive.log}"
readonly STATE_FILE="${SUPABASE_KEEPALIVE_STATE:-/home/kudinow/.supabase-keepalive.state}"
readonly PING_TABLE="profiles"
readonly REQUEST_TIMEOUT_SEC=25
readonly FAILURES_BEFORE_ALERT=2   # алертим со второй подряд неудачи, чтобы не шуметь на сетевых морганиях
readonly LOG_MAX_LINES=500

log() {
  printf '%s %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$1" >> "$LOG_FILE"
}

read_env() {
  grep -E "^$1=" "$ENV_FILE" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"'\''\r'
}

notify_admin() {
  local text="$1"
  [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_ADMIN_CHAT_ID" ] || return 0
  curl -sS -o /dev/null -m 15 \
    --data-urlencode "chat_id=${TELEGRAM_ADMIN_CHAT_ID}" \
    --data-urlencode "text=${text}" \
    "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" || true
}

rotate_log() {
  local lines
  lines=$(wc -l < "$LOG_FILE" 2>/dev/null || echo 0)
  [ "$lines" -le "$LOG_MAX_LINES" ] && return 0
  tail -n "$LOG_MAX_LINES" "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"
}

mkdir -p "$(dirname "$LOG_FILE")"

if [ ! -r "$ENV_FILE" ]; then
  log "FATAL env file not readable: $ENV_FILE"
  exit 1
fi

SUPABASE_URL="$(read_env NEXT_PUBLIC_SUPABASE_URL)"
SUPABASE_KEY="$(read_env NEXT_PUBLIC_SUPABASE_ANON_KEY)"
TELEGRAM_BOT_TOKEN="$(read_env TELEGRAM_BOT_TOKEN)"
TELEGRAM_ADMIN_CHAT_ID="$(read_env TELEGRAM_ADMIN_CHAT_ID)"

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  log "FATAL NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY not found in $ENV_FILE"
  exit 1
fi

http_code="$(curl -sS -o /dev/null -m "$REQUEST_TIMEOUT_SEC" -w '%{http_code}' \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  "${SUPABASE_URL}/rest/v1/${PING_TABLE}?select=id&limit=1" 2>/dev/null)"

previous_failures="$(cat "$STATE_FILE" 2>/dev/null || echo 0)"
case "$previous_failures" in ''|*[!0-9]*) previous_failures=0 ;; esac

# 200/206 — живой PostgREST (пустой ответ из-за RLS тоже ок, запрос дошёл до БД).
if [ "$http_code" = "200" ] || [ "$http_code" = "206" ]; then
  log "OK ${http_code}"
  if [ "$previous_failures" -ge "$FAILURES_BEFORE_ALERT" ]; then
    notify_admin "✅ Supabase снова отвечает (${http_code}). Keep-alive восстановлен."
  fi
  echo 0 > "$STATE_FILE"
  rotate_log
  exit 0
fi

failures=$((previous_failures + 1))
echo "$failures" > "$STATE_FILE"
log "FAIL http=${http_code} streak=${failures}"

if [ "$failures" -eq "$FAILURES_BEFORE_ALERT" ]; then
  notify_admin "⚠️ Supabase не отвечает: HTTP ${http_code} (${failures} проверки подряд). Проверь, не ушёл ли проект в паузу: https://supabase.com/dashboard/project/xlguerrejryvgwlaygbe"
fi

rotate_log
exit 1
