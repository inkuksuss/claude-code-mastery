"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useLocalStorage } from "usehooks-ts"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

// 이메일 형식만 검증
const newsletterSchema = z.object({
	email: z.string().email("올바른 이메일 형식이 아닙니다"),
})

type NewsletterValues = z.infer<typeof newsletterSchema>

// 뉴스레터 구독 폼
// useLocalStorage로 구독 여부를 영속화해
// 재방문 시 폼 대신 완료 메시지를 보여준다
// initializeWithValue: false로 첫 렌더는 항상 서버와 동일한 initialValue(false)를 사용하고,
// 마운트 이후 useEffect에서 실제 localStorage 값으로 동기화해 hydration mismatch를 방지한다
function NewsletterForm() {
	const [subscribed, setSubscribed] = useLocalStorage("newsletter-subscribed", false, {
		initializeWithValue: false,
	})
	const [isSubmitting, setIsSubmitting] = React.useState(false)
	const [submitError, setSubmitError] = React.useState(false)
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<NewsletterValues>({
		resolver: zodResolver(newsletterSchema),
	})

	async function onSubmit(data: NewsletterValues) {
		setIsSubmitting(true)
		setSubmitError(false)
		try {
			// TODO: 실제 구독 API 호출로 교체하세요
			// await subscribeNewsletter(data.email)
			setSubscribed(true)
		} catch (error) {
			console.error(`뉴스레터 구독 실패 (${data.email})`, error)
			setSubmitError(true)
		} finally {
			setIsSubmitting(false)
		}
	}

	if (subscribed) {
		return (
			<div className="rounded-lg border border-border bg-card p-4">
				<p className="text-center text-sm font-medium text-primary">
					✓ 뉴스레터 구독이 완료되었습니다
				</p>
				<p className="mt-1 text-center text-xs text-muted-foreground">
					새로운 소식을 이메일로 받아보세요
				</p>
				<Button
					variant="ghost"
					size="sm"
					className="mt-3 w-full"
					onClick={() => setSubscribed(false)}
				>
					다시 구독하기
				</Button>
			</div>
		)
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
			<Field>
				<FieldLabel htmlFor="email">이메일</FieldLabel>
				<Input
					id="email"
					type="email"
					placeholder="you@example.com"
					{...register("email")}
					aria-invalid={!!errors.email}
				/>
				{errors.email && (
					<FieldError errors={[errors.email]} />
				)}
			</Field>
			{submitError && (
				<p className="text-sm text-destructive">
					구독에 실패했습니다. 잠시 후 다시 시도해주세요.
				</p>
			)}
			<Button type="submit" className="w-full" disabled={isSubmitting}>
				뉴스레터 구독
			</Button>
		</form>
	)
}

export { NewsletterForm }
