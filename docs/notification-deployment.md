# 알림 시스템 배포 가이드

## 📋 개요

이 문서는 Supabase 기반 실시간 알림 시스템을 배포하는 방법을 안내합니다.

**알림 시스템 아키텍처:**
- **Database Triggers**: 예약 상태 변경 시 자동 알림 생성
- **Supabase Realtime**: WebSocket으로 실시간 알림 전송
- **pg_cron**: 예약 작업 (수거 알림, 결제 마감, 리뷰 요청)

## 🚀 배포 단계

### 1단계: SQL 마이그레이션 적용

Supabase CLI를 사용하여 마이그레이션을 적용합니다:

```bash
# 로컬 개발 환경
npx supabase db push

# 또는 프로덕션 환경
npx supabase db push --db-url "postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres"
```

**적용될 마이그레이션:**
- `20250110000001_notification_triggers.sql` - 트리거 및 함수
- `20250110000002_notification_cron_jobs.sql` - 크론 작업 함수

### 2단계: Supabase Realtime 활성화

1. **Supabase Dashboard 접속**
   - https://app.supabase.com/project/[YOUR-PROJECT-ID]

2. **Realtime 설정**
   - 좌측 메뉴: `Database` → `Replication`
   - `notifications` 테이블 찾기
   - `Enable Realtime` 토글 활성화
   - Source: `INSERT` 이벤트 체크

3. **RLS 정책 확인**
   - 좌측 메뉴: `Database` → `Policies`
   - `notifications` 테이블의 SELECT 정책 확인:
   ```sql
   -- 사용자는 자신의 알림만 조회 가능
   CREATE POLICY "Users can view own notifications"
   ON notifications FOR SELECT
   USING (auth.uid() = user_id);
   ```

### 3단계: pg_cron Extension 활성화

1. **Supabase Dashboard 접속**
   - 좌측 메뉴: `Database` → `Extensions`

2. **pg_cron 활성화**
   - 검색: `pg_cron`
   - `Enable` 버튼 클릭

3. **확인**
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   -- 결과가 있으면 성공
   ```

### 4단계: 크론 작업 등록

Supabase Dashboard의 SQL Editor에서 다음 쿼리를 실행합니다:

```sql
-- 1. 수거 예정 알림 (매일 오전 8시)
SELECT cron.schedule(
  'send-pickup-reminders',
  '0 8 * * *',
  $$SELECT send_pickup_reminders()$$
);

-- 2. 결제 마감 임박 알림 (매시간)
SELECT cron.schedule(
  'send-payment-deadline-reminders',
  '0 * * * *',
  $$SELECT send_payment_deadline_reminders()$$
);

-- 3. 리뷰 작성 요청 (매일 오후 6시)
SELECT cron.schedule(
  'send-review-requests',
  '0 18 * * *',
  $$SELECT send_review_requests()$$
);
```

**크론 표현식 설명:**
- `0 8 * * *`: 매일 오전 8시
- `0 * * * *`: 매시간 정각
- `0 18 * * *`: 매일 오후 6시

### 5단계: 배포 확인

#### 5.1 크론 작업 확인
```sql
-- 등록된 크론 작업 확인
SELECT * FROM cron.job;

-- 크론 작업 실행 이력 확인
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 20;
```

#### 5.2 트리거 테스트
```sql
-- 예약 상태 변경 테스트 (알림 자동 생성)
UPDATE bookings
SET status = 'confirmed'
WHERE id = '[BOOKING-ID]';

