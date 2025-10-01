# 칼가는곳 관리자 API 문서

## 개요
Supabase를 활용한 관리자 백엔드 API 시스템입니다.

## 환경 설정

### 필요 환경 변수
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=your_jwt_secret
```

## 데이터베이스 스키마

### 테이블 구조
- `products` - 상품 정보
- `banners` - 배너 이미지
- `orders` - 주문 정보
- `order_items` - 주문 상품 목록
- `bank_accounts` - 무통장입금 계좌
- `admins` - 관리자 계정
- `coupon_issue_logs` - 쿠폰 발급 로그

## API 엔드포인트

### 🔐 인증 API

#### 관리자 로그인
```http
POST /api/admin/auth
Content-Type: application/json

# 이메일 + 비밀번호 로그인
{
  "email": "admin@example.com",
  "password": "your-password",
  "action": "login"
}

# 또는 전화번호 + 비밀번호 로그인
{
  "phone": "01012345678",
  "password": "your-password",
  "action": "login"
}
```

#### 관리자 로그아웃
```http
POST /api/admin/auth
Content-Type: application/json

{
  "action": "logout"
}
```

#### 현재 관리자 정보 조회
```http
GET /api/admin/auth
```

---

### 📦 상품 관리 API

#### 상품 목록 조회
```http
GET /api/admin/products
GET /api/admin/products?category=knife
GET /api/admin/products?isActive=true
```

#### 상품 추가
```http
POST /api/admin/products
Content-Type: application/json

{
  "name": "소형 칼",
  "category": "knife",
  "market_price": 4000,
  "discount_price": 3000,
  "image_url": "https://...",
  "display_order": 1,
  "is_active": true
}
```

#### 상품 수정
```http
PUT /api/admin/products
Content-Type: application/json

