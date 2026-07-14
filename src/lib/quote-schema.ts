import { z } from "zod"

// ── 내부 도메인 타입 ──────────────────────────────

export type QuoteStatus = "작성중" | "발송됨" | "승인" | "만료"

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

// Notion 페이지 속성 원시 구조 → 위 quoteSchema로 매핑하는 파서는
// Task 006에서 lib/notion.ts와 함께 구현한다 (여기서는 시그니처만 정의).
function parseNotionQuotePage(page: unknown): Quote {
	void page
	throw new Error("parseNotionQuotePage는 아직 구현되지 않았습니다. (Task 006)")
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
	resolveDisplayStatus,
	getSupplierInfo,
}
