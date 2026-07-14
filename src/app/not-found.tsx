import Link from "next/link"

import { Button } from "@/components/ui/button"

// 앱 전역 404 화면
// 존재하지 않는 경로 또는 notFound() 호출 시 표시된다.
// 견적서 세그먼트 전용 안내 화면(/quote/[token]/not-found)은 구현 단계에서 추가한다.
export default function NotFound() {
	return (
		<section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
			<p className="font-heading text-5xl font-bold text-muted-foreground">404</p>
			<h1 className="text-2xl font-semibold">페이지를 찾을 수 없습니다</h1>
			<p className="text-muted-foreground">
				요청하신 페이지가 존재하지 않거나 접근할 수 없습니다.
			</p>
			<Button render={<Link href="/" />}>홈으로 돌아가기</Button>
		</section>
	)
}
