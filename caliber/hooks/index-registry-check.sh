#!/usr/bin/env bash
# caliber 插件 PostToolUse(Write|Edit) hook（caliber-suite v1.1.0）
# ① 写 docs/learnings/*.md 未登记 INDEX.md 时注入登记提醒（C7/C8，已证
# additionalContext 通道）；② 维护 session 编辑计数器与 wrote 标记供
# learnings-wrapup.sh 门控（C5）。契约 C3/C4/C5/C7；exit 恒 0；任何异常静默
INPUT=$(cat)
PY=$(command -v python 2>/dev/null || command -v python3 2>/dev/null || true)
[ -n "$PY" ] || exit 0

{ IFS= read -r SID; IFS= read -r FP; } < <(printf '%s' "$INPUT" | "$PY" -c "
import json,sys
try:
    d=json.load(sys.stdin)
except Exception:
    print(''); print(''); raise SystemExit
sid=d.get('session_id') or d.get('sessionId') or ''
ti=d.get('tool_input') or d.get('toolInput') or {}
fp=ti.get('file_path','') if isinstance(ti,dict) else ''
print(sid if isinstance(sid,str) else '')
print(fp if isinstance(fp,str) else '')
" 2>/dev/null | tr -d '\r')

# file_path 为空 = 解析失败或非预期负载 → 不计数直接静默（C7）
FP=$(printf '%s' "$FP" | tr '\\' '/')
[ -n "$FP" ] || exit 0

[ -n "$SID" ] || SID="${CLAUDE_SESSION_ID:-}"
[ -n "$SID" ] || SID="nosid"
SID=$(printf '%s' "$SID" | tr -c 'A-Za-z0-9_-' '_')
M="/tmp/caliber-lrn-$SID"

printf '.\n' >> "$M-edits" 2>/dev/null

case "$FP" in
  */docs/learnings/*.md) ;;
  *) exit 0 ;;
esac
touch "$M-wrote" 2>/dev/null
BASE=$(basename "$FP")
[ "$BASE" = "INDEX.md" ] && exit 0

PROJ="${ZCODE_PROJECT_DIR:-${CLAUDE_PROJECT_DIR:-}}"
[ -n "$PROJ" ] || exit 0
IDX="$PROJ/docs/learnings/INDEX.md"
[ -f "$IDX" ] || exit 0
grep -qF "$BASE" "$IDX" 2>/dev/null && exit 0

"$PY" -c "
import json,sys
base=sys.argv[1]
print(json.dumps({'hookSpecificOutput':{'hookEventName':'PostToolUse','additionalContext':'你刚写了 docs/learnings/'+base+'，但 INDEX.md 未登记。按 §9：新 learning 落档即追加 docs/learnings/INDEX.md 一行（日期|文件|何时需要）。'}}))
" "$BASE" 2>/dev/null
exit 0
