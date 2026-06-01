# Sprint 02 — 매물 CRUD + 사진 + 체크리스트

## 목표
임장노트 핵심 기능인 매물 등록·목록·상세·수정·삭제와 사진 업로드, 체크리스트를 구현한다.

## 완료 기준 (Definition of Done)
- [ ] 매물 등록 폼 (`/dashboard/new`) 동작
- [ ] 매물 목록 (`/dashboard`) 렌더링 (본인 매물만)
- [ ] 매물 상세 (`/dashboard/[id]`) 렌더링
- [ ] 매물 수정 (`/dashboard/[id]/edit`) 동작
- [ ] 매물 삭제 동작
- [ ] 사진 업로드 (최대 5장, Supabase Storage)
- [ ] 체크리스트 별점 저장
- [ ] 무료 플랜 매물 3개 초과 시 안내 메시지 노출
- [ ] `npm run build` 성공
- [ ] Vercel Preview 배포 URL 존재
- [ ] `eval/sprint-02.json` 판정 결과 작성

## 태스크
1. [ ] `src/features/properties/queries.ts` 작성
2. [ ] `src/features/properties/actions.ts` 작성 (create, update, delete)
3. [ ] 매물 등록 폼 컴포넌트
4. [ ] 매물 목록 컴포넌트
5. [ ] 매물 상세 컴포넌트
6. [ ] 사진 업로드 컴포넌트 (Storage 연동)
7. [ ] 체크리스트 UI
8. [ ] 무료 한도 체크 로직
9. [ ] Vercel 배포
10. [ ] Evaluator: eval/sprint-02.json 작성
