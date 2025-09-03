-- 약관 및 콘텐츠 관리 시스템 스키마

-- 약관 관리 테이블
CREATE TABLE IF NOT EXISTS terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'service', 'privacy', 'location', 'marketing' 등
  content TEXT NOT NULL,
  version VARCHAR(20) NOT NULL DEFAULT '1.0',
  is_active BOOLEAN DEFAULT true,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 사용자 약관 동의 기록 테이블
CREATE TABLE IF NOT EXISTS user_term_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  term_id uuid NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  agreed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  is_agreed BOOLEAN DEFAULT true,
  version VARCHAR(20) NOT NULL,
  UNIQUE(user_id, term_id)
);

-- 공지사항 테이블
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'general', -- 'general', 'notice', 'event', 'maintenance' 등
  is_important BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- FAQ 테이블
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question VARCHAR(300) NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'general',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_terms_type_active ON terms(type, is_active);
CREATE INDEX IF NOT EXISTS idx_user_term_agreements_user_id ON user_term_agreements(user_id);
CREATE INDEX IF NOT EXISTS idx_announcements_active_important ON announcements(is_active, is_important);
CREATE INDEX IF NOT EXISTS idx_faqs_category_active ON faqs(category, is_active);

-- RLS 정책 설정
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_term_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- 모든 테이블에 대한 전체 액세스 정책
DROP POLICY IF EXISTS "terms_all_access" ON terms;
CREATE POLICY "terms_all_access" ON terms FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "user_term_agreements_all_access" ON user_term_agreements;
CREATE POLICY "user_term_agreements_all_access" ON user_term_agreements FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "announcements_all_access" ON announcements;
CREATE POLICY "announcements_all_access" ON announcements FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "faqs_all_access" ON faqs;
CREATE POLICY "faqs_all_access" ON faqs FOR ALL USING (true) WITH CHECK (true);

