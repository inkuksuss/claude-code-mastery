#!/bin/bash
# Claude Code PreToolUse 훅 → Bash 명령어를 logs/command-logs.txt에 기록
# 로그 포맷: [명령어] | [실행 시간]
# 주의: 실행된 명령어가 평문으로 저장되므로 민감정보(토큰, 키 등)가 로그에 남을 수 있다.
# 로깅은 부가 기능이므로 어떤 실패도 Bash 실행을 막지 않도록 항상 exit 0으로 종료한다.

set -u

# jq 미설치 환경에서는 조용히 무력화
command -v jq >/dev/null 2>&1 || exit 0

input=$(cat)
command=$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null) || exit 0
[ -z "$command" ] && exit 0

# CLAUDE_PROJECT_DIR가 없으면 임의 위치에 로그를 만들지 않고 포기
[ -z "${CLAUDE_PROJECT_DIR:-}" ] && exit 0
log_dir="$CLAUDE_PROJECT_DIR/logs"
mkdir -p "$log_dir" 2>/dev/null || exit 0

# 멀티라인 명령어가 로그 레코드를 쪼개지 않도록 개행을 \n 문자열로 치환 (한 레코드 = 한 줄 보장)
safe_command=${command//$'\n'/\\n}
printf '[%s] | [%s]\n' "$safe_command" "$(date '+%Y-%m-%d %H:%M:%S')" >> "$log_dir/command-logs.txt" 2>/dev/null
exit 0
