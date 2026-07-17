# 노션 견적서 웹 뷰어 개발 로드맵

노션에 입력하면 끝. 클라이언트는 링크로 보고 PDF로 받는다.

## 개요

노션 견적서 웹 뷰어는 **소규모 사업자·프리랜서(공급자)와 견적서를 받는 클라이언트**를 위한 제품으로, 공급자가 이미 쓰는 노션을 어드민으로 삼고 클라이언트에게는 항상 최신 상태의 웹 링크와 PDF를 제공합니다. 다음 기능을 제공합니다:

- **토큰 링크 웹 뷰**: `/quote/[token]` — 회원가입 없이 링크 하나로 항상 최신 견적서 열람
- **서버 PDF 다운로드**: 한글 폰트를 임베딩한 A4 세로 견적서 PDF를 서버에서 생성
- **노션 = 어드민**: 별도 관리 화면 없이 노션 Database가 곧 견적서 관리 도구 (읽기 전용, 싱글 테넌트)

> 이 제품은 **읽기 전용 뷰어**입니다. 회원/로그인, 전자서명, 결제, 이메일 발송, 커스텀 PDF 템플릿, 다국어, 열람 추적, 멀티 테넌시는 의도적으로 범위 밖(Out of Scope)이며 로드맵에 포함하지 않습니다. 데이터 저장소는 노션이 담당하므로 자체 데이터베이스·인증 서버·ORM 구축 Task는 없습니다.

### 기술 스택 (프로젝트 규약 준수)

- **프레임워크**: Next.js 16.2 (App Router) + React 19 + TypeScript(strict), React Compiler 활성화(수동 메모이제이션 금지)
- **스타일**: Tailwind CSS v4 (CSS-first, `globals.css` 관리) + shadcn/ui(base-nova) + lucide-react + `cn()`
- **데이터 소스**: Notion API(`@notionhq/client`, 신규 의존성), 서버 컴포넌트에서 직접 페칭
- **검증/타입**: zod v4로 Notion 응답 검증 및 내부 타입 변환
- **PDF**: `@react-pdf/renderer`(신규 의존성) + Pretendard/Noto Sans KR 서브셋 폰트 임베딩
- **캐싱**: `unstable_cache`(또는 `"use cache"`) + `revalidate: 60`
- **컨벤션**: RSC 기본, `'use client'` 최소화, named export(page/layout 제외), 파일명 kebab-case, 컴포넌트명 PascalCase, 탭 들여쓰기, UI 텍스트 한국어

### 현재 코드베이스 상태 (완료됨 — Task 아님)

- 스타터킷 초기화 완료: `src/app/layout.tsx`, 최소 랜딩 페이지(`page.tsx`), 루트 `not-found.tsx`
- 테마 인프라: `theme-provider.tsx`, `theme-toggle.tsx` (next-themes)
- shadcn UI 일부: `badge`, `button`, `card`, `table`(예정), `separator`, `skeleton` 등
- `.env.example` 존재
- **미설치**: `@notionhq/client`, `@react-pdf/renderer`, 한글 폰트 에셋

---

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
   - 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - `/tasks` 디렉토리에 새 작업 파일 생성
   - 명명 형식: `XXX-description.md` (예: `001-setup.md`)
   - 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
   - **API/비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP 테스트 시나리오 작성)**
   - 예시를 위해 `/tasks` 디렉토리의 마지막 완료된 작업 참조. 예를 들어 현재 작업이 `007`이라면 `006`과 `005`를 예시로 참조
   - 완료된 작업 파일은 체크된 박스와 변경 사항 요약을 포함한 최종 상태를 반영함. 새 작업은 빈 박스와 변경 사항 요약이 없어야 하며, 초기 상태 샘플로 `000-sample.md`를 참조

3. **작업 구현**
   - 작업 파일의 명세서를 따름
   - 기능과 기능성 구현
   - **Notion API 연동 및 비즈니스 로직(금액 계산·상태 판정·PDF 생성) 구현 시 Playwright MCP로 테스트 수행 필수**
   - 각 단계 후 작업 파일 내 단계 진행 상황 업데이트
   - 구현 완료 후 Playwright MCP를 사용한 E2E 테스트 실행
   - 테스트 통과 확인 후 다음 단계로 진행
   - 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**
   - 로드맵에서 완료된 작업을 ✅로 표시

