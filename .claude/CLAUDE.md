# CLAUDE.md

이 파일은 이 저장소에서 코드를 작업할 때 Claude Code(claude.ai/code)에 지침을 제공합니다.

## 프로젝트 개요

이것은 다음을 사용하는 현대적인 Next.js 스타터 킷 프로젝트입니다:
- **프레임워크**: Next.js 16 with TypeScript
- **스타일링**: Tailwind CSS v4 with PostCSS
- **UI 컴포넌트**: shadcn/ui (Radix UI 기반)
- **아이콘**: lucide-react
- **테마**: next-themes (다크/라이트 모드 지원)
- **토스트**: sonner (알림 표시)

## 개발 명령어

```bash
# 개발 서버 시작 (기본 포트 3000)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 시작
npm start

# 린터 실행
npm run lint

# 린터 오류 자동 수정
npm run lint:fix
```

## 코드 스타일 & 컨벤션

모든 규칙은 `.claude/rules/` 디렉토리에 정의되어 있으며 반드시 따라야 합니다:

### 코드 스타일 (code-style.md)
- **들여쓰기**: Tab (1 tab = 1 level)
- **변수명**: camelCase (예: `isVisible`, `userCount`)
- **함수명**: 동사로 시작 (예: `handleClick`, `fetchData`)
- **주석**: 한글 주석 사용
- **세미콜론**: 문장 끝에 세미콜론 사용 금지

### Git 컨벤션 (git.md)
- **커밋 메시지**: 한글로 작성
- **브랜치명**: 기능은 `feature/기능명`, 버그 수정은 `fix/버그명`
- **커밋 전략**: 작고 기능별로 나눈 커밋 (대량으로 묶지 않기)

### 설정 주의사항

**주의할 점**:
- `.prettierrc.json`은 `"semi": true` 설정 (세미콜론 강제)
- 코드 스타일 규칙은 세미콜론 금지
- **해결 방법**: 명시적인 code-style.md 규칙을 따름 (세미콜론 없음). prettier 설정은 존재하지만 스타일 가이드와 일치시키도록 업데이트 필요.

## 프로젝트 구조

```
src/
├── app/              # Next.js App Router 페이지 및 레이아웃
│   ├── layout.tsx    # 루트 레이아웃 (테마 프로바이더 포함)
│   ├── page.tsx      # 홈 페이지
│   └── globals.css   # 전역 스타일
├── components/       # React 컴포넌트
│   ├── header.tsx    # 메인 네비게이션 헤더
│   └── ui/           # shadcn/ui 컴포넌트 래퍼
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       └── sonner.tsx # 토스트 알림 컴포넌트
└── lib/
    └── utils.ts      # 유틸리티 함수
```

## 아키텍처 노트

### App Router 구조
- Next.js App Router 사용 (Pages Router 아님)
- 루트 레이아웃 (`src/app/layout.tsx`)은 모든 페이지를 감싸고 있으며:
  - Google 폰트 (Geist Sans, Geist Mono)
  - 전역 CSS 및 Tailwind 스타일
  - 네비게이션 헤더 컴포넌트

### UI 컴포넌트
- 모든 UI 컴포넌트는 `src/components/ui/`에 위치하고 shadcn/ui 래퍼
- Radix UI를 기본 프리미티브로 사용
- Tailwind CSS v4로 스타일링
- class-variance-authority를 사용한 컴포넌트 변형
- clsx/tailwind-merge로 조건부 스타일링

### 경로 별칭
- `@/*`은 `src/*`으로 매핑됨 (tsconfig.json에 정의)
- 프로젝트 전역에서 깔끔한 `@/` 임포트 사용

### 스타일링
- Tailwind CSS v4 with PostCSS 파이프라인
- 전역 CSS 래퍼 불필요 (Next.js 16에서 처리)
- next-themes를 통한 테마 지원
- 다크/라이트 모드 전환 가능

## 타입 안정성
- 엄격한 TypeScript 모드 활성화
- React 19 with 최신 타입 정의
- 컴포넌트 props 및 state에 적절한 타입 지정

## 작업 시작 전

1. `.claude/rules/` 디렉토리에서 프로젝트별 컨벤션 확인
2. `src/components/ui/`의 기존 UI 컴포넌트를 검토하여 패턴 파악
3. 새로운 컴포넌트 생성 시 shadcn/ui 패턴 따라가기 (클래스 기반 스타일링 with CVA)
4. `npm run dev` 실행하고 브라우저에서 스타일 변경사항 테스트
