// 브라우저 콘솔에서 실행할 수 있는 인증 상태 확인 스크립트
console.log('=== 인증 상태 확인 ===');

// 1. localStorage 확인
console.log('\n1. localStorage 상태:');
const authStorage = localStorage.getItem('auth-storage');
if (authStorage) {
  try {
    const parsed = JSON.parse(authStorage);
    console.log('✅ auth-storage 존재:', parsed);
    if (parsed.state && parsed.state.user) {
      console.log('👤 로그인된 사용자:', parsed.state.user);
    } else {
      console.log('❌ 로그인된 사용자 없음');
    }
  } catch (e) {
    console.log('❌ auth-storage 파싱 오류:', e);
  }
} else {
  console.log('❌ auth-storage 없음');
}

// 2. 쿠키 확인
console.log('\n2. 쿠키 상태:');
const cookies = document.cookie.split(';').reduce((acc, cookie) => {
  const [key, value] = cookie.trim().split('=');
  acc[key] = value;
  return acc;
}, {});
console.log('🍪 모든 쿠키:', cookies);
if (cookies['auth-token']) {
  console.log('✅ auth-token 쿠키 존재:', cookies['auth-token']);
} else {
  console.log('❌ auth-token 쿠키 없음');
}

// 3. Zustand 스토어 상태 확인 (개발자 도구에서만 가능)
console.log('\n3. Zustand 스토어 상태:');
if (typeof window !== 'undefined' && window.__ZUSTAND__) {
  console.log('✅ Zustand 개발자 도구 활성화됨');
  console.log('개발자 도구에서 "auth-storage" 스토어를 확인하세요');
} else {
  console.log('❌ Zustand 개발자 도구 비활성화됨');
}

// 4. 현재 페이지 URL 확인
console.log('\n4. 현재 페이지:');
console.log('📍 URL:', window.location.href);
console.log('📍 Pathname:', window.location.pathname);

// 5. 로그인 상태 요약
console.log('\n5. 로그인 상태 요약:');
const hasLocalStorage = !!authStorage;
const hasCookie = !!cookies['auth-token'];
const isLoggedIn = hasLocalStorage && hasCookie;

console.log(`🔐 로그인 상태: ${isLoggedIn ? '✅ 로그인됨' : '❌ 로그인 안됨'}`);
console.log(`📱 localStorage: ${hasLocalStorage ? '✅ 있음' : '❌ 없음'}`);
console.log(`🍪 쿠키: ${hasCookie ? '✅ 있음' : '❌ 없음'}`);

if (isLoggedIn) {
  try {
    const userData = JSON.parse(authStorage).state.user;
    console.log('\n📋 사용자 정보:');
    console.log('   ID:', userData.id);
    console.log('   이름:', userData.name);
    console.log('   전화번호:', userData.phone);
    console.log('   가입일:', userData.created_at);
  } catch (e) {
    console.log('❌ 사용자 정보 파싱 오류:', e);
  }
}

console.log('\n=== 확인 완료 ===');
