-- 칼 보험 시스템 스키마

-- 보험 상품 테이블
CREATE TABLE IF NOT EXISTS insurance_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  coverage_amount INTEGER NOT NULL, -- 보장 금액
  premium_rate DECIMAL(5,4) NOT NULL, -- 보험료율 (예: 0.03 = 3%)
  min_premium INTEGER DEFAULT 1000, -- 최소 보험료
  max_premium INTEGER, -- 최대 보험료
  coverage_details JSONB, -- 보장 세부사항
  terms TEXT, -- 약관
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 사용자 보험 가입 테이블
CREATE TABLE IF NOT EXISTS user_insurances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  insurance_product_id uuid NOT NULL REFERENCES insurance_products(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  premium_amount INTEGER NOT NULL, -- 실제 지불한 보험료
  coverage_amount INTEGER NOT NULL, -- 보장금액
  policy_number VARCHAR(50) UNIQUE NOT NULL, -- 보험증권번호
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'claimed'
  start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  end_date TIMESTAMP WITH TIME ZONE, -- 보장 종료일
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 보험 청구 테이블
CREATE TABLE IF NOT EXISTS insurance_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_insurance_id uuid NOT NULL REFERENCES user_insurances(id) ON DELETE CASCADE,
  claim_amount INTEGER NOT NULL, -- 청구 금액
  damage_description TEXT NOT NULL, -- 손상 설명
  damage_photos TEXT[], -- 손상 사진 URL 배열
  claim_reason VARCHAR(100) NOT NULL, -- 청구 사유
  status VARCHAR(20) DEFAULT 'submitted', -- 'submitted', 'reviewing', 'approved', 'denied', 'paid'
  admin_notes TEXT, -- 관리자 메모
  approved_amount INTEGER, -- 승인된 보상 금액
  processed_at TIMESTAMP WITH TIME ZONE, -- 처리 완료일
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 결제 시스템 테이블들

-- 결제 방법 테이블
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'card', 'bank_transfer', 'mobile', 'simple_pay'
  provider VARCHAR(100), -- 'toss', 'kakao', 'naver', 'payco' 등
  icon_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 결제 내역 테이블
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_method_id uuid REFERENCES payment_methods(id),
  payment_key VARCHAR(200), -- 결제사에서 제공하는 결제 키
  order_id VARCHAR(100) NOT NULL, -- 주문 번호
  amount INTEGER NOT NULL, -- 결제 금액
  discount_amount INTEGER DEFAULT 0, -- 할인 금액
  insurance_amount INTEGER DEFAULT 0, -- 보험료
  final_amount INTEGER NOT NULL, -- 최종 결제 금액
  currency VARCHAR(10) DEFAULT 'KRW',
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'cancelled', 'refunded'
  payment_method_type VARCHAR(50), -- 실제 사용된 결제수단
  card_info JSONB, -- 카드 정보 (마스킹된)
  failure_reason TEXT, -- 결제 실패 사유
  paid_at TIMESTAMP WITH TIME ZONE, -- 결제 완료일
  cancelled_at TIMESTAMP WITH TIME ZONE, -- 결제 취소일
  refunded_at TIMESTAMP WITH TIME ZONE, -- 환불 완료일
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  UNIQUE(order_id)
);

-- 환불 내역 테이블
CREATE TABLE IF NOT EXISTS refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  refund_key VARCHAR(200), -- 환불사에서 제공하는 환불 키
  amount INTEGER NOT NULL, -- 환불 금액
  reason TEXT NOT NULL, -- 환불 사유
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  requested_by uuid REFERENCES users(id), -- 환불 요청자 (관리자 또는 사용자)
  processed_at TIMESTAMP WITH TIME ZONE, -- 환불 처리 완료일
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_insurances_user_booking ON user_insurances(user_id, booking_id);
CREATE INDEX IF NOT EXISTS idx_user_insurances_policy_number ON user_insurances(policy_number);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_status ON insurance_claims(status);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON refunds(payment_id);

