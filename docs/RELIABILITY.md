# RELIABILITY.md

## 에러 처리 원칙

1. Server Actions: 에러를 throw하지 않고 `{ error: string }` 반환
2. 로딩 상태: Suspense boundary 활용
3. 빌드 실패: `npm run build` 성공이 배포 조건

## 모니터링

- Vercel Analytics (선택적)
- Supabase Dashboard 로그 확인
