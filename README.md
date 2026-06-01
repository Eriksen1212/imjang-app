# ssot-goal-lab

개인 목표 관리 웹앱 — 6-튜플 SSOT 하네스 실습 프로젝트

## 시작하기

```bash
npm install
cp .env.example .env.local
# .env.local에 Supabase 환경변수 입력
npm run dev
```

## 검증 실행

```bash
npm run verify
```

## 문서

- [AGENTS.md](./AGENTS.md) — Claude 작업 지도
- [ARCHITECTURE.md](./ARCHITECTURE.md) — 기술 결정 SSOT
- [docs/PRODUCT_SPEC.md](./docs/PRODUCT_SPEC.md) — 제품 명세
- [state/progress.json](./state/progress.json) — 현재 진행 상태

## 스택

- Next.js App Router + TypeScript
- Supabase Auth + Postgres
- Vercel Deployment
- Tailwind CSS
