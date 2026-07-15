import { readFileSync } from "node:fs"
import { join } from "node:path"

import { Document, Font, Page, StyleSheet, Text } from "@react-pdf/renderer"

// Pretendard 서브셋 없는 전체 TTF(Regular/Bold)를 public/fonts/에서 읽어 등록한다
// (Task 008 스파이크 결론). public/ 디렉토리는 이 프로젝트의 배포 타겟인 Vercel
// 플랫폼(및 `next start` 기반 배포)에서는 정적 자산으로 항상 서빙된다.
// 단, next.config.ts에서 output: "standalone"으로 전환해 Docker 등 자체 호스팅으로
// 바꾸는 경우 public/은 자동 복사되지 않으므로(Next.js 공식 문서 명시) 배포 스크립트에
// `cp -r public .next/standalone/` 단계가 별도로 필요하다.
//
// 이전에 시도했다가 폐기한 방식:
//   ① require()/require.resolve()로 node_modules 내 .ttf를 참조
//      → Turbopack이 이를 모듈 임포트로 해석해 "Unknown module type" 빌드 에러 발생
//   ② next.config.ts의 outputFileTracingIncludes로 node_modules/pretendard 포함
//      → 이 옵션은 webpack 번들러 전용이며 Turbopack(Next.js 16 기본 빌드)에서는
//        완전히 무시됨 — 실제 .next 빌드 산출물의 nft.json에 반영되지 않음을 확인
// fs.readFileSync로 바이너리를 직접 읽고 base64 data URL 문자열로 변환해 전달한다
// (@react-pdf/font의 FontSrc 타입이 string만 허용하며 Buffer는 타입 에러가 남).
//
// @fontsource/noto-sans-kr은 유니코드 범위별 woff/woff2 청크로만 배포되어
// react-pdf 임베딩에 부적합해 제외했다.
//
// pretendard npm 의존성 대신 TTF를 이 저장소에 직접 커밋(vendoring)한 이유:
// node_modules 참조 방식이 위 두 시도 모두 Turbopack에서 실패했기 때문이다.
// 폰트 파일은 자주 바뀌지 않아 버전 고정 목적에도 맞다. 다만 public/ 하위라
// `/fonts/Pretendard-*.ttf`로 공개 다운로드도 가능해짐(OFL 라이선스라 문제없음,
// LICENSE.txt 동봉).
//
// 현재 Regular(400)/Bold(700) 2종만 등록 — 추가 weight가 필요하면
// pretendard npm 패키지(dist/public/static/alternative/)의 다른 파일을
// public/fonts/에 추가로 복사해 같은 방식으로 등록한다.
//
// 검증 이력: route.ts를 임시로 QuotePdfDocument에 연결해 next build 후
// .next/server/app/quote/[token]/pdf/route.js.nft.json에 public/fonts/*.ttf가
// 포함됨을 확인했고, next start로 실제 HTTP 요청까지 검증했다(Task 008).
// 이 검증은 route.ts가 아직 501 스텁이라 코드에 고정되지 않은 1회성 확인이므로,
// Task 009에서 실제로 연결한 뒤 동일 절차로 재검증이 필요하다.
const PRETENDARD_DIR = join(process.cwd(), "public/fonts")

// @react-pdf/renderer의 FontSrc 타입이 string만 허용하므로 Buffer를
// base64 data URL 문자열로 변환해 타입 안전하게 전달한다.
function readFontAsDataUrl(fileName: string): string {
	const buffer = readFileSync(join(PRETENDARD_DIR, fileName))
	return `data:font/ttf;base64,${buffer.toString("base64")}`
}

if (!Font.getRegisteredFontFamilies().includes("Pretendard")) {
	Font.register({
		family: "Pretendard",
		fonts: [
			{ src: readFontAsDataUrl("Pretendard-Regular.ttf") },
			{ src: readFontAsDataUrl("Pretendard-Bold.ttf"), fontWeight: "bold" },
		],
	})
}

const styles = StyleSheet.create({
	page: {
		fontFamily: "Pretendard",
		fontSize: 12,
		padding: 40,
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
	},
})

export interface QuotePdfDocumentProps {
	title: string
}

// @react-pdf/renderer 문서 정의 — 최소 A4 렌더링 + 한글 폰트 임베딩 검증(Task 008).
// 웹 뷰 7블록에 대응하는 실제 레이아웃은 Task 009에서 확장한다.
function QuotePdfDocument({ title }: QuotePdfDocumentProps) {
	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<Text style={styles.title}>{title}</Text>
			</Page>
		</Document>
	)
}

export { QuotePdfDocument }
