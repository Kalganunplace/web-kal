-- 관리자 계정 테이블 생성
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('super_admin', 'staff')),
  permissions TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_admins_username ON admins(username);
CREATE INDEX idx_admins_is_active ON admins(is_active);

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 초기 관리자 계정 생성 (비밀번호는 bcrypt 해시)
-- super_admin: admin / admin123!
-- staff: staff / staff123!
INSERT INTO admins (username, email, password_hash, name, role, permissions) VALUES
  ('admin', 'admin@kalganenungot.com', '$2b$10$OIcPAADjG0LnK470qgm14.pf3KGCUn803uGRH5guLN4mIp/WETnji', '슈퍼 관리자', 'super_admin', ARRAY['*']),
  ('staff', 'staff@kalganenungot.com', '$2b$10$RRQWrRy4hSEdiD3KGUQr3.xNDsnprIbqGlmdnhCFiqTWcc3sahTty', '직원', 'staff', ARRAY['orders', 'customers', 'products'])
ON CONFLICT (username) DO NOTHING;

-- RLS 정책 비활성화 (JWT 기반 인증 사용)
-- 관리자 테이블은 애플리케이션 레벨에서 인증 처리
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE admins IS '관리자 계정 테이블';
COMMENT ON COLUMN admins.username IS '로그인 아이디';
COMMENT ON COLUMN admins.password_hash IS 'bcrypt 해시된 비밀번호';
COMMENT ON COLUMN admins.role IS '관리자 역할 (super_admin, staff)';
COMMENT ON COLUMN admins.permissions IS '권한 배열 (* = 모든 권한)';
