-- 칼가는곳 앱 데이터베이스 스키마

-- 사용자 테이블
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인증번호 테이블
CREATE TABLE verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone VARCHAR(15) NOT NULL,
  code VARCHAR(6) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'phone_verification', -- phone_verification, password_reset 등
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_verification_codes_phone ON verification_codes(phone);
CREATE INDEX idx_verification_codes_code ON verification_codes(code);
CREATE INDEX idx_verification_codes_expires_at ON verification_codes(expires_at);

-- RLS (Row Level Security) 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- RLS 정책
-- 사용자는 자신의 정보만 볼 수 있음
CREATE POLICY "사용자 본인만 조회 가능" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- 사용자는 자신의 정보만 업데이트 가능
CREATE POLICY "사용자 본인만 업데이트 가능" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- 인증번호는 서버 사이드에서만 접근 (service_role 키 사용)
CREATE POLICY "서비스 롤만 접근 가능" ON verification_codes
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

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


---
 -- 기존 정책 삭제
  DROP POLICY IF EXISTS "서비스 롤만 접근 가능" ON verification_codes;

  -- anon 사용자도 인증번호 관련 함수 호출 가능하도록 수정
  CREATE POLICY "anon_can_manage_verification_codes" ON verification_codes
    FOR ALL USING (true);

  -- users 테이블도 anon이 insert 가능하도록 추가
  CREATE POLICY "anon_can_insert_users" ON users
    FOR INSERT WITH CHECK (true);
