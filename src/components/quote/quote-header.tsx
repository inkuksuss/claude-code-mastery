import { Badge, badgeVariants } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { QuoteStatus } from "@/lib/quote-schema"
import type { VariantProps } from "class-variance-authority"

export interface QuoteHeaderProps {
	title: string
	quoteNumber: string
	issuedAt: Date
	validUntil: Date
	status: QuoteStatus
}

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>

// 상태 → 배지 variant 매핑 (색상은 보조 수단, 상태 텍스트가 본질 정보)
const statusBadgeVariant: Record<QuoteStatus, BadgeVariant> = {
	작성중: "outline",
	발송됨: "secondary",
	승인: "default",
	만료: "destructive",
}

// 날짜를 한국어 표기(예: 2026년 7월 1일)로 변환한다.
function formatDateKR(date: Date): string {
	return date.toLocaleDateString("ko-KR", {
		year: "numeric",
		month: "long",
		day: "numeric",
	})
}

// 견적명·번호·발행일·유효기간·상태 배지 헤더
// 만료 자동 판정(resolveDisplayStatus 연결)은 Task 011 범위이므로,
// 여기서는 status prop이 "만료"일 때만 안내 배너를 노출한다.
function QuoteHeader({
	title,
	quoteNumber,
	issuedAt,
	validUntil,
	status,
}: QuoteHeaderProps) {
	const isExpired = status === "만료"

	return (
		<header className="flex flex-col gap-4">
			{isExpired && (
				<p
					role="status"
					className={cn(
						"rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3",
						"text-sm font-medium text-destructive"
					)}
				>
					이 견적서는 유효기간이 지나 만료되었습니다. 재발행이 필요하시면
					공급자에게 문의해 주세요.
				</p>
			)}

			<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
				<h1 className="text-2xl font-semibold tracking-tight text-foreground">
					{title}
				</h1>
				{/* 색상만으로 상태를 전달하지 않도록 배지 안에 상태 텍스트를 그대로 노출한다 */}
				<Badge variant={statusBadgeVariant[status]}>
					<span className="sr-only">견적서 상태: </span>
					{status}
				</Badge>
			</div>

			<dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
				<dt className="text-muted-foreground">견적 번호</dt>
				<dd className="text-foreground">{quoteNumber}</dd>

				<dt className="text-muted-foreground">발행일</dt>
				<dd className="text-foreground">
					<time dateTime={issuedAt.toISOString().slice(0, 10)}>
						{formatDateKR(issuedAt)}
					</time>
				</dd>

				<dt className="text-muted-foreground">유효기간</dt>
				<dd className="text-foreground">
					<time dateTime={validUntil.toISOString().slice(0, 10)}>
						{formatDateKR(validUntil)}
					</time>
					{" 까지"}
				</dd>
			</dl>
		</header>
	)
}

export { QuoteHeader }
