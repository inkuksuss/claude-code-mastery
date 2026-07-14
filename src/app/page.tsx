// 루트 페이지
// 견적서는 공유 토큰 링크(/quote/[token])로만 접근하므로
// 루트에는 별도 진입점을 두지 않고 최소한의 안내만 표시한다
export default function Home() {
	return (
		<section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
			<h1 className="font-heading text-3xl font-bold sm:text-4xl">견적서 뷰어</h1>
			<p className="text-muted-foreground">
				전달받은 견적서 링크로 접속하시면 견적 내용을 확인하실 수 있습니다.
			</p>
		</section>
	)
}
