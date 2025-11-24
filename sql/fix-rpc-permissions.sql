-- RPC 함수에 대한 권한 설정
-- anon 역할(인증되지 않은 사용자)이 인증번호 생성 및 검증 함수를 호출할 수 있도록 설정

-- generate_verification_code 함수에 대한 권한 부여
GRANT EXECUTE ON FUNCTION generate_verification_code(VARCHAR, VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION generate_verification_code(VARCHAR, VARCHAR) TO authenticated;

-- verify_code 함수에 대한 권한 부여
GRANT EXECUTE ON FUNCTION verify_code(VARCHAR, VARCHAR, VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION verify_code(VARCHAR, VARCHAR, VARCHAR) TO authenticated;

-- verification_codes 테이블에 대한 권한 설정 (함수에서 사용하므로 필요)
GRANT SELECT, INSERT, UPDATE, DELETE ON verification_codes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON verification_codes TO authenticated;

-- users 테이블에 대한 기본 권한 설정
GRANT SELECT, INSERT, UPDATE ON users TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;
