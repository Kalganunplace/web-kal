# 인증 문제 디버깅 가이드

## 🔍 배포 환경에서 로그인이 풀리는 문제 디버깅

### 1단계: 브라우저에서 쿠키 확인

배포된 사이트에서:
1. 로그인 성공 후
2. F12 → Application → Cookies → 사이트 도메인 선택
3. `auth-token` 쿠키 확인

**체크리스트:**
```
✅ 쿠키 이름: auth-token
✅ HttpOnly: true
✅ Secure: true (https에서만)
✅ SameSite: Lax
✅ Path: /
✅ Max-Age: 86400 (24시간)
✅ Domain: 자동 설정되어야 함
```

### 2단계: Network 탭에서 쿠키 전송 확인

1. F12 → Network 탭
2. 새로고침
3. `/api/auth/me` 요청 클릭
4. Request Headers 확인

**확인 사항:**
```
Cookie: auth-token=eyJhbGc...
```

**쿠키가 전송되지 않는 경우:**
- 쿠키 Domain 설정 문제
- SameSite 설정 문제
- Secure 플래그 문제

### 3단계: Vercel 로그 확인

1. Vercel Dashboard → Project → Functions
2. Real-time logs 보기
3. 로그인 후 다음 로그 확인:

**로그인 시:**
```
[Client Login] Setting JWT token for user: <uuid>
[Client Login] Token length: <number>
[Client Login] NODE_ENV: production
[Client Login] Cookie settings: { httpOnly: true, secure: true, ... }
[Client Login] JWT token set in cookie successfully
```

**새로고침 시 (/api/auth/me):**
```
[/api/auth/me] Cookies received: ['auth-token']
[/api/auth/me] auth-token exists: true
[/api/auth/me] auth-token length: <number>
[/api/auth/me] NODE_ENV: production
[/api/auth/me] Auth success: <uuid>
```

### 4단계: 브라우저 콘솔 로그 확인

새로고침 후 콘솔에서:
```
[Layout Provider] Calling auth initialize
[Auth Store] Initialize called
[Auth Store] Cookie exists: true
[Auth Store] Fetching user from /api/auth/me
[Auth Store] Server response: { success: true, user: {...} }
[Auth Store] User authenticated: <uuid>
```

## 🐛 일반적인 문제와 해결책

### 문제 1: 쿠키가 설정되지 않음
**증상:** 로그인 후 Application 탭에서 auth-token 쿠키가 보이지 않음

**원인:**
- Secure 플래그가 true인데 http 사용 (로컬에서만)
- Domain 설정 오류

**해결:**
- 프로덕션은 https이므로 문제 없어야 함
- Domain은 자동 설정되므로 명시하지 않음

### 문제 2: 쿠키는 있는데 전송되지 않음
**증상:** 쿠키는 Application 탭에 있지만 Network 요청에 포함 안 됨

**원인:**
- SameSite=strict 설정 (이미 lax로 변경함)
- Domain 불일치
- Path 불일치

**해결:**
```typescript
// 이미 적용됨
sameSite: 'lax'
path: '/'
```

### 문제 3: 쿠키가 전송되지만 인증 실패
**증상:** 쿠키가 전송되지만 /api/auth/me가 401 반환

**원인:**
- JWT 검증 실패
- JWT_SECRET 환경 변수 불일치

**해결:**
Vercel 환경 변수 확인:
```
JWT_SECRET=<.env.local과 동일한 값>
SUPABASE_JWT_SECRET=<.env.local과 동일한 값>
```

### 문제 4: 특정 페이지에서만 풀림
**증상:** 메인 페이지는 괜찮은데 특정 페이지에서 풀림

**원인:**
- 클라이언트 라우팅 시 auth store 초기화 로직 문제

**해결:**
이미 적용된 로직 확인:
- Layout Provider에서 한 번만 initialize
- hydration 완료 대기

## 📊 디버깅 결과 분석

### Case A: 쿠키 없음
```
[/api/auth/me] Cookies received: []
[/api/auth/me] auth-token exists: false
```
→ 로그인 API 문제 또는 쿠키 설정 문제

### Case B: 쿠키 있지만 인증 실패
```
[/api/auth/me] auth-token exists: true
[/api/auth/me] Auth failed: Token verification failed
```
→ JWT SECRET 불일치 또는 토큰 손상

### Case C: 서버는 성공, 클라이언트 store 업데이트 안 됨
```
[/api/auth/me] Auth success: <uuid>
[Auth Store] No user in response
```
→ store 업데이트 로직 문제

## 🚀 배포 후 테스트 체크리스트

1. [ ] 로그인 성공
2. [ ] Application 탭에서 auth-token 쿠키 확인
3. [ ] 새로고침 후 로그인 상태 유지
4. [ ] Vercel 로그에서 로그인 로그 확인
5. [ ] Vercel 로그에서 /api/auth/me 성공 로그 확인
6. [ ] 브라우저 콘솔에서 Auth Store 로그 확인
7. [ ] 알림/이용내역/내정보 접근 테스트

## 💡 추가 디버깅 팁

### Vercel 로그 실시간 보기
```bash
vercel logs --follow
```

### 특정 함수 로그만 보기
```bash
vercel logs /api/auth/me
```

### 쿠키 수동 테스트 (브라우저 콘솔)
```javascript
// 쿠키 확인
document.cookie

// auth-token 쿠키만 확인
document.cookie.split(';').find(c => c.includes('auth-token'))

// localStorage 확인
localStorage.getItem('auth-storage-v2')
```

## 🔧 문제 해결 후 롤백

디버깅이 완료되면 로그 제거:
1. `/app/api/auth/me/route.ts` - 디버깅 로그 제거
2. `/app/api/auth/client/login/route.ts` - 디버깅 로그 제거
3. `/stores/auth-store.ts` - console.log 제거 (선택)
