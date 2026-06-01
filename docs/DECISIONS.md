# DECISIONS.md — Architecture Decision Records

## ADR-001: Next.js App Router 채택

- **날짜**: TBD
- **상태**: 결정됨
- **맥락**: SSR과 Server Actions를 활용해 Supabase와 안전하게 연동해야 함
- **결정**: Next.js 15 App Router 사용
- **결과**: Server Components에서 RLS가 적용된 서버 클라이언트로 직접 쿼리 가능

## ADR-002: Supabase Auth 채택

- **날짜**: TBD
- **상태**: 결정됨
- **맥락**: RLS와 Auth를 하나의 서비스에서 관리해야 함
- **결정**: Supabase Auth (이메일/패스워드)
- **결과**: JWT 기반 세션, middleware에서 자동 검증
