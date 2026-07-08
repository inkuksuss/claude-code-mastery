"use client"

import * as React from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { navLinks } from "@/components/layout/nav-links"

// 모바일 네비게이션, Sheet를 기반으로 한다
// 상위 Header에서 모바일 뷰포트에서만 이 컴포넌트가 렌더링된다
function MobileNav() {
	const [open, setOpen] = React.useState(false)

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger render={<Button variant="ghost" size="icon-sm" className="md:hidden" />}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="size-4"
				>
					<line x1="4" x2="20" y1="6" y2="6" />
					<line x1="4" x2="20" y1="12" y2="12" />
					<line x1="4" x2="20" y1="18" y2="18" />
				</svg>
				<span className="sr-only">메뉴</span>
			</SheetTrigger>
			<SheetContent side="right">
				<nav className="flex flex-col gap-2">
					{navLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							onClick={() => setOpen(false)}
							className="rounded px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
							target={link.href.startsWith("http") ? "_blank" : undefined}
							rel={link.href.startsWith("http") ? "noreferrer" : undefined}
						>
							{link.label}
						</Link>
					))}
				</nav>
			</SheetContent>
		</Sheet>
	)
}

export { MobileNav }
