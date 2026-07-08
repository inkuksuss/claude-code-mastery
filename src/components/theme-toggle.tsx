"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useIsClient } from "usehooks-ts"

import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// 라이트/다크/시스템 테마를 전환하는 드롭다운 토글 버튼
// useIsClient로 하이드레이션 전 렌더링을 방지해 아이콘 깜빡임을 피한다
function ThemeToggle() {
	const { setTheme } = useTheme()
	const isClient = useIsClient()

	if (!isClient) {
		return (
			<Button variant="ghost" size="icon-sm">
				<Sun className="size-4" />
				<span className="sr-only">테마 변경</span>
			</Button>
		)
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
				<Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
				<Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
				<span className="sr-only">테마 변경</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => setTheme("light")}>
					라이트
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("dark")}>
					다크
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("system")}>
					시스템
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export { ThemeToggle }
