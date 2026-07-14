import {
	Client,
	isFullBlock,
	isFullDatabase,
	isFullPage,
	isNotionClientError,
} from "@notionhq/client"
import { NextResponse } from "next/server"

// ── Task 005 스파이크: 인라인 자식 Database 탐색 PoC (R4 검증) ──────
// 목적: Quotes 페이지 블록 children에서 자식 Database(QuoteItems)를
// Notion API로 탐색 가능한지 4단계 조회 흐름으로 검증한다.
//   ① 공유토큰 필터 쿼리 → ② 자식 DB 탐색 → ③ 항목 쿼리 → ④ 파싱
// 이 라우트는 스파이크 전용이며 Task 006에서 lib/notion.ts로 정식 이관 후 삭제한다.
// NOTION_API_KEY는 이 서버 전용 모듈 밖으로 절대 나가지 않는다.

interface SpikeStep {
	step: number
	name: string
	ok: boolean
	detail: unknown
}

export async function GET(request: Request) {
	// 프로덕션에서는 존재 자체를 숨긴다 (스파이크 라우트 노출 방지)
	if (process.env.NODE_ENV === "production") {
		return new NextResponse(null, { status: 404 })
	}

	const { searchParams } = new URL(request.url)
	const token = searchParams.get("token")
	const steps: SpikeStep[] = []

	// 0단계: 환경 변수 확인 — Integration 발급은 사용자 수동 작업
	const apiKey = process.env.NOTION_API_KEY
	const quotesDbId = process.env.NOTION_QUOTES_DB_ID
	const missing = [
		...(apiKey ? [] : ["NOTION_API_KEY"]),
		...(quotesDbId ? [] : ["NOTION_QUOTES_DB_ID"]),
	]
	if (!apiKey || !quotesDbId) {
		return NextResponse.json({
			ok: false,
			conclusion:
				"환경 변수가 없어 PoC를 실행할 수 없습니다. Notion Integration을 발급하고 .env.local에 설정한 뒤 다시 호출하세요.",
			missing,
			steps,
		})
	}

	const notion = new Client({ auth: apiKey })

	try {
		// ① 공유토큰 필터 쿼리 (SDK v5: database → data source 해석 후 dataSources.query)
		const database = await notion.databases.retrieve({
			database_id: quotesDbId,
		})
		if (!isFullDatabase(database)) {
			throw new Error("Quotes DB 전체 응답을 받지 못했습니다. (partial response)")
		}
		const quotesDataSourceId = database.data_sources[0]?.id
		if (!quotesDataSourceId) {
			throw new Error("Quotes DB에 연결된 data source가 없습니다.")
		}

		const quotesQuery = await notion.dataSources.query({
			data_source_id: quotesDataSourceId,
			...(token
				? {
						filter: {
							property: "공유토큰",
							rich_text: { equals: token },
						},
					}
				: {}),
			page_size: 1,
		})
		const quotePage = quotesQuery.results.find(isFullPage)
		steps.push({
			step: 1,
			name: token
				? "공유토큰 필터 쿼리"
				: "첫 페이지 쿼리 (token 쿼리 파라미터 미지정)",
			ok: quotePage !== undefined,
			detail: {
				dataSourceId: quotesDataSourceId,
				dataSourceCount: database.data_sources.length,
				resultCount: quotesQuery.results.length,
				pageId: quotePage?.id ?? null,
			},
		})
		if (!quotePage) {
			return NextResponse.json({
				ok: false,
				conclusion: token
					? "해당 공유토큰과 일치하는 견적서 페이지가 없습니다."
					: "Quotes DB에 페이지가 없습니다. 샘플 견적서를 먼저 입력하세요.",
				steps,
			})
		}

		// ② 페이지 블록 children에서 자식 Database(child_database) 탐색
		const children = await notion.blocks.children.list({
			block_id: quotePage.id,
			page_size: 100,
		})
		const childDatabaseBlocks = children.results
			.filter(isFullBlock)
			.filter((block) => block.type === "child_database")
		const firstChildDb = childDatabaseBlocks[0]
		steps.push({
			step: 2,
			name: "페이지 블록 children에서 자식 DB 탐색",
			ok: firstChildDb !== undefined,
			detail: {
				totalBlocks: children.results.length,
				childDatabaseCount: childDatabaseBlocks.length,
				childDatabaseTitles: childDatabaseBlocks.map((block) =>
					block.type === "child_database" ? block.child_database.title : null
				),
			},
		})
		if (!firstChildDb) {
			return NextResponse.json({
				ok: false,
				conclusion:
					"페이지 blocks.children에서 child_database 블록을 찾지 못했습니다. R4 완화책(별도 최상위 DB + Relation 전환)을 검토해야 합니다.",
				steps,
			})
		}

		// ③ 자식 DB(QuoteItems) 항목 쿼리 — child_database 블록 id == database id
		const itemsDatabase = await notion.databases.retrieve({
			database_id: firstChildDb.id,
		})
		if (!isFullDatabase(itemsDatabase)) {
			throw new Error("QuoteItems DB 전체 응답을 받지 못했습니다.")
		}
		const itemsDataSourceId = itemsDatabase.data_sources[0]?.id
		if (!itemsDataSourceId) {
			throw new Error("QuoteItems DB에 연결된 data source가 없습니다.")
		}
		const itemsQuery = await notion.dataSources.query({
			data_source_id: itemsDataSourceId,
			page_size: 10,
		})
		steps.push({
			step: 3,
			name: "자식 DB(QuoteItems) 항목 쿼리",
			ok: true,
			detail: {
				itemsDatabaseId: firstChildDb.id,
				itemsDataSourceId,
				itemCount: itemsQuery.results.length,
			},
		})

		// ④ 최소 파싱 — 항목명(Title)/수량(Number)/단가(Number)만 추출해 구조 검증
		const parsedItems = itemsQuery.results.filter(isFullPage).map((item) => {
			const nameProp = item.properties["항목명"]
			const quantityProp = item.properties["수량"]
			const unitPriceProp = item.properties["단가"]

			return {
				id: item.id,
				name:
					nameProp?.type === "title"
						? nameProp.title.map((t) => t.plain_text).join("")
						: null,
				quantity: quantityProp?.type === "number" ? quantityProp.number : null,
				unitPrice:
					unitPriceProp?.type === "number" ? unitPriceProp.number : null,
			}
		})
		const parseOk =
			parsedItems.length > 0 &&
			parsedItems.every(
				(item) =>
					item.name !== null && item.quantity !== null && item.unitPrice !== null
			)
		steps.push({
			step: 4,
			name: "항목 최소 파싱 (항목명/수량/단가)",
			ok: parseOk,
			detail: { parsedItems },
		})

		return NextResponse.json({
			ok: parseOk,
			conclusion: parseOk
				? "인라인 자식 DB 탐색 4단계 조회 흐름이 Notion API로 가능함을 확인했습니다. (R4 해소 — Relation 전환 불필요)"
				: "자식 DB 탐색은 성공했으나 항목 속성 파싱이 불완전합니다. QuoteItems 속성명(항목명/수량/단가)을 확인하세요.",
			steps,
		})
	} catch (error) {
		// Notion API 오류는 코드/상태를 그대로 진단에 노출 (스파이크 용도)
		if (isNotionClientError(error)) {
			return NextResponse.json({
				ok: false,
				conclusion: "Notion API 호출 중 오류가 발생했습니다.",
				error: { code: error.code, message: error.message },
				steps,
			})
		}
		return NextResponse.json({
			ok: false,
			conclusion: "예상하지 못한 오류가 발생했습니다.",
			error: {
				message: error instanceof Error ? error.message : String(error),
			},
			steps,
		})
	}
}
