import type { PageObjectResponse } from "@notionhq/client"
import { z } from "zod"

// ── 내부 도메인 타입 ──────────────────────────────

export type QuoteStatus = "작성중" | "발송됨" | "승인" | "만료"

// "작성중" 상태 리터럴의 단일 소스 — lib/notion.ts의 조기 접근 제어 판정에서 재사용해
// quoteStatusSchema와 값이 어긋나지 않도록 한다
export const DRAFT_STATUS: QuoteStatus = "작성중"

export interface QuoteItem {
	id: string
	name: string
	quantity: number
	unitPrice: number
	amount: number
	order: number | null
}

export interface Quote {
	id: string
	title: string
	quoteNumber: string
	shareToken: string
	status: QuoteStatus
	clientName: string
	clientManager: string | null
	issuedAt: Date
	validUntil: Date
	note: string | null
	items: QuoteItem[]
}

// ── zod 스키마 (Notion 원시 응답 → 내부 타입 검증) ──────

const quoteStatusSchema = z.enum(["작성중", "발송됨", "승인", "만료"])

const quoteItemSchema = z.object({
	id: z.string(),
	name: z.string().min(1),
	quantity: z.number().positive(),
	unitPrice: z.number().nonnegative(),
	amount: z.number().nonnegative(),
	order: z.number().nullable(),
})

const quoteSchema = z.object({
	id: z.string(),
	title: z.string().min(1),
	quoteNumber: z.string().min(1),
	shareToken: z.string().uuid(),
	status: quoteStatusSchema,
	clientName: z.string().min(1),
	clientManager: z.string().nullable(),
	issuedAt: z.date(),
	validUntil: z.date(),
	note: z.string().nullable(),
	items: z.array(quoteItemSchema),
})

// ── Notion property 타입별 추출 헬퍼 ──────────────────────
// Notion 응답은 속성 타입마다 형태가 달라 타입 가드 후에만 값을 꺼낸다.
// 기대 타입이 아니거나 값이 비어 있으면 null을 반환하고,
// 필수 여부 판단은 최종 quoteSchema.parse에 위임한다.

type NotionProperties = PageObjectResponse["properties"]

// Title → plain_text 결합 (빈 문자열이면 null)
function extractTitle(properties: NotionProperties, name: string): string | null {
	const property = properties[name]
	if (property?.type !== "title") return null
	const text = property.title.map((t) => t.plain_text).join("")
	return text.length > 0 ? text : null
}

// Rich text → plain_text 결합 (빈 문자열이면 null)
function extractRichText(
	properties: NotionProperties,
	name: string
): string | null {
	const property = properties[name]
	if (property?.type !== "rich_text") return null
	const text = property.rich_text.map((t) => t.plain_text).join("")
	return text.length > 0 ? text : null
}

// Select → 선택된 옵션 name
function extractSelect(properties: NotionProperties, name: string): string | null {
	const property = properties[name]
	if (property?.type !== "select") return null
	return property.select?.name ?? null
}

// Date → start 값을 Date로 변환 (파싱 불가 문자열이면 null)
function extractDate(properties: NotionProperties, name: string): Date | null {
	const property = properties[name]
	if (property?.type !== "date" || !property.date?.start) return null
	const date = new Date(property.date.start)
	return Number.isNaN(date.getTime()) ? null : date
}

// Number → 그대로 (미입력 시 null)
function extractNumber(properties: NotionProperties, name: string): number | null {
	const property = properties[name]
	if (property?.type !== "number") return null
	return property.number
}

