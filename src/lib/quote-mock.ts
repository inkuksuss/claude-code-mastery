import {
	calculateQuoteAmounts,
	quoteSchema,
	type Quote,
	type QuoteItem,
	type QuoteStatus,
	type SupplierInfo,
} from "@/lib/quote-schema"

// ── 더미 견적서 생성 유틸 (Task 003) ──────────────────────
// Phase 2 UI 작업에서 사용하는 mock 데이터. Notion 연동(Task 006) 전까지의 대체재.

// 실무 느낌의 항목명 풀 (개수가 풀보다 많으면 차수를 붙여 순환)
const MOCK_ITEM_NAMES = [
	"메인 페이지 UI 디자인",
	"반응형 퍼블리싱 (모바일/데스크톱)",
	"관리자 대시보드 개발",
	"회원 인증 기능 구현",
	"결제 모듈 연동",
	"검색 엔진 최적화(SEO) 설정",
	"배포 파이프라인 구축",
	"운영 가이드 문서화",
] as const

// 결정적(deterministic) 규칙으로 항목을 생성한다 — 매 호출 결과가 동일해 스냅샷/디버깅에 유리
function createMockItems(count: number): QuoteItem[] {
	return Array.from({ length: count }, (_, index) => {
		const quantity = (index % 5) + 1
		const unitPrice = 50_000 + (index % 7) * 25_000
		const baseName = MOCK_ITEM_NAMES[index % MOCK_ITEM_NAMES.length]
		const cycle = Math.floor(index / MOCK_ITEM_NAMES.length)
		const name = cycle === 0 ? baseName : `${baseName} ${cycle + 1}차`

		return {
			id: `mock-item-${index + 1}`,
			name,
			quantity,
			unitPrice,
			// 항목 합계는 항상 수량 × 단가와 일치해야 한다
			amount: quantity * unitPrice,
			order: index + 1,
		}
	})
}

export interface CreateMockQuoteOptions {
	// 견적 항목 개수 (기본 3개)
	itemCount?: number
	// 견적서 상태 (기본 "발송됨" — 만료 배너 확인 시 "만료" 전달)
	status?: QuoteStatus
	// id/title/quoteNumber 등 항목 외 필드 덮어쓰기
	overrides?: Partial<Omit<Quote, "items">>
}

// 옵션으로 항목 개수·상태를 조절할 수 있는 mock 견적서 팩토리
function createMockQuote(options: CreateMockQuoteOptions = {}): Quote {
	const { itemCount = 3, status = "발송됨", overrides } = options
	const items = createMockItems(itemCount)

	// calculateQuoteAmounts 기준 공급가액과 항목 amount 합계가 일치하는지 검증
	// (mock 데이터가 실제 계산 로직과 어긋나는 것을 조기에 잡기 위한 안전장치)
	const { supplyAmount } = calculateQuoteAmounts(items)
	const itemAmountSum = items.reduce((sum, item) => sum + item.amount, 0)
	if (itemAmountSum !== supplyAmount) {
		throw new Error(
			"mock 견적 항목의 합계가 calculateQuoteAmounts 결과와 일치하지 않습니다."
		)
	}

	const quote: Quote = {
		id: "mock-quote-standard",
		title: "웹사이트 리뉴얼 구축 견적",
		quoteNumber: "Q-2026-0001",
		shareToken: "3f2504e0-4f89-41d3-9a0c-0305e82c3301",
		status,
		clientName: "주식회사 한빛상사",
		clientManager: "김담당",
		issuedAt: new Date("2026-07-01T00:00:00+09:00"),
		validUntil: new Date("2026-07-31T23:59:59+09:00"),
		note: "본 견적은 유효기간 내 계약 체결 시에만 적용되며, 범위 변경 시 재산정될 수 있습니다.",
		items,
		...overrides,
	}

	// zod 스키마로 최종 검증해 mock이 내부 타입 규약을 항상 만족하도록 보장
	return quoteSchema.parse(quote)
}

// 일반 케이스: 항목 3개짜리 표준 견적서
function createMockQuoteStandard(): Quote {
	return createMockQuote()
}

// 대량 케이스: 항목 30개짜리 견적서 (긴 테이블 스크롤/레이아웃 확인용)
function createMockQuoteLarge(): Quote {
	return createMockQuote({
		itemCount: 30,
		overrides: {
			id: "mock-quote-large",
			title: "전사 시스템 구축 견적 (대량 항목)",
			quoteNumber: "Q-2026-0002",
			shareToken: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
		},
	})
}

// 만료 케이스: 유효기간이 지난 견적서 (만료 배너 확인용)
function createMockQuoteExpired(): Quote {
	return createMockQuote({
		itemCount: 4,
		status: "만료",
		overrides: {
			id: "mock-quote-expired",
			title: "브랜드 사이트 유지보수 견적",
			quoteNumber: "Q-2026-0003",
			shareToken: "9b2c1a34-5d6e-47f8-8a90-1b2c3d4e5f60",
			issuedAt: new Date("2026-05-01T00:00:00+09:00"),
			validUntil: new Date("2026-05-31T23:59:59+09:00"),
		},
	})
}

// 작성중 케이스: 웹 열람이 차단(404)되어야 하는 상태 (PRD 5.2 상태별 노출 규칙)
function createMockQuoteDraft(): Quote {
	return createMockQuote({
		status: "작성중",
		overrides: {
			id: "mock-quote-draft",
			title: "신규 프로젝트 견적 (작성중)",
			quoteNumber: "Q-2026-0004",
			shareToken: "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
		},
	})
}

// 공급자 정보 mock — Task 006에서 getSupplierInfo()(환경 변수 기반)로 교체한다
const MOCK_SUPPLIER: SupplierInfo = {
	name: "주식회사 클로드소프트",
	ceo: "박대표",
	phone: "02-1234-5678",
	email: "contact@claudesoft.example.com",
}

// 공유토큰으로 mock 견적서를 조회한다 — Task 006에서 Notion 조회로 대체되는 더미 조회 계층
// 일치하는 토큰이 없으면 null을 반환한다 (페이지에서 notFound() 분기)
function findMockQuoteByToken(token: string): Quote | null {
	const quotes = [
		createMockQuoteStandard(),
		createMockQuoteLarge(),
		createMockQuoteExpired(),
		createMockQuoteDraft(),
	]

	return quotes.find((quote) => quote.shareToken === token) ?? null
}

export {
	createMockQuote,
	createMockQuoteStandard,
	createMockQuoteLarge,
	createMockQuoteExpired,
	createMockQuoteDraft,
	findMockQuoteByToken,
	MOCK_SUPPLIER,
}
