-- schema.sql — 임장노트 데이터베이스 스키마 SSOT
-- 변경 시 반드시 이 파일을 먼저 수정하고 Supabase에 적용한다.

-- ============================================================
-- 1. profiles
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  plan text not null default 'free', -- 'free' | 'premium'
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles: 본인만 조회"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: 본인만 수정"
  on public.profiles for update
  using (auth.uid() = id);

-- Auth trigger: 신규 가입 시 profiles 자동 생성
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- 2. properties (매물)
-- ============================================================
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,

  -- 기본 정보
  address text not null,
  deposit integer,           -- 보증금 (만원)
  monthly_rent integer,      -- 월세 (만원)
  sale_price integer,        -- 매매가 (만원)
  area_sqm numeric(6,2),     -- 평수
  floor integer,
  room_count integer,
  visit_date date,
  agent_contact text,
  memo text,

  -- 체크리스트 (별점 1~5, null = 미입력)
  sunlight smallint check (sunlight between 1 and 5),
  noise smallint check (noise between 1 and 5),
  water_pressure smallint check (water_pressure between 1 and 5),
  has_parking boolean,
  has_elevator boolean,
  management_fee integer,    -- 관리비 (만원)

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.properties enable row level security;

create policy "properties: 본인만 조회"
  on public.properties for select
  using (auth.uid() = user_id);

create policy "properties: 본인만 삽입"
  on public.properties for insert
  with check (auth.uid() = user_id);

create policy "properties: 본인만 수정"
  on public.properties for update
  using (auth.uid() = user_id);

create policy "properties: 본인만 삭제"
  on public.properties for delete
  using (auth.uid() = user_id);

-- updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger properties_set_updated_at
  before update on public.properties
  for each row execute procedure public.set_updated_at();


-- ============================================================
-- 3. property_photos (사진)
-- ============================================================
create table if not exists public.property_photos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  storage_path text not null,  -- Supabase Storage 경로
  created_at timestamptz default now()
);

alter table public.property_photos enable row level security;

create policy "photos: 본인만 조회"
  on public.property_photos for select
  using (auth.uid() = user_id);

create policy "photos: 본인만 삽입"
  on public.property_photos for insert
  with check (auth.uid() = user_id);

create policy "photos: 본인만 삭제"
  on public.property_photos for delete
  using (auth.uid() = user_id);


-- ============================================================
-- 4. 무료 플랜 한도 함수
-- ============================================================
-- 무료 사용자의 매물 수를 확인하는 함수 (Server Action에서 호출)
create or replace function public.get_property_count(p_user_id uuid)
returns integer as $$
  select count(*)::integer from public.properties where user_id = p_user_id;
$$ language sql security definer;


-- ============================================================
-- 5. 이메일 인증 자동 처리 (개발/테스트 환경)
-- ============================================================
-- 회원가입 즉시 email_confirmed_at을 설정해 인증 이메일 없이 바로 로그인 가능
-- 프로덕션에서 이메일 인증을 활성화하려면 이 트리거를 제거하고
-- Supabase 대시보드 Authentication > Email > "Confirm email" 옵션을 켠다
create or replace function public.auto_confirm_email()
returns trigger as $$
begin
  new.email_confirmed_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists auto_confirm_email_on_signup on auth.users;
create trigger auto_confirm_email_on_signup
  before insert on auth.users
  for each row execute function public.auto_confirm_email();
