#!/usr/bin/env bash
# caliber 插件 Stop hook：learnings 收尾提醒（caliber-suite v1.1.0）
# 会话有实质编辑（≥3 次 Write|Edit，计数由 index-registry-check.sh 维护）但
# 未触 docs/learnings 时，以 Stop continuation（顶层 decision:block）递送
# §9 收尾检查单。契约 C3/C4/C5/C6/C8；每会话至多提醒一次，有新 HEAD 可再一次。
# exit 恒 0；任何异常静默；禁 set -e；stopHookActive=true 一律静默（防续跑循环，
# 2026-09-12 探针实证）
INPUT=$(cat)
PY=$(command -v python 2>/dev/null || command -v python3 2>/dev/null || true)
[ -n "$PY" ] || exit 0

ACTIVE=$(printf '%s' "$INPUT" | "$PY" -c "
import json,sys
try:
    d=json.load(sys.stdin)
except Exception:
    print(''); raise SystemExit
print('1' if (d.get('stopHookActive') or d.get('stop_hook_active')) else '')
" 2>/dev/null)
[ -n "$ACTIVE" ] && exit 0

SID=$(printf '%s' "$INPUT" | "$PY" -c "
import json,sys
try:
    d=json.load(sys.stdin)
except Exception:
    print(''); raise SystemExit
v=d.get('session_id') or d.get('sessionId') or ''
print(v if isinstance(v,str) else '')
" 2>/dev/null | tr -d '\r')
[ -n "$SID" ] || SID="${CLAUDE_SESSION_ID:-}"
[ -n "$SID" ] || SID="nosid"
SID=$(printf '%s' "$SID" | tr -c 'A-Za-z0-9_-' '_')

PROJ="${ZCODE_PROJECT_DIR:-${CLAUDE_PROJECT_DIR:-}}"
[ -n "$PROJ" ] || exit 0
IDX="$PROJ/docs/learnings/INDEX.md"
[ -f "$IDX" ] || exit 0

M="/tmp/caliber-lrn-$SID"
EDITS=0
[ -f "$M-edits" ] && EDITS=$(wc -l < "$M-edits" 2>/dev/null)
[ "${EDITS:-0}" -ge 3 ] 2>/dev/null || exit 0
[ -f "$M-wrote" ] && exit 0
[ -f "$M-reminded2" ] && exit 0

HEAD=$(git -C "$PROJ" rev-parse HEAD 2>/dev/null)
if [ -f "$M-reminded" ]; then
  OLD=$(cat "$M-reminded" 2>/dev/null)
  [ "$OLD" = "$HEAD" ] && exit 0
  touch "$M-reminded2" 2>/dev/null
else
  printf '%s\n' "$HEAD" > "$M-reminded" 2>/dev/null
fi

"$PY" -c "
import json
reason='会话收尾检查（docs/README.md §9 四层路由）：本会话已有 ≥3 次编辑但未检测到 docs/learnings 更新。逐条自问：① 有无新知识（根因/裁定/坑/验证结论）？无=合法零产出，显式声明「§9 扫描：零产出」再收尾；② 有→先落 docs/learnings/YYYY-MM-DD-<slug>.md（史实层），再做路由判断（这知识下次何时被需要？）；③ 新 learning 落档即追加 docs/learnings/INDEX.md 一行（日期|文件|何时需要）。'
print(json.dumps({'decision':'block','reason':reason}))
" 2>/dev/null
exit 0
