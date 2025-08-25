# 칼갈이 서비스 모바일 앱

한국의 칼갈이(칼 연마) 서비스를 위한 완전한 모바일 애플리케이션입니다.

## 📱 전체 페이지 구성

### 🏠 메인 화면들
- **홈 화면** (`app/page.tsx`) - 서비스 메인 화면, 실시간 채팅, 신청 버튼
- **칼갈이 신청** (`components/knife-request.tsx`) - 서비스 신청 폼
- **가격표** (`components/price-list.tsx`) - 서비스 가격 안내
- **이용 가이드** (`components/guide.tsx`) - 서비스 이용 방법 안내

### 📋 약관 및 정책
- **서비스 약관 동의** (`components/service-agreement.tsx`) - 약관 동의 화면
- **약관 상세** (`components/terms-detail.tsx`) - 서비스 이용약관 전문

### 🔔 알림 및 이력
- **알림** (`components/notifications.tsx`) - 서비스 알림 관리
- **이용내역** (`components/usage-history.tsx`) - 서비스 이용 기록

### 👤 사용자 관리
- **내정보** (`components/profile.tsx`) - 사용자 프로필 메인
- **회원정보** (`components/member-info.tsx`) - 개인정보 수정
- **주소 설정** (`components/address-settings.tsx`) - 수거/배송 주소 관리
- **구독 관리** (`components/subscription.tsx`) - 정기 구독 서비스 관리
- **쿠폰** (`components/coupons.tsx`) - 보유 쿠폰 관리

### 🛠️ 고객 지원
- **공지사항** (`components/notices.tsx`) - 서비스 공지사항
- **고객센터** (`components/customer-service.tsx`) - 문의 및 FAQ
- **앱 설정** (`components/app-settings.tsx`) - 앱 환경 설정

## 🎨 주요 기능

### 🏠 홈 화면 (HomePage)
- **위치 기반 서비스**: 지역별 서비스 제공
- **실시간 상태 알림**: 서비스 진행 상황을 채팅 형태로 표시
- **원클릭 신청**: 간편한 서비스 신청
- **배송 추적**: 실시간 배송 상태 확인

### 🔪 칼갈이 신청 (KnifeRequest)
- **주소 관리**: 수거 주소 선택 및 변경
- **시간 선택**: 6개 시간대 중 선택
- **수량 조절**: 칼 개수 선택
- **특별 요청**: 추가 요청사항 입력
- **비용 계산**: 실시간 예상 비용 표시

### 💰 가격표 (PriceList)
- **카테고리별 가격**: 식칼, 회칼, 가위, 과도 등
- **추가 정보**: 배송비, 할인 조건, 작업 시간
- **품질 보장**: 30일 품질 보장 안내

### 📖 이용 가이드 (Guide)
- **4단계 프로세스**: 신청 → 수거 → 연마 → 배송
- **이용 팁**: 서비스 이용시 주의사항
- **시각적 가이드**: 아이콘과 함께 직관적 설명

### 📋 서비스 약관 (ServiceAgreement)
- **필수/선택 약관**: 구분된 약관 동의
- **일괄 동의**: 모든 약관 한번에 동의
- **상세 보기**: 각 약관 상세 내용 확인

### 🔔 알림 시스템 (Notifications)
- **실시간 알림**: 서비스 상태 변경 알림
- **배송 추적**: 상세한 배송 정보
- **읽음 관리**: 읽음/안읽음 상태 관리

### 📊 이용내역 (UsageHistory)
- **서비스 기록**: 과거 이용 내역 조회
- **상태별 분류**: 진행중/완료 상태 구분
- **상세 정보**: 서비스 내용, 가격, 날짜

### 👤 회원정보 (MemberInfo)
- **프로필 관리**: 이름, 전화번호, 이메일 수정
- **실시간 편집**: 인라인 편집 기능
- **정보 보안**: 안전한 개인정보 관리

### 📍 주소 설정 (AddressSettings)
- **다중 주소**: 집, 회사 등 여러 주소 관리
- **기본 주소**: 기본 수거 주소 설정
- **주소 추가**: 새로운 주소 간편 추가

### 💎 구독 관리 (Subscription)
- **3가지 플랜**: 베이직, 프리미엄, 패밀리
- **플랜 비교**: 기능별 상세 비교
- **구독 혜택**: 할인 및 특별 서비스
- **플랜 변경**: 언제든 플랜 변경 가능

