import { createElement } from "react"

import { renderToBuffer } from "@react-pdf/renderer"
import { NextResponse } from "next/server"

import { QuotePdfDocument } from "@/components/quote/quote-pdf-document"
import {
	getQuoteByToken,
	NotionDataInvalidError,
	NotionRateLimitError,
} from "@/lib/notion"
import { getSupplierInfo, type Quote } from "@/lib/quote-schema"

// RFC 5987 filename* 값 인코딩 — encodeURIComponent가 남겨두는 문자 중
// attr-char에 포함되지 않는 ' ( ) * 를 추가로 퍼센트 인코딩한다
function encodeRfc5987(value: string): string {
	return encodeURIComponent(value).replace(
		/['()*]/g,
		(char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`
	)
}

// Content-Disposition 헤더 값 생성.
// 한글 파일명은 RFC 5987 filename*(UTF-8 퍼센트 인코딩)으로 전달하고,
// 구형 클라이언트를 위한 ASCII fallback(filename)을 함께 제공한다.
function buildContentDisposition(quote: Quote): string {
	const fileName = `견적서_${quote.quoteNumber}_${quote.clientName}.pdf`
	// fallback은 헤더에 안전한 ASCII만 남긴다 (견적번호의 영숫자·하이픈 활용)
	const asciiFallback = `quote_${quote.quoteNumber.replace(/[^\w.-]/g, "_")}.pdf`

	return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeRfc5987(fileName)}`
}

// PDF 다운로드 Route Handler (Task 009)
// - 접근 제어는 웹 뷰(page.tsx)와 동일: 토큰 형식 불일치·미존재·'작성중'은
//   getQuoteByToken이 모두 null로 정규화하므로 구분 불가능한 동일 404를 반환한다
// - 식별 가능한 실패는 웹 뷰의 안내 화면에 대응하는 상태 코드로 매핑:
//   rate limit → 429(재시도 유도), 데이터 검증 실패 → 502(업스트림 데이터 불량)
// - 그 외 예외는 다시 던져 Next.js 기본 에러 처리(500)에 맡긴다
export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ token: string }> }
) {
	const { token } = await params

	let quote: Quote | null
	try {
		quote = await getQuoteByToken(token)
	} catch (error) {
		if (error instanceof NotionRateLimitError) {
			return NextResponse.json(
				{ message: "요청이 일시적으로 많습니다. 잠시 후 다시 시도해주세요." },
				{ status: 429 }
			)
		}
		if (error instanceof NotionDataInvalidError) {
			return NextResponse.json(
				{ message: "견적서 데이터에 문제가 있어 PDF를 생성할 수 없습니다." },
				{ status: 502 }
			)
		}
		throw error
	}

	if (!quote) {
		return NextResponse.json(
			{ message: "견적서를 찾을 수 없습니다." },
			{ status: 404 }
		)
	}

	// 공급자 정보는 환경 변수(SUPPLIER_*)에서 로드 — 웹 뷰(page.tsx)와 동일
	const supplier = getSupplierInfo()

	// route.ts(비 tsx) 확장자를 유지하기 위해 JSX 대신 createElement를 사용한다
	const pdfBuffer = await renderToBuffer(
		createElement(QuotePdfDocument, { quote, supplier })
	)

	// Buffer(Uint8Array<ArrayBufferLike>)는 BodyInit 타입과 어긋날 수 있어
	// ArrayBuffer 기반 Uint8Array로 감싸 전달한다
	return new NextResponse(new Uint8Array(pdfBuffer), {
		status: 200,
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": buildContentDisposition(quote),
		},
	})
}