{
  "id": "product-uuid",
  "name": "소형 칼",
  "discount_price": 2500
}
```

#### 상품 삭제
```http
DELETE /api/admin/products?id=product-uuid
```

---

### 📋 주문 관리 API

#### 주문 목록 조회
```http
GET /api/admin/orders
GET /api/admin/orders?status=pending
GET /api/admin/orders?userId=user-uuid
GET /api/admin/orders?startDate=2025-01-01&endDate=2025-01-31
GET /api/admin/orders?page=1&limit=20
```

응답 예시:
```json
{
  "success": true,
  "data": [
    {
      "id": "order-uuid",
      "order_number": "ORD1234567890",
      "customer_name": "홍길동",
      "total_amount": 19000,
      "status": "pending",
      "order_items": [
        {
          "product_name": "소형 칼",
          "quantity": 2,
          "unit_price": 3000
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### 주문 생성
```http
POST /api/admin/orders
Content-Type: application/json

{
  "user_id": "user-uuid",
  "customer_phone": "01012345678",
  "customer_name": "홍길동",
  "total_amount": 19000,
  "service_date": "2025-01-15T10:00:00Z",
  "service_address": "대구광역시 중구 동성로3길 21",
  "items": [
    {
      "product_id": "product-uuid",
      "product_name": "소형 칼",
      "quantity": 2,
      "unit_price": 3000
    }
  ]
}
```

#### 주문 상태 변경
```http
PATCH /api/admin/orders
Content-Type: application/json

{
  "id": "order-uuid",
  "status": "completed"
}
```

상태 값: `pending`, `confirmed`, `completed`, `cancelled`

---

### 🎫 쿠폰 관리 API

#### 쿠폰 타입 조회
```http
GET /api/admin/coupon-types
```

#### 발급된 쿠폰 조회
```http
GET /api/admin/coupons
GET /api/admin/coupons?userId=user-uuid
GET /api/admin/coupons?isUsed=false
GET /api/admin/coupons?includeExpired=true
```

#### 쿠폰 수동 발급
```http
POST /api/admin/coupons
Content-Type: application/json

{
  "userPhone": "01012345678",
  "couponTypeId": "coupon-type-uuid",
  "adminId": "admin-uuid",
  "issueReason": "고객 보상"
}
```

#### 쿠폰 삭제
```http
DELETE /api/admin/coupons?id=coupon-uuid
```

---

### 🖼️ 배너 관리 API

#### 배너 목록 조회
```http
GET /api/admin/banners
GET /api/admin/banners?position=home_main
GET /api/admin/banners?isActive=true
```

#### 배너 추가
```http
POST /api/admin/banners
Content-Type: application/json

{
  "position": "home_main",
  "title": "신규 이벤트",
  "image_url": "https://...",
  "link_url": "/event",
  "display_order": 1,
  "is_active": true
}
```

#### 배너 수정
```http
PUT /api/admin/banners
Content-Type: application/json

{
  "id": "banner-uuid",
  "title": "수정된 배너",
  "is_active": false
}
```

#### 배너 삭제
```http
DELETE /api/admin/banners?id=banner-uuid
```

---

### 🏦 은행 계좌 관리 API

#### 계좌 목록 조회
```http
GET /api/admin/bank-accounts
```

#### 계좌 추가
```http
POST /api/admin/bank-accounts
Content-Type: application/json

{
  "bank_name": "농협은행",
  "account_number": "123-456-7890",
  "account_holder": "칼가는곳",
  "is_primary": true
}
```

#### 계좌 수정
```http
PUT /api/admin/bank-accounts
Content-Type: application/json

{
  "id": "account-uuid",
  "is_primary": true
}
```

#### 계좌 삭제
```http
DELETE /api/admin/bank-accounts?id=account-uuid
```

---

### 👤 관리자 관리 API (슈퍼관리자 전용)

#### 관리자 목록 조회
```http
GET /api/admin/admins
Authorization: Required (Super Admin)
```

#### 관리자 등록
```http
POST /api/admin/admins
Authorization: Required (Super Admin)
Content-Type: application/json

{
  "email": "newadmin@example.com",
  "phone": "01087654321",  // 선택사항
  "name": "김관리",
  "password": "securePassword123!",
  "role": "admin"  // "super_admin", "admin", "manager"
}
```

#### 관리자 정보 수정
```http
PUT /api/admin/admins
Authorization: Required (Super Admin)
Content-Type: application/json

{
  "id": "admin-uuid",
  "email": "updated@example.com",
  "phone": "01011112222",
  "name": "박관리",
  "password": "newPassword123!",  // 선택사항
  "role": "manager",
  "is_active": true
}
```

#### 관리자 비활성화
```http
DELETE /api/admin/admins?id=admin-uuid
Authorization: Required (Super Admin)
```

---

## 보안

### RLS (Row Level Security) 정책
- 상품/배너: 모든 사용자 읽기 가능, 관리자만 수정
- 주문: 사용자는 본인 주문만, 관리자는 모든 주문 접근
- 은행계좌/쿠폰발급: 관리자만 접근 가능
- 관리자 테이블: 슈퍼관리자만 관리 가능

### 인증 미들웨어
모든 관리자 API는 JWT 토큰 검증을 거칩니다.
```javascript
import { withAdminAuth } from '@/middleware/admin-auth';

// 사용 예시
export const GET = withAdminAuth(async (request) => {
  // 인증된 요청만 처리
});
```

---

## 에러 처리

모든 API는 다음 형식으로 에러를 반환합니다:
```json
{
  "success": false,
  "error": "에러 메시지"
}
```

### HTTP 상태 코드
- `200` - 성공
- `400` - 잘못된 요청
- `401` - 인증 실패
- `404` - 리소스 없음
- `500` - 서버 에러

---

## 테스트

### 기본 관리자 계정
- Email: `admin@kalganun.com`
- Phone: `01012345678`
- Password: `password123!`
- Role: `super_admin`

### 역할별 권한
| 역할 | 설명 | 권한 |
| --- | --- | --- |
| `super_admin` | 슈퍼관리자 | 모든 권한 + 관리자 관리 |
| `admin` | 일반관리자 | 상품, 주문, 쿠폰, 배너 관리 |
| `manager` | 매니저 | 주문 조회 및 상태 변경 |

### 샘플 데이터
초기 마이그레이션 시 상품 10개와 기본 은행계좌가 자동으로 생성됩니다.
