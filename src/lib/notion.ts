import {
	APIErrorCode,
	Client,
	isFullBlock,
	isFullDatabase,
	isFullPage,
	isNotionClientError,
} from "@notionhq/client"
import type { PageObjectResponse } from "@notionhq/client"
import { z } from "zod"

import { DRAFT_STATUS, parseNotionQuotePage, type Quote } from "@/lib/quote-schema"

// ── Notion 조회 계층 (서버 전용) ──────────────────────────
// NOTION_API_KEY는 이 모듈 밖으로 절대 나가지 않는다.
// 조회 흐름(Task 005 스파이크에서 실증한 4단계):
//   ① 공유토큰 필터 쿼리 → ② 페이지 블록에서 자식 DB 탐색
//   → ③ 자식 DB(QuoteItems) 항목 전체 쿼리 → ④ zod 파싱

// 429 rate limit이 1회 재시도 후에도 계속될 때 던지는 에러
// (상위에서 "잠시 후 다시 시도" 안내 화면으로 분기하기 위한 식별용)
export class NotionRateLimitError extends Error {
	constructor(message = "Notion API 요청 한도를 초과했습니다.", options?: ErrorOptions) {
		super(message, options)
		this.name = "NotionRateLimitError"
	}
}

// Notion 데이터가 스키마 규약(필수 속성 누락 등)을 만족하지 못할 때 던지는 에러
// (500이 아니라 "견적서 정보가 올바르지 않습니다" 안내 화면으로 분기하기 위한 식별용)
export class NotionDataInvalidError extends Error {
	constructor(message = "Notion 견적서 데이터가 올바르지 않습니다.", options?: ErrorOptions) {
		super(message, options)
		this.name = "NotionDataInvalidError"
	}
}

function getNotionClient(): Client {
	const apiKey = process.env.NOTION_API_KEY

	if (!apiKey) {
		throw new Error("NOTION_API_KEY가 설정되지 않았습니다.")
	}

	// SDK 자체 재시도(기본 2회, exponential backoff)를 끄고
	// withRateLimitRetry의 1회 재시도만 동작하도록 통일 (지연시간 예측 가능성 확보)
	return new Client({ auth: apiKey, retry: false })
}

// 공유토큰 형식 검증 — quoteSchema.shareToken(z.string().uuid())과 동일 기준.
// 형식이 아니면 Notion API 호출 자체를 하지 않는다 (불필요한 호출 + rate limit 소모 방지)
const shareTokenSchema = z.string().uuid()

// 429(rate_limited) 수신 시 Retry-After만큼 대기 후 1회 재시도.
// 재시도마저 429면 NotionRateLimitError로 변환해 던진다.
async function withRateLimitRetry<T>(call: () => Promise<T>): Promise<T> {
	try {
		return await call()
	} catch (error) {
		if (!isNotionClientError(error) || error.code !== APIErrorCode.RateLimited) {
			throw error
		}

		// Retry-After 헤더(초 단위)를 우선 사용하고, 없거나 비정상이면 1초 대기
		const retryAfterHeader =
			"headers" in error && error.headers instanceof Headers
				? error.headers.get("retry-after")
				: null
		const retryAfterSeconds = Number(retryAfterHeader)
		const waitMs =
			Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
				? retryAfterSeconds * 1000
				: 1000
		await new Promise((resolve) => setTimeout(resolve, waitMs))

		try {
			return await call()
		} catch (retryError) {
			if (
				isNotionClientError(retryError) &&
				retryError.code === APIErrorCode.RateLimited
			) {
				throw new NotionRateLimitError(undefined, { cause: retryError })
			}
			throw retryError
		}
	}
}

// database id → 첫 번째 data source id 해석 (SDK v5: query는 data source 단위)
async function resolveDataSourceId(
	notion: Client,
	databaseId: string,
	label: string
): Promise<string> {
	const database = await withRateLimitRetry(() =>
		notion.databases.retrieve({ database_id: databaseId })
	)
	if (!isFullDatabase(database)) {
		throw new Error(`${label} DB 전체 응답을 받지 못했습니다. (partial response)`)
	}
	const dataSourceId = database.data_sources[0]?.id
	if (!dataSourceId) {
		throw new Error(`${label} DB에 연결된 data source가 없습니다.`)
	}
	return dataSourceId
}