-- 알림 생성 확인
SELECT * FROM notifications
WHERE related_booking_id = '[BOOKING-ID]'
ORDER BY created_at DESC;
```

#### 5.3 Realtime 테스트
1. 클라이언트 앱 로그인
2. 브라우저 개발자 도구 → Console 탭
3. 다음 로그 확인:
   ```
   [Realtime] Starting notification subscription for user: [USER-ID]
   [Realtime] Subscription status: SUBSCRIBED
   ```
4. 관리자 페이지에서 예약 상태 변경
5. 클라이언트에서 실시간 알림 수신 확인:
   - Toast 메시지 표시
   - 브라우저 알림 표시 (권한 허용 시)

## 🔧 문제 해결

### Realtime이 작동하지 않는 경우

1. **Realtime 활성화 확인**
   ```sql
   SELECT schemaname, tablename, replica_identity
   FROM pg_tables
   WHERE tablename = 'notifications';
   -- replica_identity가 'default' 또는 'full'이어야 함
   ```

2. **WebSocket 연결 확인**
   - 브라우저 개발자 도구 → Network 탭
   - WS 필터 적용
   - `realtime/v1/websocket` 연결 확인

3. **RLS 정책 확인**
   ```sql
   SELECT * FROM pg_policies
   WHERE tablename = 'notifications';
   ```

### 크론 작업이 실행되지 않는 경우

1. **Extension 확인**
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```

2. **크론 로그 확인**
   ```sql
   SELECT * FROM cron.job_run_details
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-pickup-reminders')
   ORDER BY start_time DESC
   LIMIT 5;
   ```

3. **수동 실행 테스트**
   ```sql
   SELECT send_pickup_reminders();
   -- NOTICE 메시지 확인: "Pickup reminders sent: X notifications"
   ```

### 알림이 생성되지 않는 경우

1. **트리거 확인**
   ```sql
   SELECT * FROM pg_trigger
   WHERE tgname = 'booking_status_change_notification';
   ```

2. **함수 실행 테스트**
   ```sql
   SELECT create_booking_notification(
     '[BOOKING-ID]'::uuid,
     '[USER-ID]'::uuid,
     'pending',
     'confirmed'
   );

   -- 알림 테이블 확인
   SELECT * FROM notifications ORDER BY created_at DESC LIMIT 1;
   ```

## 📊 모니터링

### 알림 통계 확인
```sql
-- 오늘 생성된 알림 수
SELECT type, COUNT(*) as count
FROM notifications
WHERE created_at::date = CURRENT_DATE
GROUP BY type;

-- 읽지 않은 알림 수 (사용자별)
SELECT user_id, COUNT(*) as unread_count
FROM notifications
WHERE is_read = false
GROUP BY user_id;
```

### 크론 작업 성능 확인
```sql
-- 크론 작업 실행 시간 통계
SELECT
  j.jobname,
  COUNT(*) as run_count,
  AVG(EXTRACT(EPOCH FROM (d.end_time - d.start_time))) as avg_duration_seconds,
  MAX(EXTRACT(EPOCH FROM (d.end_time - d.start_time))) as max_duration_seconds
FROM cron.job_run_details d
JOIN cron.job j ON j.jobid = d.jobid
WHERE d.start_time > NOW() - INTERVAL '7 days'
GROUP BY j.jobname;
```

## 🔄 업데이트 및 유지보수

### 크론 작업 수정
```sql
-- 기존 작업 삭제
SELECT cron.unschedule('send-pickup-reminders');

-- 새 일정으로 재등록
SELECT cron.schedule(
  'send-pickup-reminders',
  '0 9 * * *',  -- 오전 9시로 변경
  $$SELECT send_pickup_reminders()$$
);
```

### 알림 메시지 수정
```sql
-- 함수 재생성 (메시지 변경)
CREATE OR REPLACE FUNCTION create_booking_notification(...)
RETURNS void AS $$
BEGIN
  -- 변경된 메시지로 수정
  ...
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## ✅ 배포 체크리스트

- [ ] SQL 마이그레이션 적용 완료
- [ ] Realtime on `notifications` 테이블 활성화
- [ ] pg_cron extension 활성화
- [ ] 3개 크론 작업 등록 완료
- [ ] 트리거 작동 테스트 완료
- [ ] Realtime 구독 테스트 완료
- [ ] 클라이언트에서 알림 수신 확인
- [ ] 브라우저 알림 권한 요청 구현 확인
- [ ] 프로덕션 환경 모니터링 설정

## 📚 관련 문서

- [알림 시스템 설계 문서](./notification-system-supabase.md)
- [Supabase Realtime 공식 문서](https://supabase.com/docs/guides/realtime)
- [pg_cron 공식 문서](https://github.com/citusdata/pg_cron)
