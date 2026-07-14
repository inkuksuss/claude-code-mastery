# AI Agent 개발 표준 — invoice-web (노션 견적서 웹 뷰어)

> 이 문서는 AI Coding Agent 전용 운영 규칙이다. 일반 Next.js/React 지식은 포함하지 않는다.
> 프로젝트 공통 컨벤션(기술 스택, 명명 규칙, 명령어)은 `.claude/CLAUDE.md`를 우선 참조하고, 본 문서는 **이 프로젝트 고유의 도메인 규칙·파일 배치·워크플로우**만 다룬다.

## 1. 제품 정의 (판단 기준)

- 본 프로젝트는 `docs/PRD.md`에 정의된 "노션 견적서 웹 뷰어 MVP"를 구현한다. 기능 추가/변경 판단 시 반드시 `docs/PRD.md`(요구사항)와 `docs/ROADMAP.md`(작업 순서·현재 상태)를 먼저 확인한다.
- 싱글 테넌트·읽기 전용 뷰어다. **회원/로그인, 전자서명, 결제, 이메일 발송, 커스텀 PDF 템플릿, 다국어, 열람 추적, 멀티 테넌시 기능은 절대 구현하지 않는다** (PRD 4.2 Out of Scope). 사용자가 명시적으로 범위 확장을 요청하지 않는 한 이 기능들을 코드에 추가하지 말 것.
- 데이터 저장소는 Notion이 전담한다. **자체 DB, ORM, 인증 서버를 신규로 구축하지 않는다.**

## 2. 디렉터리 배치 규칙 (신규 파일 생성 시 필수 위치)

새 기능 파일을 만들 때 아래 예정 구조를 따른다 (`docs/ROADMAP.md` 7.4 기준). 다른 위치에 임의로 생성하지 말 것.

| 대상 | 경로 |
| --- | --- |
| 견적서 웹 뷰 라우트 | `src/app/quote/[token]/page.tsx` (RSC) |
| 토큰 불일치/작성중 안내 | `src/app/quote/[token]/not-found.tsx` |
| PDF 생성 Route Handler | `src/app/quote/[token]/pdf/route.ts` |
| 견적서 프레젠테이션 컴포넌트 | `src/components/quote/*.tsx` (예: `quote-header.tsx`, `quote-party-info.tsx`, `quote-items-table.tsx`, `quote-summary.tsx`, `quote-pdf-button.tsx`, `quote-pdf-document.tsx`) |
| Notion 클라이언트·조회·캐싱 로직 | `src/lib/notion.ts` (단일 파일에 집약, 웹 뷰와 PDF Route Handler가 공유) |
| zod 스키마·내부 타입·금액 계산 함수 | `src/lib/quote-schema.ts` |
| PDF용 한글 폰트 에셋 | `src/lib/fonts/` |

- Notion 조회 로직을 `page.tsx`나 `route.ts`에 직접 작성하지 말고 반드시 `src/lib/notion.ts`를 통해 호출한다 (웹 뷰·PDF 간 로직 중복 방지).
- 금액 계산(공급가액/부가세/총액)은 `src/lib/quote-schema.ts`의 순수 함수로만 수행한다. 컴포넌트나 Route Handler 내부에서 직접 계산하지 않는다. Notion Formula 값은 표시 보조용일 뿐 신뢰하지 않는다.

## 3. Notion 데이터 규칙

- 견적서 조회는 항상 4단계 흐름을 따른다: ① `Quotes` DB에서 `공유토큰 == token` 필터 쿼리 → ② 해당 페이지의 블록 children에서 자식 Database(`QuoteItems`) 탐색 → ③ 항목 쿼리 → ④ zod 스키마 파싱.
- Notion 응답은 반드시 `src/lib/quote-schema.ts`의 zod 스키마로 검증한 뒤 내부 타입으로 변환한다. 검증되지 않은 Notion 원시 응답을 컴포넌트에 직접 전달하지 않는다.
- 필수 속성이 비어 있으면 500 에러를 던지지 말고 "견적서 정보가 올바르지 않습니다" 안내 화면으로 처리한다 (PRD 5.1 인수 조건).
- 인라인 자식 Database 탐색이 API 제약으로 어려울 경우, 임의로 우회하지 말고 PRD 리스크 R4에 명시된 대로 "별도 최상위 DB + Relation" 구조 전환을 사용자에게 먼저 제안한다.
- `NOTION_API_KEY`는 서버 전용 환경 변수로만 사용한다. `'use client'` 컴포넌트나 클라이언트로 전달되는 props에 절대 포함시키지 않는다.