### 🎫 쿠폰 관리 (Coupons)
- **쿠폰 분류**: 사용가능/사용완료 구분
- **할인 정보**: 금액/퍼센트 할인 표시
- **사용 조건**: 최소 주문금액, 유효기간
- **원클릭 사용**: 간편한 쿠폰 사용

### 📢 공지사항 (Notices)
- **카테고리별 분류**: 서비스, 공지, 업데이트 등
- **신규 표시**: NEW 배지로 최신 공지 강조
- **상세 보기**: 공지사항 전문 확인

### 🎧 고객센터 (CustomerService)
- **다양한 문의 방법**: 전화, 채팅, 이메일
- **운영시간 안내**: 상담 가능 시간 표시
- **FAQ**: 자주 묻는 질문 모음
- **즉시 연결**: 원클릭 문의 연결

### ⚙️ 앱 설정 (AppSettings)
- **알림 설정**: 푸시, 주문, 마케팅 알림 개별 설정
- **보안 설정**: 자동 로그인, 생체 인증
- **기타 설정**: 언어, 버전 정보
- **위치 서비스**: GPS 기반 서비스 설정

## 🎨 디자인 시스템

### 컬러 팔레트
- **Primary**: Orange (#F97316) - 메인 브랜드 컬러
- **Secondary**: Gray (#6B7280) - 보조 텍스트
- **Success**: Green (#10B981) - 성공 상태
- **Warning**: Yellow (#F59E0B) - 주의 상태
- **Error**: Red (#EF4444) - 오류 상태

### 타이포그래피
- **제목**: 18-24px, 볼드
- **본문**: 14-16px, 미디엄/레귤러
- **캡션**: 12px, 레귤러

### 컴포넌트
- **카드**: 둥근 모서리, 그림자 효과
- **버튼**: 라운드 형태, 호버 효과
- **입력 필드**: 심플한 보더, 포커스 효과
- **배지**: 작은 라운드 라벨

## 🛠️ 기술 스택

- **Framework**: Next.js 15 (App Router)
- **UI Library**: shadcn/ui
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript
- **State Management**: React Hooks

## 📱 반응형 디자인

- **모바일 우선**: 모바일 환경에 최적화
- **최대 너비**: 384px (max-w-sm)
- **터치 친화적**: 충분한 터치 영역
- **스크롤 최적화**: 부드러운 스크롤 경험

## 🚀 주요 사용자 플로우

### 신규 사용자
1. 홈 화면 진입
2. 서비스 약관 동의
3. 회원가입
4. 첫 칼갈이 신청
5. 실시간 진행 상황 확인

### 기존 사용자
1. 자동 로그인
2. 홈에서 현재 상태 확인
3. 추가 서비스 신청
4. 이용내역 확인
5. 구독 관리

### 구독 사용자
1. 구독 상태 확인
2. 월간 할당량 확인
3. 우선 예약 서비스
4. 플랜 변경/해지

## 📦 프로젝트 구조

\`\`\`
app/
├── page.tsx                    # 홈 화면
├── layout.tsx                  # 레이아웃
└── globals.css                 # 글로벌 스타일

components/
├── knife-request.tsx           # 칼갈이 신청
├── price-list.tsx             # 가격표
├── guide.tsx                  # 이용 가이드
├── service-agreement.tsx      # 서비스 약관
├── terms-detail.tsx           # 약관 상세
├── notifications.tsx          # 알림
├── usage-history.tsx          # 이용내역
├── profile.tsx                # 내정보
├── member-info.tsx            # 회원정보
├── address-settings.tsx       # 주소 설정
├── subscription.tsx           # 구독 관리
├── coupons.tsx               # 쿠폰
├── notices.tsx               # 공지사항
├── customer-service.tsx      # 고객센터
└── app-settings.tsx          # 앱 설정

components/ui/                 # shadcn/ui 컴포넌트
├── button.tsx
├── card.tsx
├── input.tsx
├── badge.tsx
└── ...
\`\`\`

## 🔧 설치 및 실행

\`\`\`bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start
\`\`\`

## 📝 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.

---

**칼가는곳** - 전통적인 칼갈이 서비스를 현대적인 모바일 플랫폼으로 혁신한 서비스입니다. 🔪✨
