import { NextResponse } from "next/server"

// PDF 다운로드 Route Handler 빈 껍데기
// 실제 @react-pdf/renderer 렌더링·접근 제어는 Task 009에서 구현한다.
export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ token: string }> }
) {
	const { token } = await params

	return NextResponse.json(
		{ message: `PDF 생성은 아직 구현되지 않았습니다. (token: ${token})` },
		{ status: 501 }
	)
}