// data source의 페이지를 커서 페이지네이션으로 전체 순회해 수집한다.
// has_more를 확인하지 않으면 100건 초과 시 조용히 데이터가 유실된다.
async function queryAllPages(
	notion: Client,
	dataSourceId: string
): Promise<PageObjectResponse[]> {
	const pages: PageObjectResponse[] = []
	let cursor: string | undefined

	do {
		const response = await withRateLimitRetry(() =>
			notion.dataSources.query({
				data_source_id: dataSourceId,
				page_size: 100,
				...(cursor ? { start_cursor: cursor } : {}),
			})
		)
		pages.push(...response.results.filter(isFullPage))
		cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined
	} while (cursor)

	return pages
}

// 페이지 블록 children을 전체 순회해 첫 번째 child_database 블록 id를 찾는다.
async function findChildDatabaseId(
	notion: Client,
	pageId: string
): Promise<string | null> {
	let cursor: string | undefined

	do {
		const response = await withRateLimitRetry(() =>
			notion.blocks.children.list({
				block_id: pageId,
				page_size: 100,
				...(cursor ? { start_cursor: cursor } : {}),
			})
		)
		const childDatabase = response.results
			.filter(isFullBlock)
			.find((block) => block.type === "child_database")
		if (childDatabase) {
			return childDatabase.id
		}
		cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined
	} while (cursor)

	return null
}

// 공유토큰으로 견적서를 조회한다. 다음 경우 모두 null을 반환해
// 상위(page.tsx)에서 "존재하지 않음"과 구분할 코드 경로 자체를 없앤다:
//   - 토큰이 UUID 형식이 아님 / 매칭 페이지 없음 / 상태가 "작성중"(비공개)
export async function getQuoteByToken(token: string): Promise<Quote | null> {
	// 형식 검증 실패 시 Notion API 호출 없이 즉시 종료
	if (!shareTokenSchema.safeParse(token).success) {
		return null
	}

	const quotesDbId = process.env.NOTION_QUOTES_DB_ID
	if (!quotesDbId) {
		throw new Error("NOTION_QUOTES_DB_ID가 설정되지 않았습니다.")
	}

	const notion = getNotionClient()

	// ① Quotes DB에서 공유토큰 일치 페이지 조회 (토큰은 유일하므로 1건이면 충분)
	const quotesDataSourceId = await resolveDataSourceId(notion, quotesDbId, "Quotes")
	const quotesQuery = await withRateLimitRetry(() =>
		notion.dataSources.query({
			data_source_id: quotesDataSourceId,
			filter: {
				property: "공유토큰",
				rich_text: { equals: token },
			},
			page_size: 1,
		})
	)
	const quotePage = quotesQuery.results.find(isFullPage)
	if (!quotePage) {
		return null
	}

	// "작성중" 상태는 비공개 — 항목 조회 전에 원시 속성으로 조기 판정해 API 호출을 아낀다
	// (속성이 누락/변형된 경우는 아래 zod 파싱 단계에서 NotionDataInvalidError로 흡수)
	const statusProperty = quotePage.properties["상태"]
	if (
		statusProperty?.type === "select" &&
		statusProperty.select?.name === DRAFT_STATUS
	) {
		return null
	}

	// ② 페이지 블록 children에서 인라인 자식 DB(QuoteItems) 탐색
	const itemsDatabaseId = await findChildDatabaseId(notion, quotePage.id)
	if (!itemsDatabaseId) {
		throw new NotionDataInvalidError(
			"견적서 페이지에서 QuoteItems 자식 Database를 찾지 못했습니다."
		)
	}

	// ③ QuoteItems 항목 전체 조회 (커서 페이지네이션 완전 순회)
	const itemsDataSourceId = await resolveDataSourceId(
		notion,
		itemsDatabaseId,
		"QuoteItems"
	)
	const itemPages = await queryAllPages(notion, itemsDataSourceId)

	// ④ zod 파싱 — 실패(필수 속성 누락, 스키마 변경 등)는 NotionDataInvalidError로 변환
	try {
		return parseNotionQuotePage(quotePage, itemPages)
	} catch (error) {
		if (error instanceof z.ZodError) {
			throw new NotionDataInvalidError(
				`견적서 데이터 검증에 실패했습니다: ${error.issues
					.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
					.join(" / ")}`,
				{ cause: error }
			)
		}
		throw error
	}
}

export { getNotionClient }
