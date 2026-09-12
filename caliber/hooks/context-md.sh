#!/usr/bin/env bash
# caliber 插件 SessionStart hook：工程有 CONTEXT.md 则全量注入（caliber-suite v1.0.0）
# 契约 C5/C6：stdout=单行 JSON 或空输出；exit 恒 0；文件缺失静默
PROJ="${ZCODE_PROJECT_DIR:-${CLAUDE_PROJECT_DIR:-}}"
[ -n "$PROJ" ] || exit 0
CTX="$PROJ/CONTEXT.md"
[ -f "$CTX" ] || exit 0
PY=$(command -v python 2>/dev/null || command -v python3 2>/dev/null || true)
[ -n "$PY" ] || exit 0
"$PY" -c "
import json,sys
body=open(sys.argv[1],encoding='utf-8').read()
header='工程 CONTEXT.md 自动注入（caliber 插件 SessionStart hook）：\n\n'
print(json.dumps({'hookSpecificOutput':{'hookEventName':'SessionStart','additionalContext':header+body}}))
" "$CTX"
exit 0
