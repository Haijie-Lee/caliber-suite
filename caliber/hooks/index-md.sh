#!/usr/bin/env bash
# caliber 插件 PreToolUse(Skill) hook：skill ∈ {caliber, plan-forge, plan-drafting, deep-probe} 且工程有
# docs/learnings/INDEX.md 时注入（caliber-suite v1.0.0）
# 契约 C5/C7：stdout=单行 JSON 或空输出；exit 恒 0；不匹配/缺失静默
# v1.5.0：过滤器随体系自研化扩两件（plan-drafting/deep-probe 同为计划前置工序）
INPUT=$(cat)
PY=$(command -v python 2>/dev/null || command -v python3 2>/dev/null || true)
[ -n "$PY" ] || exit 0
SKILL=$(printf '%s' "$INPUT" | "$PY" -c "
import json,sys
try:
    d=json.load(sys.stdin)
except Exception:
    print(''); raise SystemExit
ti=d.get('tool_input') or d.get('toolInput') or {}
print(ti.get('skill','') if isinstance(ti,dict) else '')
" 2>/dev/null)
SKILL="${SKILL##*:}"  # 剥插件前缀：caliber:caliber→caliber，全限定名调用同样命中（2026-09-12 5d 实证 nuance）
case "$SKILL" in
  caliber|plan-forge|plan-drafting|deep-probe) ;;
  *) exit 0 ;;
esac
PROJ="${ZCODE_PROJECT_DIR:-${CLAUDE_PROJECT_DIR:-}}"
[ -n "$PROJ" ] || exit 0
IDX="$PROJ/docs/learnings/INDEX.md"
[ -f "$IDX" ] || exit 0
"$PY" -c "
import json,sys
body=open(sys.argv[1],encoding='utf-8').read()
header='制定计划前：逐条对下表「何时需要」列与当前任务，命中读对应 learnings 全文，零命中在 plan 选材留一行「INDEX 扫描零命中」。\n\n'
print(json.dumps({'hookSpecificOutput':{'hookEventName':'PreToolUse','additionalContext':header+body}}))
" "$IDX"
exit 0
