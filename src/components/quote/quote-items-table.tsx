import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { formatKRW } from "@/lib/quote-schema"

export interface QuoteItemRow {
	id: string
	name: string
	quantity: number
	unitPrice: number
	amount: number
}

export interface QuoteItemsTableProps {
	items: QuoteItemRow[]
}

// 견적 항목 테이블 — 시맨틱 <table> + <caption> (shadcn Table이 실제 table 요소를 렌더링)
// 금액 표시는 반드시 formatKRW()만 사용한다.
function QuoteItemsTable({ items }: QuoteItemsTableProps) {
	return (
		<Table>
			<TableCaption>
				견적 항목 목록 — 항목명, 수량, 단가, 합계 순으로 표시됩니다.
			</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead scope="col">항목명</TableHead>
					<TableHead scope="col" className="text-right">
						수량
					</TableHead>
					<TableHead scope="col" className="text-right">
						단가
					</TableHead>
					<TableHead scope="col" className="text-right">
						합계
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{items.length === 0 ? (
					<TableRow>
						<TableCell
							colSpan={4}
							className="h-16 text-center text-muted-foreground"
						>
							등록된 견적 항목이 없습니다.
						</TableCell>
					</TableRow>
				) : (
					items.map((item) => (
						<TableRow key={item.id}>
							<TableCell className="whitespace-normal break-keep text-foreground">
								{item.name}
							</TableCell>
							<TableCell className="text-right tabular-nums text-foreground">
								{item.quantity.toLocaleString("ko-KR")}
							</TableCell>
							<TableCell className="text-right tabular-nums text-foreground">
								{formatKRW(item.unitPrice)}
							</TableCell>
							<TableCell className="text-right font-medium tabular-nums text-foreground">
								{formatKRW(item.amount)}
							</TableCell>
						</TableRow>
					))
				)}
			</TableBody>
		</Table>
	)
}

export { QuoteItemsTable }
