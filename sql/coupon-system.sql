-- 쿠폰 시스템 확장 스키마

-- 쿠폰 테이블 확장
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50);
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS usage_limit INTEGER DEFAULT 1;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS used_count INTEGER DEFAULT 0;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS min_order_amount INTEGER DEFAULT 0;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS max_discount_amount INTEGER;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_stackable BOOLEAN DEFAULT false;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS target_knife_types TEXT[]; -- 특정 칼 종류에만 적용
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_first_order_only BOOLEAN DEFAULT false;

-- 쿠폰 카테고리 테이블
CREATE TABLE IF NOT EXISTS coupon_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20) DEFAULT 'gray',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 쿠폰 이벤트 테이블
CREATE TABLE IF NOT EXISTS coupon_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) NOT NULL, -- 'signup', 'first_order', 'birthday', 'seasonal', 'referral' 등
  coupon_template JSONB NOT NULL, -- 쿠폰 생성 템플릿
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  target_conditions JSONB, -- 대상 조건 (회원 등급, 가입 기간 등)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 쿠폰 사용 내역 테이블 확장
ALTER TABLE user_coupons ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50);
ALTER TABLE user_coupons ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0;
ALTER TABLE user_coupons ADD COLUMN IF NOT EXISTS original_order_amount INTEGER DEFAULT 0;
ALTER TABLE user_coupons ADD COLUMN IF NOT EXISTS final_order_amount INTEGER DEFAULT 0;

-- 쿠폰 공유/추천 테이블
CREATE TABLE IF NOT EXISTS coupon_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  shared_by_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shared_to_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  share_code VARCHAR(50) NOT NULL,
  share_method VARCHAR(20) NOT NULL, -- 'link', 'code', 'kakao', 'sms' 등
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  UNIQUE(share_code)
);

-- 리뷰 시스템 테이블
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  service_quality_rating INTEGER CHECK (service_quality_rating >= 1 AND service_quality_rating <= 5),
  delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  photos TEXT[], -- 리뷰 사진 URL 배열
  is_anonymous BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  UNIQUE(user_id, booking_id)
);

-- 리뷰 도움이 됐어요 테이블
CREATE TABLE IF NOT EXISTS review_helpful (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  UNIQUE(review_id, user_id)
);

-- 관리자 대시보드용 통계 뷰
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM bookings) as total_bookings,
  (SELECT COUNT(*) FROM bookings WHERE status = 'completed') as completed_bookings,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM coupons WHERE is_active = true) as active_coupons,
  (SELECT COUNT(*) FROM user_coupons WHERE is_used = true) as used_coupons,
  (SELECT COALESCE(AVG(rating), 0) FROM reviews) as average_rating,
  (SELECT COUNT(*) FROM reviews) as total_reviews,
  (SELECT COALESCE(SUM(total_amount), 0) FROM bookings WHERE status = 'completed') as total_revenue,
  (SELECT COUNT(*) FROM notifications WHERE created_at > NOW() - INTERVAL '24 hours') as notifications_today;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(coupon_code) WHERE coupon_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_coupon_events_type_active ON coupon_events(event_type, is_active);
CREATE INDEX IF NOT EXISTS idx_coupon_shares_code ON coupon_shares(share_code);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_user ON reviews(booking_id, user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating_created ON reviews(rating, created_at);

-- RLS 정책 설정
ALTER TABLE coupon_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful ENABLE ROW LEVEL SECURITY;

-- 모든 테이블에 대한 전체 액세스 정책
DROP POLICY IF EXISTS "coupon_categories_all_access" ON coupon_categories;
CREATE POLICY "coupon_categories_all_access" ON coupon_categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "coupon_events_all_access" ON coupon_events;
CREATE POLICY "coupon_events_all_access" ON coupon_events FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "coupon_shares_all_access" ON coupon_shares;
CREATE POLICY "coupon_shares_all_access" ON coupon_shares FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "reviews_all_access" ON reviews;
CREATE POLICY "reviews_all_access" ON reviews FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "review_helpful_all_access" ON review_helpful;
CREATE POLICY "review_helpful_all_access" ON review_helpful FOR ALL USING (true) WITH CHECK (true);

-- 초기 데이터 삽입
INSERT INTO coupon_categories (name, description, icon, color, order_index) VALUES
('신규 회원 혜택', '처음 가입하신 분들을 위한 특별 혜택', '🎉', 'blue', 1),
('생일 축하', '생일을 맞으신 고객님을 위한 축하 쿠폰', '🎂', 'purple', 2),
('재주문 할인', '재주문해주시는 고객님을 위한 감사 쿠폰', '🔄', 'green', 3),
('시즌 이벤트', '계절별 특별 이벤트 쿠폰', '🌟', 'orange', 4),
('친구 추천', '친구를 추천해주시면 받는 리워드', '👥', 'pink', 5)
ON CONFLICT (id) DO NOTHING;

-- 쿠폰 이벤트 예시 데이터
INSERT INTO coupon_events (title, description, event_type, coupon_template, start_date, end_date) VALUES
(
  '신규 가입 축하 이벤트',
  '처음 가입하신 분들께 20% 할인 쿠폰을 드립니다!',
  'signup',
  '{"name": "신규 가입 축하", "type": "percentage", "value": 20, "min_order_amount": 0, "valid_days": 30}',
  NOW(),
  NOW() + INTERVAL '1 year'
),
(
  '첫 주문 완료 축하',
  '첫 주문을 완료하신 고객님께 다음 주문시 사용할 수 있는 5000원 할인 쿠폰을 드립니다!',
  'first_order',
  '{"name": "첫 주문 감사", "type": "fixed", "value": 5000, "min_order_amount": 10000, "valid_days": 60}',
  NOW(),
  NOW() + INTERVAL '1 year'
),
(
  '생일 축하 이벤트',
  '생일을 맞으신 고객님께 특별한 할인 혜택을 드립니다!',
  'birthday',
  '{"name": "생일 축하", "type": "percentage", "value": 30, "min_order_amount": 0, "valid_days": 7}',
  NOW(),
  NOW() + INTERVAL '1 year'
)
ON CONFLICT (id) DO NOTHING;