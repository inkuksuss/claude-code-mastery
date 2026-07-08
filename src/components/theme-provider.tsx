"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// next-themes를 앱 전역에 연결하는 클라이언트 컴포넌트
// attribute="class"로 html 태그에 dark 클래스를 토글하며,
// globals.css의 @custom-variant dark와 호환된다
function ThemeProvider({
	children,
	...props
}: React.ComponentProps<typeof NextThemesProvider>) {
	return (
		<NextThemesProvider {...props}>
			{children}
		</NextThemesProvider>
	)
}

export { ThemeProvider }
