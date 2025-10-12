-- payment_bank_accounts 테이블 RLS 정책 수정
-- 관리자가 계좌를 추가/수정/삭제할 수 있도록 설정

-- 기존 RLS 정책 제거 (있다면)
DROP POLICY IF EXISTS "Allow admin to manage bank accounts" ON payment_bank_accounts;
DROP POLICY IF EXISTS "Allow public to read bank accounts" ON payment_bank_accounts;

-- RLS 비활성화 (관리자 전용 테이블)
ALTER TABLE payment_bank_accounts DISABLE ROW LEVEL SECURITY;

-- 테이블 주석 추가
COMMENT ON TABLE payment_bank_accounts IS '무통장입금 계좌 정보 테이블 - 관리자 전용';