## 4. 접근 제어 규칙 (보안 — 반드시 준수)

- '작성중' 상태, 존재하지 않는 토큰, 빈 토큰의 세 경우는 **응답 본문과 상태 코드가 완전히 동일한 404**여야 한다. 토큰 존재 여부를 유추할 수 있는 어떤 차이(에러 메시지, 응답 시간 로직 분기 등)도 만들지 않는다.
- 견적서 페이지(`page.tsx`)에는 항상 `robots: { index: false, follow: false }` (noindex, nofollow) 메타데이터를 설정한다.
- PDF Route Handler는 웹 뷰와 동일한 접근 제어 로직을 재사용한다 (별도로 재구현하지 말 것 — `src/lib/notion.ts`의 공유 조회 함수를 그대로 사용).

## 5. 금액·표시 규칙

- 부가세는 10% 단일 세율만 지원한다 (면세 항목 미지원). 공급가액 = Σ(수량 × 단가), 부가세 = 공급가액 × 10%(원 단위 반올림), 총액 = 공급가액 + 부가세.
- 금액 표시는 항상 천 단위 콤마 + "원" 형식(`1,234,567원`)이다. `quote-schema.ts`의 공용 포맷 함수를 사용하고, 컴포넌트마다 개별적으로 포맷 로직을 작성하지 않는다.
- 상태값은 4단계 고정: `작성중` / `발송됨` / `승인` / `만료`. 이 외 상태를 임의로 추가하지 않는다. 유효기간 경과 시에는 저장된 상태값과 무관하게 화면에서 '만료'로 취급한다(P1, ROADMAP Task 011).

## 6. PDF 생성 규칙

- PDF 라이브러리는 `@react-pdf/renderer`로 확정되어 있다 (PRD 7.3 비교·선정 완료). Playwright/Puppeteer나 pdfkit 등 다른 라이브러리로 대체하지 않는다.
- 한글 폰트는 시스템 폰트에 의존하지 않고 `src/lib/fonts/`의 서브셋 폰트 파일을 직접 임베딩한다.
- PDF 파일명은 `견적서_{견적번호}_{클라이언트명}.pdf` 형식을 반드시 지키고 `Content-Disposition: attachment` 헤더로 응답한다.
- PDF는 웹 뷰와 별개로 **항상 라이트 테마 고정**이다. 다크 모드 대응을 PDF 문서 컴포넌트(`quote-pdf-document.tsx`)에 적용하지 않는다.
- 웹 뷰와 PDF는 동일한 7개 블록(공급자 정보 → 헤더 → 수신자 → 항목 테이블 → 금액 요약 → 비고 → 다운로드 버튼/페이지 번호) 순서를 유지한다. 두 렌더링 결과의 금액·항목이 항상 일치해야 한다.

## 7. 캐싱 규칙

- Notion SDK 호출은 반드시 `unstable_cache`(또는 `"use cache"`) + `revalidate: 60`으로 감싼다. 캐싱 없이 매 요청마다 Notion API를 직접 호출하는 코드를 작성하지 않는다 (rate limit 리스크 R1 완화).
- 429(rate limit) 응답 수신 시 1회 재시도 후 실패하면 안내 화면으로 전환한다. 무한 재시도나 재시도 없는 즉시 실패 모두 금지.

## 8. 컴포넌트/렌더링 규칙

