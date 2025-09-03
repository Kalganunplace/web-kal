-- 칼가는곳 앱 데이터베이스 스키마 - 확장 버전

-- =============================================
-- 1. 기본 확장 기능 활성화
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 2. 사용자 관련 테이블
-- =============================================

-- 사용자 기본 정보 테이블 (기존)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 프로필 확장 정보 테이블 (신규)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  member_grade VARCHAR(20) DEFAULT 'bronze' CHECK (member_grade IN ('bronze', 'silver', 'gold', 'platinum')),
  total_services INTEGER DEFAULT 0,
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- =============================================
-- 3. 인증 관련 테이블
-- =============================================

-- 인증번호 테이블 (기존)
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone VARCHAR(15) NOT NULL,
  code VARCHAR(6) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'phone_verification', -- phone_verification, password_reset 등
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. 쿠폰 시스템
-- =============================================

-- 쿠폰 마스터 테이블 (쿠폰 종류 정의)
CREATE TABLE IF NOT EXISTS coupon_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  valid_days INTEGER DEFAULT 30, -- 쿠폰 유효 기간(일)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 쿠폰 보유 테이블
CREATE TABLE IF NOT EXISTS user_coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  coupon_type_id UUID REFERENCES coupon_types(id) ON DELETE CASCADE,
  code VARCHAR(50) UNIQUE NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. 구독 시스템
-- =============================================

-- 구독 플랜 테이블
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')),
  max_services_per_cycle INTEGER, -- NULL이면 무제한
  features JSONB, -- 구독 혜택들
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 구독 정보 테이블
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subscription_plan_id UUID REFERENCES subscription_plans(id),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  services_used_this_cycle INTEGER DEFAULT 0,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id) -- 한 사용자당 하나의 구독만
);

-- =============================================
-- 6. 인덱스 생성 (확장)
-- =============================================

-- 기존 인덱스
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_verification_codes_phone ON verification_codes(phone);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at);

-- 신규 인덱스들
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_coupons_user_id ON user_coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_coupons_expires_at ON user_coupons(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_coupons_is_used ON user_coupons(is_used);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

-- =============================================
-- 7. 트리거 및 함수 생성
-- =============================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 적용
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 사용자 생성시 프로필 자동 생성
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_user_profile_trigger 
    AFTER INSERT ON users 
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- =============================================
-- 8. RLS (Row Level Security) 설정
-- =============================================

-- 기존 테이블들
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- 신규 테이블들
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 9. RLS 정책 설정
-- =============================================

-- 기존 RLS 정책들
CREATE POLICY "사용자 본인만 조회 가능" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "사용자 본인만 업데이트 가능" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- 신규 테이블들 RLS 정책

-- 사용자 프로필
CREATE POLICY "Users can view own profile data" ON user_profiles 
  FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own profile data" ON user_profiles 
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 사용자 쿠폰
CREATE POLICY "Users can view own coupons" ON user_coupons 
  FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can use own coupons" ON user_coupons 
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 쿠폰 타입 (공개)
CREATE POLICY "Anyone can view coupon types" ON coupon_types 
  FOR SELECT USING (is_active = true);

-- 구독 플랜 (공개)
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans 
  FOR SELECT USING (is_active = true);

-- 사용자 구독 정보
CREATE POLICY "Users can view own subscription" ON user_subscriptions 
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- 함수: 만료된 인증번호 정리
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM verification_codes
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 함수: 인증번호 생성
CREATE OR REPLACE FUNCTION generate_verification_code(
  p_phone VARCHAR(15),
  p_type VARCHAR(20) DEFAULT 'phone_verification'
)
RETURNS VARCHAR(6) AS $$
DECLARE
  v_code VARCHAR(6);
BEGIN
  -- 기존 미사용 인증번호 삭제
  DELETE FROM verification_codes
  WHERE phone = p_phone AND type = p_type AND used = FALSE;

  -- 새 인증번호 생성 (6자리 숫자)
  v_code := LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');

  -- 인증번호 저장 (5분 후 만료)
  INSERT INTO verification_codes (phone, code, type, expires_at)
  VALUES (p_phone, v_code, p_type, NOW() + INTERVAL '5 minutes');

  RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- 함수: 인증번호 검증
CREATE OR REPLACE FUNCTION verify_code(
  p_phone VARCHAR(15),
  p_code VARCHAR(6),
  p_type VARCHAR(20) DEFAULT 'phone_verification'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_record verification_codes%ROWTYPE;
BEGIN
  -- 인증번호 조회
  SELECT * INTO v_record
  FROM verification_codes
  WHERE phone = p_phone
    AND code = p_code
    AND type = p_type
    AND used = FALSE
    AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;

  -- 인증번호가 존재하고 유효한 경우
  IF FOUND THEN
    -- 인증번호를 사용됨으로 표시
    UPDATE verification_codes
    SET used = TRUE
    WHERE id = v_record.id;

    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;


-- =============================================
-- 10. 초기 데이터 삽입
-- =============================================

-- 기본 쿠폰 타입들
INSERT INTO coupon_types (name, description, discount_type, discount_value, min_order_amount, valid_days) VALUES
('신규가입쿠폰', '첫 가입시 제공되는 할인 쿠폰', 'percentage', 20.00, 10000, 30),
('생일축하쿠폰', '생일월에 제공되는 특별 할인 쿠폰', 'fixed_amount', 5000.00, 15000, 30),
('리뷰작성쿠폰', '서비스 후 리뷰 작성시 제공', 'percentage', 10.00, 5000, 90),
('친구추천쿠폰', '친구 추천 성공시 제공되는 쿠폰', 'fixed_amount', 3000.00, 10000, 60)
ON CONFLICT DO NOTHING;

-- 기본 구독 플랜
INSERT INTO subscription_plans (name, description, price, billing_cycle, max_services_per_cycle, features) VALUES
('베이직', '월 2회 칼갈이 서비스', 15000.00, 'monthly', 2, '{"priority_booking": false, "free_delivery": true, "weekend_service": false}'),
('프리미엄', '월 무제한 칼갈이 서비스', 29900.00, 'monthly', NULL, '{"priority_booking": true, "free_delivery": true, "weekend_service": true, "emergency_service": true}'),
('연간할인', '연간 프리미엄 (2개월 무료)', 299000.00, 'yearly', NULL, '{"priority_booking": true, "free_delivery": true, "weekend_service": true, "emergency_service": true, "annual_discount": true}')
ON CONFLICT DO NOTHING;

-- =============================================
-- 11. anon 사용자 접근 정책 (기존)
-- =============================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "서비스 롤만 접근 가능" ON verification_codes;

-- anon 사용자도 인증번호 관련 함수 호출 가능하도록 수정
CREATE POLICY "anon_can_manage_verification_codes" ON verification_codes
  FOR ALL USING (true);

-- users 테이블 anon 접근 정책
CREATE POLICY "anon_can_insert_users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "anon_can_select_users" ON users
  FOR SELECT USING (true);

CREATE POLICY "anon_can_update_users" ON users  
  FOR UPDATE USING (true);
