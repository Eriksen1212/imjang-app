# SECURITY.md

## 원칙

1. **환경변수**: `.env.local`만 사용, 절대 커밋 금지
2. **RLS**: 모든 Supabase 테이블에 Row Level Security 활성화 필수
3. **Server Actions**: 모든 mutation은 서버 사이드에서만 처리
4. **세션 검증**: middleware에서 모든 보호된 라우트 세션 확인
5. **Storage**: 사진은 로그인한 사용자만 업로드 가능, 본인 폴더(`{user_id}/`)에만 저장

## RLS 적용 현황

| 테이블 | RLS | 정책 |
|--------|-----|------|
| profiles | ✅ | 본인만 조회/수정 |
| properties | ✅ | 본인만 조회/삽입/수정/삭제 |
| property_photos | ✅ | 본인만 조회/삽입/삭제 |

## 금지 사항

- `service_role` 키를 클라이언트 코드에 노출 금지
- RLS 비활성화 상태로 테이블 생성 금지
- 사용자 입력을 검증 없이 DB 쿼리에 사용 금지
- `storage_path`에 다른 사용자 경로 삽입 금지

## Storage 버킷 설정

- 버킷명: `property-photos`
- 접근: Private (인증된 사용자만)
- 경로 규칙: `{user_id}/{property_id}/{filename}`
