"use client"

import Link from "next/link"
import { useIsClient, useMediaQuery } from "usehooks-ts"

import { ThemeToggle } from "@/components/theme-toggle"
import { MobileNav } from "@/components/layout/mobile-nav"
import { navLinks } from "@/components/layout/nav-links"

// 상단 고정 네비게이션 헤더
// useMediaQuery로 JS 레벨에서 데스크톱/모바일을 분기해
// CSS 은닉보다 더 좋은 접근성을 제공한다
// 단, 서버에는 window가 없어 항상 기본값(false)으로 렌더링되므로
// 클라이언트 실제 값과 어긋나 hydration mismatch가 발생한다
// useIsClient로 마운트 전에는 서버와 동일하게 모바일 트리를 렌더링해 이를 방지한다
function Header() {
	const isClient = useIsClient()
	const isDesktopQuery = useMediaQuery("(min-width: 768px)")
	const isDesktop = isClient && isDesktopQuery

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
				<Link href="/" className="font-heading text-lg font-semibold">
					Starter Kit
				</Link>

				<div className="flex items-center gap-4">
					{isDesktop && (
						<nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
							{navLinks.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className="transition-colors hover:text-foreground"
									target={link.href.startsWith("http") ? "_blank" : undefined}
									rel={link.href.startsWith("http") ? "noreferrer" : undefined}
								>
									{link.label}
								</Link>
							))}
						</nav>
					)}

					<ThemeToggle />

					{!isDesktop && <MobileNav />}
				</div>
			</div>
		</header>
	)
}

export { Header }