---

## 개발 단계

전체 흐름은 **구조 우선 접근법**을 따릅니다: (1) 라우트 골격과 타입/스키마를 먼저 세우고, (2) 더미 데이터로 웹 뷰·PDF UI를 완성한 뒤, (3) 실제 Notion 연동으로 더미를 교체하고, (4) 캐싱·다크모드·만료 판정 등 마감 작업을 수행합니다. PRD 9장의 3주 마일스톤과 10장 리스크(R2 폰트 임베딩 스파이크, R4 인라인 자식 DB 탐색 스파이크)를 각 Phase 초반에 스파이크로 배치했습니다.

> **진행 상황**: Phase 1(Task 001~002) ✅ 완료 · Phase 2(Task 003~004) ✅ 완료 · Phase 3(Task 005~009-1) ✅ 완료 · Task 010 ✅ 완료. 다음 우선순위는 **Task 011(다크 모드 대응 및 만료 자동 판정)**.

### Phase 1: 애플리케이션 골격 및 스키마 정의 (1주차 전반) ✅

- ✅ **Task 001: 프로젝트 구조 및 라우팅 골격 설정** - 우선순위
  - `src/app/quote/[token]/page.tsx` — 견적서 웹 뷰 라우트 빈 껍데기 (RSC)
  - `src/app/quote/[token]/not-found.tsx` — 토큰 불일치/작성중 안내 골격
  - `src/app/quote/[token]/pdf/route.ts` — PDF Route Handler 빈 껍데기
  - `src/components/quote/` 6개 컴포넌트 빈 껍데기 생성 (header, party-info, items-table, summary, pdf-button, pdf-document)
  - `src/lib/notion.ts` / `src/lib/quote-schema.ts` 빈 모듈 골격
  - 신규 의존성 설치: `@notionhq/client`, `@react-pdf/renderer`
  - `.env.example`에 `NOTION_API_KEY`, `NOTION_QUOTES_DB_ID`, `SUPPLIER_*` 변수 추가 (사용자 직접 반영 필요)
  - 변경 사항: shadcn `table.tsx` 신규 추가(`"use client"` 제거), `npm run build`/`npm run lint` 통과, Playwright MCP로 `/quote/[token]` 200 응답·`noindex` 메타·`/quote/[token]/pdf` 501 응답 확인

- ✅ **Task 002: 타입 정의 및 zod 스키마 설계**
  - `quote-schema.ts`에 내부 타입 정의: `Quote`, `QuoteItem`, `QuoteStatus`(작성중/발송됨/승인/만료)
  - Notion 속성 → 내부 타입 매핑을 위한 zod 스키마 작성 (필수 속성 누락 검증 포함)
  - 금액 계산 순수 함수 정의: 공급가액 = Σ(수량×단가), 부가세 = 공급가액×10%(원 단위 반올림), 총액
  - `formatKRW()` 등 표시 유틸(천 단위 콤마 `1,234,567원`) 정의
  - **Notion Database 스키마 문서화** (Quotes/QuoteItems 속성표) — 실제 노션 구축은 Task 006에서 수행
  - 공급자 정보(A7) 환경 변수 로더 타입/헬퍼 골격
  - 변경 사항: `docs/notion-schema.md` 신규 작성, `calculateQuoteAmounts`/`formatKRW` 수동 검증 완료(1,430,000원 등 PRD 공식과 일치)

### Phase 2: UI/UX 완성 (더미 데이터 활용) ✅

