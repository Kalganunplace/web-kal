# 에러 코드 정의서

칼가는곳 프로젝트의 모든 에러 메시지를 체계적으로 정리한 문서입니다.

## 목차

1. [인증 관련 에러 (AUTH_*)](#1-인증-관련-에러)
2. [예약/주문 관련 에러 (BOOKING_*)](#2-예약주문-관련-에러)
3. [결제 관련 에러 (PAYMENT_*)](#3-결제-관련-에러)
4. [쿠폰 관련 에러 (COUPON_*)](#4-쿠폰-관련-에러)
5. [관리자 API 에러 (ADMIN_*)](#5-관리자-api-에러)
6. [서버 에러 (SERVER_*)](#6-서버-에러)

---

## 1. 인증 관련 에러

### 1.1 클라이언트 로그인/회원가입

#### AUTH_CLIENT_MISSING_FIELDS
- **HTTP 상태 코드**: 400 Bad Request
- **에러 메시지**: "전화번호와 인증번호를 입력해주세요."
- **발생 파일**: `/app/api/auth/client/login/route.ts`
- **발생 시나리오**: 클라이언트 로그인 시 phone 또는 verificationCode가 누락된 경우
- **해결 방법**: 필수 필드를 모두 입력하여 요청

#### AUTH_CLIENT_SIGNUP_MISSING_FIELDS
- **HTTP 상태 코드**: 400 Bad Request
- **에러 메시지**: "전화번호, 이름, 인증번호를 모두 입력해주세요."
- **발생 파일**: `/app/api/auth/client/signup/route.ts`
- **발생 시나리오**: 클라이언트 회원가입 시 phone, name, verificationCode 중 하나라도 누락된 경우
- **해결 방법**: 필수 필드를 모두 입력하여 요청

#### AUTH_CLIENT_LOGIN_FAILED
- **HTTP 상태 코드**: 401 Unauthorized
- **에러 메시지**: "로그인에 실패했습니다." / UnifiedAuthService에서 반환된 에러 메시지
- **발생 파일**: `/app/api/auth/client/login/route.ts`, `/lib/auth/unified.ts`
- **발생 시나리오**:
  - 인증번호 검증 실패
  - 가입되지 않은 전화번호로 로그인 시도
  - Supabase 인증 프로세스 실패
- **해결 방법**: 올바른 전화번호와 유효한 인증번호 입력

#### AUTH_CLIENT_SIGNUP_FAILED
- **HTTP 상태 코드**: 400 Bad Request
- **에러 메시지**: "회원가입에 실패했습니다." / UnifiedAuthService에서 반환된 에러 메시지
- **발생 파일**: `/app/api/auth/client/signup/route.ts`, `/lib/auth/unified.ts`
- **발생 시나리오**:
  - 인증번호 검증 실패
  - 이미 가입된 전화번호
  - Supabase 사용자 생성 실패
- **해결 방법**: 인증번호 재발급 또는 가입 여부 확인

#### AUTH_PHONE_VERIFICATION_FAILED
- **HTTP 상태 코드**: N/A (내부 에러)
- **에러 메시지**: "인증번호가 올바르지 않거나 만료되었습니다."
- **발생 파일**: `/lib/auth/supabase.ts`
- **발생 시나리오**: Supabase RPC `verify_code` 호출 시 인증번호 불일치 또는 만료
- **해결 방법**: 새로운 인증번호 요청 후 재시도

#### AUTH_PHONE_INVALID_FORMAT
- **HTTP 상태 코드**: N/A (내부 에러)
- **에러 메시지**: "올바른 전화번호 형식이 아닙니다."
- **발생 파일**: `/lib/auth/supabase.ts`
- **발생 시나리오**: 한국 휴대폰 번호 패턴(010-XXXX-XXXX)과 일치하지 않는 경우
- **해결 방법**: 올바른 형식의 전화번호 입력

#### AUTH_PHONE_ALREADY_REGISTERED
- **HTTP 상태 코드**: N/A (내부 에러)
- **에러 메시지**: "이미 가입된 전화번호입니다."
- **발생 파일**: `/lib/auth/supabase.ts`
- **발생 시나리오**: 회원가입 시 이미 존재하는 전화번호로 가입 시도
- **해결 방법**: 로그인 페이지로 이동하거나 비밀번호 찾기

#### AUTH_PHONE_NOT_REGISTERED
- **HTTP 상태 코드**: N/A (내부 에러)
- **에러 메시지**: "가입되지 않은 전화번호입니다."
- **발생 파일**: `/lib/auth/supabase.ts`
- **발생 시나리오**: 로그인 시 가입되지 않은 전화번호로 시도
- **해결 방법**: 회원가입 먼저 진행

#### AUTH_PHONE_DUPLICATE
- **HTTP 상태 코드**: N/A (내부 에러)
- **에러 메시지**: "이미 사용 중인 전화번호입니다."
- **발생 파일**: `/lib/auth/supabase.ts`
- **발생 시나리오**: 사용자 정보 수정 시 다른 사용자가 이미 사용 중인 전화번호로 변경 시도
- **해결 방법**: 다른 전화번호 사용

#### AUTH_VERIFICATION_CODE_GENERATION_FAILED
- **HTTP 상태 코드**: N/A (내부 에러)
- **에러 메시지**: "인증번호 생성에 실패했습니다."
- **발생 파일**: `/lib/auth/supabase.ts`
- **발생 시나리오**: Supabase RPC `generate_verification_code` 호출 실패
- **해결 방법**: 서버 로그 확인 및 Supabase 연결 상태 점검

#### AUTH_SMS_SEND_FAILED
- **HTTP 상태 코드**: N/A (내부 에러)
- **에러 메시지**: "인증번호 발송에 실패했습니다."
- **발생 파일**: `/lib/auth/supabase.ts`
- **발생 시나리오**: SMS 서비스 발송 실패
- **해결 방법**: SMS 서비스 상태 확인 및 재시도

### 1.2 관리자 로그인

#### AUTH_ADMIN_MISSING_FIELDS
- **HTTP 상태 코드**: 400 Bad Request
- **에러 메시지**: "이메일과 비밀번호를 입력해주세요."
- **발생 파일**: `/app/api/auth/admin/login/route.ts`
- **발생 시나리오**: 관리자 로그인 시 email 또는 password가 누락된 경우
- **해결 방법**: 필수 필드를 모두 입력하여 요청

#### AUTH_ADMIN_INVALID_CREDENTIALS
- **HTTP 상태 코드**: 401 Unauthorized
- **에러 메시지**: "이메일 또는 비밀번호가 잘못되었습니다."
- **발생 파일**: `/lib/auth/unified.ts`
- **발생 시나리오**: 잘못된 이메일 또는 비밀번호로 관리자 로그인 시도
- **해결 방법**: 올바른 관리자 계정 정보 입력

#### AUTH_ADMIN_ACCOUNT_INACTIVE
- **HTTP 상태 코드**: 401 Unauthorized
- **에러 메시지**: "비활성화된 계정입니다."
- **발생 파일**: `/lib/auth/unified.ts`
- **발생 시나리오**: is_active가 false인 관리자 계정으로 로그인 시도
- **해결 방법**: 계정 활성화 요청 또는 관리자 문의

### 1.3 토큰 검증

#### AUTH_TOKEN_MISSING
- **HTTP 상태 코드**: 400 Bad Request
- **에러 메시지**: "토큰이 필요합니다."
- **발생 파일**: `/app/api/auth/verify/route.ts`
- **발생 시나리오**: 토큰 검증 API 호출 시 token 파라미터 누락
- **해결 방법**: 유효한 JWT 토큰 포함하여 요청

#### AUTH_TOKEN_INVALID
- **HTTP 상태 코드**: 401 Unauthorized
- **에러 메시지**: "유효하지 않은 토큰입니다."
- **발생 파일**: `/lib/auth/unified.ts`, `/lib/auth/jwt.ts`
- **발생 시나리오**:
  - 만료된 JWT 토큰
  - 서명 검증 실패
  - 잘못된 형식의 토큰
- **해결 방법**: 재로그인하여 새로운 토큰 발급

#### AUTH_TOKEN_VERIFICATION_ERROR
- **HTTP 상태 코드**: 401 Unauthorized
- **에류 메시지**: "토큰 검증 중 오류가 발생했습니다."
- **발생 파일**: `/lib/auth/unified.ts`
- **발생 시나리오**: JWT 검증 과정에서 예외 발생
- **해결 방법**: 서버 로그 확인 및 재로그인

#### AUTH_UNKNOWN_USER_TYPE
- **HTTP 상태 코드**: 401 Unauthorized
- **에러 메시지**: "알 수 없는 사용자 타입입니다."
- **발생 파일**: `/lib/auth/unified.ts`
- **발생 시나리오**: JWT payload의 userType이 'client' 또는 'admin'이 아닌 경우
- **해결 방법**: 토큰 재발급 또는 시스템 점검

#### AUTH_USER_NOT_FOUND
- **HTTP 상태 코드**: 401 Unauthorized
- **에러 메시지**: "인증 토큰이 없습니다."
- **발생 파일**: `/lib/auth/unified.ts`
- **발생 시나리오**: getCurrentUser() 호출 시 쿠키에 토큰이 없는 경우
- **해결 방법**: 로그인 필요

#### AUTH_USER_INFO_FETCH_ERROR
- **HTTP 상태 코드**: 401 Unauthorized
- **에러 메시지**: "사용자 정보 조회 중 오류가 발생했습니다."
- **발생 파일**: `/lib/auth/unified.ts`
- **발생 시나리오**: getCurrentUser() 호출 중 예외 발생
- **해결 방법**: 서버 로그 확인 및 재로그인

### 1.4 사용자 프로필

#### AUTH_PROFILE_NOT_FOUND
- **HTTP 상태 코드**: N/A (내부 에러)
- **에러 메시지**: "사용자 정보를 찾을 수 없습니다."
- **발생 파일**: `/lib/auth/supabase.ts`
- **발생 시나리오**: getUserProfile() 호출 시 users 테이블에 사용자 없음
- **해결 방법**: 사용자 데이터 무결성 점검

#### AUTH_PROFILE_CREATION_ERROR
- **HTTP 상태 코드**: N/A (내부 에러)
- **에러 메시지**: "프로필 생성 중 오류가 발생했습니다."
- **발생 파일**: `/lib/auth/supabase.ts`
- **발생 시나리오**: user_profiles 테이블에 기본 프로필 생성 실패
- **해결 방법**: 데이터베이스 연결 및 권한 확인

#### AUTH_PROFILE_FETCH_ERROR
- **HTTP 상태 코드**: N/A (내부 에러)
- **에러 메시지**: "프로필 조회 중 오류가 발생했습니다."
- **발생 파일**: `/lib/auth/supabase.ts`
- **발생 시나리오**: getUserProfile() 호출 중 예외 발생
- **해결 방법**: 서버 로그 확인 및 데이터베이스 점검

#### AUTH_USER_UPDATE_FAILED
- **HTTP 상태 코드**: N/A (내부 에러)
- **에러 메시지**: "정보 수정에 실패했습니다."
- **발생 파일**: `/lib/auth/supabase.ts`
- **발생 시나리오**: updateUserInfo() 호출 시 users 테이블 업데이트 실패
- **해결 방법**: 입력값 검증 및 데이터베이스 연결 확인

#### AUTH_USER_UPDATE_ERROR
- **HTTP 상태 코드**: N/A (내부 에러)
- **에러 메시지**: "정보 수정 처리 중 오류가 발생했습니다."
- **발생 파일**: `/lib/auth/supabase.ts`
- **발생 시나리오**: updateUserInfo() 호출 중 예외 발생
- **해결 방법**: 서버 로그 확인 및 재시도

### 1.5 인증 상태 확인

#### AUTH_CHECK_USER_MISSING_PHONE
- **HTTP 상태 코드**: 400 Bad Request
- **에러 메시지**: "전화번호를 입력해주세요."
- **발생 파일**: `/app/api/auth/check-user/route.ts`
- **발생 시나리오**: 사용자 존재 여부 확인 시 phone 파라미터 누락
- **해결 방법**: 전화번호 포함하여 요청

### 1.6 개발 환경 전용

#### AUTH_DEV_CODE_NOT_DEVELOPMENT
- **HTTP 상태 코드**: 403 Forbidden
- **에러 메시지**: "This endpoint is only available in development"
- **발생 파일**: `/app/api/auth/dev-code/route.ts`
- **발생 시나리오**: 프로덕션 환경에서 개발용 인증코드 조회 API 호출
- **해결 방법**: 개발 환경에서만 사용

#### AUTH_DEV_CODE_MISSING_PHONE
- **HTTP 상태 코드**: 400 Bad Request
- **에러 메시지**: "Phone number is required"
- **발생 파일**: `/app/api/auth/dev-code/route.ts`
- **발생 시나리오**: 개발용 인증코드 조회 시 phone 파라미터 누락
- **해결 방법**: 전화번호 포함하여 요청

#### AUTH_DEV_CODE_NOT_FOUND
- **HTTP 상태 코드**: 404 Not Found
- **에러 메시지**: "No valid verification code found"
- **발생 파일**: `/app/api/auth/dev-code/route.ts`
- **발생 시나리오**: 유효한 인증코드가 DB에 없는 경우
- **해결 방법**: 먼저 인증코드 발송 API 호출

---

## 2. 예약/주문 관련 에러

### 2.1 예약 생성

#### BOOKING_KNIFE_TYPE_NOT_FOUND
- **HTTP 상태 코드**: N/A (내부 에러)
- **에러 메시지**: "칼 종류를 조회할 수 없습니다."
- **발생 파일**: `/lib/booking-service.ts`
- **발생 시나리오**: createBooking() 시 knife_types 테이블 조회 실패
- **해결 방법**: 데이터베이스 연결 및 knife_types 테이블 확인

#### BOOKING_KNIFE_TYPE_INVALID
- **HTTP 상태 코드**: N/A (throw Error)
- **에러 메시지**: "칼 종류를 찾을 수 없습니다: {knife_type_id}"
- **발생 파일**: `/lib/booking-service.ts`
- **발생 시나리오**: 요청한 knife_type_id가 활성 상태가 아니거나 존재하지 않음
- **해결 방법**: 유효한 칼 종류 ID 사용

#### BOOKING_CREATION_FAILED
- **HTTP 상태 코드**: N/A (throw Error)
- **에러 메시지**: "예약을 생성할 수 없습니다."
- **발생 파일**: `/lib/booking-service.ts`
- **발생 시나리오**: bookings 테이블에 INSERT 실패
- **해결 방법**: 데이터베이스 연결 및 필수 필드 확인

#### BOOKING_ITEMS_CREATION_FAILED
- **HTTP 상태 코드**: N/A (throw Error)
- **에러 메시지**: "예약 항목을 생성할 수 없습니다."
- **발생 파일**: `/lib/booking-service.ts`
- **발생 시나리오**: booking_items 테이블에 INSERT 실패
- **해결 방법**:
  - 데이터베이스 연결 확인
  - 트랜잭션이 자동 롤백되므로 재시도

### 2.2 예약 조회

#### BOOKING_LIST_FETCH_FAILED
- **HTTP 상태 코드**: N/A (throw Error)
- **에러 메시지**: "예약 목록을 불러올 수 없습니다."
- **발생 파일**: `/lib/booking-service.ts`
- **발생 시나리오**: getUserBookings() 호출 시 데이터베이스 조회 실패
- **해결 방법**: 데이터베이스 연결 확인 및 쿼리 점검

#### BOOKING_NOT_FOUND
- **HTTP 상태 코드**: N/A (return null)
- **에러 메시지**: N/A (null 반환)
- **발생 파일**: `/lib/booking-service.ts`
- **발생 시나리오**: getBookingById() 호출 시 해당 예약이 없거나 다른 사용자의 예약
- **해결 방법**: 올바른 booking_id와 user_id 확인

#### BOOKING_FETCH_FAILED
- **HTTP 상태 코드**: N/A (throw Error)
- **에러 메시지**: "예약을 조회할 수 없습니다."
- **발생 파일**: `/lib/booking-service.ts`
- **발생 시나리오**: getBookingById() 호출 시 데이터베이스 에러
- **해결 방법**: 데이터베이스 연결 확인

### 2.3 예약 상태 변경

#### BOOKING_STATUS_UPDATE_FAILED
- **HTTP 상태 코드**: N/A (throw Error)
- **에러 메시지**: "예약 상태를 업데이트할 수 없습니다."
- **발생 파일**: `/lib/booking-service.ts`
- **발생 시나리오**: updateBookingStatus() 호출 시 UPDATE 실패
- **해결 방법**:
  - 예약 존재 여부 확인
  - 사용자 권한 확인
  - 데이터베이스 연결 확인

---

## 3. 결제 관련 에러

### 3.1 결제 생성

#### PAYMENT_CREATION_FAILED
- **HTTP 상태 코드**: N/A (throw Error)
- **에러 메시지**: "결제를 생성할 수 없습니다."
- **발생 파일**: `/lib/payment-service.ts`
- **발생 시나리오**: createPayment() 시 payments 테이블 INSERT 실패
- **해결 방법**:
  - 필수 필드 확인 (booking_id, amount 등)
  - 데이터베이스 연결 확인

### 3.2 결제 조회

#### PAYMENT_LIST_FETCH_FAILED
- **HTTP 상태 코드**: N/A (throw Error)
- **에러 메시지**: "결제 목록을 불러올 수 없습니다."
- **발생 파일**: `/lib/payment-service.ts`
- **발생 시나리오**: getUserPayments() 또는 getPaymentsForAdmin() 호출 시 조회 실패
- **해결 방법**: 데이터베이스 연결 확인

#### PAYMENT_NOT_FOUND
- **HTTP 상태 코드**: N/A (return null)
- **에러 메시지**: N/A (null 반환)
- **발생 파일**: `/lib/payment-service.ts`
- **발생 시나리오**: getPaymentById() 또는 getPaymentByBookingId() 시 결제 정보 없음
- **해결 방법**: 올바른 payment_id 또는 booking_id 확인

#### PAYMENT_FETCH_FAILED
- **HTTP 상태 코드**: N/A (throw Error)
- **에러 메시지**: "결제 정보를 조회할 수 없습니다."
- **발생 파일**: `/lib/payment-service.ts`
- **발생 시나리오**: getPaymentById() 또는 getPaymentByBookingId() 호출 시 데이터베이스 에러
- **해결 방법**: 데이터베이스 연결 확인

### 3.3 결제 상태 변경

#### PAYMENT_STATUS_UPDATE_FAILED
- **HTTP 상태 코드**: N/A (throw Error)
- **에러 메시지**: "결제 상태를 업데이트할 수 없습니다."
- **발생 파일**: `/lib/payment-service.ts`
- **발생 시나리오**: updatePaymentStatus() 호출 시 UPDATE 실패
- **해결 방법**:
  - 결제 존재 여부 확인
  - 사용자 권한 확인
  - 데이터베이스 연결 확인

### 3.4 결제 확인 (관리자)

#### PAYMENT_CONFIRM_NOT_FOUND
- **HTTP 상태 코드**: N/A (throw Error)
- **에러 메시지**: "결제 정보를 찾을 수 없습니다."
- **발생 파일**: `/lib/payment-service.ts`
- **발생 시나리오**: confirmPayment() 호출 시 결제 정보 조회 실패
- **해결 방법**: 올바른 payment_id 확인

#### PAYMENT_CONFIRM_INVALID_ACTION
- **HTTP 상태 코드**: N/A (throw Error)
- **에러 메시지**: "유효하지 않은 액션 타입입니다."
- **발생 파일**: `/lib/payment-service.ts`
- **발생 시나리오**: confirmPayment() 호출 시 action_type이 'confirm', 'reject', 'cancel'이 아닌 경우
- **해결 방법**: 올바른 액션 타입 사용

#### PAYMENT_CONFIRM_UPDATE_FAILED
- **HTTP 상태 코드**: N/A (throw Error)
- **에러 메시지**: "결제 상태를 업데이트할 수 없습니다."
- **발생 파일**: `/lib/payment-service.ts`
- **발생 시나리오**: confirmPayment() 시 payments 테이블 UPDATE 실패
- **해결 방법**: 데이터베이스 연결 및 권한 확인

### 3.5 입금 계좌 조회

#### PAYMENT_BANK_ACCOUNT_FETCH_FAILED
- **HTTP 상태 코드**: N/A (기본값 반환)
- **에러 메시지**: 없음 (fallback to default)
- **발생 파일**: `/lib/payment-service.ts`
- **발생 시나리오**: getActiveBankAccounts() 호출 시 데이터베이스 조회 실패
- **해결 방법**: 기본 계좌 정보 사용 또는 데이터베이스 확인

#### PAYMENT_DEFAULT_BANK_ACCOUNT_NOT_FOUND
- **HTTP 상태 코드**: N/A (throw Error)
- **에러 메시지**: "기본 입금 계좌를 불러올 수 없습니다."
- **발생 파일**: `/lib/payment-service.ts`
- **발생 시나리오**: getDefaultBankAccount() 호출 시 조회 실패 (fallback 없이)
- **해결 방법**: payment_bank_accounts 테이블에 기본 계좌 설정

### 3.6 결제 확인 로그

#### PAYMENT_CONFIRMATION_LOG_FETCH_FAILED
- **HTTP 상태 코드**: N/A (throw Error)
- **에러 메시지**: "결제 확인 로그를 불러올 수 없습니다."
- **발생 파일**: `/lib/payment-service.ts`
- **발생 시나리오**: getPaymentConfirmations() 호출 시 조회 실패
- **해결 방법**: 데이터베이스 연결 확인

---

## 4. 쿠폰 관련 에러

### 4.1 쿠폰 조회

#### COUPON_NOT_FOUND
- **HTTP 상태 코드**: N/A (return null)
- **에러 메시지**: N/A (null 반환)
- **발생 파일**: `/lib/coupon-service.ts`
- **발생 시나리오**: getCoupon() 또는 getCouponByCode() 호출 시 쿠폰 없음
- **해결 방법**: 올바른 coupon_id 또는 coupon_code 확인

#### COUPON_FETCH_FAILED
- **HTTP 상태 코드**: N/A (throw Error)
- **에러 메시지**: "쿠폰을 조회할 수 없습니다."
- **발생 파일**: `/lib/coupon-service.ts`
- **발생 시나리오**: getCoupon() 또는 getCouponByCode() 호출 시 데이터베이스 에러
- **해결 방법**: 데이터베이스 연결 확인

#### COUPON_LIST_FETCH_FAILED
- **HTTP 상태 코드**: N/A (throw Error)
- **에러 메시지**: "쿠폰 목록을 불러올 수 없습니다."
- **발생 파일**: `/lib/coupon-service.ts`
- **발생 시나리오**: getActiveCoupons() 또는 getUserCoupons() 호출 시 조회 실패
- **해결 방법**: 데이터베이스 연결 확인

### 4.2 쿠폰 생성

#### COUPON_CREATION_FAILED
- **HTTP 상태 코드**: N/A (throw Error)
- **에러 메시지**: "쿠폰을 생성할 수 없습니다."
- **발생 파일**: `/lib/coupon-service.ts`
- **발생 시나리오**: createCoupon() 호출 시 coupons 테이블 INSERT 실패
- **해결 방법**:
  - 필수 필드 확인
  - 중복된 coupon_code 확인
  - 데이터베이스 연결 확인

### 4.3 사용자 쿠폰 발급

#### COUPON_ISSUE_FAILED
- **HTTP 상태 코드**: N/A (throw Error)
- **에러 메시지**: "쿠폰을 발급할 수 없습니다."
- **발생 파일**: `/lib/coupon-service.ts`
- **발생 시나리오**: issueCouponToUser() 호출 시 user_coupons 테이블 INSERT 실패
- **해결 방법**:
  - 사용자 존재 여부 확인
  - 쿠폰 존재 여부 확인
  - 데이터베이스 연결 확인

### 4.4 쿠폰 사용

#### COUPON_USE_FAILED
- **HTTP 상태 코드**: N/A (throw Error)
- **에러 메시지**: "쿠폰을 사용할 수 없습니다."
- **발생 파일**: `/lib/coupon-service.ts`
- **발생 시나리오**: useCoupon() 호출 시 user_coupons 테이블 UPDATE 실패
- **해결 방법**:
  - 쿠폰이 이미 사용되었는지 확인
  - 쿠폰 유효기간 확인
  - 데이터베이스 연결 확인

### 4.5 쿠폰 검증

#### COUPON_VALIDATION_NOT_OWNED
- **HTTP 상태 코드**: N/A (내부 응답)
- **에러 메시지**: "보유하지 않은 쿠폰입니다."
- **발생 파일**: `/lib/coupon-service.ts`
- **발생 시나리오**: validateCoupon() 호출 시 사용자가 해당 쿠폰을 보유하지 않음
- **해결 방법**: 올바른 쿠폰 선택

#### COUPON_VALIDATION_ALREADY_USED
- **HTTP 상태 코드**: N/A (내부 응답)
- **에러 메시지**: "이미 사용된 쿠폰입니다."
- **발생 파일**: `/lib/coupon-service.ts`
- **발생 시나리오**: validateCoupon() 호출 시 쿠폰이 이미 사용됨
- **해결 방법**: 다른 쿠폰 선택

#### COUPON_VALIDATION_EXPIRED
- **HTTP 상태 코드**: N/A (내부 응답)
- **에러 메시지**: "쿠폰 사용 기간이 아닙니다."
- **발생 파일**: `/lib/coupon-service.ts`
- **발생 시나리오**: validateCoupon() 호출 시 현재 시간이 쿠폰 유효기간 외
- **해결 방법**: 유효기간 내의 쿠폰 사용

#### COUPON_VALIDATION_MIN_ORDER_AMOUNT
- **HTTP 상태 코드**: N/A (내부 응답)
- **에러 메시지**: "최소 주문 금액 {amount} 이상일 때 사용 가능합니다."
- **발생 파일**: `/lib/coupon-service.ts`
- **발생 시나리오**: validateCoupon() 호출 시 주문 금액이 최소 금액 미달
- **해결 방법**: 주문 금액 증가 또는 다른 쿠폰 사용

#### COUPON_VALIDATION_KNIFE_TYPE_MISMATCH
- **HTTP 상태 코드**: N/A (내부 응답)
- **에러 메시지**: "해당 쿠폰은 특정 칼 종류에만 적용됩니다."
- **발생 파일**: `/lib/coupon-service.ts`
- **발생 시나리오**: validateCoupon() 호출 시 대상 칼 종류 불일치
- **해결 방법**: 쿠폰 적용 가능한 칼 종류 선택

#### COUPON_VALIDATION_ERROR
- **HTTP 상태 코드**: N/A (내부 응답)
- **에러 메시지**: "쿠폰 검증 중 오류가 발생했습니다."
- **발생 파일**: `/lib/coupon-service.ts`
- **발생 시나리오**: validateCoupon() 호출 중 예외 발생
- **해결 방법**: 서버 로그 확인 및 재시도

---

## 5. 관리자 API 에러

### 5.1 주문 관리 (Admin Orders)

#### ADMIN_ORDER_FETCH_FAILED
- **HTTP 상태 코드**: 500 Internal Server Error
- **에러 메시지**: error.message (Supabase 에러 메시지)
- **발생 파일**: `/app/api/admin/orders/route.ts`
- **발생 시나리오**: GET 요청 시 데이터베이스 조회 실패
- **해결 방법**: 데이터베이스 연결 및 쿼리 점검

#### ADMIN_ORDER_CREATION_FAILED
- **HTTP 상태 코드**: 500 Internal Server Error
- **에러 메시지**: error.message (Supabase 에러 메시지)
- **발생 파일**: `/app/api/admin/orders/route.ts`
- **발생 시나리오**: POST 요청 시 주문 생성 실패
- **해결 방법**:
  - 필수 필드 확인
  - items 배열 유효성 검증
  - 데이터베이스 연결 확인

#### ADMIN_ORDER_UPDATE_MISSING_ID
- **HTTP 상태 코드**: 400 Bad Request
- **에러 메시지**: "Order ID is required"
- **발생 파일**: `/app/api/admin/orders/route.ts`
- **발생 시나리오**: PUT 요청 시 id 필드 누락
- **해결 방법**: 주문 ID 포함하여 요청

#### ADMIN_ORDER_UPDATE_FAILED
- **HTTP 상태 코드**: 500 Internal Server Error
- **에러 메시지**: error.message (Supabase 에러 메시지)
- **발생 파일**: `/app/api/admin/orders/route.ts`
- **발생 시나리오**: PUT 요청 시 주문 업데이트 실패
- **해결 방법**: 주문 존재 여부 및 필드 유효성 확인

#### ADMIN_ORDER_STATUS_MISSING_FIELDS
- **HTTP 상태 코드**: 400 Bad Request
- **에러 메시지**: "Order ID and status are required"
- **발생 파일**: `/app/api/admin/orders/route.ts`
- **발생 시나리오**: PATCH 요청 시 id 또는 status 누락
- **해결 방법**: 필수 필드 포함하여 요청

#### ADMIN_ORDER_STATUS_INVALID
- **HTTP 상태 코드**: 400 Bad Request
- **에러 메시지**: "Invalid status"
- **발생 파일**: `/app/api/admin/orders/route.ts`
- **발생 시나리오**: PATCH 요청 시 유효하지 않은 status 값
- **해결 방법**: 'pending', 'confirmed', 'completed', 'cancelled' 중 하나 사용

#### ADMIN_ORDER_STATUS_UPDATE_FAILED
- **HTTP 상태 코드**: 500 Internal Server Error
- **에러 메시지**: error.message (Supabase 에러 메시지)
- **발생 파일**: `/app/api/admin/orders/route.ts`
- **발생 시나리오**: PATCH 요청 시 상태 업데이트 실패
- **해결 방법**: 주문 존재 여부 확인

### 5.2 쿠폰 관리 (Admin Coupons)

#### ADMIN_COUPON_FETCH_FAILED
- **HTTP 상태 코드**: 500 Internal Server Error
- **에러 메시지**: error.message (Supabase 에러 메시지)
- **발생 파일**: `/app/api/admin/coupons/route.ts`
- **발생 시나리오**: GET 요청 시 쿠폰 목록 조회 실패
- **해결 방법**: 데이터베이스 연결 확인

#### ADMIN_COUPON_USER_NOT_FOUND
- **HTTP 상태 코드**: 404 Not Found
- **에러 메시지**: "User not found"
- **발생 파일**: `/app/api/admin/coupons/route.ts`
- **발생 시나리오**: POST 요청 시 userPhone으로 사용자 조회 실패
- **해결 방법**: 올바른 전화번호 확인 또는 사용자 생성

#### ADMIN_COUPON_TYPE_NOT_FOUND
- **HTTP 상태 코드**: 404 Not Found
- **에러 메시지**: "Coupon type not found"
- **발생 파일**: `/app/api/admin/coupons/route.ts`
- **발생 시나리오**: POST 요청 시 couponTypeId로 쿠폰 타입 조회 실패
- **해결 방법**: 올바른 쿠폰 타입 ID 사용

#### ADMIN_COUPON_CREATION_FAILED
- **HTTP 상태 코드**: 500 Internal Server Error
- **에러 메시지**: error.message (Supabase 에러 메시지)
- **발생 파일**: `/app/api/admin/coupons/route.ts`
- **발생 시나리오**: POST 요청 시 쿠폰 생성 실패
- **해결 방법**: 필수 필드 및 데이터베이스 연결 확인

#### ADMIN_COUPON_DELETE_MISSING_ID
- **HTTP 상태 코드**: 400 Bad Request
- **에러 메시지**: "Coupon ID is required"
- **발생 파일**: `/app/api/admin/coupons/route.ts`
- **발생 시나리오**: DELETE 요청 시 id 파라미터 누락
- **해결 방법**: 쿠폰 ID 포함하여 요청

#### ADMIN_COUPON_DELETE_FAILED
- **HTTP 상태 코드**: 500 Internal Server Error
- **에러 메시지**: error.message (Supabase 에러 메시지)
- **발생 파일**: `/app/api/admin/coupons/route.ts`
- **발생 시나리오**: DELETE 요청 시 쿠폰 삭제 실패
- **해결 방법**: 쿠폰 존재 여부 및 권한 확인

### 5.3 상품 관리 (Admin Products)

#### ADMIN_PRODUCT_FETCH_FAILED
- **HTTP 상태 코드**: 500 Internal Server Error
- **에러 메시지**: error.message (Supabase 에러 메시지)
- **발생 파일**: `/app/api/admin/products/route.ts`
- **발생 시나리오**: GET 요청 시 상품 목록 조회 실패
- **해결 방법**: 데이터베이스 연결 확인

#### ADMIN_PRODUCT_CREATION_FAILED
- **HTTP 상태 코드**: 500 Internal Server Error
- **에러 메시지**: error.message (Supabase 에러 메시지)
- **발생 파일**: `/app/api/admin/products/route.ts`
- **발생 시나리오**: POST 요청 시 상품 생성 실패
- **해결 방법**: 필수 필드 및 데이터베이스 연결 확인

#### ADMIN_PRODUCT_UPDATE_MISSING_ID
- **HTTP 상태 코드**: 400 Bad Request
- **에러 메시지**: "Product ID is required"
- **발생 파일**: `/app/api/admin/products/route.ts`
- **발생 시나리오**: PUT 요청 시 id 필드 누락
- **해결 방법**: 상품 ID 포함하여 요청

#### ADMIN_PRODUCT_UPDATE_FAILED
- **HTTP 상태 코드**: 500 Internal Server Error
- **에러 메시지**: error.message (Supabase 에러 메시지)
- **발생 파일**: `/app/api/admin/products/route.ts`
- **발생 시나리오**: PUT 요청 시 상품 업데이트 실패
- **해결 방법**: 상품 존재 여부 및 필드 유효성 확인

#### ADMIN_PRODUCT_DELETE_MISSING_ID
- **HTTP 상태 코드**: 400 Bad Request
- **에러 메시지**: "Product ID is required"
- **발생 파일**: `/app/api/admin/products/route.ts`
- **발생 시나리오**: DELETE 요청 시 id 파라미터 누락
- **해결 방법**: 상품 ID 포함하여 요청

#### ADMIN_PRODUCT_DELETE_FAILED
- **HTTP 상태 코드**: 500 Internal Server Error
- **에러 메시지**: error.message (Supabase 에러 메시지)
- **발생 파일**: `/app/api/admin/products/route.ts`
- **발생 시나리오**: DELETE 요청 시 상품 삭제 실패
- **해결 방법**: 상품 존재 여부 및 관련 데이터 확인

### 5.4 배너 관리 (Admin Banners)

#### ADMIN_BANNER_FETCH_FAILED
- **HTTP 상태 코드**: 500 Internal Server Error
- **에러 메시지**: error.message (Supabase 에러 메시지)
- **발생 파일**: `/app/api/admin/banners/route.ts`
- **발생 시나리오**: GET 요청 시 배너 목록 조회 실패
- **해결 방법**: 데이터베이스 연결 확인

#### ADMIN_BANNER_CREATION_FAILED
- **HTTP 상태 코드**: 500 Internal Server Error
- **에러 메시지**: error.message (Supabase 에러 메시지)
- **발생 파일**: `/app/api/admin/banners/route.ts`
- **발생 시나리오**: POST 요청 시 배너 생성 실패
- **해결 방법**: 필수 필드 및 데이터베이스 연결 확인

#### ADMIN_BANNER_UPDATE_MISSING_ID
- **HTTP 상태 코드**: 400 Bad Request
- **에러 메시지**: "Banner ID is required"
- **발생 파일**: `/app/api/admin/banners/route.ts`
- **발생 시나리오**: PUT 요청 시 id 필드 누락
- **해결 방법**: 배너 ID 포함하여 요청

#### ADMIN_BANNER_UPDATE_FAILED
- **HTTP 상태 코드**: 500 Internal Server Error
- **에러 메시지**: error.message (Supabase 에러 메시지)
- **발생 파일**: `/app/api/admin/banners/route.ts`
- **발생 시나리오**: PUT 요청 시 배너 업데이트 실패
- **해결 방법**: 배너 존재 여부 및 필드 유효성 확인

#### ADMIN_BANNER_DELETE_MISSING_ID
- **HTTP 상태 코드**: 400 Bad Request
- **에러 메시지**: "Banner ID is required"
- **발생 파일**: `/app/api/admin/banners/route.ts`
- **발생 시나리오**: DELETE 요청 시 id 파라미터 누락
- **해결 방법**: 배너 ID 포함하여 요청

#### ADMIN_BANNER_DELETE_FAILED
- **HTTP 상태 코드**: 500 Internal Server Error
- **에러 메시지**: error.message (Supabase 에러 메시지)
- **발생 파일**: `/app/api/admin/banners/route.ts`
- **발생 시나리오**: DELETE 요청 시 배너 삭제 실패
- **해결 방법**: 배너 존재 여부 확인

---

## 6. 서버 에러

### 6.1 API 공통 에러

#### SERVER_INTERNAL_ERROR
- **HTTP 상태 코드**: 500 Internal Server Error
- **에러 메시지**: "서버 오류가 발생했습니다."
- **발생 파일**:
  - `/app/api/auth/client/login/route.ts`
  - `/app/api/auth/client/signup/route.ts`
  - `/app/api/auth/admin/login/route.ts`
  - `/app/api/auth/me/route.ts`
  - `/app/api/auth/verify/route.ts`
  - `/app/api/auth/logout/route.ts`
  - `/app/api/auth/check-user/route.ts`
- **발생 시나리오**: try-catch 블록에서 예외가 발생한 경우
- **해결 방법**:
  - 서버 로그 확인
  - 데이터베이스 연결 확인
  - 요청 파라미터 검증

#### SERVER_DEV_INTERNAL_ERROR
- **HTTP 상태 코드**: 500 Internal Server Error
- **에러 메시지**: "Internal server error"
- **발생 파일**: `/app/api/auth/dev-code/route.ts`
- **발생 시나리오**: 개발용 인증코드 조회 API에서 예외 발생
- **해결 방법**: 서버 로그 확인 및 데이터베이스 연결 확인

### 6.2 알림 관련 에러

#### NOTIFICATION_CREATION_FAILED
- **HTTP 상태 코드**: N/A (로그만 기록)
- **에러 메시지**: 없음 (에러 로그만 출력)
- **발생 파일**: `/lib/booking-service.ts`
- **발생 시나리오**: createBookingNotification() 호출 시 notifications 테이블 INSERT 실패
- **해결 방법**:
  - 알림 생성 실패는 예약 프로세스를 막지 않음
  - 데이터베이스 로그 확인
  - notifications 테이블 구조 점검

---

## 에러 처리 모범 사례

### 1. 클라이언트 측 에러 처리

```typescript
try {
  const result = await fetch('/api/auth/client/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, verificationCode })
  })

  const data = await result.json()

  if (!data.success) {
    // 사용자에게 친절한 에러 메시지 표시
    alert(data.error)
    return
  }

  // 성공 처리
} catch (error) {
  // 네트워크 에러 등
  alert('네트워크 오류가 발생했습니다.')
}
```

### 2. 서버 측 에러 로깅

모든 에러는 console.error로 로깅되며, 프로덕션 환경에서는 로깅 서비스(Sentry, LogRocket 등)로 수집하는 것을 권장합니다.

### 3. 에러 응답 형식

API 응답은 항상 다음 형식을 따릅니다:

```typescript
// 성공
{
  success: true,
  data?: any,
  user?: any
}

// 실패
{
  success: false,
  error: string
}
```

### 4. 데이터베이스 에러 처리

Supabase 에러는 다음과 같이 처리합니다:

- **PGRST116**: 데이터 없음 (404 처리 또는 null 반환)
- 기타 에러: 로그 출력 후 일반적인 에러 메시지 반환

---

## 향후 개선 사항

1. **에러 코드 표준화**: 현재는 에러 메시지만 반환하지만, 향후 고유한 에러 코드(예: AUTH_001) 추가 고려
2. **다국어 지원**: 에러 메시지 다국어 처리
3. **세분화된 에러**: 더 구체적인 에러 메시지로 디버깅 효율성 향상
4. **재시도 로직**: 네트워크 오류 등 일시적인 에러에 대한 자동 재시도 구현
5. **에러 모니터링**: Sentry, LogRocket 등 에러 추적 도구 통합

---

**문서 버전**: 1.0
**최종 수정일**: 2025-10-01
**작성자**: Claude Code
