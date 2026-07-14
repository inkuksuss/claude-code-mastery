import { Document, Page, Text } from "@react-pdf/renderer"

export interface QuotePdfDocumentProps {
	title: string
}

// @react-pdf/renderer 문서 정의 빈 껍데기
// 실제 A4 레이아웃·한글 폰트 등록은 Task 008(폰트 스파이크)·009에서 구현한다.
function QuotePdfDocument({ title }: QuotePdfDocumentProps) {
	return (
		<Document>
			<Page size="A4">
				<Text>{title}</Text>
			</Page>
		</Document>
	)
}

export { QuotePdfDocument }
