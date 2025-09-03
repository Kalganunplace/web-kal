# 칼가는곳 데이터베이스 스키마

이 폴더는 Supabase 데이터베이스 구축을 위한 SQL 파일들을 포함합니다.

## 📋 파일 구조

```
sql/
├── supabase-schema.sql     # 전체 데이터베이스 스키마
└── README.md               # 이 파일
```

## 🚀 데이터베이스 구축 방법

### 1. Supabase 프로젝트 생성
1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성
2. 프로젝트 URL과 anon key를 `.env.local`에 추가

### 2. 스키마 실행
Supabase Dashboard의 SQL Editor에서 `supabase-schema.sql` 내용을 붙여넣고 실행합니다.

### 3. 환경변수 설정
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📊 데이터베이스 구조

### 핵심 테이블들

#### 1. **users** - 사용자 기본 정보
- `id`: 사용자 고유 ID (UUID)
- `phone`: 전화번호 (인증용)
- `name`: 사용자 이름

#### 2. **user_profiles** - 사용자 확장 정보
- `user_id`: 사용자 ID 참조
- `member_grade`: 회원 등급 (bronze, silver, gold, platinum)
- `total_services`: 총 서비스 이용 횟수
- `notification_enabled`: 알림 설정 여부

#### 3. **user_coupons** - 사용자 쿠폰
- `user_id`: 사용자 ID 참조
- `coupon_type_id`: 쿠폰 종류 참조
- `code`: 쿠폰 코드
- `expires_at`: 만료 일시
- `is_used`: 사용 여부

#### 4. **user_subscriptions** - 구독 정보
- `user_id`: 사용자 ID 참조
- `subscription_plan_id`: 구독 플랜 참조
- `status`: 구독 상태 (active, cancelled, expired, paused)
- `current_period_end`: 현재 구독 기간 종료일

#### 5. **verification_codes** - 인증번호
- `phone`: 전화번호
- `code`: 6자리 인증번호
- `expires_at`: 만료 시간 (5분)
- `used`: 사용 여부

## 🔧 주요 기능들

### 1. 자동 프로필 생성
사용자 가입시 `user_profiles` 테이블에 기본 프로필이 자동 생성됩니다.

### 2. 인증번호 시스템
```sql
-- 인증번호 생성
SELECT generate_verification_code('01012345678');

-- 인증번호 검증
SELECT verify_code('01012345678', '123456');
```

### 3. 자동 업데이트 타임스탬프
`updated_at` 컬럼이 있는 테이블들은 자동으로 수정 시간이 업데이트됩니다.

### 4. Row Level Security (RLS)
- 사용자는 자신의 데이터만 접근 가능
- 공개 데이터 (쿠폰 타입, 구독 플랜)는 누구나 조회 가능

## 📈 초기 데이터

스키마 실행시 자동으로 삽입되는 기본 데이터들:

### 쿠폰 타입
- 신규가입쿠폰 (20% 할인)
- 생일축하쿠폰 (5,000원 할인)
- 리뷰작성쿠폰 (10% 할인)
- 친구추천쿠폰 (3,000원 할인)

### 구독 플랜
- **베이직**: 월 15,000원 (월 2회 서비스)
- **프리미엄**: 월 29,900원 (무제한 서비스)
- **연간할인**: 년 299,000원 (프리미엄 + 2개월 무료)

## 🔍 주의사항

1. **전화번호 형식**: 하이픈 없는 숫자만 저장 ('01012345678')
2. **UUID 사용**: 모든 ID는 UUID v4 사용
3. **시간대**: 모든 timestamp는 UTC 기준
4. **인증번호**: 5분 후 자동 만료

## 🛠 개발 팁

### Mock 데이터 생성
개발 중에는 `lib/auth/supabase.ts`의 `getUserProfile` 함수에서 mock 데이터를 반환합니다.

### 쿠폰 개수 조회
```sql
SELECT COUNT(*) 
FROM user_coupons 
WHERE user_id = $1 
AND is_used = false 
AND expires_at > NOW();
```

### 구독 상태 확인
```sql
SELECT status 
FROM user_subscriptions 
WHERE user_id = $1 
AND status = 'active';
```

## 🚨 마이그레이션 시 주의점

기존 테이블이 있는 경우, 스키마 파일의 `CREATE TABLE IF NOT EXISTS` 문법으로 안전하게 실행 가능합니다.

새로운 컬럼 추가시에는 별도의 마이그레이션 파일을 생성하는 것을 권장합니다.