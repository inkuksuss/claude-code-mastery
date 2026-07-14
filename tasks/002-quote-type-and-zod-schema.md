# Task 002: 타입 정의 및 zod 스키마 설계

## 개요

`src/lib/quote-schema.ts`에 견적서 도메인의 내부 타입(`Quote`, `QuoteItem`, `QuoteStatus`)과 Notion 응답 검증용 zod 스키마, 금액 계산 순수 함수, 표시 유틸을 정의한다. 실제 Notion 원시 응답 파싱 로직은 Task 006에서 구현하므로 이 Task에서는 시그니처만 선언한다.

## 관련 파일

- `src/lib/quote-schema.ts` — 타입, zod 스키마, 순수 함수 전체
- `docs/notion-schema.md` — Notion Database 스키마 문서화 (Quotes/QuoteItems 속성표)

## 구현 단계

- [x] `QuoteStatus`, `QuoteItem`, `Quote` 타입 정의
- [x] `quoteStatusSchema`, `quoteItemSchema`, `quoteSchema` zod 스키마 작성 (필수 속성 누락 검증 포함)
- [x] `calculateQuoteAmounts` 순수 함수 구현 (공급가액/부가세/총액)
- [x] `formatKRW` 표시 유틸 구현 (천 단위 콤마 + "원")
- [x] `resolveDisplayStatus` 만료 판정 함수 시그니처 정의 (실사용은 Task 011)
- [x] `getSupplierInfo` 공급자 정보 환경 변수 로더 구현
- [x] `parseNotionQuotePage` 파서 시그니처 선언 (구현은 Task 006)
- [x] `docs/notion-schema.md`에 Notion Database 스키마 문서화

## 수락 기준

- [ ] `quote-schema.ts` 임포트 시 컴파일 에러가 없다
- [ ] `calculateQuoteAmounts`의 계산 결과가 PRD 공식(공급가액=Σ(수량×단가), 부가세=공급가액×10% 반올림, 총액=공급가액+부가세)과 일치한다
- [ ] `formatKRW(1234567)`가 `"1,234,567원"`을 반환한다
- [ ] `quoteSchema`가 필수 속성이 없는 객체를 파싱 실패로 처리한다

## 테스트 체크리스트

해당 없음 — 순수 함수/타입/스키마 정의 단계이며 실제 Notion 연동이 없다. 종단 검증은 Task 006(실제 데이터 연결)에서 수행한다.

## 변경 사항 요약

- `src/lib/quote-schema.ts` 신규 작성: `Quote`/`QuoteItem`/`QuoteStatus` 타입, zod 스키마 3종, `calculateQuoteAmounts`, `formatKRW`, `resolveDisplayStatus`, `getSupplierInfo` 구현, `parseNotionQuotePage` 시그니처 선언
- `docs/notion-schema.md` 신규 작성 (Task 001과 공유)