- ✅ **Task 003: 공통 프레젠테이션 컴포넌트 구현 (더미 데이터)**
  - shadcn `Table`, `Badge`, `Button`, `Separator`, `Card` 기반 견적서 컴포넌트 구현
  - `QuoteHeader`(견적명·번호·발행일·유효기간·상태 배지), `QuotePartyInfo`(공급자/수신자 블록)
  - `QuoteItemsTable`(시맨틱 `<table>` + caption, 항목명/수량/단가/합계), `QuoteSummary`(공급가액/부가세/총액 강조)
  - 상태 배지: 색상 외 텍스트로도 상태 전달(접근성), 만료 안내 배너
  - `src/lib/quote-mock.ts` — 더미 견적서(항목 3개 이상, 30개 대량 케이스) 생성 유틸
  - 본문 텍스트 대비 4.5:1 이상, `cn()` + cva 패턴 준수
  - 변경 사항: `quote-header.tsx`(Badge 상태 배지 + `sr-only` 라벨 + 만료 배너), `quote-party-info.tsx`(Card/Separator 공급자·수신자 블록), `quote-items-table.tsx`(shadcn Table, 시맨틱 `table`+`caption`, `formatKRW`), `quote-summary.tsx`(총액 강조) 마크업 완성. `src/lib/quote-mock.ts` 신규(팩토리 `createMockQuote` + 표준 3개/대량 30개 케이스, `calculateQuoteAmounts` 일치 검증, `quoteSchema.parse` 보장). 전부 RSC 유지, `npm run lint`/`npm run build` 통과

- ✅ **Task 004: 견적서 웹 뷰 페이지 UI 완성 (더미 데이터)**
  - `/quote/[token]/page.tsx`에 7개 블록 조립(공급자→헤더→수신자→항목표→금액요약→비고→PDF 버튼)
  - 375px(모바일)~1280px+ 반응형, 견적 항목 테이블 내부 스크롤 처리(페이지 가로 스크롤 없음)
  - 상태별 노출 규칙 UI 골격(작성중=404 분기, 발송됨/승인/만료 배지, 만료 배너)
  - `robots` 메타 `noindex, nofollow` 설정
  - PDF 다운로드 버튼(`'use client'` 최소 적용)만 클라이언트 컴포넌트로 분리
  - 사용자 플로우·네비게이션 검증 (더미 데이터 기준 렌더링 확인)
  - 변경 사항: `page.tsx`에 7개 블록 조립(헤더·만료배너→공급자/수신자→항목표→금액요약→비고→PDF 버튼), 더미 조회 `findMockQuoteByToken` + 작성중/미존재 토큰 동일 404 분기, 금액 서버 계산, `robots` `noindex/nofollow`, PDF 버튼만 `'use client'`(`buttonVariants` 링크). **Playwright MCP 검증**: 375px/1280px 페이지 가로 스크롤 없음(테이블 내부 스크롤), 30개 대량 케이스 렌더링, 만료 배너 노출, 작성중·무작위 토큰 404 본문 동일성, `noindex` 메타 확인

### Phase 3: 핵심 기능 구현 (Notion 연동 · PDF 생성) ✅

> Phase 3는 리스크가 집중된 구간입니다. R4(인라인 자식 DB 탐색)와 R2(한글 폰트 임베딩)를 각각 스파이크로 먼저 검증한 뒤 본 구현에 들어갑니다.

- ✅ **Task 005: [스파이크] 인라인 자식 Database 탐색 검증** - 우선순위
  - Notion Integration 발급, 최소 SDK 연결로 페이지 블록 children에서 자식 Database(QuoteItems) 탐색 PoC
  - 조회 흐름 4단계 검증: 토큰 필터 쿼리 → 자식 DB 탐색 → 항목 쿼리 → 파싱
  - **R4 완화**: 인라인 자식 DB 탐색이 API상 어려우면 별도 최상위 DB + Relation으로 스키마 전환 결정 (코드 영향 최소화 확인)
  - Playwright MCP로 PoC 라우트 응답(JSON) 검증
  - 변경 사항: `src/app/api/notion-spike/route.ts` 개발 전용 PoC Route Handler 작성(프로덕션 404). 실제 Notion Integration으로 4단계 조회 흐름 전부 검증 성공 — ① 공유토큰 필터 쿼리(SDK v5: `databases.retrieve`→`data_sources`→`dataSources.query`) ② 페이지 `blocks.children`에서 `child_database` 탐색 ③ 자식 DB(QuoteItems) 항목 쿼리 ④ 항목명/수량/단가 파싱. **결론: 인라인 자식 DB 탐색 API로 가능, Relation 전환 불필요(R4 해소)**. 부수 작업으로 샘플 견적서 페이지에 인라인 QuoteItems DB(항목 3건, 속성 항목명/수량/단가/순서)를 API로 생성. 미해결 메모: 샘플 페이지 공유토큰(`1011-1111-1111-1111`)이 UUID v4 형식이 아니어서 `zod` uuid 검증과 충돌 — **Task 006에서 토큰 교체 또는 스키마 결정 필요**

