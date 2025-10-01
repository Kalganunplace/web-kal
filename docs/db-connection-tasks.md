# DB 연결 작업 가이드

## 📌 개요
현재 프로젝트는 Mock 데이터와 실제 DB가 혼재되어 있는 상태입니다. 
이 문서는 모든 기능을 실제 Supabase DB와 연결하기 위한 작업 계획입니다.

**중요: UI/디자인은 절대 수정하지 않습니다. 데이터 소스만 변경합니다.**

## 🎯 목표
- Mock 데이터를 실제 DB 데이터로 교체
- 하드코딩된 데이터를 DB에서 가져오도록 변경
- 서비스 간 데이터 흐름 연결
- 테스트용 ID 제거하고 실제 인증 시스템 사용

## 📊 현재 상태 분석

### DB 연결 상태 요약
| 카테고리 | 페이지 | 현재 상태 | 목표 상태 |
|---------|--------|-----------|-----------|
| **인증** | /login, /signup | ✅ Real DB | ✅ 완료 |
| **프로필** | /profile | ✅ Real DB | ✅ 완료 |
| **홈** | / | ⚠️ Mixed (인증만 연결) | Real DB |
| **칼갈이 신청** | /knife-request | ⚠️ Mixed (칼 종류 하드코딩) | Real DB |
| **이용내역** | /usage-history | ❌ Mock | Real DB |
| **알림** | /notifications | ❌ 하드코딩 | Real DB |
| **쿠폰** | /coupons | ✅ Real DB | ✅ 완료 |
| **주소설정** | /address-settings | ⚠️ testUserId 하드코딩 | Real DB |
| **결제** | /payment/* | ✅ Real DB | ✅ 완료 |
| **고객센터** | /customer-service | ⚠️ Mixed (FAQ 하드코딩) | Real DB |
| **구독** | /subscription | ❓ 미확인 | Real DB |

## 🔴 우선순위 1: 핵심 기능 (필수)

### 1. 칼 종류 데이터 DB 연결
**파일**: `/app/(client)/knife-request/page.tsx`
**현재 문제**:
- 하드코딩된 칼 종류와 가격 데이터 사용
```javascript
const knifeTypes = [
  { id: "1", name: "주방용 칼", basePrice: 5000, image: "..." },
  // ... 하드코딩
]
```

**수정 방법**:
1. `knife-service.ts` 생성 또는 수정
2. `knife_types` 테이블에서 데이터 가져오기
3. useEffect에서 `knifeService.getAllKnifeTypes()` 호출
4. 로딩 상태 처리 추가

**예상 코드**:
```typescript
// lib/knife-service.ts
export class KnifeService {
  private supabase = createClient()
  
  async getAllKnifeTypes() {
    const { data, error } = await this.supabase
      .from('knife_types')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
    
    return data || []
  }
}
```

### 2. 이용내역 실제 DB 연결
**파일**: `/app/(client)/usage-history/page.tsx`
**현재 문제**:
- `mock/usage-history.ts`의 시나리오 기반 Mock 데이터 사용
- 실제 예약/결제 내역이 표시되지 않음

**수정 방법**:
1. Mock 데이터 import 제거
2. `bookingService.getUserBookings()` 사용
3. 예약 상태별 필터링 구현
4. 실시간 상태 업데이트 표시

**필요한 데이터 구조**:
```typescript
interface UsageHistoryItem {
  id: string
  booking_date: string
  booking_time: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  total_quantity: number
  total_amount: number
  booking_items: BookingItem[]
  payment?: Payment
}
```

### 3. 알림 페이지 실제 DB 연결
**파일**: `/app/(client)/notifications/page.tsx`
**현재 문제**:
- 하드코딩된 단일 알림만 표시
- 실제 알림이 생성되어도 표시 안됨

**수정 방법**:
1. 하드코딩된 `notifications` 배열 제거
2. `notificationService.getUserNotifications()` 사용
3. 읽음/안읽음 상태 관리
4. 알림 클릭 시 읽음 처리

### 4. testUserId 제거
**영향받는 파일**:
- `/app/(client)/address-settings/page.tsx`
- `/components/features/knife/knife-request.tsx`
- 기타 하드코딩된 ID 사용 파일

**수정 방법**:
1. `const testUserId = "..."` 제거
2. `useAuthStore()` 또는 `useAuthAware()` 사용
3. 인증 확인 로직 추가
4. 비로그인 상태 처리

## 🟡 우선순위 2: 서비스 완성도

### 5. 주소 설정 페이지 인증 연결
**파일**: `/app/(client)/address-settings/page.tsx`
**현재 문제**:
```javascript
const testUserId = "6e29121f-909e-4abf-bdcc-32f08d33a001"
```

**수정 방법**:
1. `useAuthStore()` 추가
2. 실제 user.id 사용
3. 로그인 확인 및 리다이렉트

### 6. 예약 생성 시 주소 정보 연결
**파일**: `/components/features/knife/knife-request.tsx`
**필요 작업**:
1. 선택된 주소 ID를 booking에 저장
2. `bookings` 테이블에 `address_id` 컬럼 추가 (필요시)
3. 예약 생성 시 주소 정보 포함

### 7. 결제 완료 후 예약 상태 업데이트
**파일**: `/lib/payment-service.ts`
**필요 작업**:
1. 결제 확인 시 자동으로 booking status 업데이트
2. 트랜잭션으로 처리하여 데이터 일관성 보장
3. 상태 변경 시 알림 생성

### 8. 구독 페이지 확인
**파일**: `/app/(client)/subscription/page.tsx`
**필요 작업**:
1. 현재 DB 연결 상태 확인
2. subscriptions 테이블 연동
3. 구독 상태 관리 구현

## 🟢 우선순위 3: 추가 개선

### 9. 서비스 간 연동 테스트
**테스트 시나리오**:
1. 칼갈이 신청 → 예약 생성 확인
2. 결제 완료 → 예약 상태 변경 확인
3. 상태 변경 → 알림 생성 확인
4. 이용내역에 표시 확인

### 10. FAQ/가이드 DB 관리
**선택사항**: 
- 현재 하드코딩된 FAQ를 DB로 이관
- CMS 스타일 관리 시스템 구축

## 📝 작업 체크리스트

### Phase 1: 데이터 연결 (1-2일)
- [ ] knife_types 테이블 데이터 연결
- [ ] 이용내역 실제 데이터 연결
- [ ] 알림 실제 데이터 연결
- [ ] testUserId 모두 제거

### Phase 2: 플로우 연결 (1일)
- [ ] 예약 생성 플로우 확인
- [ ] 결제 완료 플로우 확인
- [ ] 알림 생성 플로우 확인
- [ ] 주소 선택 플로우 확인

### Phase 3: 테스트 (반나절)
- [ ] 전체 예약 플로우 테스트
- [ ] 데이터 일관성 확인
- [ ] 에러 처리 확인
- [ ] 로딩 상태 확인

## 🚫 주의사항

1. **UI 수정 금지**: 
   - 디자인, 레이아웃, 스타일 변경 없음
   - 기존 컴포넌트 구조 유지
   - 클래스명 변경 금지

2. **데이터만 변경**:
   - Mock → Real DB
   - 하드코딩 → Dynamic
   - 테스트 ID → 실제 인증

3. **에러 처리**:
   - 로딩 상태 표시
   - 에러 메시지 표시
   - 빈 상태 처리

4. **하위 호환성**:
   - 기존 데이터 구조 유지
   - 필요시 데이터 변환 함수 작성

## 🔧 필요한 도구

### Supabase 테이블 확인
```sql
-- 필요한 테이블 목록
- users
- knife_types
- bookings
- booking_items
- payments
- notifications
- user_addresses
- coupons
- user_coupons
- subscriptions
```

### 서비스 파일
```
lib/
├── auth/supabase.ts ✅
├── knife-service.ts (생성 필요)
├── booking-service.ts ✅
├── payment-service.ts ✅
├── notification-service.ts ✅
├── address-service.ts ✅
├── coupon-service.ts ✅
└── subscription-service.ts (확인 필요)
```

## 📅 예상 일정
- **Day 1**: Priority 1 작업 (칼 종류, 이용내역, 알림, testUserId)
- **Day 2**: Priority 2 작업 (주소, 예약, 결제 플로우)
- **Day 3**: 테스트 및 디버깅

## ✅ 완료 기준
1. 모든 페이지가 실제 DB 데이터 표시
2. Mock 데이터 의존성 제거
3. 전체 예약-결제 플로우 정상 작동
4. 하드코딩된 테스트 데이터 제거
5. UI 변경 없음 확인

---

작성일: 2025-01-01
작성자: Claude
버전: 1.0.0