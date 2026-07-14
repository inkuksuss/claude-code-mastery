# Notion Database 스키마 (노션 견적서 웹 뷰어)

> PRD 5.1 기준. 실제 Notion Database 구축은 `docs/ROADMAP.md` Task 006에서 수행한다. 이 문서는 스키마 정의를 미리 확정해 두기 위한 참조 자료다.

## Quotes Database (견적서)

페이지 1개 = 견적서 1건.

| 속성명 | Notion 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| 견적명 | Title | ✅ | 예: "쇼핑몰 리뉴얼 견적" |
| 견적번호 | Rich text | ✅ | 예: `Q-2026-001` (PDF 파일명에 사용) |
| 공유토큰 | Rich text | ✅ | UUID v4. URL 경로(`/quote/[token]`)에 사용 |
| 상태 | Select | ✅ | `작성중` / `발송됨` / `승인` / `만료` |
| 클라이언트명 | Rich text | ✅ | 예: "(주)박대표컴퍼니" |
| 담당자 | Rich text | — | 클라이언트 측 담당자명 |
| 발행일 | Date | ✅ | 견적서 발행일 |
| 유효기간 | Date | ✅ | 이 날짜 경과 시 자동 만료 처리 |
| 비고 | Rich text | — | 특약·안내 문구 (여러 줄) |

## QuoteItems Database (견적 항목)

견적서 페이지 내 인라인 자식 Database (가정 A2).

| 속성명 | Notion 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| 항목명 | Title | ✅ | 예: "메인 페이지 디자인" |
| 수량 | Number | ✅ | 기본 1 |
| 단가 | Number (원) | ✅ | 원화 정수 |
| 합계 | Formula | ✅ | `수량 × 단가` (표시 보조용, 서버는 신뢰하지 않음) |
| 순서 | Number | — | 웹/PDF 표시 정렬 기준 (미입력 시 생성순) |

## 금액 계산 규칙

서버(`src/lib/quote-schema.ts`의 `calculateQuoteAmounts`)에서 계산하며, Notion Formula 값은 표시 보조용으로만 취급한다.

- 공급가액 = Σ(수량 × 단가)
- 부가세 = 공급가액 × 10% (원 단위 반올림)
- 총액 = 공급가액 + 부가세
