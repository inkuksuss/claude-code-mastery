import { readFileSync } from "node:fs"
import { join } from "node:path"

import {
	Document,
	Font,
	Page,
	StyleSheet,
	Text,
	View,
} from "@react-pdf/renderer"
import type { DocumentProps } from "@react-pdf/renderer"

import {
	calculateQuoteAmounts,
	formatDateKR,
	formatKRW,
	sortItemsByOrder,
	type Quote,
	type SupplierInfo,
} from "@/lib/quote-schema"

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
// 검증 이력: Task 008에서 임시 연결로 nft.json 트레이싱·HTTP 응답을 1회 확인했고,
// Task 009에서 route.ts가 이 컴포넌트를 실제로 사용하게 된 뒤 동일 절차
// (next build → route.js.nft.json에 public/fonts/*.ttf 포함 확인 → next start
// 실 HTTP 요청으로 /Type0·FontFile2 임베딩 확인)로 재검증을 완료했다.
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

// ── 색상 팔레트 (라이트 테마 고정) ──────────────────────────
// PDF는 다크모드 개념이 없으므로 웹 뷰의 shadcn 라이트 토큰과 비슷한 톤을
// 하드코딩한다. (foreground ≈ gray-900, muted-foreground ≈ gray-500, border ≈ gray-200)
const COLOR = {
	foreground: "#111827",
	muted: "#6b7280",
	border: "#e5e7eb",
	headerBg: "#f9fafb",
} as const

const styles = StyleSheet.create({
	page: {
		fontFamily: "Pretendard",
		fontSize: 10,
		color: COLOR.foreground,
		paddingTop: 40,
		paddingHorizontal: 40,
		// 하단은 고정 페이지 번호(fixed) 영역과 겹치지 않도록 여유를 더 둔다
		paddingBottom: 56,
	},

	// ── 블록 1: 헤더 ──
	header: {
		flexDirection: "column",
		gap: 10,
		marginBottom: 20,
	},
	titleRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
	},
	statusBadge: {
		fontSize: 9,
		color: COLOR.muted,
		borderWidth: 1,
		borderColor: COLOR.border,
		borderRadius: 4,
		paddingVertical: 2,
		paddingHorizontal: 6,
	},
	metaRow: {
		flexDirection: "row",
		gap: 12,
		marginBottom: 2,
	},
	metaLabel: {
		width: 52,
		color: COLOR.muted,
	},

	// ── 블록 2: 공급자/수신자 (2단 배치) ──
	partyRow: {
		flexDirection: "row",
		gap: 12,
		marginBottom: 20,
	},
	partyCard: {
		flex: 1,
		borderWidth: 1,
		borderColor: COLOR.border,
		borderRadius: 6,
		padding: 12,
	},
	partyTitle: {
		fontSize: 11,
		fontWeight: "bold",
		marginBottom: 8,
		paddingBottom: 6,
		borderBottomWidth: 1,
		borderBottomColor: COLOR.border,
	},
	infoRow: {
		flexDirection: "row",
		gap: 10,
		marginBottom: 3,
	},
	infoLabel: {
		width: 40,
		color: COLOR.muted,
	},
	infoValue: {
		flex: 1,
	},

	// ── 블록 3: 견적 항목 테이블 (View row + Text cell을 flexbox로 표처럼 구성) ──
	table: {
		marginBottom: 16,
	},
	tableRow: {
		flexDirection: "row",
		borderBottomWidth: 1,
		borderBottomColor: COLOR.border,
		paddingVertical: 6,
		paddingHorizontal: 8,
	},
	tableHeadRow: {
		backgroundColor: COLOR.headerBg,
		borderTopWidth: 1,
		borderTopColor: COLOR.border,
	},
	tableHeadCell: {
		fontWeight: "bold",
		color: COLOR.muted,
	},
	cellName: {
		flex: 4,
		paddingRight: 8,
	},
	cellQuantity: {
		flex: 1,
		textAlign: "right",
	},
	cellUnitPrice: {
		flex: 2,
		textAlign: "right",
	},
	cellAmount: {
		flex: 2,
		textAlign: "right",
	},
	cellAmountValue: {
		fontWeight: "bold",
	},
	emptyRow: {
		paddingVertical: 16,
		textAlign: "center",
		color: COLOR.muted,
		borderBottomWidth: 1,
		borderBottomColor: COLOR.border,
	},

	// ── 블록 4: 금액 요약 ──
	summary: {
		alignSelf: "flex-end",
		width: 220,
		borderWidth: 1,
		borderColor: COLOR.border,
		borderRadius: 6,
		padding: 12,
		marginBottom: 20,
	},
	summaryRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 4,
	},
	summaryLabel: {
		color: COLOR.muted,
	},
	summaryDivider: {
		borderBottomWidth: 1,
		borderBottomColor: COLOR.border,
		marginVertical: 6,
	},
	summaryTotalLabel: {
		fontSize: 11,
		fontWeight: "bold",
	},
	summaryTotalValue: {
		fontSize: 13,
		fontWeight: "bold",
	},

	// ── 블록 5: 비고 ──
	noteTitle: {
		fontSize: 11,
		fontWeight: "bold",
		marginBottom: 4,
	},
	noteBody: {
		color: COLOR.foreground,
		lineHeight: 1.5,
	},

	// ── 페이지 번호 (모든 페이지 하단 고정) ──
	pageNumber: {
		position: "absolute",
		bottom: 24,
		left: 0,
		right: 0,
		textAlign: "center",
		fontSize: 9,
		color: COLOR.muted,
	},
})