-- RLS 정책 설정
ALTER TABLE insurance_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_insurances ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- 모든 테이블에 대한 전체 액세스 정책
DROP POLICY IF EXISTS "insurance_products_all_access" ON insurance_products;
CREATE POLICY "insurance_products_all_access" ON insurance_products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "user_insurances_all_access" ON user_insurances;
CREATE POLICY "user_insurances_all_access" ON user_insurances FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "insurance_claims_all_access" ON insurance_claims;
CREATE POLICY "insurance_claims_all_access" ON insurance_claims FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "payment_methods_all_access" ON payment_methods;
CREATE POLICY "payment_methods_all_access" ON payment_methods FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "payments_all_access" ON payments;
CREATE POLICY "payments_all_access" ON payments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "refunds_all_access" ON refunds;
CREATE POLICY "refunds_all_access" ON refunds FOR ALL USING (true) WITH CHECK (true);

-- 초기 데이터 삽입

-- 기본 보험 상품
INSERT INTO insurance_products (name, description, coverage_amount, premium_rate, min_premium, max_premium, coverage_details, terms) VALUES
(
  '칼 손상 보상 보험',
  '전문 연마 작업 중 발생할 수 있는 칼 손상을 보상하는 보험입니다.',
  1000000, -- 최대 100만원 보장
  0.05, -- 5% 보험료율
  1000, -- 최소 1,000원
  50000, -- 최대 50,000원
  '{
    "coverage_types": ["파손", "분실", "도난", "화재", "침수"],
    "exclusions": ["고의적 손상", "자연 마모", "부적절한 사용으로 인한 손상"],
    "processing_time": "신고 후 3-5 영업일",
    "required_documents": ["손상 사진", "구매 영수증", "손상 경위서"]
  }',
  '제1조 (보험의 목적)
이 보험은 피보험자가 당사에 칼갈이 서비스를 의뢰한 칼에 대하여, 서비스 제공 중 발생한 우발적 손상에 대해 보상하는 것을 목적으로 합니다.

제2조 (보상 범위)
1. 작업 중 발생한 칼의 파손
2. 서비스 제공자의 과실로 인한 분실
3. 화재, 침수 등 천재지변으로 인한 손상
4. 운송 중 발생한 손상

제3조 (보상 제외 사항)
1. 피보험자의 고의 또는 중대한 과실로 인한 손상
2. 칼의 자연적 마모 및 노후화
3. 전쟁, 내란, 테러 등으로 인한 손상
4. 핵위험으로 인한 손상

제4조 (보상 금액)
보상 금액은 칼의 구매 가격 또는 현재 시세 중 낮은 금액을 기준으로 하되, 보장 한도액을 초과하지 않습니다.

제5조 (보험금 청구)
1. 손상 발생 시 즉시 신고
2. 관련 서류 제출 (손상 사진, 구매 증빙 등)
3. 손상 경위서 작성 및 제출

제6조 (보험료)
보험료는 칼의 가치 및 서비스 금액에 따라 산정되며, 서비스 이용료와 함께 납부합니다.'
)
ON CONFLICT (id) DO NOTHING;

-- 결제 방법 데이터
INSERT INTO payment_methods (name, type, provider, display_order) VALUES
('토스페이', 'simple_pay', 'toss', 1),
('카카오페이', 'simple_pay', 'kakao', 2),
('네이버페이', 'simple_pay', 'naver', 3),
('페이코', 'simple_pay', 'payco', 4),
('신용카드', 'card', NULL, 5),
('체크카드', 'card', NULL, 6),
('무통장입금', 'bank_transfer', NULL, 7),
('계좌이체', 'bank_transfer', NULL, 8)
ON CONFLICT (id) DO NOTHING;

-- 함수: 보험증권번호 생성
CREATE OR REPLACE FUNCTION generate_policy_number()
RETURNS TEXT AS $$
DECLARE
    policy_number TEXT;
BEGIN
    -- INS + YYYYMMDD + 6자리 랜덤 숫자
    policy_number := 'INS' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    -- 중복 확인
    WHILE EXISTS (SELECT 1 FROM user_insurances WHERE policy_number = policy_number) LOOP
        policy_number := 'INS' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    END LOOP;
    
    RETURN policy_number;
END;
$$ LANGUAGE plpgsql;

-- 함수: 주문번호 생성
CREATE OR REPLACE FUNCTION generate_order_id()
RETURNS TEXT AS $$
DECLARE
    order_id TEXT;
BEGIN
    -- ORD + YYYYMMDD + 8자리 랜덤 숫자
    order_id := 'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');
    
    -- 중복 확인
    WHILE EXISTS (SELECT 1 FROM payments WHERE order_id = order_id) LOOP
        order_id := 'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');
    END LOOP;
    
    RETURN order_id;
END;
$$ LANGUAGE plpgsql;