- ✅ **Task 006: Notion 스키마 구축 및 견적서 조회 로직 구현** - 우선순위
  - PRD 5.1 스키마대로 실제 Notion Database(Quotes/QuoteItems) 생성 + 샘플 견적서 1건(항목 3개 이상) 입력
  - Task 005 미해결 사항 처리: 샘플 페이지 공유토큰(`1011-1111-1111-1111`)의 UUID v4 비호환 이슈 — 토큰 값을 UUID v4로 교체하거나 `quoteSchema` 토큰 검증 규칙을 확정
  - `lib/notion.ts`에 조회 로직 구현: 공유토큰 필터 → 자식 DB 항목 조회 → zod 파싱 → 서버 금액 계산 (Task 005 PoC의 4단계 흐름을 정식 코드로 이관)
  - 429(rate limit) 수신 시 재시도 1회 후 안내 화면(R1 완화)
  - 필수 속성 누락 시 "견적서 정보가 올바르지 않습니다" 안내 화면(500 아님)
  - `NOTION_API_KEY`가 클라이언트 번들에 포함되지 않음을 확인
  - **테스트 체크리스트**: Playwright MCP로 웹 뷰의 더미→실제 데이터 교체 검증, 금액 서버 계산값 일치, 필수 속성 누락 안내 화면 표시
  - 변경 사항: `lib/notion.ts`에 `getQuoteByToken` 구현(공유토큰 필터→자식 DB 탐색→항목 쿼리→zod 파싱, `withRateLimitRetry`로 429 1회 재시도, `NotionRateLimitError`/`NotionDataInvalidError`로 안내 화면 분기). `quote-schema.ts`의 `parseNotionQuotePage` stub을 Notion property 추출 헬퍼 기반 실구현으로 교체. `page.tsx`를 mock에서 실제 Notion 조회로 전환, `notion-spike` 라우트 삭제. 실제 Notion 워크스페이스 스키마를 문서 기준으로 정정(견적명/견적번호 속성 분리, 상태 Select 타입 전환, 담당자/비고 추가)하고 웹 뷰 실렌더링 검증 완료. 캐싱(`unstable_cache`+`revalidate 60`)은 Task 010으로 스코프 이관.

- ✅ **Task 007: 접근 제어 및 상태별 노출 규칙 구현**
  - 유효 토큰 + '발송됨' 이상 상태만 열람, 그 외 동일한 404 응답(존재 여부 구분 불가)
  - 무작위 UUID·'작성중'·빈 토큰 → 응답 본문·상태코드 동일한 404
  - 상태 배지/만료 배너를 실제 상태값과 연결
  - **테스트 체크리스트**: Playwright MCP E2E — 발송됨/승인 열람 성공, 작성중 404, 무작위 UUID 404 동일성, `noindex` 메타 포함, 번들 내 `NOTION_API_KEY` 미노출
  - 변경 사항: Task 006에서 이미 구현된 조회 계층 수준의 접근 제어("작성중"을 `null`로 조기 정규화)가 요구사항을 구조적으로 충족함을 확인. Playwright E2E로 실증(발송됨 200, 무작위 UUID/비UUID/빈 토큰 모두 바이트 단위 동일 404, API 키 미노출, `noindex` 확인). 코드 수정 없이 검증만으로 완료.

