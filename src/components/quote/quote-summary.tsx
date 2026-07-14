import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatKRW } from "@/lib/quote-schema"

export interface QuoteSummaryProps {
	supplyAmount: number
	taxAmount: number
	totalAmount: number
}

// 공급가액/부가세/총액 요약 — 총액은 크기·굵기로 시각적으로 강조한다.
// 금액 표시는 반드시 formatKRW()만 사용한다.
function QuoteSummary({
	supplyAmount,
	taxAmount,
	totalAmount,
}: QuoteSummaryProps) {
	return (
		<section aria-label="금액 요약">
			<Card size="sm" className="ml-auto w-full max-w-sm">
				<CardContent>
					<dl className="flex flex-col gap-2 text-sm">
						<div className="flex items-center justify-between gap-4">
							<dt className="text-muted-foreground">공급가액</dt>
							<dd className="tabular-nums text-foreground">
								{formatKRW(supplyAmount)}
							</dd>
						</div>

						<div className="flex items-center justify-between gap-4">
							<dt className="text-muted-foreground">부가세 (10%)</dt>
							<dd className="tabular-nums text-foreground">
								{formatKRW(taxAmount)}
							</dd>
						</div>

						<Separator className="my-1" />

						<div className="flex items-center justify-between gap-4">
							<dt className="text-base font-semibold text-foreground">총액</dt>
							<dd className="text-xl font-bold tabular-nums text-foreground">
								{formatKRW(totalAmount)}
							</dd>
						</div>
					</dl>
				</CardContent>
			</Card>
		</section>
	)
}

export { QuoteSummary }
