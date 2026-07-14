# 노션 견적서 웹 뷰어

공급자가 노션(Notion)에 입력한 견적서를, 클라이언트가 회원가입 없이 공유 링크로 열람하고 PDF로 저장할 수 있는 웹 뷰어입니다. 자세한 요구사항은 [docs/PRD.md](./docs/PRD.md)를 참고하세요.

## 기술 스택

- Next.js 16 (App Router) + React 19 + TypeScript (strict)
- React Compiler 활성화 (수동 메모이제이션 작성 금지)
- Tailwind CSS v4 (CSS-first) + shadcn/ui (base-nova) + lucide-react
- 폼: react-hook-form + zod + @hookform/resolvers
- 테마: next-themes

## 시작하기

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.local .env.local
# .env.local 파일을 열어 실제 값을 채웁니다.

# 3. 개발 서버 실행
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## 환경 변수

| 변수 | 설명 |
| --- | --- |
| `NOTION_API_KEY` | Notion 내부 통합(Integration) 시크릿 |
| `NOTION_QUOTES_DB_ID` | 견적서 Database ID |
| `SUPPLIER_NAME` / `SUPPLIER_CEO` / `SUPPLIER_PHONE` / `SUPPLIER_EMAIL` | 공급자 정보 |

## 명령어

- `npm run dev` — 개발 서버 실행
- `npm run build` — 프로덕션 빌드
- `npm run lint` — ESLint 검사

## 프로젝트 구조

- 소스 루트: `src/`, 경로 alias: `@/*` → `./src/*`
- `src/app/` — App Router 라우트·레이아웃·globals.css
- `src/components/` — 일반 컴포넌트 / `ui/`: shadcn 컴포넌트 / `layout/`: header·footer
- `src/lib/utils.ts` — `cn()` 헬퍼