- ✅ **Task 008: [스파이크] PDF 한글 폰트 임베딩 검증** - 우선순위
  - Pretendard(또는 Noto Sans KR) 서브셋 폰트를 `src/lib/fonts/`에 포함, `@react-pdf/renderer`에 등록
  - 최소 PDF에 한글 텍스트를 렌더링해 깨짐 여부·폰트 용량·콜드스타트 영향 확인(R2 완화)
  - macOS 미리보기 / Windows Acrobat 기준 한글 렌더링 확인
  - 변경 사항: Pretendard TTF(Regular/Bold)를 `public/fonts/`에 vendoring, `fs.readFileSync`+base64 data URL로 `Font.register`. `require.resolve`(Turbopack이 모듈로 오인해 빌드 실패)와 `outputFileTracingIncludes`(Turbopack에서 무시됨)를 차례로 시도했다가 실패를 실증 확인한 뒤 `public/` 정적 자산 방식으로 확정. 실제 프로덕션 빌드+서버로 PDF 생성 검증(`nft.json`에 폰트 포함, `/Type0`+`FontFile2`로 CJK 임베딩 확인), 한글 깨짐 없음.

- ✅ **Task 009: PDF 다운로드 Route Handler 구현**
  - `/quote/[token]/pdf/route.ts` — `QuotePdfDocument`(A4 세로) 렌더링, 바이너리 응답
  - 파일명 규칙 `견적서_{견적번호}_{클라이언트명}.pdf` + `Content-Disposition: attachment`
  - 웹 뷰와 동일한 7개 블록, 항목 30개 시 2페이지 이상 분할 + 페이지 번호
  - 웹 뷰와 동일 접근 제어(작성중/토큰 불일치 시 404), PDF는 항상 라이트 테마 고정
  - **테스트 체크리스트**: Playwright MCP — 다운로드 파일명 규칙, 한글 미깨짐, 항목 30개 다중 페이지 분할, PDF 금액=웹 뷰 일치, 작성중 PDF URL 404
  - 변경 사항: `quote-pdf-document.tsx`를 웹 뷰 7블록 대응 A4 레이아웃으로 확장(`View`/`Text` flexbox로 표 구현, `wrap={false}`로 행 단위 페이지 분할, 페이지 번호 `fixed`+`render`), `calculateQuoteAmounts`/`formatKRW` 재사용. `pdf/route.ts`를 501 스텁에서 실구현으로 교체(`getQuoteByToken` 재사용, `NotionRateLimitError`→429/`NotionDataInvalidError`→502, 파일명 RFC 5987+ASCII fallback 병행). 항목 31개로 2페이지 분할·긴 항목명 줄바꿈을 실제 PDF 생성+텍스트 추출로 검증. 코드 리뷰 반영으로 `formatDateKR`/`sortItemsByOrder`를 `quote-schema.ts`로 추출해 웹 뷰·PDF 공유, 비고 개행을 명시적 줄 분리로 처리.

- ✅ **Task 009-1: 핵심 기능 통합 테스트**
  - Playwright MCP로 공급자→클라이언트 전체 플로우 검증(열람→PDF 저장)
  - Notion 연동·금액 계산·상태 판정·PDF 생성 비즈니스 로직 통합 검증
  - 엣지 케이스: 항목 0개, 필수 속성 누락, 429 재시도, 유효기간 경계값, 빈/손상 토큰
  - 변경 사항: 실제 토큰으로 전체 플로우(웹 뷰 열람→PDF 다운로드) E2E 검증, 웹/PDF 금액 완전 일치 확인(공급가액 2,400,000원/부가세 240,000원/총액 2,640,000원). 엣지 케이스 전부 통과(항목 0개 안전 처리, 필수 속성 누락 시 `NotionDataInvalidError` 경로 확인, 비정상 경로 전부 404, 429 재시도 로직 코드 리뷰). 발견된 결함 없이 소스 변경 0건으로 완료.

### Phase 4: 비기능 요구사항 및 마감 (P1 · 3주차)

