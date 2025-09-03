-- users 테이블 RLS 정책 수정
-- 기존 정책 삭제 후 새로운 정책 추가

-- 기존 제한적 정책 삭제
DROP POLICY IF EXISTS "사용자 본인만 조회 가능" ON users;
DROP POLICY IF EXISTS "사용자 본인만 업데이트 가능" ON users;

-- anon 사용자도 접근할 수 있는 정책으로 대체
CREATE POLICY "anon_can_select_users" ON users
  FOR SELECT USING (true);

CREATE POLICY "anon_can_update_users" ON users  
  FOR UPDATE USING (true);

-- 기존 insert 정책은 유지
-- CREATE POLICY "anon_can_insert_users" ON users FOR INSERT WITH CHECK (true);