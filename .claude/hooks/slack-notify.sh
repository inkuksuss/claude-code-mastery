#!/bin/bash
# Claude Code 훅 → Slack Incoming Webhook 알림
# 사용법: slack-notify.sh <notification|stop>  (stdin으로 훅 JSON을 받는다)
# SLACK_WEBHOOK_URL은 .claude/settings.local.json의 env 블록에서 주입된다.
# URL이 없으면 조용히 종료한다 — 웹훅을 설정하지 않은 팀원에게 무해하다.

set -u

[ -z "${SLACK_WEBHOOK_URL:-}" ] && exit 0

event="${1:-}"
input=$(cat)

cwd=$(printf '%s' "$input" | jq -r '.cwd // empty')
project=$(basename "${cwd:-$PWD}")

case "$event" in
	notification)
		msg=$(printf '%s' "$input" | jq -r '.message // empty')
		# Notification 이벤트는 60초 입력 대기(idle) 알림도 발화하므로 권한 요청만 통과시킨다
		case "$msg" in
			*permission*|*권한*) ;;
			*) exit 0 ;;
		esac
		text="🔐 *권한 요청* — Claude가 승인을 기다리고 있습니다
> ${msg}
📁 ${project}"
		;;
	stop)
		text="✅ *작업 완료* — Claude Code가 응답을 마쳤습니다
📁 ${project}"
		;;
	*)
		exit 0
		;;
esac

payload=$(jq -n --arg text "$text" '{text: $text}')
curl -s -m 8 -X POST -H 'Content-type: application/json' --data "$payload" "$SLACK_WEBHOOK_URL" > /dev/null
