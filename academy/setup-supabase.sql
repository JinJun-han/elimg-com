-- 글로컬 AI 아카데미 — Supabase 설정
-- elimgbridge 프로젝트(zaygzrbfuwulbceppamx)에 적용
-- 실행: Supabase SQL Editor → 붙여넣기 → Run

-- ─────────────────────────────────────────────
-- 1. academy_signups 테이블 생성
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.academy_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- 기본 정보
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  kakao_id TEXT,
  age_group TEXT,
  nationality TEXT DEFAULT '한국',
  region TEXT,
  language_pref TEXT DEFAULT 'ko',

  -- 대상 그룹 (8개 중 선택)
  target_group TEXT NOT NULL,
    -- 'immigrant_worker' | 'overseas_student' | 'multicultural'
    -- | 'small_business' | 'office_worker' | 'minister'
    -- | 'parent' | 'senior' | 'other'

  -- AI 사용 경험
  ai_level TEXT NOT NULL,
    -- 'none' | 'tried' | 'occasional' | 'frequent'
  ai_tools TEXT[],
    -- ['chatgpt', 'claude', 'gemini', 'none']

  -- 학습 목표·상황
  goal_text TEXT,
  challenge_text TEXT,

  -- 참여 방식
  attendance_mode TEXT NOT NULL,
    -- 'online' | 'offline_gimhae' | 'both' | 'recorded_only'
  available_evening BOOLEAN DEFAULT true,

  -- 인지 경로
  source TEXT,
    -- 'kakao' | 'email' | 'blog' | 'youtube' | 'word_of_mouth' | 'other'
  referrer_name TEXT,

  -- 개인정보 동의
  consent_personal_info BOOLEAN NOT NULL DEFAULT false,
  consent_communication BOOLEAN DEFAULT false,

  -- 운영용
  status TEXT DEFAULT 'new',
    -- 'new' | 'contacted' | 'confirmed' | 'completed' | 'cancelled'
  notes TEXT,
  cohort TEXT DEFAULT '2026-Q3-1기'
);

-- ─────────────────────────────────────────────
-- 2. RLS 비활성화 (register_user 패턴과 일관)
-- ─────────────────────────────────────────────

ALTER TABLE public.academy_signups DISABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- 3. anon 권한 부여 (INSERT만 허용)
-- ─────────────────────────────────────────────

REVOKE ALL ON public.academy_signups FROM anon, PUBLIC;
GRANT INSERT ON public.academy_signups TO anon, PUBLIC;

-- ─────────────────────────────────────────────
-- 4. SECURITY DEFINER RPC 함수 — 등록 처리
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.register_academy(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO public.academy_signups (
    name, phone, email, kakao_id, age_group, nationality, region, language_pref,
    target_group, ai_level, ai_tools, goal_text, challenge_text,
    attendance_mode, available_evening,
    source, referrer_name,
    consent_personal_info, consent_communication,
    notes
  )
  VALUES (
    payload->>'name',
    payload->>'phone',
    payload->>'email',
    payload->>'kakao_id',
    payload->>'age_group',
    COALESCE(payload->>'nationality', '한국'),
    payload->>'region',
    COALESCE(payload->>'language_pref', 'ko'),
    payload->>'target_group',
    payload->>'ai_level',
    CASE
      WHEN payload->'ai_tools' IS NOT NULL
      THEN ARRAY(SELECT jsonb_array_elements_text(payload->'ai_tools'))
      ELSE NULL
    END,
    payload->>'goal_text',
    payload->>'challenge_text',
    payload->>'attendance_mode',
    COALESCE((payload->>'available_evening')::boolean, true),
    payload->>'source',
    payload->>'referrer_name',
    COALESCE((payload->>'consent_personal_info')::boolean, false),
    COALESCE((payload->>'consent_communication')::boolean, false),
    payload->>'notes'
  )
  RETURNING id INTO new_id;

  RETURN jsonb_build_object('ok', true, 'id', new_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_academy(jsonb) TO anon, authenticated, PUBLIC;

-- ─────────────────────────────────────────────
-- 5. admin 조회 RPC (기존 admin 비밀번호 재사용)
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_academy_signups(admin_pass text)
RETURNS SETOF public.academy_signups
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF admin_pass IS DISTINCT FROM 'y!sveu78tjC!UhVlzWhd' THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY SELECT * FROM public.academy_signups ORDER BY created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_academy_signups(text) TO anon, authenticated, PUBLIC;

-- ─────────────────────────────────────────────
-- 6. PostgREST 스키마 리로드
-- ─────────────────────────────────────────────

NOTIFY pgrst, 'reload schema';

-- ─────────────────────────────────────────────
-- 검증 쿼리 (선택)
-- ─────────────────────────────────────────────

-- 테이블 존재 확인
SELECT 'academy_signups 테이블 생성됨' AS status
WHERE EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'academy_signups'
);

-- 함수 존재 확인
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('register_academy', 'get_academy_signups');
