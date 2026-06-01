# Sprint 01 — 프로젝트 세팅 & 인증

## 목표
Next.js + Supabase 연결을 완성하고 로그인/회원가입이 동작하도록 한다.

## 완료 기준 (Definition of Done)
- [ ] `npm run verify` 통과
- [ ] Supabase 프로젝트 생성 + `.env.local` 설정 완료
- [ ] `supabase/schema.sql` Supabase에 적용 완료 (profiles, properties, property_photos)
- [ ] 로그인 페이지 (`/login`) 동작
- [ ] 회원가입 페이지 (`/signup`) 동작
- [ ] 로그인 후 `/dashboard` 리디렉션
- [ ] 비로그인 상태에서 `/dashboard` 접근 시 `/login` 리디렉션 (middleware)
- [ ] `eval/sprint-01.json` 판정 결과 작성

## 태스크
1. [ ] Supabase 프로젝트 생성
2. [ ] `.env.local` 환경변수 설정
3. [ ] schema.sql Supabase SQL Editor에 실행
4. [ ] `src/app/(auth)/login/page.tsx` 구현
5. [ ] `src/app/(auth)/signup/page.tsx` 구현
6. [ ] `src/middleware.ts` 작성 (세션 보호)
7. [ ] Evaluator: eval/sprint-01.json 작성
