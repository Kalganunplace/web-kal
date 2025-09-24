-- 결제 시스템 스키마
-- 무통장입금 기반 결제 처리를 위한 테이블들

-- 1. payments 테이블 - 결제 정보
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 결제 기본 정보
  payment_method VARCHAR(50) NOT NULL DEFAULT 'bank_transfer', -- 'bank_transfer', 'card', 'virtual_account'
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'KRW',

  -- 무통장입금 정보
  bank_name VARCHAR(50), -- 입금 은행명
  account_number VARCHAR(50), -- 계좌번호
  account_holder VARCHAR(100), -- 예금주
  depositor_name VARCHAR(100), -- 입금자명
  deposit_deadline TIMESTAMP WITH TIME ZONE, -- 입금 마감 시간

  -- 결제 상태
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'failed', 'cancelled', 'refunded'

  -- 확인 정보
  confirmed_by UUID REFERENCES auth.users(id), -- 확인한 관리자
  confirmed_at TIMESTAMP WITH TIME ZONE, -- 확인 시간
  confirmation_note TEXT, -- 확인 메모

  -- 기타 정보
  payment_note TEXT, -- 결제 메모
  refund_reason TEXT, -- 환불 사유
  refund_amount DECIMAL(10,2), -- 환불 금액
  refunded_at TIMESTAMP WITH TIME ZONE, -- 환불 시간

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. payment_bank_accounts 테이블 - 입금 계좌 정보 관리
CREATE TABLE IF NOT EXISTS payment_bank_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_name VARCHAR(50) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  account_holder VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. payment_confirmations 테이블 - 입금 확인 로그
CREATE TABLE IF NOT EXISTS payment_confirmations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id),

  -- 확인 정보
  action_type VARCHAR(20) NOT NULL, -- 'confirm', 'reject', 'cancel'
  previous_status VARCHAR(20) NOT NULL,
  new_status VARCHAR(20) NOT NULL,
  confirmation_note TEXT,

  -- 입금 확인 세부사항
  confirmed_amount DECIMAL(10,2), -- 실제 입금 확인된 금액
  deposit_date TIMESTAMP WITH TIME ZONE, -- 입금 일시
  bank_transaction_id VARCHAR(100), -- 은행 거래 번호

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_payment_id ON payment_confirmations(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_admin_user_id ON payment_confirmations(admin_user_id);

-- RLS 정책 설정
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_confirmations ENABLE ROW LEVEL SECURITY;

-- payments 테이블 RLS 정책
-- 사용자는 자신의 결제 정보만 조회 가능
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 결제 정보만 생성 가능
CREATE POLICY "Users can create own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 pending 상태의 자신의 결제만 수정 가능
CREATE POLICY "Users can update own pending payments" ON payments
  FOR UPDATE USING (auth.uid() = user_id AND payment_status = 'pending');

-- 관리자는 모든 결제 정보 조회/수정 가능
CREATE POLICY "Admins can manage all payments" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- payment_bank_accounts 테이블 RLS 정책
-- 모든 사용자가 활성화된 계좌 정보 조회 가능
CREATE POLICY "Users can view active bank accounts" ON payment_bank_accounts
  FOR SELECT USING (is_active = true);

-- 관리자만 계좌 정보 관리 가능
CREATE POLICY "Admins can manage bank accounts" ON payment_bank_accounts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- payment_confirmations 테이블 RLS 정책
-- 관리자만 확인 로그 조회/생성 가능
CREATE POLICY "Admins can manage payment confirmations" ON payment_confirmations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- 트리거 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_bank_accounts_updated_at
  BEFORE UPDATE ON payment_bank_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 기본 입금 계좌 정보 삽입
INSERT INTO payment_bank_accounts (bank_name, account_number, account_holder, is_active, is_default, description, display_order) VALUES
('국민은행', '123456-78-901234', '칼가는곳', true, true, '칼갈이 서비스 입금계좌', 1),
('신한은행', '110-345-678901', '칼가는곳', true, false, '칼갈이 서비스 보조계좌', 2)
ON CONFLICT DO NOTHING;

-- bookings 테이블에 결제 관련 컬럼 추가 (이미 없는 경우에만)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'payment_required') THEN
    ALTER TABLE bookings ADD COLUMN payment_required BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'payment_status') THEN
    ALTER TABLE bookings ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'paid_at') THEN
    ALTER TABLE bookings ADD COLUMN paid_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- 결제 상태 업데이트 함수
CREATE OR REPLACE FUNCTION update_booking_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- 결제가 확인되면 예약의 결제 상태도 업데이트
  IF NEW.payment_status = 'confirmed' AND OLD.payment_status != 'confirmed' THEN
    UPDATE bookings
    SET payment_status = 'confirmed', paid_at = NOW()
    WHERE id = NEW.booking_id;
  ELSIF NEW.payment_status = 'failed' OR NEW.payment_status = 'cancelled' THEN
    UPDATE bookings
    SET payment_status = 'failed', paid_at = NULL
    WHERE id = NEW.booking_id;
  END IF;

  RETURN NEW;
END;
$$ language 'plpgsql';

-- 결제 상태 업데이트 트리거
DROP TRIGGER IF EXISTS update_booking_payment_status_trigger ON payments;
CREATE TRIGGER update_booking_payment_status_trigger
  AFTER UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_booking_payment_status();

-- 결제 만료 시간 설정 함수 (24시간 후)
CREATE OR REPLACE FUNCTION set_payment_deadline()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_method = 'bank_transfer' AND NEW.deposit_deadline IS NULL THEN
    NEW.deposit_deadline = NOW() + INTERVAL '24 hours';
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 결제 만료 시간 설정 트리거
DROP TRIGGER IF EXISTS set_payment_deadline_trigger ON payments;
CREATE TRIGGER set_payment_deadline_trigger
  BEFORE INSERT ON payments
  FOR EACH ROW EXECUTE FUNCTION set_payment_deadline();