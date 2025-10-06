# 칼가는곳 알림 시스템 명세서

## 📋 목차
1. [현재 구현 상태](#현재-구현-상태)
2. [알림 라이프사이클](#알림-라이프사이클)
3. [구현 필요 알림](#구현-필요-알림)
4. [구현 우선순위](#구현-우선순위)
5. [기술 스택](#기술-스택)
6. [데이터베이스 구조](#데이터베이스-구조)

---

## 현재 구현 상태

### ✅ 구현 완료
- **알림 조회 기능**
  - 전체 알림 조회
  - 읽지 않은 알림 조회
  - 읽지 않은 알림 개수 조회

- **알림 관리 기능**
  - 개별 알림 읽음 처리
  - 전체 알림 읽음 처리
  - 알림 삭제

- **자동 발송 알림**
  - ✅ **신청 접수**: 칼갈이 신청 완료 시 자동 발송
    - 위치: `lib/booking-service.ts:139`
    - 타입: `booking`
    - 제목: "예약이 접수되었습니다!"

### ❌ 미구현
- 주문 상태 변경 시 자동 알림 (9개)
- 쿠폰 발급 알림
- 프로모션/이벤트 알림
- 예약 알림 (결제 마감 임박, 리뷰 작성 요청 등)

---

## 알림 라이프사이클

### 주문 상태별 알림 흐름

```
[사용자 신청]
    ↓
✅ 1. 신청 접수 알림 (pending)
    "예약이 접수되었습니다!"

    ↓ [관리자: 입금 확인 요청]

❌ 2. 결제 대기 알림 (payment_pending)
    "입금 확인이 필요합니다"
    입금 계좌, 입금자명, 마감시간 안내

    ↓ [사용자: 입금 완료]
    ↓ [관리자: 입금 확인 → confirmed]

❌ 3. 예약 확정 알림 (confirmed)
    "예약이 확정되었습니다!"
    입금 확인, 방문 예정 일시 안내

    ↓ [예약 당일 또는 전날]

❌ 4. 수거 예정 알림 (confirmed)
    "오늘 칼 수거 예정입니다"
    방문 예정 시간 안내

    ↓ [관리자: 칼 수거 완료 → in_progress]

❌ 5. 연마 시작 알림 (in_progress)
    "연마 작업이 시작되었습니다!"
    작업 예상 소요 시간 안내

    ↓ [1-2일 작업]

❌ 6. 연마 완료 알림 (in_progress)
    "연마 작업이 완료되었습니다!"
    배송 준비 안내

    ↓ [관리자: 배송 시작 → shipping]

❌ 7. 배송 시작 알림 (shipping)
    "칼이 배송중입니다!"
    배송 예상 도착 시간 안내

    ↓ [배송 중]
    ↓ [관리자: 배송 완료 → completed]

❌ 8. 배송 완료 알림 (completed)
    "배송이 완료되었습니다!"
    서비스 완료, 리뷰 작성 유도

    ↓ [1일 후 자동]

❌ 13. 리뷰 작성 요청 (completed + 1일)
    "서비스는 어떠셨나요?"
    리뷰 작성 링크, 쿠폰 제공
```

### 예외 상황 알림

```
[어느 시점에서든]
    ↓ [관리자: 취소 → cancelled]

❌ 9. 주문 취소 알림 (cancelled)
    "주문이 취소되었습니다"
    취소 사유, 환불 정보 안내
```

---

## 구현 필요 알림

### 📋 주문 상태 변경 알림 (우선순위: 높음)

#### 1. 신청 접수 (pending)
- **현재 상태**: ✅ 구현 완료
- **발송 시점**: 사용자가 칼갈이 신청 완료 시
- **발송 위치**: `lib/booking-service.ts:139`
- **타입**: `booking`
- **제목**: "예약이 접수되었습니다!"
- **내용**: "칼갈이 예약이 정상적으로 접수되었습니다. 빠른 시일 내에 연락드리겠습니다."

#### 2. 결제 대기 (payment_pending)
- **현재 상태**: ❌ 미구현
- **발송 시점**: 관리자가 입금 확인 요청 시
- **발송 위치**: `app/api/admin/orders/route.ts` PATCH 메서드
- **타입**: `booking`
- **제목**: "입금 확인이 필요합니다"
- **내용**:
  ```
  입금 정보
  - 은행: {bank_name}
  - 계좌번호: {account_number}
  - 예금주: {account_holder}
  - 입금액: {amount}원
  - 입금자명: {customer_name}
  - 입금 마감: {deadline}
  ```
- **포함 정보**: `bank_account`, `deposit_deadline`

#### 3. 예약 확정 (confirmed)
- **현재 상태**: ❌ 미구현
- **발송 시점**: 관리자가 입금 확인 후 예약 확정 시
- **발송 위치**: `app/api/admin/orders/route.ts` PATCH 메서드
- **타입**: `booking`
- **제목**: "예약이 확정되었습니다!"
- **내용**: "입금이 확인되었습니다. {booking_date} {booking_time}에 방문 예정입니다."
- **포함 정보**: `booking_date`, `booking_time`, `service_address`

#### 4. 수거 예정 (confirmed - 예약 당일/전날)
- **현재 상태**: ❌ 미구현
- **발송 시점**: 예약 당일 오전 또는 전날 저녁 (자동 예약 발송)
- **발송 방식**: 크론잡 또는 스케줄러
- **타입**: `booking`
- **제목**: "오늘 칼 수거 예정입니다"
- **내용**: "오늘 {booking_time}경 방문하여 칼을 수거할 예정입니다."
- **포함 정보**: `booking_time`, `service_address`

#### 5. 연마 시작 (in_progress)
- **현재 상태**: ❌ 미구현
- **발송 시점**: 관리자가 연마 작업 시작으로 상태 변경 시
- **발송 위치**: `app/api/admin/orders/route.ts` PATCH 메서드
- **타입**: `booking`
- **제목**: "연마 작업이 시작되었습니다!"
- **내용**: "전문 장인이 칼 연마 작업을 시작했습니다. 완료까지 1-2일 소요됩니다."
- **포함 정보**: `estimated_completion_time`

#### 6. 연마 완료 (in_progress → shipping 전)
- **현재 상태**: ❌ 미구현
- **발송 시점**: 관리자가 수동으로 발송 (선택적)
- **발송 위치**: 관리자 페이지에서 수동 발송 버튼
- **타입**: `booking`
- **제목**: "연마 작업이 완료되었습니다!"
- **내용**: "칼 연마가 완료되었습니다. 곧 안전하게 배송해드리겠습니다."

#### 7. 배송 시작 (shipping)
- **현재 상태**: ❌ 미구현 (템플릿만 존재)
- **발송 시점**: 관리자가 배송 시작으로 상태 변경 시
- **발송 위치**: `app/api/admin/orders/route.ts` PATCH 메서드
- **타입**: `delivery`
- **제목**: "칼이 배송중입니다!"
- **내용**: "연마완료! 안전하게 배송중이예요!"
- **포함 정보**: `estimated_delivery_time`

#### 8. 배송 완료 (completed)
- **현재 상태**: ❌ 미구현
- **발송 시점**: 관리자가 배송 완료로 상태 변경 시
- **발송 위치**: `app/api/admin/orders/route.ts` PATCH 메서드
- **타입**: `booking`
- **제목**: "배송이 완료되었습니다!"
- **내용**: "칼갈이 서비스가 완료되었습니다. 이용해 주셔서 감사합니다! 🙏"
- **추가 액션**: 리뷰 작성 링크 포함

#### 9. 주문 취소 (cancelled)
- **현재 상태**: ❌ 미구현
- **발송 시점**: 관리자가 주문 취소 시
- **발송 위치**: `app/api/admin/orders/route.ts` PATCH 메서드
- **타입**: `booking`
- **제목**: "주문이 취소되었습니다"
- **내용**:
  ```
  주문이 취소되었습니다.
  사유: {cancellation_reason}

  입금하신 경우 영업일 기준 3-5일 내 환불됩니다.
  문의사항은 고객센터로 연락주세요.
  ```
- **포함 정보**: `cancellation_reason`, `refund_info`

---

### 🎁 부가 알림 (우선순위: 중간)

#### 10. 쿠폰 발급
- **현재 상태**: ❌ 미구현
- **발송 시점**: 관리자가 쿠폰 발급 시
- **발송 위치**: `app/api/admin/coupons/route.ts` POST 메서드
- **타입**: `promotion`
- **제목**: "새로운 쿠폰이 발급되었습니다!"
- **내용**: "{coupon_name}이 발급되었습니다. 마이페이지에서 확인하세요."
- **포함 정보**: `coupon_id`, `coupon_name`, `discount_info`, `expires_at`

#### 11. 프로모션/이벤트
- **현재 상태**: ❌ 미구현
- **발송 시점**: 관리자가 프로모션 발송 시
- **발송 방식**: 관리자 페이지에서 대상 선택 후 일괄 발송
- **타입**: `promotion`
- **제목**: 관리자 입력
- **내용**: 관리자 입력
- **포함 정보**: `promotion_url`, `event_image`

#### 12. 결제 마감 임박
- **현재 상태**: ❌ 미구현
- **발송 시점**: 입금 마감 2시간 전 (자동)
- **발송 방식**: 크론잡 또는 스케줄러
- **타입**: `booking`
- **제목**: "입금 마감이 곧 종료됩니다"
- **내용**: "{remaining_time} 후 입금 마감됩니다. 서둘러 입금해주세요!"
- **포함 정보**: `deposit_deadline`, `remaining_time`

#### 13. 리뷰 작성 요청
- **현재 상태**: ❌ 미구현
- **발송 시점**: 배송 완료 1일 후 (자동)
- **발송 방식**: 크론잡 또는 스케줄러
- **타입**: `general`
- **제목**: "서비스는 어떠셨나요?"
- **내용**: "소중한 후기를 남겨주세요. 1,000원 할인 쿠폰을 드립니다!"
- **포함 정보**: `review_url`, `incentive_coupon`

---

## 구현 우선순위

### Phase 1: 필수 알림 (즉시 구현)
**목표**: 주문 상태 변경에 따른 기본 알림 제공

1. ✅ **예약 확정** (confirmed)
   - 구현 위치: `app/api/admin/orders/route.ts` PATCH
   - 이유: 사용자가 입금 확인을 기다리는 가장 중요한 알림

2. ✅ **연마 시작** (in_progress)
   - 구현 위치: `app/api/admin/orders/route.ts` PATCH
   - 이유: 작업 진행 상황을 투명하게 전달

3. ✅ **배송 시작** (shipping)
   - 구현 위치: `app/api/admin/orders/route.ts` PATCH
   - 이유: 배송 추적 및 수령 준비

4. ✅ **배송 완료** (completed)
   - 구현 위치: `app/api/admin/orders/route.ts` PATCH
   - 이유: 서비스 완료 확인

5. ✅ **주문 취소** (cancelled)
   - 구현 위치: `app/api/admin/orders/route.ts` PATCH
   - 이유: 취소 사실 및 환불 안내

**예상 작업 시간**: 2-3시간

---

### Phase 2: 중요 알림 (1주 내 구현)
**목표**: 결제 및 고객 관리 강화

6. ⭐ **결제 대기** (payment_pending)
   - 구현 위치: `app/api/admin/orders/route.ts` PATCH
   - 이유: 입금 독려 및 마감 시간 안내

7. ⭐ **쿠폰 발급**
   - 구현 위치: `app/api/admin/coupons/route.ts` POST
   - 이유: 마케팅 및 고객 리텐션

8. ⭐ **결제 마감 임박** (자동)
   - 구현 방식: 크론잡/스케줄러
   - 이유: 결제율 향상

**예상 작업 시간**: 3-4시간

---

### Phase 3: 선택 알림 (2주 내 구현)
**목표**: UX 개선 및 서비스 품질 향상

9. 📌 **수거 예정** (자동)
   - 구현 방식: 크론잡/스케줄러
   - 이유: 고객 준비 시간 확보

10. 📌 **연마 완료**
    - 구현 위치: 관리자 수동 발송
    - 이유: 작업 진행도 투명성

11. 📌 **프로모션/이벤트**
    - 구현 위치: 관리자 페이지 일괄 발송
    - 이유: 마케팅 활용

12. 📌 **리뷰 작성 요청** (자동)
    - 구현 방식: 크론잡/스케줄러
    - 이유: 리뷰 수집 및 쿠폰 제공

**예상 작업 시간**: 4-6시간

---

## 기술 스택

### 사용 중인 기술
- **프론트엔드**: Next.js 15, React, TypeScript
- **데이터베이스**: Supabase (PostgreSQL)
- **알림 관리**: `lib/notification-service.ts`
- **상태 관리**: React Query (TanStack Query)

### 구현 방법

#### 1. 즉시 발송 알림 (Phase 1, 2)
```typescript
// app/api/admin/orders/route.ts - PATCH 메서드

export async function PATCH(request: NextRequest) {
  const { id, status, ...data } = await request.json();

  // 1. 주문 상태 업데이트
  const { data: booking } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select('*, user:users(*)')
    .single();

  // 2. 상태별 알림 발송
  await sendStatusChangeNotification(booking, status);

  return NextResponse.json({ success: true, data: booking });
}

async function sendStatusChangeNotification(booking: any, newStatus: string) {
  const notificationMap = {
    'confirmed': {
      title: '예약이 확정되었습니다!',
      message: `입금이 확인되었습니다. ${booking.booking_date} ${booking.booking_time}에 방문 예정입니다.`,
      type: 'booking'
    },
    'in_progress': {
      title: '연마 작업이 시작되었습니다!',
      message: '전문 장인이 칼 연마 작업을 시작했습니다. 완료까지 1-2일 소요됩니다.',
      type: 'booking'
    },
    'shipping': {
      title: '칼이 배송중입니다!',
      message: '연마완료! 안전하게 배송중이예요!',
      type: 'delivery'
    },
    'completed': {
      title: '배송이 완료되었습니다!',
      message: '칼갈이 서비스가 완료되었습니다. 이용해 주셔서 감사합니다! 🙏',
      type: 'booking'
    },
    'cancelled': {
      title: '주문이 취소되었습니다',
      message: '주문이 취소되었습니다. 문의사항은 고객센터로 연락주세요.',
      type: 'booking'
    }
  };

  const notification = notificationMap[newStatus];
  if (notification && booking.user_id) {
    await supabase.from('notifications').insert({
      user_id: booking.user_id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      related_booking_id: booking.id,
      is_read: false
    });
  }
}
```

#### 2. 예약 발송 알림 (Phase 3)
```typescript
// 크론잡 또는 Supabase Edge Function

// 매일 오전 8시 실행
async function sendScheduledNotifications() {
  // 오늘 수거 예정인 예약 조회
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, user:users(*)')
    .eq('booking_date', today)
    .eq('status', 'confirmed');

  // 수거 예정 알림 발송
  for (const booking of bookings) {
    await supabase.from('notifications').insert({
      user_id: booking.user_id,
      title: '오늘 칼 수거 예정입니다',
      message: `오늘 ${booking.booking_time}경 방문하여 칼을 수거할 예정입니다.`,
      type: 'booking',
      related_booking_id: booking.id,
      is_read: false
    });
  }
}
```

#### 3. 쿠폰 발급 알림 (Phase 2)
```typescript
// app/api/admin/coupons/route.ts - POST 메서드

export async function POST(request: NextRequest) {
  const { userPhone, couponTypeId, issueReason } = await request.json();

  // 1. 쿠폰 발급
  const coupon = await issueCoupon(...);

  // 2. 알림 발송
  await supabase.from('notifications').insert({
    user_id: coupon.user_id,
    title: '새로운 쿠폰이 발급되었습니다!',
    message: `${coupon.coupon_type.name}이 발급되었습니다. 마이페이지에서 확인하세요.`,
    type: 'promotion',
    is_read: false
  });

  return NextResponse.json({ success: true, data: coupon });
}
```

---

## 데이터베이스 구조

### notifications 테이블
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'general' CHECK (type IN ('booking', 'delivery', 'promotion', 'general')),
  is_read BOOLEAN DEFAULT false,
  related_booking_id UUID REFERENCES bookings(id),
  estimated_delivery_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 인덱스
```sql
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

---

## 관리자 기능 추가 필요

### 1. 알림 발송 이력
- **위치**: `/admin/notifications` (신규 페이지)
- **기능**:
  - 전체 발송 알림 조회
  - 사용자별 알림 조회
  - 알림 타입별 필터링
  - 발송 성공/실패 확인

### 2. 수동 알림 발송
- **위치**: `/admin/notifications/send` (신규 페이지)
- **기능**:
  - 대상 선택 (전체/특정 사용자/그룹)
  - 알림 타입 선택
  - 제목/내용 입력
  - 즉시 발송 또는 예약 발송

### 3. 알림 템플릿 관리
- **위치**: `/admin/notifications/templates` (신규 페이지)
- **기능**:
  - 기본 템플릿 조회
  - 템플릿 수정
  - 변수 관리 ({name}, {date} 등)

---

## 주의사항

1. **알림 중복 발송 방지**
   - 동일 booking_id + 동일 타입은 1회만 발송
   - 발송 이력 테이블 또는 플래그로 관리

2. **사용자 알림 설정 존중**
   - `notification_settings` 테이블 확인
   - 알림 수신 거부한 사용자는 제외

3. **성능 고려**
   - 대량 발송 시 배치 처리
   - 큐 시스템 도입 고려 (Bull, BullMQ 등)

4. **테스트**
   - 각 상태 변경 시나리오 테스트
   - 알림 발송 실패 시 에러 핸들링
   - 롤백 전략 수립

---

## 참고 파일

### 핵심 파일
- `lib/notification-service.ts` - 알림 서비스 로직
- `lib/booking-service.ts` - 예약 서비스 (신청 접수 알림)
- `app/client/notifications/page.tsx` - 알림 페이지 UI
- `hooks/queries/use-notification.ts` - React Query 훅

### 수정 필요 파일
- `app/api/admin/orders/route.ts` - 주문 상태 변경 API
- `app/api/admin/coupons/route.ts` - 쿠폰 발급 API

### 신규 생성 필요 파일
- `app/admin/notifications/page.tsx` - 관리자 알림 관리 페이지
- `app/admin/notifications/send/page.tsx` - 수동 알림 발송 페이지
- `app/api/admin/notifications/route.ts` - 관리자 알림 API

---

**작성일**: 2025-01-10
**최종 수정일**: 2025-01-10
**작성자**: Claude Code
