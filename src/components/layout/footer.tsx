// 저작권 문구를 표시하는 하단 푸터
function Footer() {
	const currentYear = new Date().getFullYear()

	return (
		<footer className="border-t border-border">
			<div className="mx-auto flex max-w-5xl items-center justify-center px-4 py-6 text-sm text-muted-foreground">
				<p>© {currentYear} 견적서. All rights reserved.</p>
			</div>
		</footer>
	)
}

export { Footer }
