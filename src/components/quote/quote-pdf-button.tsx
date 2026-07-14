"use client"

import { Download } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface QuotePdfButtonProps {
	token: string
}

// PDF 다운로드 트리거 — 상호작용이 필요한 유일한 클라이언트 컴포넌트
// 현재는 Route Handler(/quote/[token]/pdf)로 연결되는 링크이며,
// 다운로드 진행 상태 등 실제 상호작용 로직은 Task 009에서 붙인다.
function QuotePdfButton({ token }: QuotePdfButtonProps) {
	return (
		<a
			href={`/quote/${token}/pdf`}
			className={cn(buttonVariants({ variant: "default", size: "lg" }))}
		>
			<Download aria-hidden="true" data-icon="inline-start" />
			PDF 다운로드
		</a>
	)
}

export { QuotePdfButton }
