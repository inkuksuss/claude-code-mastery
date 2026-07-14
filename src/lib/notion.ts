import { Client } from "@notionhq/client"

// Notion 클라이언트 초기화 및 조회 로직을 모으는 단일 모듈
// 실제 조회 흐름(토큰 필터 → 자식 DB 탐색 → 항목 쿼리 → zod 파싱)은 Task 006에서 구현한다.
function getNotionClient(): Client {
	const apiKey = process.env.NOTION_API_KEY

	if (!apiKey) {
		throw new Error("NOTION_API_KEY가 설정되지 않았습니다.")
	}

	return new Client({ auth: apiKey })
}

export { getNotionClient }
