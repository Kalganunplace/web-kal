-- 기존 payments 테이블에 고객 계좌 정보 필드 추가
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS customer_bank_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS customer_account_number VARCHAR(50);

-- 기존 은행 계좌 관련 필드들은 더 이상 사용하지 않지만 호환성을 위해 유지
-- bank_name, account_number, account_holder 필드는 그대로 둠

-- 고객 계좌 정보에 대한 인덱스 추가 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_payments_customer_bank
ON payments(customer_bank_name, customer_account_number)
WHERE customer_bank_name IS NOT NULL;

-- 업데이트된 스키마에 대한 설명 주석
COMMENT ON COLUMN payments.customer_bank_name IS '고객의 입금 계좌 은행명';
COMMENT ON COLUMN payments.customer_account_number IS '고객의 입금 계좌 번호';
COMMENT ON COLUMN payments.depositor_name IS '고객의 계좌 예금주명';

-- RLS 정책 업데이트 (기존 정책이 새 필드도 포함하도록)
-- 기존 정책들이 이미 있으므로 별도 작업 불필요