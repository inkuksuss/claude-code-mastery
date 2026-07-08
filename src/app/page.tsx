import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NewsletterForm } from "@/components/newsletter-form"

// 스타터킷 홈페이지
export default function Home() {
	return (
		<>
			{/* Hero Section */}
			<section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-24 text-center">
				<Badge variant="secondary">
					Next.js 16 · React 19 · Tailwind v4
				</Badge>
				<h1 className="font-heading text-4xl font-bold leading-tight sm:text-6xl">
					모던 웹 스타터킷
				</h1>
				<p className="max-w-xl text-lg text-muted-foreground">
					shadcn/ui와 다크모드가 준비된 Next.js 시작점입니다.
					필요한 모든 레이아웃과 컴포넌트가 이미 설치되어 있으니 바로 개발을 시작하세요.
				</p>
				<div className="flex flex-col gap-3 sm:flex-row">
					<Button size="lg">시작하기</Button>
					<Button size="lg" variant="outline">
						GitHub에서 보기
					</Button>
				</div>
			</section>

			<Separator className="my-8" />

			{/* Component Showcase Section */}
			<section id="showcase" className="mx-auto max-w-5xl px-4 py-16">
				<div className="mb-12 text-center">
					<h2 className="mb-3 font-heading text-3xl font-semibold">
						컴포넌트 쇼케이스
					</h2>
					<p className="text-muted-foreground">
						shadcn/ui의 핵심 컴포넌트들을 실제 사용 맥락에서 보여드립니다.
					</p>
				</div>

				<div className="grid gap-6 sm:grid-cols-2">
					{/* Buttons Showcase */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">버튼 (Buttons)</CardTitle>
							<CardDescription>기본 4가지 variant를 제공합니다</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col gap-3">
							<div className="flex flex-wrap gap-2">
								<Button size="sm">기본</Button>
								<Button size="sm" variant="outline">외곽선</Button>
								<Button size="sm" variant="secondary">보조</Button>
								<Button size="sm" variant="ghost">고스트</Button>
								<Button size="sm" variant="destructive">삭제</Button>
							</div>
						</CardContent>
					</Card>

					{/* Cards Showcase */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">카드 (Cards)</CardTitle>
							<CardDescription>콘텐츠를 그룹화하는 기본 컨테이너</CardDescription>
						</CardHeader>
						<CardContent className="space-y-2 text-sm text-muted-foreground">
							<p>✓ 반응형 그리드에 최적화</p>
							<p>✓ 헤더, 콘텐츠, 푸터 분리</p>
							<p>✓ 다크모드 완벽 지원</p>
						</CardContent>
					</Card>

					{/* Badges Showcase */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">배지 (Badges)</CardTitle>
							<CardDescription>상태나 카테고리를 표시합니다</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-wrap gap-2">
							<Badge>기본</Badge>
							<Badge variant="secondary">보조</Badge>
							<Badge variant="outline">외곽선</Badge>
							<Badge variant="destructive">삭제</Badge>
						</CardContent>
					</Card>

					{/* Dialog Showcase */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">다이얼로그 (Dialog)</CardTitle>
							<CardDescription>사용자 상호작용을 위한 모달</CardDescription>
						</CardHeader>
						<CardContent>
							<Dialog>
								<DialogTrigger render={<Button size="sm" variant="outline" />}>
									다이얼로그 열기
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>더 알아보기</DialogTitle>
										<DialogDescription>
											이것은 기본 다이얼로그 컴포넌트입니다.
										</DialogDescription>
									</DialogHeader>
									<div className="space-y-4">
										<p className="text-sm">
											ESC를 누르거나 외부를 클릭하면 닫힙니다.
										</p>
										<Button>확인</Button>
									</div>
								</DialogContent>
							</Dialog>
						</CardContent>
					</Card>

					{/* Avatar Showcase */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">아바타 (Avatar)</CardTitle>
							<CardDescription>사용자 또는 작성자 표시</CardDescription>
						</CardHeader>
						<CardContent className="flex items-center gap-4">
							<Avatar>
								<AvatarImage src="https://github.com/shadcn.png" />
								<AvatarFallback>CN</AvatarFallback>
							</Avatar>
							<div className="flex-1">
								<p className="text-sm font-medium">Starter Kit</p>
								<p className="text-xs text-muted-foreground">
									Made with shadcn/ui
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Tooltip Showcase */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">툴팁 (Tooltip)</CardTitle>
							<CardDescription>호버 시 정보 표시</CardDescription>
						</CardHeader>
						<CardContent>
							<Tooltip>
								<TooltipTrigger render={<Button size="sm" variant="outline" />}>
									호버해보세요 →
								</TooltipTrigger>
								<TooltipContent>
									<p>이것은 툴팁 메시지입니다</p>
								</TooltipContent>
							</Tooltip>
						</CardContent>
					</Card>
				</div>
			</section>

			<Separator className="my-8" />

			{/* Loading State Demo */}
			<section className="mx-auto max-w-5xl px-4 py-16">
				<h2 className="mb-6 font-heading text-2xl font-semibold">
					로딩 상태 (Skeleton)
				</h2>
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 3 }).map((_, i) => (
						<Card key={i}>
							<CardHeader>
								<Skeleton className="h-6 w-3/4" />
								<Skeleton className="mt-2 h-4 w-full" />
							</CardHeader>
							<CardContent className="space-y-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-5/6" />
							</CardContent>
						</Card>
					))}
				</div>
				<p className="mt-4 text-center text-sm text-muted-foreground">
					실제 콘텐츠 로딩 시 이런 형태의 로딩 상태를 보여줍니다
				</p>
			</section>

			<Separator className="my-8" />

			{/* Form Section */}
			<section className="mx-auto max-w-2xl px-4 py-16">
				<div className="mb-8">
					<h2 className="mb-2 font-heading text-2xl font-semibold">
						뉴스레터 구독
					</h2>
					<p className="text-sm text-muted-foreground">
						react-hook-form + zod로 폼 검증을 구현했습니다.
						useLocalStorage로 구독 상태를 영속화합니다.
					</p>
				</div>
				<Card>
					<CardContent className="pt-6">
						<NewsletterForm />
					</CardContent>
				</Card>
			</section>

			<Separator className="my-8" />

			{/* Select Showcase */}
			<section className="mx-auto max-w-2xl px-4 py-16">
				<h2 className="mb-6 font-heading text-2xl font-semibold">
					셀렉트 (Select)
				</h2>
				<Card>
					<CardContent className="space-y-4 pt-6">
						<div className="space-y-2">
							<label className="text-sm font-medium">
								관심 분야 선택
							</label>
							<Select>
								<SelectTrigger>
									<SelectValue placeholder="분야를 선택하세요" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="frontend">프론트엔드</SelectItem>
									<SelectItem value="backend">백엔드</SelectItem>
									<SelectItem value="fullstack">풀스택</SelectItem>
									<SelectItem value="devops">DevOps</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<Button className="w-full">선택 완료</Button>
					</CardContent>
				</Card>
			</section>

			<Separator className="my-8" />

			{/* Feature Overview */}
			<section className="mx-auto max-w-3xl px-4 py-16">
				<div className="rounded-lg border border-border bg-card/50 p-8 text-center">
					<h2 className="mb-4 font-heading text-2xl font-semibold">
						다음 단계
					</h2>
					<p className="mb-6 text-muted-foreground">
						Tier 1 · Tier 2 모든 필수 컴포넌트가 설치되었습니다.
						이제 자신의 프로젝트를 시작하세요.
					</p>
					<div className="grid gap-4 sm:grid-cols-2">
						<Button variant="outline">문서 읽기</Button>
						<Button>새 페이지 만들기</Button>
					</div>
				</div>
			</section>
		</>
	)
}
