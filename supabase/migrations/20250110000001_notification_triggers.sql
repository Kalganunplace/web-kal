-- =============================================
-- 알림 시스템: Database Triggers & Functions
-- =============================================
-- 작성일: 2025-01-10
-- 설명: bookings 상태 변경 시 자동 알림 생성 및 쿠폰 발급 알림

-- =============================================
-- 1. 예약 상태 변경 알림 생성 함수
-- =============================================
CREATE OR REPLACE FUNCTION create_booking_notification(
  p_booking_id UUID,
  p_user_id UUID,
  p_old_status TEXT,
  p_new_status TEXT
)
RETURNS void AS $$
DECLARE
  v_booking RECORD;
  v_title TEXT;
  v_message TEXT;
  v_type TEXT;
  v_formatted_date TEXT;
  v_formatted_time TEXT;
BEGIN
  -- user_id가 없으면 알림 생성 안함
  IF p_user_id IS NULL THEN
    RETURN;
  END IF;

  -- 예약 정보 조회
  SELECT * INTO v_booking
  FROM bookings
  WHERE id = p_booking_id;

  -- 날짜와 시간 포맷팅
  v_formatted_date := to_char(v_booking.booking_date, 'YYYY-MM-DD');
  v_formatted_time := to_char(v_booking.booking_time, 'HH24:MI');

  -- 상태별 알림 내용 설정
  CASE p_new_status
    WHEN 'confirmed' THEN
      v_title := '예약이 확정되었습니다!';
      v_message := format('입금이 확인되었습니다. %s %s에 방문 예정입니다.',
                         COALESCE(v_formatted_date, '예정일'),
                         COALESCE(v_formatted_time, '예정 시간'));
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
      -- 알림 생성하지 않음 (pending 등)
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

  RAISE NOTICE 'Notification created for booking % with status %', p_booking_id, p_new_status;

EXCEPTION
  WHEN OTHERS THEN
    -- 알림 생성 실패해도 예약 업데이트는 성공
    RAISE WARNING 'Failed to create notification for booking %: %', p_booking_id, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 2. 예약 상태 변경 트리거 함수
-- =============================================
CREATE OR REPLACE FUNCTION trigger_booking_status_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- status가 실제로 변경된 경우에만 알림 생성
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- 비동기로 알림 생성 (pg_notify 사용 가능하지만 일단 동기로)
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

-- =============================================
-- 3. 예약 상태 변경 트리거 생성
-- =============================================
-- 기존 트리거 삭제 (있으면)
DROP TRIGGER IF EXISTS booking_status_change_notification ON bookings;

-- 새 트리거 생성
CREATE TRIGGER booking_status_change_notification
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_booking_status_notification();

-- =============================================
-- 4. 쿠폰 발급 알림 함수
-- =============================================
CREATE OR REPLACE FUNCTION trigger_coupon_issued_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_coupon_name TEXT;
BEGIN
  -- user_id가 없으면 알림 생성 안함
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- coupons 테이블에서 쿠폰 정보 조회
  SELECT title INTO v_coupon_name
  FROM coupons
  WHERE id = NEW.id;

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
    format('%s이 발급되었습니다. 마이페이지에서 확인하세요.', COALESCE(v_coupon_name, '할인 쿠폰')),
    'promotion',
    false
  );

  RETURN NEW;

EXCEPTION
  WHEN OTHERS THEN
    -- 알림 생성 실패해도 쿠폰 발급은 성공
    RAISE WARNING 'Failed to create coupon notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. 쿠폰 발급 트리거 생성
-- =============================================
-- 기존 트리거 삭제 (있으면)
DROP TRIGGER IF EXISTS coupon_issued_notification ON coupons;

-- 새 트리거 생성
CREATE TRIGGER coupon_issued_notification
  AFTER INSERT ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION trigger_coupon_issued_notification();

-- =============================================
-- 완료 메시지
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Notification triggers created successfully!';
  RAISE NOTICE '   - booking_status_change_notification';
  RAISE NOTICE '   - coupon_issued_notification';
END $$;
