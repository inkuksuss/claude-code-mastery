# 프로젝트 개요
- Next.js 16 기반 모던 웹 스타터 킷 (Claude Code 학습/연습용 프로젝트)

# 기술 스택
- Next.js 16.2 (App Router) + React 19 + TypeScript (strict)
- React Compiler 활성화 (next.config.ts) → useMemo/useCallback/React.memo 수동 최적화 작성 금지
- Tailwind CSS v4 (CSS-first 방식) → tailwind.config 파일 없음, 테마/설정은 src/app/globals.css에서 관리
- shadcn/ui (base-nova 스타일, Radix가 아닌 Base UI 기반) + lucide-react + cva
- 폼: react-hook-form + zod(v4) + @hookform/resolvers
- 테마: next-themes / 유틸 훅: usehooks-ts
- 전역 상태 라이브러리 없음 (로컬 상태 + usehooks-ts의 useLocalStorage 활용)

# 명령어
- `npm run dev` / `npm run build` / `npm run lint`
- 테스트 프레임워크 미설치 (명시적 지시 없이 테스트 코드를 만들지 않기)

# 프로젝트 구조
- 소스 루트: `src/`, 경로 alias: `@/*` → `./src/*`
- `src/app/`: App Router 라우트·레이아웃·globals.css
- `src/components/`: 일반 컴포넌트 / `ui/`: shadcn 컴포넌트 / `layout/`: header·footer·nav
- `src/lib/utils.ts`: `cn()` 헬퍼 (clsx + tailwind-merge)

# 코딩 컨벤션
- 서버 컴포넌트(RSC)가 기본, `'use client'`는 상호작용/훅이 필요한 컴포넌트에만 최소 사용
- named export 사용 (app/의 page.tsx·layout.tsx만 Next.js 규약상 default export)
- 파일명: kebab-case / 컴포넌트명: PascalCase
- 들여쓰기: 탭 (신규 코드 기준, shadcn 자동 생성 파일은 예외)
- 클래스 병합은 항상 `cn()` 사용, variant는 cva 패턴
- 폼은 react-hook-form + zodResolver + zod 스키마 조합
- UI 텍스트는 한국어

# 개발 환경
- OS: Mac M1
