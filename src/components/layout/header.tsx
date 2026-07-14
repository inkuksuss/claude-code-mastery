import Link from "next/link"

import { ThemeToggle } from "@/components/theme-toggle"

// 상단 고정 헤더
// 견적서 뷰어는 공개 링크로 접근하는 읽기 전용 페이지이므로
// 별도 네비게이션 메뉴 없이 브랜드명과 테마 토글만 노출한다
function Header() {
	return (
		<header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
				<Link href="/" className="font-heading text-lg font-semibold">
					견적서
				</Link>
				<ThemeToggle />
			</div>
		</header>
	)
}

export { Header }
