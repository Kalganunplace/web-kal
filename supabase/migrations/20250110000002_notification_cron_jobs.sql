-- =============================================
-- 알림 시스템: pg_cron 예약 작업
-- =============================================
-- 작성일: 2025-01-10
-- 설명: 수거 예정, 결제 마감 임박, 리뷰 작성 요청 자동 알림
-- 주의: pg_cron extension이 활성화되어 있어야 합니다.

-- =============================================
-- 0. pg_cron Extension 활성화 확인
-- =============================================
-- Supabase Dashboard → Database → Extensions에서 pg_cron 활성화 필요
-- 또는 아래 명령어 실행 (권한 있을 경우)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- =============================================
-- 1. 수거 예정 알림 함수 (매일 오전 8시)
-- =============================================
CREATE OR REPLACE FUNCTION send_pickup_reminders()
RETURNS void AS $$
DECLARE
  v_booking RECORD;
  v_count INTEGER := 0;
BEGIN
  -- 오늘 수거 예정인 확정된 예약 조회
  FOR v_booking IN
    SELECT *
    FROM bookings
    WHERE booking_date = CURRENT_DATE
      AND status = 'confirmed'
      AND user_id IS NOT NULL
  LOOP
    -- 중복 알림 방지: 같은 날 이미 발송했는지 확인
    IF NOT EXISTS (
      SELECT 1 FROM notifications
      WHERE user_id = v_booking.user_id
        AND related_booking_id = v_booking.id
        AND title = '오늘 칼 수거 예정입니다'
        AND created_at::date = CURRENT_DATE
    ) THEN
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
        format('오늘 %s경 방문하여 칼을 수거할 예정입니다.', COALESCE(v_booking.booking_time::TEXT, '예정 시간')),
        'booking',
        v_booking.id,
        false
      );

      v_count := v_count + 1;
    END IF;
  END LOOP;

  RAISE NOTICE 'Pickup reminders sent: % notifications', v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 2. 결제 마감 임박 알림 함수 (매시간)
-- =============================================
CREATE OR REPLACE FUNCTION send_payment_deadline_reminders()
RETURNS void AS $$
DECLARE
  v_payment RECORD;
  v_count INTEGER := 0;
BEGIN
  -- 2시간 후 마감되는 결제 조회
  FOR v_payment IN
    SELECT p.*, b.user_id, b.id as booking_id
    FROM payments p
    JOIN bookings b ON b.id = p.booking_id
    WHERE p.deposit_deadline BETWEEN NOW() AND NOW() + INTERVAL '2 hours'
      AND p.payment_status = 'pending'
      AND b.user_id IS NOT NULL
      AND b.status IN ('pending', 'payment_pending')
  LOOP
    -- 중복 알림 방지: 최근 2시간 이내 같은 알림 발송 확인
    IF NOT EXISTS (
      SELECT 1 FROM notifications
      WHERE user_id = v_payment.user_id
        AND related_booking_id = v_payment.booking_id
        AND title = '입금 마감이 곧 종료됩니다'
        AND created_at > NOW() - INTERVAL '2 hours'
    ) THEN
      -- 알림 생성
      INSERT INTO notifications (
        user_id,
        title,
        message,
        type,
        related_booking_id,
        is_read
      ) VALUES (
        v_payment.user_id,
        '입금 마감이 곧 종료됩니다',
        format('2시간 후 입금 마감됩니다. 서둘러 입금해주세요! (마감: %s)',
               to_char(v_payment.deposit_deadline, 'HH24:MI')),
        'booking',
        v_payment.booking_id,
        false
      );

      v_count := v_count + 1;
    END IF;
  END LOOP;

  RAISE NOTICE 'Payment deadline reminders sent: % notifications', v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 3. 리뷰 작성 요청 함수 (매일 오후 6시)
-- =============================================
CREATE OR REPLACE FUNCTION send_review_requests()
RETURNS void AS $$
DECLARE
  v_booking RECORD;
  v_count INTEGER := 0;
BEGIN
  -- 1일 전에 완료된 예약 조회
  FOR v_booking IN
    SELECT *
    FROM bookings
    WHERE status = 'completed'
      AND updated_at::date = CURRENT_DATE - INTERVAL '1 day'
      AND user_id IS NOT NULL
  LOOP
    -- 중복 알림 방지: 이미 리뷰 요청 발송했는지 확인
    IF NOT EXISTS (
      SELECT 1 FROM notifications
      WHERE user_id = v_booking.user_id
        AND related_booking_id = v_booking.id
        AND title = '서비스는 어떠셨나요?'
    ) THEN
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
        '서비스는 어떠셨나요?',
        '소중한 후기를 남겨주세요. 1,000원 할인 쿠폰을 드립니다!',
        'general',
        v_booking.id,
        false
      );

      v_count := v_count + 1;
    END IF;
  END LOOP;

  RAISE NOTICE 'Review requests sent: % notifications', v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 4. 크론 작업 등록
-- =============================================
-- 주의: 이 부분은 Supabase Dashboard의 SQL Editor에서 직접 실행해야 합니다.
-- pg_cron extension이 활성화되어 있어야 합니다.

-- 기존 크론 작업 삭제 (있으면)
-- SELECT cron.unschedule('send-pickup-reminders');
-- SELECT cron.unschedule('send-payment-deadline-reminders');
-- SELECT cron.unschedule('send-review-requests');

-- 크론 작업 등록 (Supabase Dashboard에서 실행)
/*
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
*/

-- =============================================
-- 5. 크론 작업 확인 쿼리
-- =============================================
-- 등록된 크론 작업 확인
-- SELECT * FROM cron.job;

-- 크론 작업 실행 이력 확인
-- SELECT * FROM cron.job_run_details
-- ORDER BY start_time DESC
-- LIMIT 20;

-- =============================================
-- 완료 메시지
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Notification cron functions created successfully!';
  RAISE NOTICE '   - send_pickup_reminders()';
  RAISE NOTICE '   - send_payment_deadline_reminders()';
  RAISE NOTICE '   - send_review_requests()';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  다음 단계: Supabase Dashboard에서 크론 작업을 등록하세요.';
  RAISE NOTICE '   1. Database → Extensions → pg_cron 활성화';
  RAISE NOTICE '   2. SQL Editor에서 위의 cron.schedule() 쿼리 실행';
END $$;