-- 초기 약관 데이터 삽입
INSERT INTO terms (title, type, content, version, is_required) VALUES 
('서비스 이용약관', 'service', '제1조 (목적)
이 약관은 칼가는곳(이하 "회사")이 제공하는 칼갈이 서비스(이하 "서비스")의 이용조건 및 절차, 회사와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (정의)
1. "서비스"란 회사가 제공하는 칼갈이 수거·연마·배송 서비스를 의미합니다.
2. "이용자"란 이 약관에 따라 서비스를 이용하는 개인을 의미합니다.
3. "수거"란 이용자의 지정 장소에서 연마할 칼을 회수하는 서비스를 의미합니다.
4. "배송"란 연마 완료된 칼을 이용자에게 전달하는 서비스를 의미합니다.

제3조 (서비스의 제공)
1. 회사는 다음과 같은 서비스를 제공합니다:
   - 칼 수거 서비스
   - 전문 장인의 칼 연마 서비스  
   - 연마 완료 후 배송 서비스
   - 예약 및 진행 상황 알림 서비스

2. 서비스는 연중무휴 24시간 신청 가능하며, 실제 수거 및 배송은 영업일 기준으로 진행됩니다.

제4조 (이용자의 의무)
1. 이용자는 다음 사항을 준수해야 합니다:
   - 정확한 개인정보 및 연락처 제공
   - 수거 시간 약속 준수
   - 칼의 상태에 대한 정확한 정보 제공
   - 서비스 이용료 결제

2. 이용자는 다음 행위를 하여서는 안 됩니다:
   - 허위 정보 제공
   - 서비스를 이용한 불법 행위
   - 회사 직원에 대한 부당한 요구

제5조 (서비스 이용료 및 결제)
1. 서비스 이용료는 칼의 종류 및 수량에 따라 책정됩니다.
2. 결제는 서비스 완료 후 진행되며, 다양한 결제 수단을 제공합니다.
3. 요금은 사전 고지 후 변경될 수 있습니다.

제6조 (손해배상)
1. 회사는 서비스 제공 과정에서 발생한 칼의 손상에 대해 배상 책임을 집니다.
2. 단, 다음의 경우는 배상 책임에서 제외됩니다:
   - 이용자의 과실로 인한 손상
   - 칼의 노후화로 인한 자연적 손상
   - 천재지변 등 불가항력으로 인한 손상

제7조 (개인정보보호)
회사는 관련 법령에 따라 이용자의 개인정보를 보호하며, 개인정보 처리방침에 따라 처리합니다.

제8조 (약관의 변경)
회사는 필요시 이 약관을 변경할 수 있으며, 변경된 약관은 공지 후 효력이 발생합니다.

제9조 (기타)
이 약관에서 정하지 아니한 사항은 관련 법령 및 상관례에 따릅니다.', '1.0', true),

('개인정보 처리방침', 'privacy', '칼가는곳 개인정보 처리방침

제1조 (개인정보의 처리목적)
회사는 다음의 목적을 위하여 개인정보를 처리합니다:
1. 서비스 제공
2. 회원관리  
3. 마케팅 및 광고 활용
4. 고객 상담 및 불만 처리

제2조 (처리하는 개인정보의 항목)
회사는 다음의 개인정보 항목을 처리하고 있습니다:
- 필수항목: 이름, 전화번호, 주소, 이메일
- 선택항목: 생년월일, 성별

제3조 (개인정보의 처리 및 보유기간)
1. 서비스 이용 기록: 서비스 종료 후 3년
2. 회원 정보: 회원 탈퇴 후 즉시 삭제
3. 결제 정보: 결제 후 5년

제4조 (개인정보의 제3자 제공)
회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:
1. 이용자가 사전에 동의한 경우
2. 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우

제5조 (개인정보의 처리위탁)
회사는 서비스 제공을 위해 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:
- 배송업체: 주소, 연락처 (배송 목적)
- 결제대행사: 결제정보 (결제처리 목적)

제6조 (정보주체의 권리)
이용자는 다음과 같은 권리를 행사할 수 있습니다:
1. 개인정보 처리정지 요구
2. 개인정보 열람 요구  
3. 개인정보 정정·삭제 요구
4. 개인정보 처리현황 통지 요구

제7조 (개인정보보호책임자)
- 개인정보보호책임자: 고객센터
- 연락처: 1588-0000
- 이메일: privacy@kalganun.com

제8조 (권익침해 구제방법)
개인정보 침해신고센터, 개인정보 분쟁조정위원회, 검찰청 사이버범죄수사단 등에 신고하실 수 있습니다.

부칙
이 개인정보처리방침은 2024년 1월 1일부터 적용됩니다.', '1.0', true),

('위치정보 이용약관', 'location', '위치정보 이용약관

제1조 (목적)
이 약관은 회사가 제공하는 위치기반서비스에 대해 회사와 개인위치정보주체 간의 권리·의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.

제2조 (약관 외 준칙)
이 약관에 명시되지 아니한 사항은 위치정보의 보호 및 이용 등에 관한 법률, 개인정보보호법, 정보통신망 이용촉진 및 정보보호 등에 관한 법률 등 관계법령과 회사의 이용약관 및 개인정보처리방침, 회사가 별도로 정한 지침 등에 의합니다.

제3조 (서비스 내용 및 요금)
1. 회사는 위치정보사업자로부터 위치정보를 전달받아 아래와 같은 위치기반서비스를 제공합니다:
   - 칼 수거 및 배송을 위한 주소 확인 서비스
   - 최적 경로 안내 서비스

2. 위치기반서비스는 무료로 제공됩니다.

제4조 (개인위치정보주체의 권리)
1. 개인위치정보주체는 개인위치정보 수집·이용·제공에 대한 동의를 언제든지 철회할 수 있습니다.
2. 개인위치정보주체는 개인위치정보의 수집·이용·제공 현황에 대한 통지를 요구할 수 있습니다.
3. 개인위치정보주체는 개인위치정보의 수집·이용·제공을 일시적으로 중단할 것을 요구할 수 있습니다.

제5조 (개인위치정보의 이용·제공)
1. 회사는 개인위치정보를 이용하여 서비스를 제공하는 경우 미리 약관에 명시하거나 고지하고 동의를 받습니다.
2. 개인위치정보는 당해 개인위치정보주체가 동의한 범위 내에서만 이용됩니다.

제6조 (개인위치정보의 보유기간)
회사는 위치정보의 보호 및 이용 등에 관한 법률 제16조 제2항에 따라 개인위치정보를 수집한 때부터 1년을 초과하여 보유하지 않습니다.

제7조 (손해배상)
회사가 위치정보의 보호 및 이용 등에 관한 법률 제15조 내지 제26조의 규정을 위반한 행위로 개인위치정보주체에게 손해가 발생한 경우 배상할 책임을 집니다.

부칙
이 약관은 2024년 1월 1일부터 시행합니다.', '1.0', false),

('마케팅 정보 수신 동의', 'marketing', '마케팅 정보 수신 동의

1. 수집·이용 목적
- 신규 서비스 안내
- 이벤트 및 프로모션 정보 제공
- 맞춤형 서비스 제공

2. 수집하는 개인정보 항목
- 연락처 정보 (휴대폰 번호, 이메일 주소)
- 서비스 이용 내역

3. 보유 및 이용기간
- 동의 철회 시까지
- 회원 탈퇴 시 즉시 삭제

4. 동의 거부권
귀하는 마케팅 정보 수신 동의를 거부할 권리가 있으며, 거부 시에도 기본 서비스 이용에는 제한이 없습니다.

5. 동의 철회
마이페이지 또는 수신 거부 링크를 통해 언제든지 동의를 철회할 수 있습니다.', '1.0', false)
ON CONFLICT (id) DO NOTHING;

-- FAQ 데이터 삽입
INSERT INTO faqs (question, answer, category, order_index) VALUES 
('서비스 지역은 어디인가요?', '현재 서울, 경기, 인천 지역에서 서비스를 제공하고 있습니다. 추후 서비스 지역을 확대할 예정입니다.', '서비스 지역', 1),
('칼갈이에 얼마나 시간이 걸리나요?', '수거 후 1-2일 내에 연마 작업을 완료하고 배송해드립니다. 칼의 상태나 수량에 따라 다소 차이가 있을 수 있습니다.', '서비스 시간', 2),
('어떤 종류의 칼을 갈아주시나요?', '식칼, 과도, 회칼, 가위 등 대부분의 주방용 칼을 연마해드립니다. 특수한 도구의 경우 사전에 문의해주세요.', '서비스 범위', 3),
('연마 후 칼이 손상되면 어떻게 하나요?', '전문 장인이 작업하므로 손상 위험이 매우 낮습니다. 만약 작업 과정에서 손상이 발생하면 적절한 배상을 해드립니다.', '손해배상', 4),
('예약을 취소하고 싶어요.', '예약 접수 완료 상태까지는 무료로 취소 가능합니다. 작업이 시작된 이후에는 취소가 어려울 수 있습니다.', '예약 취소', 5),
('요금은 언제 결제하나요?', '서비스 완료 후 결제가 진행됩니다. 다양한 결제 수단을 이용하실 수 있습니다.', '결제', 6),
('칼이 많이 무뎌진 상태인데 가능한가요?', '아무리 무뎌진 칼이라도 연마가 가능합니다. 다만 심하게 손상된 경우 완전한 복원이 어려울 수 있습니다.', '칼 상태', 7),
('일요일에도 수거가 가능한가요?', '수거 서비스는 월~토요일에 제공됩니다. 일요일과 공휴일은 휴무입니다.', '운영 시간', 8)
ON CONFLICT (id) DO NOTHING;

-- 공지사항 데이터 삽입  
INSERT INTO announcements (title, content, type, is_important) VALUES 
('칼가는곳 서비스 오픈!', '안녕하세요. 칼가는곳입니다.

드디어 여러분의 소중한 칼을 더욱 날카롭게 만들어드릴 준비가 완료되었습니다.

🔪 **전문 장인의 수작업 연마**
오랜 경험을 가진 전문 장인이 하나하나 정성껏 연마해드립니다.

🚚 **편리한 수거/배송 서비스**  
집까지 찾아가서 수거하고, 연마 완료 후 다시 배송해드립니다.

💝 **오픈 기념 할인**
첫 서비스 이용 시 20% 할인 혜택을 제공합니다.

많은 관심과 이용 부탁드립니다.
감사합니다.', 'notice', true),

('설 연휴 서비스 안내', '안녕하세요. 칼가는곳입니다.

설 연휴 기간 중 서비스 운영 안내드립니다.

🗓️ **휴무 기간**
- 2024년 2월 9일(금) ~ 2월 12일(월)

📦 **수거/배송 일정**  
- 2월 8일(목) 이후 접수된 주문은 2월 13일(화)부터 순차적으로 진행됩니다.
- 연휴 전 마지막 수거: 2월 8일(목)
- 연휴 후 첫 수거: 2월 13일(화)

⚠️ **긴급 상담**
긴급한 문의사항은 카카오톡 채널로 연락해주시기 바랍니다.

연휴 기간 중 불편을 드려 죄송합니다.
새해 복 많이 받으세요!', 'notice', false),

('칼갈이 후 관리 방법 안내', '안녕하세요. 칼가는곳입니다.

연마해드린 칼을 더 오래, 더 날카롭게 사용하실 수 있도록 관리 방법을 안내드립니다.

✨ **사용 후 관리**
1. 사용 후 즉시 미지근한 물로 세척
2. 물기를 완전히 제거 후 보관
3. 칼꽂이나 마그네틱 홀더 사용 권장

❌ **피해야 할 것들**
- 식기세척기 사용 (칼날 손상 위험)
- 딱딱한 도마 사용 (유리, 대리석 등)
- 냉동식품 직접 절단
- 칼끼리 서로 부딪히게 보관

🔄 **정기 연마**
일반 가정용 칼은 3-6개월마다 정기 연마를 권장드립니다.

궁금한 점이 있으시면 언제든 문의해주세요!', 'general', false)
ON CONFLICT (id) DO NOTHING;