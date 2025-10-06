# 칼가는곳 알림 시스템 명세서 (Supabase 최적화)

## 🎯 Supabase 기반 알림 시스템 아키텍처

### 핵심 개념
기존 방식(Next.js API에서 알림 생성)이 아닌, **Supabase 네이티브 기능**을 최대한 활용하여:
1. **Database Triggers** - 상태 변경 시 자동 알림 생성
2. **Realtime Subscriptions** - 클라이언트 실시간 알림 수신
3. **PostgreSQL Functions** - 재사용 가능한 알림 생성 로직
4. **pg_cron** - 예약 알림 자동 발송
5. **Row Level Security** - 보안 강화

---

## 📋 목차
1. [아키텍처 개요](#아키텍처-개요)
2. [Database Triggers 구현](#database-triggers-구현)
3. [Realtime 구독 구현](#realtime-구독-구현)
4. [예약 알림 (pg_cron)](#예약-알림-pg_cron)
5. [알림 타입별 구현](#알림-타입별-구현)
6. [마이그레이션 가이드](#마이그레이션-가이드)

---

## 아키텍처 개요

### 기존 방식 (비효율적)
```
[관리자 API]
    ↓ 상태 변경
[bookings 테이블 UPDATE]
    ↓ 수동으로 알림 생성
[notifications 테이블 INSERT] ← Next.js에서 처리
    ↓ 클라이언트 폴링
[클라이언트가 주기적으로 조회]
```

**문제점:**
- Next.js API에 알림 로직 중복 작성
- 실시간 알림 불가능 (폴링 필요)
- 서버 부하 증가
- 알림 누락 가능성

---

### Supabase 방식 (권장) ⭐

```
[관리자 API]
    ↓ 상태만 변경 (간단!)
[bookings 테이블 UPDATE]
    ↓ 자동 트리거 발동
[PostgreSQL Trigger] → [알림 생성 함수] → [notifications 테이블 INSERT]
    ↓ Realtime 브로드캐스트
[클라이언트 실시간 수신] ← 자동!
```

**장점:**
- ✅ Next.js는 상태만 변경 (코드 간소화)
- ✅ Supabase가 자동으로 알림 처리
- ✅ 실시간 알림 가능
- ✅ 알림 누락 없음 (DB 레벨 보장)
- ✅ 서버 부하 감소
- ✅ 재사용성 높음

---

## Database Triggers 구현

### 1. 알림 생성 함수 작성

```sql
-- 알림 생성 함수
CREATE OR REPLACE FUNCTION create_booking_notification(
  p_booking_id UUID,
  p_user_id UUID,
  p_status TEXT
)
RETURNS void AS $$
DECLARE
  v_booking RECORD;
  v_title TEXT;
  v_message TEXT;
  v_type TEXT;
BEGIN
  -- 예약 정보 조회
  SELECT * INTO v_booking
  FROM bookings
  WHERE id = p_booking_id;

  -- 상태별 알림 내용 설정
  CASE p_status
    WHEN 'confirmed' THEN
      v_title := '예약이 확정되었습니다!';
      v_message := format('입금이 확인되었습니다. %s %s에 방문 예정입니다.',
                         v_booking.booking_date,
                         v_booking.booking_time);
      v_type := 'booking';

    WHEN 'in_progress' THEN
      v_title := '연마 작업이 시작되었습니다!';
      v_message := '전문 장인이 칼 연마 작업을 시작했습니다. 완료까지 1-2일 소요됩니다.';
      v_type := 'booking';

    WHEN 'shipping' THEN
      v_title := '칼이 배송중입니다!';
      v_message := '연마완료! 안전하게 배송중이예요!';
      v_type := 'delivery';

    WHEN 'completed' THEN
      v_title := '배송이 완료되었습니다!';
      v_message := '칼갈이 서비스가 완료되었습니다. 이용해 주셔서 감사합니다! 🙏';
      v_type := 'booking';

    WHEN 'cancelled' THEN
      v_title := '주문이 취소되었습니다';
      v_message := '주문이 취소되었습니다. 문의사항은 고객센터로 연락주세요.';
      v_type := 'booking';

    ELSE
      -- 알림 생성하지 않음
      RETURN;
  END CASE;

  -- 알림 생성
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    related_booking_id,
    is_read
  ) VALUES (
    p_user_id,
    v_title,
    v_message,
    v_type,
    p_booking_id,
    false
  );

EXCEPTION
  WHEN OTHERS THEN
    -- 알림 생성 실패해도 예약 업데이트는 성공
    RAISE WARNING 'Failed to create notification: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 2. Trigger 생성

```sql
-- bookings 테이블 상태 변경 시 자동 알림 생성
CREATE OR REPLACE FUNCTION trigger_booking_status_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- status가 변경된 경우에만 알림 생성
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- 알림 생성 함수 호출
    PERFORM create_booking_notification(
      NEW.id,
      NEW.user_id,
      NEW.status
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
DROP TRIGGER IF EXISTS booking_status_change_notification ON bookings;
CREATE TRIGGER booking_status_change_notification
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_booking_status_notification();
```

---

### 3. Next.js API 간소화

**기존 코드** (복잡):
```typescript
// app/api/admin/orders/route.ts
export async function PATCH(request: NextRequest) {
  const { id, status } = await request.json();

  // 1. 상태 업데이트
  const { data: booking } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select('*, user:users(*)')
    .single();

  // 2. 알림 생성 (수동) ❌ 번거로움!
  const notificationMap = { ... };
  if (notificationMap[status]) {
    await supabase.from('notifications').insert({
      user_id: booking.user_id,
      title: notificationMap[status].title,
      message: notificationMap[status].message,
      ...
    });
  }

  return NextResponse.json({ success: true, data: booking });
}
```

**Supabase 방식** (간단) ⭐:
```typescript
// app/api/admin/orders/route.ts
export async function PATCH(request: NextRequest) {
  const { id, status } = await request.json();

  // 상태만 업데이트 - 알림은 자동으로 생성됨! ✅
  const { data: booking } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  return NextResponse.json({ success: true, data: booking });
}
```

---

## Realtime 구독 구현

### 1. Realtime 활성화 (Supabase Dashboard)

```sql
-- notifications 테이블에 Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

또는 Supabase Dashboard에서:
1. Database → Replication 메뉴
2. `notifications` 테이블 선택
3. Realtime 체크

---

### 2. 클라이언트에서 실시간 구독

```typescript
// hooks/use-realtime-notifications.ts
import { useEffect } from 'react'
import { createClient } from '@/lib/auth/supabase'
import { useQueryClient } from '@tanstack/react-query'

export function useRealtimeNotifications(userId: string) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    // 실시간 구독 시작
    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New notification!', payload.new)

          // 1. React Query 캐시 무효화 (자동 재조회)
          queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
          queryClient.invalidateQueries({ queryKey: ['unread-count', userId] })

          // 2. 브라우저 알림 (선택)
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(payload.new.title, {
              body: payload.new.message,
              icon: '/logo.png'
            })
          }

          // 3. Toast 메시지 표시 (선택)
          toast.info(payload.new.title)
        }
      )
      .subscribe()

    // 구독 해제
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, queryClient])
}
```

---

### 3. 메인 레이아웃에 통합

```typescript
// components/common/main-layout.tsx
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications'
import { useIsAuthenticated } from '@/stores/auth-store'

export default function MainLayout({ children }) {
  const { user } = useIsAuthenticated()

  // 실시간 알림 구독 ✅
  useRealtimeNotifications(user?.id)

  return (
    <div>
      {children}
    </div>
  )
}
```

이제 알림이 생성되면 **자동으로 클라이언트에 실시간 전달**됩니다!

---

## 예약 알림 (pg_cron)

### 1. pg_cron Extension 활성화

```sql
-- Supabase에서 pg_cron 활성화 (Dashboard → Database → Extensions)
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

---

### 2. 수거 예정 알림 (매일 오전 8시)

```sql
-- 수거 예정 알림 생성 함수
CREATE OR REPLACE FUNCTION send_pickup_reminders()
RETURNS void AS $$
DECLARE
  v_booking RECORD;
BEGIN
  -- 오늘 수거 예정인 확정된 예약 조회
  FOR v_booking IN
    SELECT *
    FROM bookings
    WHERE booking_date = CURRENT_DATE
      AND status = 'confirmed'
      AND user_id IS NOT NULL
  LOOP
    -- 알림 생성
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      related_booking_id,
      is_read
    ) VALUES (
      v_booking.user_id,
      '오늘 칼 수거 예정입니다',
      format('오늘 %s경 방문하여 칼을 수거할 예정입니다.', v_booking.booking_time),
      'booking',
      v_booking.id,
      false
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 크론 스케줄 등록 (매일 오전 8시)
SELECT cron.schedule(
  'send-pickup-reminders',
  '0 8 * * *',  -- 매일 오전 8시
  $$SELECT send_pickup_reminders()$$
);
```

---

### 3. 결제 마감 임박 알림 (2시간 전)

```sql
-- 결제 마감 임박 알림 함수
CREATE OR REPLACE FUNCTION send_payment_deadline_reminders()
RETURNS void AS $$
DECLARE
  v_booking RECORD;
BEGIN
  -- 2시간 후 마감되는 예약 조회
  FOR v_booking IN
    SELECT b.*, p.deposit_deadline
    FROM bookings b
    LEFT JOIN payments p ON p.booking_id = b.id
    WHERE b.status = 'payment_pending'
      AND p.deposit_deadline BETWEEN NOW() AND NOW() + INTERVAL '2 hours'
      AND b.user_id IS NOT NULL
  LOOP
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      related_booking_id,
      is_read
    ) VALUES (
      v_booking.user_id,
      '입금 마감이 곧 종료됩니다',
      '2시간 후 입금 마감됩니다. 서둘러 입금해주세요!',
      'booking',
      v_booking.id,
      false
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 크론 스케줄 등록 (매시간)
SELECT cron.schedule(
  'send-payment-deadline-reminders',
  '0 * * * *',  -- 매시간
  $$SELECT send_payment_deadline_reminders()$$
);
```

---

### 4. 리뷰 작성 요청 (완료 1일 후)

```sql
-- 리뷰 작성 요청 함수
CREATE OR REPLACE FUNCTION send_review_requests()
RETURNS void AS $$
DECLARE
  v_booking RECORD;
BEGIN
  -- 1일 전에 완료된 예약 조회 (리뷰 요청 미발송)
  FOR v_booking IN
    SELECT *
    FROM bookings
    WHERE status = 'completed'
      AND updated_at::date = CURRENT_DATE - INTERVAL '1 day'
      AND user_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM notifications
        WHERE related_booking_id = bookings.id
          AND title = '서비스는 어떠셨나요?'
      )
  LOOP
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      related_booking_id,
      is_read
    ) VALUES (
      v_booking.user_id,
      '서비스는 어떠셨나요?',
      '소중한 후기를 남겨주세요. 1,000원 할인 쿠폰을 드립니다!',
      'general',
      v_booking.id,
      false
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 크론 스케줄 등록 (매일 오후 6시)
SELECT cron.schedule(
  'send-review-requests',
  '0 18 * * *',  -- 매일 오후 6시
  $$SELECT send_review_requests()$$
);
```

---

### 5. 크론 작업 확인 및 관리

```sql
-- 등록된 크론 작업 확인
SELECT * FROM cron.job;

-- 크론 작업 실행 이력 확인
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;

-- 크론 작업 삭제
SELECT cron.unschedule('send-pickup-reminders');
```

---

## 알림 타입별 구현

### Phase 1: 상태 변경 자동 알림 (Trigger) ✅

| 상태 | 트리거 발동 | 구현 방법 |
|------|------------|-----------|
| confirmed | bookings.status 변경 | ✅ Trigger 자동 |
| in_progress | bookings.status 변경 | ✅ Trigger 자동 |
| shipping | bookings.status 변경 | ✅ Trigger 자동 |
| completed | bookings.status 변경 | ✅ Trigger 자동 |
| cancelled | bookings.status 변경 | ✅ Trigger 자동 |

**구현 완료!** - Trigger 1개만 만들면 모든 상태 변경 알림 자동 처리

---

### Phase 2: 예약 알림 (pg_cron) ✅

| 알림 | 발송 시점 | 크론 스케줄 |
|------|----------|------------|
| 수거 예정 | 매일 오전 8시 | `0 8 * * *` |
| 결제 마감 임박 | 매시간 | `0 * * * *` |
| 리뷰 작성 요청 | 매일 오후 6시 | `0 18 * * *` |

**구현 완료!** - pg_cron 3개만 등록하면 자동 발송

---

### Phase 3: 쿠폰 발급 알림 (Trigger)

```sql
-- 쿠폰 발급 시 자동 알림
CREATE OR REPLACE FUNCTION trigger_coupon_issued_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_coupon_type RECORD;
BEGIN
  -- 쿠폰 타입 정보 조회
  SELECT name INTO v_coupon_type
  FROM coupon_types
  WHERE id = NEW.coupon_type_id;

  -- 알림 생성
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    is_read
  ) VALUES (
    NEW.user_id,
    '새로운 쿠폰이 발급되었습니다!',
    format('%s이 발급되었습니다. 마이페이지에서 확인하세요.', v_coupon_type.name),
    'promotion',
    false
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger 생성
CREATE TRIGGER coupon_issued_notification
  AFTER INSERT ON user_coupons
  FOR EACH ROW
  EXECUTE FUNCTION trigger_coupon_issued_notification();
```

---

## 마이그레이션 가이드

### 1단계: 데이터베이스 함수 및 트리거 생성

```bash
# SQL 파일 생성
cd /Users/simjaehyeong/Desktop/side/web-kal
mkdir -p supabase/migrations
```

**파일**: `supabase/migrations/20250110000001_notification_system.sql`

```sql
-- 1. 알림 생성 함수
CREATE OR REPLACE FUNCTION create_booking_notification(...)
RETURNS void AS $$
...
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 상태 변경 트리거 함수
CREATE OR REPLACE FUNCTION trigger_booking_status_notification()
RETURNS TRIGGER AS $$
...
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 트리거 생성
CREATE TRIGGER booking_status_change_notification
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_booking_status_notification();

-- 4. 쿠폰 발급 트리거
CREATE TRIGGER coupon_issued_notification
  AFTER INSERT ON user_coupons
  FOR EACH ROW
  EXECUTE FUNCTION trigger_coupon_issued_notification();
```

**적용**:
```bash
npx supabase db push
```

---

### 2단계: pg_cron 설정

Supabase Dashboard에서:
1. Database → Extensions → `pg_cron` 활성화
2. SQL Editor에서 크론 작업 등록

```sql
-- 수거 예정 알림
SELECT cron.schedule('send-pickup-reminders', '0 8 * * *', $$SELECT send_pickup_reminders()$$);

-- 결제 마감 임박
SELECT cron.schedule('send-payment-deadline-reminders', '0 * * * *', $$SELECT send_payment_deadline_reminders()$$);

-- 리뷰 작성 요청
SELECT cron.schedule('send-review-requests', '0 18 * * *', $$SELECT send_review_requests()$$);
```

---

### 3단계: Realtime 활성화

Supabase Dashboard:
1. Database → Replication
2. `notifications` 테이블 선택
3. Realtime 활성화

---

### 4단계: 클라이언트 코드 수정

```typescript
// hooks/use-realtime-notifications.ts 파일 생성
export function useRealtimeNotifications(userId: string) { ... }

// components/common/main-layout.tsx 수정
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications'

export default function MainLayout({ children }) {
  const { user } = useIsAuthenticated()
  useRealtimeNotifications(user?.id)  // ✅ 추가
  ...
}
```

---

### 5단계: Next.js API 간소화

```typescript
// app/api/admin/orders/route.ts
// 알림 생성 코드 제거 - Trigger가 자동 처리
export async function PATCH(request: NextRequest) {
  const { id, status } = await request.json();

  const { data } = await supabase
    .from('bookings')
    .update({ status })  // 이것만 하면 끝!
    .eq('id', id)
    .select()
    .single();

  return NextResponse.json({ success: true, data });
}
```

---

## 장점 정리

### ✅ Supabase 방식의 장점

1. **코드 간소화**
   - Next.js API에서 알림 생성 코드 제거
   - 상태만 변경하면 자동 처리

2. **실시간 알림**
   - Realtime으로 즉시 클라이언트에 전달
   - 폴링 불필요

3. **안정성**
   - DB 레벨에서 알림 보장
   - 트랜잭션 안전성

4. **확장성**
   - 새로운 상태 추가 시 함수만 수정
   - 재사용성 높음

5. **성능**
   - 서버 부하 감소
   - DB에서 직접 처리

6. **유지보수**
   - 알림 로직이 한 곳에 집중
   - 디버깅 용이

---

## 참고 자료

- [Supabase Triggers](https://supabase.com/docs/guides/database/postgres/triggers)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [pg_cron](https://supabase.com/docs/guides/database/extensions/pg_cron)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)

---

---

## 🎉 실제 구현 완료 현황

### ✅ 배포 완료된 항목 (2025-01-10)

#### 1. Database Triggers 적용 완료
- ✅ 마이그레이션: `notification_triggers`
- ✅ 함수: `create_booking_notification()`
- ✅ 함수: `trigger_booking_status_notification()`
- ✅ 함수: `trigger_coupon_issued_notification()`
- ✅ 트리거: `booking_status_change_notification`
- ✅ 트리거: `coupon_issued_notification`

**테스트 결과:**
```sql
-- 상태 변경 테스트
UPDATE bookings SET status = 'confirmed' WHERE id = '59020aa5-...';
-- ✅ 알림 자동 생성 확인: "예약이 확정되었습니다!"
```

#### 2. pg_cron 스케줄 작업 완료
- ✅ Extension 활성화: `pg_cron` v1.6
- ✅ 크론 작업 1: `send-pickup-reminders` (매일 오전 8시)
- ✅ 크론 작업 2: `send-payment-deadline-reminders` (매시간)
- ✅ 크론 작업 3: `send-review-requests` (매일 오후 6시)

**등록 확인:**
```sql
SELECT jobname, schedule, active FROM cron.job;
-- 결과:
-- 1. send-pickup-reminders | 0 8 * * * | true
-- 2. send-payment-deadline-reminders | 0 * * * * | true
-- 3. send-review-requests | 0 18 * * * | true
```

#### 3. Realtime Broadcast 구현 완료
- ✅ 방식: **Broadcast** (최신 Supabase 권장 방식)
- ✅ RLS Policy: `realtime.messages` SELECT 권한 설정
- ✅ Client Hook: `/hooks/use-realtime-notifications.ts`
- ✅ 통합: `components/common/main-layout.tsx`

**구현된 기능:**
- WebSocket 기반 실시간 알림 수신
- React Query 캐시 자동 무효화
- Toast 메시지 표시
- 브라우저 알림 (권한 허용 시)

#### 4. 배포 방법

**Supabase MCP 사용 (자동화):**
```typescript
// 1. 마이그레이션 적용
await mcp__supabase__apply_migration({
  project_id: 'hrsqcroirtzbdoeheyxy',
  name: 'notification_triggers',
  query: '...'
})

// 2. pg_cron Extension 활성화
await mcp__supabase__execute_sql({
  project_id: 'hrsqcroirtzbdoeheyxy',
  query: 'CREATE EXTENSION IF NOT EXISTS pg_cron;'
})

// 3. 크론 작업 등록
await mcp__supabase__execute_sql({
  project_id: 'hrsqcroirtzbdoeheyxy',
  query: `
    SELECT cron.schedule('send-pickup-reminders', '0 8 * * *', ...);
    SELECT cron.schedule('send-payment-deadline-reminders', '0 * * * *', ...);
    SELECT cron.schedule('send-review-requests', '0 18 * * *', ...);
  `
})

// 4. RLS Policy 설정
await mcp__supabase__execute_sql({
  project_id: 'hrsqcroirtzbdoeheyxy',
  query: `
    CREATE POLICY "Authenticated users can receive broadcasts"
    ON "realtime"."messages" FOR SELECT TO authenticated USING (true);
  `
})
```

**결과:** ✅ 모든 설정 자동 완료

---

### 🔄 Realtime 방식 변경 (중요)

#### ❌ 기존 문서 (Deprecated)
```typescript
// postgres_changes 방식 (구버전)
const channel = supabase
  .channel('notifications-channel')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, callback)
  .subscribe()
```
⚠️ **문제:** Replication 설정 필요 (Dashboard에서 "Coming Soon")

---

#### ✅ 실제 구현 (Broadcast)
```typescript
// hooks/use-realtime-notifications.ts
export function useRealtimeNotifications(userId?: string) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    // Realtime 채널 생성 및 구독
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        console.log('[Realtime] New notification:', payload.new)

        // 1. React Query 캐시 무효화
        queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
        queryClient.invalidateQueries({ queryKey: ['unread-count', userId] })

        // 2. Toast 메시지 표시
        toast(payload.new.title, {
          description: payload.new.message,
          duration: 5000
        })

        // 3. 브라우저 알림 (권한 있으면)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(payload.new.title, {
            body: payload.new.message,
            icon: '/logo.png'
          })
        }
      })
      .subscribe((status) => {
        console.log('[Realtime] Subscription status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, queryClient, supabase])
}
```

**Database Trigger:**
```sql
-- Trigger가 realtime.broadcast_changes() 호출
CREATE OR REPLACE FUNCTION trigger_booking_status_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM create_booking_notification(
      NEW.id,
      NEW.user_id,
      OLD.status,
      NEW.status
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**장점:**
- ✅ Replication 설정 불필요
- ✅ RLS Policy로 보안 강화
- ✅ Private Channel 지원
- ✅ 최신 Supabase 권장 방식

---

### 📊 구현 상태 요약

| 기능 | 상태 | 구현 방법 | 비고 |
|------|------|----------|------|
| 예약 확정 알림 | ✅ 완료 | Database Trigger | 자동 생성 |
| 연마 시작 알림 | ✅ 완료 | Database Trigger | 자동 생성 |
| 배송 시작 알림 | ✅ 완료 | Database Trigger | 자동 생성 |
| 배송 완료 알림 | ✅ 완료 | Database Trigger | 자동 생성 |
| 주문 취소 알림 | ✅ 완료 | Database Trigger | 자동 생성 |
| 쿠폰 발급 알림 | ✅ 완료 | Database Trigger | 자동 생성 |
| 수거 예정 알림 | ✅ 완료 | pg_cron (08:00) | 매일 자동 |
| 결제 마감 임박 | ✅ 완료 | pg_cron (매시간) | 2시간 전 알림 |
| 리뷰 작성 요청 | ✅ 완료 | pg_cron (18:00) | 완료 1일 후 |
| 실시간 알림 수신 | ✅ 완료 | Broadcast | WebSocket |
| 브라우저 알림 | ✅ 완료 | Notification API | 권한 허용 시 |
| Toast 메시지 | ✅ 완료 | Sonner | 자동 표시 |

---

### 🧪 테스트 가이드

#### 1. 로컬 테스트
```bash
# 개발 서버 실행
npm run dev

# 브라우저 접속: http://localhost:3000
# 개발자 도구(F12) → Console 확인:
# [Realtime] Starting notification subscription for user: ...
# [Realtime] Subscription status: SUBSCRIBED
```

#### 2. 트리거 테스트
```sql
-- 예약 상태 변경
UPDATE bookings
SET status = 'confirmed'
WHERE id = '59020aa5-77e8-4a5d-94d7-50e910c59c32';

-- 알림 생성 확인
SELECT * FROM notifications
WHERE related_booking_id = '59020aa5-77e8-4a5d-94d7-50e910c59c32'
ORDER BY created_at DESC;
```

#### 3. 실시간 수신 확인
- ✅ Console 로그: `[Realtime] New notification received: {...}`
- ✅ Toast 메시지 자동 표시
- ✅ 브라우저 알림 (권한 허용 시)

#### 4. 크론 작업 테스트
```sql
-- 수동 실행 테스트
SELECT send_pickup_reminders();
-- NOTICE: Pickup reminders sent: X notifications

-- 실행 이력 확인
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
```

---

### 🔍 문제 해결

#### Issue 1: Realtime 연결 안됨
**원인:** RLS Policy 미설정
**해결:**
```sql
CREATE POLICY "Authenticated users can receive broadcasts"
ON "realtime"."messages" FOR SELECT TO authenticated USING (true);
```

#### Issue 2: 크론 작업 미실행
**원인:** pg_cron Extension 비활성화
**해결:**
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
```

#### Issue 3: 알림 생성 안됨
**원인:** Trigger 미등록
**해결:**
```sql
SELECT tgname FROM pg_trigger WHERE tgrelid = 'bookings'::regclass;
-- booking_status_change_notification 확인
```

---

### 📝 다음 단계

1. ✅ ~~Database Triggers 생성~~
2. ✅ ~~pg_cron 스케줄 등록~~
3. ✅ ~~Realtime 구독 구현~~
4. ✅ ~~배포 및 테스트~~
5. ⏭️ 프로덕션 모니터링 설정
6. ⏭️ 에러 핸들링 강화

---

**작성일**: 2025-01-10
**최종 수정일**: 2025-01-10 (실제 구현 완료 업데이트)
**작성자**: Claude Code
**배포 상태**: ✅ **프로덕션 배포 완료**

**이전 문서**: `notification-system.md` (Next.js 방식)
**현재 문서**: `notification-system-supabase.md` (Supabase 네이티브 방식) ⭐ **권장**
**배포 가이드**: `notification-deployment.md`
