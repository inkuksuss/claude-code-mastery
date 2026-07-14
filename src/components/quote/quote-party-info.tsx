import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export interface QuotePartyInfoProps {
	supplier: {
		name: string
		ceo: string
		phone: string
		email: string
	}
	client: {
		name: string
		manager?: string | null
	}
}

// 라벨-값 한 쌍을 dl 그리드 행으로 렌더링하는 내부 헬퍼
function InfoRow({ label, value }: { label: string; value: string }) {
	return (
		<>
			<dt className="text-muted-foreground">{label}</dt>
			<dd className="break-keep text-foreground">{value}</dd>
		</>
	)
}

// 공급자/수신자 정보 블록 (Card + Separator 기반)
function QuotePartyInfo({ supplier, client }: QuotePartyInfoProps) {
	return (
		<section
			aria-label="거래 당사자 정보"
			className="grid gap-4 sm:grid-cols-2"
		>
			<Card size="sm">
				<CardHeader>
					<CardTitle>공급자</CardTitle>
				</CardHeader>
				<Separator />
				<CardContent>
					<dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
						<InfoRow label="상호" value={supplier.name} />
						<InfoRow label="대표" value={supplier.ceo} />
						<InfoRow label="연락처" value={supplier.phone} />
						<InfoRow label="이메일" value={supplier.email} />
					</dl>
				</CardContent>
			</Card>

			<Card size="sm">
				<CardHeader>
					<CardTitle>수신자</CardTitle>
				</CardHeader>
				<Separator />
				<CardContent>
					<dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
						<InfoRow label="회사명" value={client.name} />
						{client.manager && (
							<InfoRow label="담당자" value={client.manager} />
						)}
					</dl>
				</CardContent>
			</Card>
		</section>
	)
}

export { QuotePartyInfo }