- 견적서 데이터 페칭은 서버 컴포넌트(`page.tsx`)에서 직접 수행한다. 클라이언트 사이드 `fetch`나 `useEffect` 기반 데이터 로딩을 도입하지 않는다.
- `'use client'`는 PDF 다운로드 버튼(`quote-pdf-button.tsx`) 등 상호작용이 실제로 필요한 최소 컴포넌트에만 적용한다.
- 견적 항목 테이블은 시맨틱 `<table>` + `<caption>`으로 마크업한다 (접근성 요구사항, div 기반 그리드로 대체 금지).
- 상태 배지는 색상만으로 상태를 표현하지 않고 항상 텍스트를 함께 표시한다.
- UI 컴포넌트는 기존 `src/components/ui/`(shadcn base-nova, Badge/Button/Card/Table 등)를 우선 재사용하고, 클래스 병합은 항상 `cn()`을 사용한다.

## 9. 신규 의존성

- 이 기능 구현에 필요한 신규 의존성은 `@notionhq/client`, `@react-pdf/renderer`(및 한글 폰트 에셋)로 이미 PRD/ROADMAP에서 확정되어 있다. 이 외 견적서 조회·PDF 생성 목적의 라이브러리를 임의로 추가하지 않는다. 추가가 필요하다고 판단되면 먼저 사용자에게 확인한다.

## 10. 작업 워크플로우 (ROADMAP 연동)

- 기능 구현 전 `docs/ROADMAP.md`에서 해당 Task 항목과 선행 Task(스파이크 등) 완료 여부를 확인한다. Task 005(자식 DB 탐색 스파이크), Task 008(한글 폰트 임베딩 스파이크)처럼 "[스파이크]"로 표시된 선행 검증 작업은 본 구현 전에 반드시 먼저 수행한다.
- Task를 완료하면 `docs/ROADMAP.md`에서 해당 항목을 완료 표시(✅)로 갱신한다. 코드만 작성하고 로드맵 갱신을 누락하지 않는다.
- API 연동·금액 계산·상태 판정·PDF 생성 등 비즈니스 로직을 구현했을 때는 Playwright MCP로 실제 동작(라우트 응답, 렌더링 결과, 파일 다운로드)을 검증한다. 테스트 프레임워크(Jest 등)는 이 프로젝트에 설치되어 있지 않으므로 새로 추가하지 않는다 (`.claude/CLAUDE.md` 명시 사항).

## 11. 기존 서브에이전트와의 역할 분리

- PRD 내용 변경/검증은 `prd-generator`/`prd-validator` 에이전트의 영역이다. 코드 구현 중 PRD 자체를 수정해야 할 필요가 생기면 직접 고치지 말고 사용자에게 알린다.
- 로드맵 재구성은 `roadmap-generator`/`development-planner` 에이전트의 영역이다. 개별 Task의 완료 체크(✅)는 구현 에이전트가 직접 갱신하되, Phase 구조나 우선순위 변경은 해당 에이전트에게 위임한다.
- Notion API 연동 코드 설계에 확신이 없을 때는 `notion-database-expert` 에이전트를 활용한다.
- 코드 구현 직후에는 `code-reviewer` 에이전트로 diff를 검토한다.

## 12. 금지 사항 요약

- ❌ PRD Out of Scope 기능(회원가입, 전자서명, 결제, 이메일 발송, 커스텀 템플릿, 다국어, 열람 추적, 멀티 테넌시) 구현
- ❌ `src/lib/notion.ts` 외부에서 Notion API 직접 호출
- ❌ 클라이언트 번들에 `NOTION_API_KEY` 노출
- ❌ '작성중'/무효 토큰 응답을 다른 케이스와 다르게 처리(404 응답 비일관성)
- ❌ `@react-pdf/renderer` 외 PDF 라이브러리 도입
- ❌ 캐싱 없는 Notion API 직접 호출 반복
- ❌ 테스트 프레임워크(Jest/Vitest 등) 임의 설치
- ❌ 금액 계산 로직을 컴포넌트마다 중복 구현