// 라벨-값 한 쌍 (공급자/수신자 카드 내부 행)
function InfoRow({ label, value }: { label: string; value: string }) {
	return (
		<View style={styles.infoRow}>
			<Text style={styles.infoLabel}>{label}</Text>
			<Text style={styles.infoValue}>{value}</Text>
		</View>
	)
}

// 헤더 메타 정보 행 (견적 번호/발행일/유효기간)
function MetaRow({ label, value }: { label: string; value: string }) {
	return (
		<View style={styles.metaRow}>
			<Text style={styles.metaLabel}>{label}</Text>
			<Text>{value}</Text>
		</View>
	)
}

// DocumentProps를 확장해 renderToBuffer(ReactElement<DocumentProps> 요구)에
// 타입 캐스팅 없이 엘리먼트를 그대로 전달할 수 있게 한다
export interface QuotePdfDocumentProps extends DocumentProps {
	quote: Quote
	supplier: SupplierInfo
}

// @react-pdf/renderer 견적서 PDF 문서 — 웹 뷰의 7블록과 동일한 정보를 담는다.
// - 금액은 웹 뷰와 동일하게 calculateQuoteAmounts로 서버에서 직접 계산 (중복 로직 금지)
// - Page의 wrap 기본 동작으로 항목이 많으면(30개 이상 등) 자동으로 다음 페이지로 분할되고,
//   행 단위(wrap={false})로 넘어가므로 한 행이 페이지 경계에서 잘리지 않는다
// - 페이지 번호는 fixed Text의 render prop으로 모든 페이지 하단에 표시한다
function QuotePdfDocument({ quote, supplier }: QuotePdfDocumentProps) {
	const amounts = calculateQuoteAmounts(quote.items)
	const sortedItems = sortItemsByOrder(quote.items)

	return (
		<Document title={quote.title}>
			<Page size="A4" style={styles.page}>
				{/* 블록 1: 헤더 — 견적명·상태·견적번호·발행일·유효기간 */}
				<View style={styles.header}>
					<View style={styles.titleRow}>
						<Text style={styles.title}>{quote.title}</Text>
						<Text style={styles.statusBadge}>{quote.status}</Text>
					</View>
					<View>
						<MetaRow label="견적 번호" value={quote.quoteNumber} />
						<MetaRow label="발행일" value={formatDateKR(quote.issuedAt)} />
						<MetaRow
							label="유효기간"
							value={`${formatDateKR(quote.validUntil)} 까지`}
						/>
					</View>
				</View>

				{/* 블록 2: 공급자/수신자 정보 — flexDirection: row로 2단 배치 */}
				<View style={styles.partyRow}>
					<View style={styles.partyCard}>
						<Text style={styles.partyTitle}>공급자</Text>
						<InfoRow label="상호" value={supplier.name} />
						<InfoRow label="대표" value={supplier.ceo} />
						<InfoRow label="연락처" value={supplier.phone} />
						<InfoRow label="이메일" value={supplier.email} />
					</View>
					<View style={styles.partyCard}>
						<Text style={styles.partyTitle}>수신자</Text>
						<InfoRow label="회사명" value={quote.clientName} />
						{quote.clientManager && (
							<InfoRow label="담당자" value={quote.clientManager} />
						)}
					</View>
				</View>

				{/* 블록 3: 견적 항목 테이블 — 항목명/수량/단가/합계 */}
				<View style={styles.table}>
					<View style={[styles.tableRow, styles.tableHeadRow]}>
						<Text style={[styles.cellName, styles.tableHeadCell]}>항목명</Text>
						<Text style={[styles.cellQuantity, styles.tableHeadCell]}>
							수량
						</Text>
						<Text style={[styles.cellUnitPrice, styles.tableHeadCell]}>
							단가
						</Text>
						<Text style={[styles.cellAmount, styles.tableHeadCell]}>합계</Text>
					</View>

					{sortedItems.length === 0 ? (
						<Text style={styles.emptyRow}>등록된 견적 항목이 없습니다.</Text>
					) : (
						sortedItems.map((item) => (
							// wrap={false}: 한 행이 페이지 경계에서 반으로 잘리지 않고
							// 통째로 다음 페이지로 넘어가도록 한다 (다중 페이지 분할 대응)
							<View key={item.id} style={styles.tableRow} wrap={false}>
								<Text style={styles.cellName}>{item.name}</Text>
								<Text style={styles.cellQuantity}>
									{item.quantity.toLocaleString("ko-KR")}
								</Text>
								<Text style={styles.cellUnitPrice}>
									{formatKRW(item.unitPrice)}
								</Text>
								<Text style={[styles.cellAmount, styles.cellAmountValue]}>
									{formatKRW(item.amount)}
								</Text>
							</View>
						))
					)}
				</View>

				{/* 블록 4: 금액 요약 — 공급가액/부가세/총액(강조), 페이지 경계에서 통째로 이동 */}
				<View style={styles.summary} wrap={false}>
					<View style={styles.summaryRow}>
						<Text style={styles.summaryLabel}>공급가액</Text>
						<Text>{formatKRW(amounts.supplyAmount)}</Text>
					</View>
					<View style={styles.summaryRow}>
						<Text style={styles.summaryLabel}>부가세 (10%)</Text>
						<Text>{formatKRW(amounts.taxAmount)}</Text>
					</View>
					<View style={styles.summaryDivider} />
					<View style={styles.summaryRow}>
						<Text style={styles.summaryTotalLabel}>총액</Text>
						<Text style={styles.summaryTotalValue}>
							{formatKRW(amounts.totalAmount)}
						</Text>
					</View>
				</View>

				{/* 블록 5: 비고 — 내용이 있을 때만 렌더링. react-pdf Text는 브라우저의
				    white-space 개념이 없어 "\n"을 줄 단위로 직접 분리해 렌더링한다
				    (웹 뷰의 whitespace-pre-line과 동일한 결과를 명시적으로 보장) */}
				{quote.note && (
					<View wrap={false}>
						<Text style={styles.noteTitle}>비고</Text>
						{quote.note.split("\n").map((line, index) => (
							<Text key={index} style={styles.noteBody}>
								{line || " "}
							</Text>
						))}
					</View>
				)}

				{/* 페이지 번호 — 모든 페이지 하단 중앙에 "현재 / 전체" 표시 */}
				<Text
					style={styles.pageNumber}
					render={({ pageNumber, totalPages }) =>
						`${pageNumber} / ${totalPages}`
					}
					fixed
				/>
			</Page>
		</Document>
	)
}

export { QuotePdfDocument }
