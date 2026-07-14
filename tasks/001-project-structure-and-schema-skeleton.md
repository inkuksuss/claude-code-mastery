# Task 001: 프로젝트 구조 및 라우팅 골격 설정

## 개요

노션 견적서 웹 뷰어 기능의 라우트·컴포넌트·lib 모듈 빈 껍데기를 생성하고, 신규 의존성(`@notionhq/client`, `@react-pdf/renderer`)을 설치한다. 실제 Notion 연동·UI 디테일은 다루지 않고, 컴파일·타입체크가 통과하는 최소 골격만 완성한다.

## 관련 파일

- `src/app/quote/[token]/page.tsx` — 견적서 웹 뷰 라우트 (RSC)
- `src/app/quote/[token]/not-found.tsx` — 토큰 불일치/작성중 안내 화면
- `src/app/quote/[token]/pdf/route.ts` — PDF Route Handler
- `src/components/quote/quote-header.tsx` — 견적명·번호·상태 배지
- `src/components/quote/quote-party-info.tsx` — 공급자/수신자 정보
- `src/components/quote/quote-items-table.tsx` — 견적 항목 테이블
- `src/components/quote/quote-summary.tsx` — 공급가액/부가세/총액
- `src/components/quote/quote-pdf-button.tsx` — PDF 다운로드 버튼 (`'use client'`)
- `src/components/quote/quote-pdf-document.tsx` — `@react-pdf/renderer` 문서 정의
- `src/lib/notion.ts` — Notion 클라이언트 초기화
- `src/lib/quote-schema.ts` — 타입/zod 스키마 (Task 002에서 상세 작성)
- `src/components/ui/table.tsx` — shadcn table 컴포넌트 (신규 추가)
- `package.json` — 신규 의존성
- `.env.example` — Notion/공급자 환경 변수 (사용자가 직접 반영)

## 구현 단계

- [x] `npm install @notionhq/client @react-pdf/renderer`
- [x] `npx shadcn@latest add table` 후 `"use client"` 제거
- [x] `src/app/quote/[token]/page.tsx`, `not-found.tsx`, `pdf/route.ts` 생성
- [x] `src/components/quote/` 6개 파일 생성
- [x] `src/lib/notion.ts` 생성
- [x] `docs/notion-schema.md` 작성
- [ ] `.env.example`에 `NOTION_API_KEY`, `NOTION_QUOTES_DB_ID`, `SUPPLIER_*` 변수 추가 (사용자 직접 반영 필요 — 도구 접근 차단)
- [ ] `npm run build` / `npm run lint` 통과 확인

## 수락 기준

- [ ] `/quote/아무-uuid` 접속 시 placeholder 텍스트가 렌더링된다
- [ ] `/quote/아무-uuid/pdf` 접속 시 501 JSON 응답이 반환된다
- [ ] `npm run build`, `npm run lint`가 통과한다
- [ ] `.env.example`에 Notion/공급자 관련 변수가 존재한다
- [ ] 클라이언트 컴포넌트는 `quote-pdf-button.tsx`에만 `'use client'`가 적용되어 있다

## 테스트 체크리스트

해당 없음 — 이 Task는 골격 생성 단계로 실제 비즈니스 로직(Notion 연동, 금액 계산, PDF 생성)을 포함하지 않는다. Playwright MCP E2E 검증은 Task 006(Notion 연동) 이후부터 적용한다.

## 변경 사항 요약

- `@notionhq/client`, `@react-pdf/renderer` 설치
- shadcn `table.tsx` 추가(RSC 유지를 위해 `"use client"` 제거)
- `src/app/quote/[token]/` 라우트 3개 파일 생성
- `src/components/quote/` 6개 컴포넌트 빈 껍데기 생성
- `src/lib/notion.ts` 생성
- `docs/notion-schema.md` 신규 작성 (Notion 스키마 문서화)
