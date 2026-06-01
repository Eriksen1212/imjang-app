# ARCHITECTURE.md

## 기술 스택
- Next.js App Router (v16)
- TypeScript
- Supabase Auth
- Supabase Postgres + Row Level Security
- Supabase Storage (사진 업로드)
- Vercel 배포
- Tailwind CSS

## 책임 경계
- UI: src/app, src/features/*/components
- Server actions / queries: src/features/*/actions.ts, queries.ts
- Supabase client: src/lib/supabase/*
- Database schema: supabase/schema.sql
- Security rules: docs/SECURITY.md, Supabase RLS policies

## 디렉토리 구조
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   └── (dashboard)/
│       └── dashboard/
│           ├── page.tsx          # 매물 목록
│           ├── new/page.tsx      # 매물 등록
│           ├── compare/page.tsx  # 비교표
│           └── [id]/
│               ├── page.tsx      # 매물 상세
│               └── edit/page.tsx # 매물 수정
├── features/
│   └── properties/
│       ├── components/
│       ├── actions.ts
│       └── queries.ts
└── lib/
    └── supabase/
        ├── client.ts   # Browser client
        └── server.ts   # Server client (cookies)
```

## 데이터 흐름
- 읽기: Server Component → Supabase server client (RLS 자동 적용)
- 쓰기: Server Actions → Supabase server client
- 사진: Client Component → Supabase Storage → DB에 경로 저장
- 인증: Supabase Auth → middleware 세션 검증

## 무료 한도 처리
- 매물 등록 Server Action에서 `get_property_count()` 호출
- 무료 플랜(plan = 'free') + 매물 3개 이상이면 등록 거부

## 규칙
클라이언트 코드는 public Supabase key만 사용할 수 있다.
서버 전용 secret은 Client Component에서 import하면 안 된다.
모든 테이블에 RLS가 활성화되어 있어야 한다.
