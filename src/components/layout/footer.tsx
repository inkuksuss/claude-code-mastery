import Link from "next/link"

// 저작권 및 참고 링크를 표시하는 하단 푸터
function Footer() {
	const currentYear = new Date().getFullYear()

	return (
		<footer className="border-t border-border">
			<div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
				<p>© {currentYear} Starter Kit. All rights reserved.</p>
				<div className="flex items-center gap-6">
					<Link
						href="https://nextjs.org"
						target="_blank"
						rel="noreferrer"
						className="transition-colors hover:text-foreground"
					>
						Next.js
					</Link>
					<Link
						href="https://ui.shadcn.com"
						target="_blank"
						rel="noreferrer"
						className="transition-colors hover:text-foreground"
					>
						shadcn/ui
					</Link>
					<Link
						href="https://tailwindcss.com"
						target="_blank"
						rel="noreferrer"
						className="transition-colors hover:text-foreground"
					>
						Tailwind CSS
					</Link>
				</div>
			</div>
		</footer>
	)
}

export { Footer }
