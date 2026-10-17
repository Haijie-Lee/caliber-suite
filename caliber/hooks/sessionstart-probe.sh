#!/usr/bin/env bash
# SessionStart 全子事件探针（临时件）
# 用途：实证 resume/clear 子事件是否发射；
#   证实 → matcher 补全跟进；证伪/30 天零观测 → 撤件销项。
# 契约：stdout 恒空、exit 恒 0、工程根守卫（仅本仓根落日志）、stdin 全字段
#   落日志（不猜字段名）、日志超 200 行截留最近 100 行；日志落 .caliber/tmp/
#   （gitignore 覆盖，零 git status 污染）。正对照：startup/compact 已知
#   发射，日志长窗内二者为零 = 探针未发射（条目形态问题），非子事件缺席。
ROOT_RAW="${ZCODE_PROJECT_DIR:-${CLAUDE_PROJECT_DIR:-}}"
[ -n "$ROOT_RAW" ] || exit 0
ROOT=$(printf '%s' "$ROOT_RAW" | tr '\\' '/' | tr -d '\r')
case "$ROOT" in
  */caliber-suite|*/caliber-suite/) : ;;
  *) exit 0 ;;
esac
LOG_DIR="$ROOT/.caliber/tmp"
mkdir -p "$LOG_DIR" 2>/dev/null || exit 0
LOG="$LOG_DIR/hooks-probe-sessionstart.log"
INPUT=$(cat 2>/dev/null | tr -d '\r')
printf '%s\t%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$INPUT" >> "$LOG" 2>/dev/null || exit 0
if [ -f "$LOG" ] && [ "$(wc -l < "$LOG" 2>/dev/null || echo 0)" -gt 200 ]; then
  tail -100 "$LOG" > "$LOG.tmp" 2>/dev/null && mv "$LOG.tmp" "$LOG"
fi
exit 0