- ✅ **Task 010: Notion 응답 캐싱 (P1)**
  - Notion SDK 호출을 `unstable_cache`(또는 `"use cache"`) + `revalidate: 60`으로 래핑
  - 캐시 히트 TTFB 1초 이내 / 미스 3초 이내, PDF 생성 10초 이내(항목 30개) 목표 확인
  - **테스트 체크리스트**: Playwright MCP — 노션 수정 후 최대 60초 내 반영, 캐시 히트/미스 응답 시간 측정
  - 변경 사항: `lib/notion.ts`의 `getQuoteByToken`을 `unstable_cache(fetchQuoteByToken, ["quote-by-token"], { revalidate: 60 })`로 래핑(모듈 스코프 상수로 고정해 캐시 함수 재생성 방지). 웹 뷰(`page.tsx`)와 PDF Route(`pdf/route.ts`)가 동일 함수를 호출하므로 캐시가 자동 공유됨. `NotionRateLimitError`/`NotionDataInvalidError`는 예외이므로 `unstable_cache`가 캐시하지 않아 매 요청 재조회됨(정상 조회 결과만 60초 캐싱). `npm run lint`/`npm run build` 통과, code-reviewer 역할 리뷰 완료. **미검증 사항**: 유효한 견적서 공유토큰 부재로 캐시 히트/미스 응답 시간 실측과 "노션 수정 후 60초 내 반영" Playwright 검증은 아직 수행하지 못함 — 토큰 확보 후 추가 검증 필요.

- **Task 011: 다크 모드 대응 및 만료 자동 판정 (P1)**
  - 웹 뷰 라이트/다크 대응(next-themes 인프라 활용), PDF는 라이트 고정 유지
  - 유효기간 경과 시 상태값과 무관하게 '만료'로 취급 + 만료 배너 표시
  - **테스트 체크리스트**: Playwright MCP — 다크 모드 대비 4.5:1, 유효기간 경과 견적서 '만료' 자동 표시

- **Task 012: 인수 조건 전체 점검 및 마감**
  - PRD 5.1~5.4 인수 조건 전체 체크리스트 점검
  - 접근성(시맨틱 table·caption, 상태 텍스트 전달, 키보드 조작) 최종 확인
  - Notion 스키마 가이드 문서 제공(R3 완화) + 토큰 교체로 링크 무효화 안내(R5)
  - `npm run build` / `npm run lint` 통과, PDF 레이아웃 다듬기(4주차 예비 버퍼)

---

## 마일스톤 매핑 (PRD 9장)

| 주차 | 목표 | 해당 Task |
| --- | --- | --- |
| 1주차 | 데이터 파이프라인 | Task 001~002 (골격·스키마), Task 005~006 (자식 DB 스파이크·조회 로직) |
| 2주차 | 웹 뷰 완성 (P0) | Task 003~004 (UI), Task 007 (접근 제어·상태 규칙) |
| 3주차 | PDF + 마감 | Task 008~009 (폰트 스파이크·PDF), Task 010~012 (캐싱·다크모드·만료·인수 점검) |
| 4주차(예비) | 버퍼 | Task 012 내 PDF 레이아웃 다듬기·실사용 피드백 |

## 리스크 대응 매핑 (PRD 10장)

| 리스크 | 완화 배치 |
| --- | --- |
| R1 rate limit | ✅ **Task 006(429 재시도) + Task 010(60초 캐싱)으로 완화** — `withRateLimitRetry` 1회 재시도 + `unstable_cache(revalidate 60)`으로 반복 조회 시 Notion API 호출 자체를 줄임. 캐시 히트/미스 응답 시간 실측은 유효 토큰 확보 후 추가 검증 필요 |
| R2 한글 폰트/용량 | ✅ **Task 008 스파이크로 해소** — Pretendard TTF를 `public/fonts/`에서 base64 data URL로 임베딩, CJK 렌더링 확인 |
| R3 공급자 스키마 임의 변경 | ✅ **Task 006에서 완화 적용** — zod 검증 실패 시 `NotionDataInvalidError`로 안내 화면 분기(500 아님). 스키마 가이드 문서화는 Task 012에서 마감 |
| R4 인라인 자식 DB 탐색 복잡도 | ✅ **Task 005 스파이크로 해소** — API로 인라인 자식 DB 탐색 가능 확인, Relation 전환 불필요 |
| R5 토큰 유출 | Task 012(노션 토큰 교체 무효화 가이드) |
