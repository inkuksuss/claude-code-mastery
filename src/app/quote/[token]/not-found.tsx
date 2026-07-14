import type { Metadata } from "next"

// 토큰 불일치/작성중 견적서 안내 화면
// PRD 5.3: 존재하지 않는 토큰·작성중 상태·빈 토큰은 모두 동일한 404 응답이어야 한다.
// 실제 판정 로직은 Task 007에서 notFound() 호출과 연결한다.
// 이 화면도 page.tsx와 동일하게 noindex — 루트 layout의 metadata는 not-found로 상속되지 않는다.
export const metadata: Metadata = {
	robots: {
		index: false,
		follow: false,
	},
}

export default function QuoteNotFound() {
	return (
		<section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
			<p className="text-5xl font-bold text-muted-foreground">404</p>
			<h1 className="text-2xl font-semibold">견적서를 찾을 수 없습니다</h1>
			<p className="text-muted-foreground">
				링크가 올바른지 확인하시거나 견적서를 보내주신 분께 문의해 주세요.
			</p>
		</section>
	)
}
