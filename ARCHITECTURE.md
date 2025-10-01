 ## 인증 상태 관리 구조:

  1. JWT 토큰 (쿠키) - 서버 인증

  - 위치: HttpOnly 쿠키 (auth-token)
  - 목적: 서버사이드 인증 및 보안
  - 만료: 24시간
  - 설정: /api/auth/client/login API에서 설정
  - 사용: middleware, API route에서 검증

  2. LocalStorage (Zustand persist) - 클라이언트 상태

  - 위치: localStorage (auth-storage-v2)
  - 목적: 클라이언트 사이드 UI 상태 관리 (빠른 접근)
  - 저장 데이터: user 객체만 (id, type, phone, name 등)
  - 사용: 페이지 로딩 시 즉시 사용자 정보 표시

  작동 방식:

  1. 로그인 시:
  로그인 API → JWT 생성 → 쿠키 설정 → user 데이터 반환
  → Zustand store 업데이트 → localStorage 자동 저장
  2. 페이지 새로고침 시:
  localStorage에서 user 복원 (빠름)
  → /api/auth/me 호출 (쿠키 JWT 검증)
  → 최신 사용자 정보로 업데이트
  3. 보안:
    - JWT는 HttpOnly 쿠키라 JavaScript로 접근 불가
    - localStorage는 UI 표시용이지 인증용이 아님
    - 실제 권한 검증은 서버에서 쿠키 JWT로만 수행

  장점:

  - ✅ 보안: HttpOnly 쿠키로 XSS 공격 방지
  - ✅ UX: localStorage로 즉시 UI 표시 (로딩 없음)
  - ✅ 신뢰성: 서버는 항상 JWT만 신뢰

  단점:

  - ⚠️ 중복 관리: 쿠키와 localStorage 동기화 필요
  - ⚠️ localStorage는 XSS에 취약하므로 민감 정보 저장 금지

## 📁 폴더 구조

```
src/
├── app/                          # App Router 페이지
│   ├── (auth)/                   # 인증이 필요한 페이지 그룹
│   │   ├── profile/
│   │   ├── member-info/
│   │   ├── subscription/
│   │   ├── coupons/
│   │   └── layout.tsx            # 인증 확인 레이아웃
│   ├── (public)/                 # 공개 페이지 그룹
│   │   ├── login/
│   │   ├── signup/
│   │   ├── price-list/
│   │   └── guide/
│   └── (hybrid)/                 # 로그인 여부에 따라 다른 UI
│       ├── page.tsx              # 홈페이지
│       └── knife-request/
├── components/
│   ├── auth/                     # 인증 관련 컴포넌트
│   │   ├── auth-guard.tsx
│   │   ├── login-prompt.tsx
│   │   ├── auth-aware.tsx
│   │   └── guest-fallback.tsx
│   ├── ui/                       # 공통 UI 컴포넌트
│   └── features/                 # 기능별 컴포넌트
│       ├── profile/
│       │   ├── authenticated-profile.tsx
│       │   └── guest-profile.tsx
│       ├── knife-request/
│       │   ├── authenticated-request.tsx
│       │   └── guest-request.tsx
│       └── home/
│           ├── authenticated-home.tsx
│           └── guest-home.tsx
├── stores/
│   ├── auth-store.ts
│   ├── user-data-store.ts        # 사용자 데이터 (주문내역 등)
│   └── app-store.ts              # 앱 전역 상태
├── hooks/
│   ├── use-auth-redirect.ts      # 인증 리다이렉트 로직
│   ├── use-require-auth.ts       # 인증 필수 훅
│   └── use-auth-aware.ts         # 인증 인식 로직
├── middleware.ts                 # Next.js 미들웨어
└── lib/
    ├── auth/
    ├── route-config.ts           # 라우트 설정
    └── permissions.ts            # 권한 관리
```

## 🔒 라우트 분류

### 인증 필수 (`/auth/*`)
- `/profile` - 프로필 페이지
- `/member-info` - 회원 정보
- `/subscription` - 구독 관리
- `/coupons` - 쿠폰 관리
- `/usage-history` - 이용 내역

### 공개 페이지 (`/public/*`)
- `/login` - 로그인
- `/signup` - 회원가입
- `/price-list` - 가격표
- `/guide` - 가이드
- `/notices` - 공지사항

### 하이브리드 (`/hybrid/*`)
- `/` - 홈페이지 (로그인 여부에 따른 개인화)
- `/knife-request` - 칼갈이 신청 (게스트도 가능, 결제시 로그인 유도)

## 🛡 보안 정책

### 미들웨어 기반 보호
- 인증 필수 라우트 자동 보호
- 로그인 페이지 리다이렉트
- 토큰 만료 검증

### 컴포넌트 레벨 보호
- AuthGuard 컴포넌트
- 권한별 UI 렌더링
- 로딩 상태 처리
