import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { QuoteHeader } from "@/components/quote/quote-header"
import { QuoteItemsTable } from "@/components/quote/quote-items-table"
import { QuotePartyInfo } from "@/components/quote/quote-party-info"
import { QuotePdfButton } from "@/components/quote/quote-pdf-button"
import { QuoteSummary } from "@/components/quote/quote-summary"
import { findMockQuoteByToken, MOCK_SUPPLIER } from "@/lib/quote-mock"
import { calculateQuoteAmounts } from "@/lib/quote-schema"

// 견적서 웹 뷰 라우트 (RSC)
// Task 004: 더미 데이터(quote-mock) 기반 7개 블록 조립.
// - 데이터 소스는 Task 006에서 findMockQuoteByToken → Notion 조회(lib/notion.ts)로 교체
// - 공급자 정보는 Task 006에서 MOCK_SUPPLIER → getSupplierInfo()(환경 변수)로 교체
// - 접근 제어의 완전한 동일 404 보장(타이밍 포함)은 Task 007에서 마무리
export const metadata: Metadata = {
	title: "견적서",
	robots: {
		index: false,
		follow: false,
	},
}

export default async function QuotePage({
	params,
}: {
	params: Promise<{ token: string }>
}) {
	const { token } = await params
	const quote = findMockQuoteByToken(token)

	// 존재하지 않는 토큰과 '작성중' 상태는 구분 불가능한 동일 404 (PRD 5.2/5.3)
	if (!quote || quote.status === "작성중") {
		notFound()
	}

	// 금액은 항상 서버에서 계산 (Notion 저장값을 신뢰하지 않는 원칙과 동일)
	const amounts = calculateQuoteAmounts(quote.items)

	// 항목은 순서 속성 오름차순, 순서 없는 항목(null)은 뒤로 정렬 (PRD 5.2)
	const sortedItems = [...quote.items].sort((a, b) => {
		if (a.order === null && b.order === null) return 0
		if (a.order === null) return 1
		if (b.order === null) return -1
		return a.order - b.order
	})

	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
			{/* 블록 2: 견적서 헤더 (제목 h1을 문서 최상단에 두어 접근성 확보) + 만료 배너 */}
			<QuoteHeader
				title={quote.title}
				quoteNumber={quote.quoteNumber}
				issuedAt={quote.issuedAt}
				validUntil={quote.validUntil}
				status={quote.status}
			/>

			{/* 블록 1·3: 공급자/수신자 정보 (QuotePartyInfo가 두 블록을 묶어 렌더링) */}
			<QuotePartyInfo
				supplier={MOCK_SUPPLIER}
				client={{ name: quote.clientName, manager: quote.clientManager }}
			/>

			{/* 블록 4: 견적 항목 테이블 (내부 가로 스크롤 — 페이지 가로 스크롤 없음) */}
			<section aria-label="견적 항목">
				<QuoteItemsTable items={sortedItems} />
			</section>

			{/* 블록 5: 금액 요약 (총액 강조) */}
			<QuoteSummary
				supplyAmount={amounts.supplyAmount}
				taxAmount={amounts.taxAmount}
				totalAmount={amounts.totalAmount}
			/>

			{/* 블록 6: 비고 (내용이 있을 때만 노출) */}
			{quote.note && (
				<section aria-label="비고" className="flex flex-col gap-1.5">
					<h2 className="text-sm font-semibold text-foreground">비고</h2>
					<p className="text-sm whitespace-pre-line text-foreground">
						{quote.note}
					</p>
				</section>
			)}

			{/* 블록 7: PDF 다운로드 버튼 (유일한 클라이언트 컴포넌트) */}
			<div className="flex justify-end border-t pt-6">
				<QuotePdfButton token={token} />
			</div>
		</div>
	)
}