// Notion 원시 페이지(Quotes 1건 + QuoteItems N건) → 내부 도메인 타입 Quote 변환.
// 최종적으로 quoteSchema.parse로 검증하므로 필수 속성 누락·타입 불일치는
// z.ZodError로 드러난다 (lib/notion.ts에서 NotionDataInvalidError로 감싸 던짐).
function parseNotionQuotePage(
	page: PageObjectResponse,
	itemPages: PageObjectResponse[]
): Quote {
	const items = itemPages.map((itemPage) => {
		const quantity = extractNumber(itemPage.properties, "수량")
		const unitPrice = extractNumber(itemPage.properties, "단가")

		return {
			id: itemPage.id,
			name: extractTitle(itemPage.properties, "항목명"),
			quantity,
			unitPrice,
			// 합계는 Notion Formula 값을 신뢰하지 않고 서버에서 직접 계산한다
			// (docs/notion-schema.md 원칙). 원값이 없으면 null → zod가 걸러낸다.
			amount:
				quantity !== null && unitPrice !== null ? quantity * unitPrice : null,
			order: extractNumber(itemPage.properties, "순서"),
		}
	})

	return quoteSchema.parse({
		id: page.id,
		title: extractTitle(page.properties, "견적명"),
		quoteNumber: extractRichText(page.properties, "견적번호"),
		shareToken: extractRichText(page.properties, "공유토큰"),
		status: extractSelect(page.properties, "상태"),
		clientName: extractRichText(page.properties, "클라이언트명"),
		clientManager: extractRichText(page.properties, "담당자"),
		issuedAt: extractDate(page.properties, "발행일"),
		validUntil: extractDate(page.properties, "유효기간"),
		note: extractRichText(page.properties, "비고"),
		items,
	})
}

// ── 금액 계산 순수 함수 ──────────────────────────────

export interface QuoteAmounts {
	supplyAmount: number
	taxAmount: number
	totalAmount: number
}

// 공급가액 = Σ(수량 × 단가), 부가세 = 공급가액 × 10%(반올림), 총액 = 공급가액 + 부가세
function calculateQuoteAmounts(
	items: Pick<QuoteItem, "quantity" | "unitPrice">[]
): QuoteAmounts {
	const supplyAmount = items.reduce(
		(sum, item) => sum + item.quantity * item.unitPrice,
		0
	)
	const taxAmount = Math.round(supplyAmount * 0.1)
	const totalAmount = supplyAmount + taxAmount

	return { supplyAmount, taxAmount, totalAmount }
}

// ── 표시 유틸 ──────────────────────────────

function formatKRW(amount: number): string {
	return `${amount.toLocaleString("ko-KR")}원`
}

// 날짜를 한국어 표기(예: 2026년 7월 1일)로 변환한다.
// 웹 뷰(quote-header.tsx)와 PDF(quote-pdf-document.tsx)가 공유한다.
function formatDateKR(date: Date): string {
	return date.toLocaleDateString("ko-KR", {
		year: "numeric",
		month: "long",
		day: "numeric",
	})
}

// 항목을 순서 오름차순으로 정렬한다. 순서가 없는 항목(null)은 뒤로 보낸다.
// 웹 뷰(page.tsx)와 PDF(quote-pdf-document.tsx)가 공유한다.
function sortItemsByOrder(items: QuoteItem[]): QuoteItem[] {
	return [...items].sort((a, b) => {
		if (a.order === null && b.order === null) return 0
		if (a.order === null) return 1
		if (b.order === null) return -1
		return a.order - b.order
	})
}

// ── 만료 판정 (P1, Task 011에서 실사용) ──────────────────

function resolveDisplayStatus(
	status: QuoteStatus,
	validUntil: Date,
	now: Date = new Date()
): QuoteStatus {
	if (now > validUntil) {
		return "만료"
	}

	return status
}

// ── 공급자 정보(A7) 환경 변수 로더 ──────────────────────

export interface SupplierInfo {
	name: string
	ceo: string
	phone: string
	email: string
}

function getSupplierInfo(): SupplierInfo {
	const name = process.env.SUPPLIER_NAME
	const ceo = process.env.SUPPLIER_CEO
	const phone = process.env.SUPPLIER_PHONE
	const email = process.env.SUPPLIER_EMAIL

	if (!name || !ceo || !phone || !email) {
		throw new Error("공급자 정보 환경 변수(SUPPLIER_*)가 설정되지 않았습니다.")
	}

	return { name, ceo, phone, email }
}

export {
	quoteStatusSchema,
	quoteItemSchema,
	quoteSchema,
	parseNotionQuotePage,
	calculateQuoteAmounts,
	formatKRW,
	formatDateKR,
	sortItemsByOrder,
	resolveDisplayStatus,
	getSupplierInfo,
}
