# 칼가는곳 디자인 시스템 작업 목록

## ✅ 완료된 작업

### 1. 아이콘 시스템
- [x] `components/ui/icon.tsx` - Lucide React 기반 아이콘 시스템 구축
- [x] 모든 필요한 아이콘 구현 (NavigationBar, UI 요소용)
- [x] 일관된 크기 및 색상 props 시스템
- [x] 전체 앱에서 404 오류 해결

### 2. 타이포그래피 시스템
- [x] `components/ui/typography.tsx` - 12가지 텍스트 스타일 구현
- [x] Figma 디자인과 정확히 매칭되는 폰트 크기, 행간, 굵기
- [x] NanumGothic, Do Hyeon 폰트 패밀리 적용
- [x] 색상 props를 통한 유연한 텍스트 색상 관리

### 3. 버튼 시스템
- [x] `components/ui/button.tsx` - Primary, Secondary, White variant
- [x] Small, Medium, Large 크기 옵션
- [x] Figma 디자인과 일치하는 스타일링
- [x] hover 상태 및 disabled 상태 처리

### 4. 스위치 컴포넌트
- [x] `components/ui/switch.tsx` - Radix UI 기반 토글 스위치
- [x] 접근성 및 키보드 지원
- [x] 브랜드 색상 (#E67E22) 적용

### 5. 네비게이션 바
- [x] `components/bottom-navigation.tsx` - 하단 고정 네비게이션
- [x] 5개 메뉴 아이템 (홈, 가격표, 칼갈이신청, 알림, 프로필)
- [x] 알림 배지 시스템
- [x] 현재 페이지 활성 상태 표시

### 6. 페이지 구현

#### 6.1 홈페이지 (app/page.tsx)
- [x] 시스템 타이틀 영역
- [x] 브랜드 로고
- [x] 메인 배너 (이미지 + CTA 버튼)
- [x] 액션 버튼들 (가격표, 가이드)
- [x] 이벤트 배너 (1+1 이벤트)
- [x] 구독 배너
- [x] 반응형 레이아웃 적용

#### 6.2 가격표 페이지 (app/price-list/page.tsx)
- [x] Top Banner 컴포넌트
- [x] 프로모션 배너
- [x] 가격 비교 테이블
- [x] 접을 수 있는 주의사항 섹션
- [x] Bottom Sheet 모달로 상세 정보 표시
- [x] 반응형 레이아웃 적용

#### 6.3 칼갈이 신청 페이지 (app/knife-request/page.tsx)
- [x] 시스템 타이틀 + 뒤로가기
- [x] 서비스 선택 (방문 수거 토글)
- [x] 칼 선택 시스템
- [x] 특별 요청사항 입력
- [x] 비용 안내
- [x] 반응형 레이아웃 적용

#### 6.4 프로필 페이지 (app/profile/page.tsx)
- [x] 사용자 정보 영역
- [x] 프로모션 배너
- [x] 로그인/회원가입 버튼
- [x] 쿠폰 버튼
- [x] 메뉴 아이템 리스트
- [x] 알림 설정 토글
- [x] MainLayout 제거하고 일관된 구조로 변경
- [x] 반응형 레이아웃 적용

#### 6.5 가이드 페이지 (app/guide/page.tsx)
- [x] 4단계 서비스 이용 방법
- [x] 아이콘이 포함된 단계별 설명
- [x] 이용 팁 섹션
- [x] 반응형 레이아웃 적용

### 7. 공용 컴포넌트

#### 7.1 Bottom Sheet
- [x] `components/ui/bottom-sheet.tsx` - 하단에서 올라오는 모달
- [x] 배경 블러 효과
- [x] 애니메이션 처리
- [x] 가격표 상세 정보에서 사용

#### 7.2 Top Banner
- [x] `components/ui/top-banner.tsx` - 뒤로가기 + 제목
- [x] 재사용 가능한 헤더 컴포넌트
- [x] 일관된 디자인 적용

### 8. 반응형 디자인 시스템
- [x] 고정 너비 (w-[330px] 등)를 flex 기반으로 변경
- [x] w-full, flex-1, max-w-md 등 유동적 크기 사용
- [x] 높이는 디자인 요구사항에 따라 고정값 유지
- [x] 모든 페이지에 일관된 max-w-md + mx-auto 적용
- [x] px-5로 일관된 좌우 패딩 적용
- [x] absolute positioning 최소화, flex 기반 레이아웃 우선 사용

### 9. 디자인 토큰
- [x] 주요 색상: #E67E22 (브랜드 오렌지), #F2F2F2 (회색), #333333 (텍스트)
- [x] 그림자: shadow-lg, shadow-md 등 표준화
- [x] 둥근 모서리: rounded-xl, rounded-3xl 등 일관성
- [x] 폰트: NanumGothic (일반), Do Hyeon (강조)

## 📋 향후 개선사항

### 1. 추가 컴포넌트
- [ ] Toast/Notification 시스템
- [ ] Loading Spinner
- [ ] Input 컴포넌트 개선
- [ ] Form Validation 시스템

### 2. 성능 최적화
- [ ] 이미지 최적화
- [ ] 코드 스플리팅
- [ ] 메모리제이션 적용

### 3. 접근성 개선
- [ ] ARIA 레이블 추가
- [ ] 키보드 네비게이션 개선
- [ ] 스크린 리더 지원

---

**총 진행률: 90% 완료**

모든 주요 디자인 시스템 컴포넌트와 페이지가 Figma 디자인에 맞춰 구현되었으며, 반응형 디자인이 적용되어 다양한 모바일 화면 크기에서 적절히 동작합니다.
