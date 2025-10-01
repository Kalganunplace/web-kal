# DB 연결 구현 가이드 (상세)

## 🎯 작업 1: 칼 종류 데이터 DB 연결

### 현재 상태 분석
**파일 위치**: `/app/(client)/knife-request/page.tsx`

**현재 코드 (하드코딩)**:
```typescript
const knifeTypes = [
  {
    id: "1",
    name: "주방용 칼",
    basePrice: 5000,
    discountRate: 20,
    image: "/images/knife1.jpg"
  },
  // ... 더 많은 하드코딩된 데이터
]
```

### 구현 단계

#### Step 1: knife-service.ts 생성
```typescript
// lib/knife-service.ts
import { createClient } from '@/lib/auth/supabase'

export interface KnifeType {
  id: string
  name: string
  description?: string
  image_url?: string
  market_price: number
  discount_price: number
  care_instructions?: string
  additional_notes?: string
  is_active: boolean
  display_order: number
}

export class KnifeService {
  private supabase = createClient()

  async getAllKnifeTypes(): Promise<KnifeType[]> {
    const { data, error } = await this.supabase
      .from('knife_types')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('칼 종류 조회 오류:', error)
      return []
    }

    return data || []
  }

  // 가격 포맷팅 헬퍼
  formatPrice(amount: number): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount)
  }

  // 할인율 계산
  getDiscountRate(marketPrice: number, discountPrice: number): number {
    return Math.round((1 - discountPrice / marketPrice) * 100)
  }
}

export const knifeService = new KnifeService()
```

#### Step 2: knife-request 페이지 수정
```typescript
// 수정 전
const knifeTypes = [...] // 하드코딩

// 수정 후
import { knifeService, type KnifeType } from '@/lib/knife-service'

// 컴포넌트 내부
const [knifeTypes, setKnifeTypes] = useState<KnifeType[]>([])
const [isLoadingKnives, setIsLoadingKnives] = useState(true)

useEffect(() => {
  const loadKnifeTypes = async () => {
    try {
      setIsLoadingKnives(true)
      const types = await knifeService.getAllKnifeTypes()
      setKnifeTypes(types)
    } catch (error) {
      console.error('칼 종류 로드 실패:', error)
    } finally {
      setIsLoadingKnives(false)
    }
  }
  
  loadKnifeTypes()
}, [])
```

---

## 🎯 작업 2: 이용내역 실제 DB 연결

### 현재 상태 분석
**파일 위치**: `/app/(client)/usage-history/page.tsx`

**현재 코드 (Mock)**:
```typescript
import { getScenario, usageHistoryScenarios } from "@/mock/usage-history"
const scenario = getScenario("with_current_service")
```

### 구현 단계

#### Step 1: 컴포넌트 수정
```typescript
// 수정 전
import { getScenario } from "@/mock/usage-history"

// 수정 후
import { bookingService } from '@/lib/booking-service'
import { useAuthStore } from '@/stores/auth-store'

export default function UsageHistoryPage() {
  const { user } = useAuthStore()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // 현재 진행 중인 서비스
  const currentService = bookings.find(b => 
    b.status === 'in_progress' || b.status === 'confirmed'
  )
  
  // 완료된 서비스
  const completedServices = bookings.filter(b => 
    b.status === 'completed'
  )
  
  // 연간 통계
  const yearlyStats = {
    year: new Date().getFullYear(),
    totalServices: bookings.length,
    totalAmount: bookings.reduce((sum, b) => sum + b.total_amount, 0)
  }

  useEffect(() => {
    if (user?.id) {
      loadBookings()
    }
  }, [user?.id])

  const loadBookings = async () => {
    try {
      setIsLoading(true)
      const data = await bookingService.getUserBookings(user!.id)
      setBookings(data)
    } catch (error) {
      console.error('예약 내역 로드 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }
}
```

#### Step 2: 상태별 표시 매핑
```typescript
const getStatusDisplay = (status: string) => {
  const statusMap = {
    'pending': { text: '예약 대기', color: 'text-yellow-600' },
    'confirmed': { text: '예약 확정', color: 'text-blue-600' },
    'in_progress': { text: '진행 중', color: 'text-orange-600' },
    'completed': { text: '완료', color: 'text-green-600' },
    'cancelled': { text: '취소됨', color: 'text-gray-600' }
  }
  return statusMap[status] || { text: status, color: 'text-gray-600' }
}
```

---

## 🎯 작업 3: 알림 페이지 실제 DB 연결

### 현재 상태 분석
**파일 위치**: `/app/(client)/notifications/page.tsx`

**현재 코드 (하드코딩)**:
```typescript
const notifications = [
  {
    id: "1",
    title: "칼이 배송중입니다!",
    message: "연마완료 안전하게 배송중이예요!",
    time: "방금 전",
    isRead: false,
  }
]
```

### 구현 단계

#### Step 1: 컴포넌트 수정
```typescript
import { notificationService } from '@/lib/notification-service'
import { useAuthStore } from '@/stores/auth-store'

export default function NotificationsPage() {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user?.id) {
      loadNotifications()
    }
  }, [user?.id])

  const loadNotifications = async () => {
    try {
      setIsLoading(true)
      const data = await notificationService.getUserNotifications(user!.id)
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.is_read).length)
    } catch (error) {
      console.error('알림 로드 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId, user!.id)
      // 로컬 상태 업데이트
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(user!.id)
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('전체 읽음 처리 실패:', error)
    }
  }
}
```

---

## 🎯 작업 4: testUserId 제거

### 영향받는 파일들
1. `/app/(client)/address-settings/page.tsx`
2. `/components/features/knife/knife-request.tsx`
3. 기타 하드코딩된 ID 사용 파일

### 구현 단계

#### Step 1: address-settings 수정
```typescript
// 수정 전
const testUserId = "6e29121f-909e-4abf-bdcc-32f08d33a001"

// 수정 후
import { useAuthStore } from '@/stores/auth-store'
import { useRouter } from 'next/navigation'

export default function AddressSettingsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (user?.id) {
      loadAddresses()
    }
  }, [isAuthenticated, user?.id])
  
  const loadAddresses = async () => {
    try {
      const userAddresses = await addressService.getUserAddresses(user!.id)
      setAddresses(userAddresses)
    } catch (error) {
      console.error('주소 목록 로드 중 오류:', error)
    }
  }
}
```

#### Step 2: knife-request 수정
```typescript
// useAuthStore 사용하여 실제 사용자 정보 가져오기
const { user, isAuthenticated } = useAuthStore()

// 예약 생성 시 실제 user.id 사용
const handleSubmit = async () => {
  if (!isAuthenticated || !user?.id) {
    openModal('login')
    return
  }
  
  const booking = await bookingService.createBooking(user.id, bookingData)
}
```

---

## 🔍 테스트 체크리스트

### 1. 칼 종류 데이터
- [ ] 페이지 로드 시 칼 종류가 표시되는가?
- [ ] 가격이 올바르게 표시되는가?
- [ ] 로딩 상태가 표시되는가?
- [ ] 에러 시 적절한 처리가 되는가?

### 2. 이용내역
- [ ] 실제 예약 내역이 표시되는가?
- [ ] 상태별 필터링이 작동하는가?
- [ ] 빈 상태 처리가 되는가?
- [ ] 날짜 형식이 올바른가?

### 3. 알림
- [ ] 실제 알림이 표시되는가?
- [ ] 읽음/안읽음 상태가 구분되는가?
- [ ] 읽음 처리가 작동하는가?
- [ ] 시간 표시가 올바른가?

### 4. 인증
- [ ] 로그인 없이 접근 시 리다이렉트되는가?
- [ ] 실제 사용자 ID가 사용되는가?
- [ ] 로그아웃 후 적절히 처리되는가?

---

## ⚠️ 주의사항

### UI 보존
```typescript
// ❌ 하지 말 것
<div className="새로운-클래스">...</div>

// ✅ 해야 할 것
<div className="기존-클래스">
  {/* 데이터만 변경 */}
  {realData.map(...)}
</div>
```

### 로딩 상태
```typescript
// 기존 UI 구조 유지하며 로딩 표시
if (isLoading) {
  return (
    <기존컨테이너>
      <로딩스피너 />
    </기존컨테이너>
  )
}
```

### 에러 처리
```typescript
// toast 또는 console.error 사용
try {
  // DB 작업
} catch (error) {
  console.error('에러:', error)
  // UI는 변경하지 않고 빈 상태 표시
}
```

---

## 📝 커밋 메시지 규칙
```bash
# 좋은 예
git commit -m "feat: 칼 종류 데이터 실제 DB 연결"
git commit -m "fix: testUserId 제거 및 실제 인증 사용"
git commit -m "refactor: 이용내역 Mock 데이터를 실제 DB로 교체"

# 나쁜 예
git commit -m "UI 수정 및 DB 연결" # UI 수정 금지!
git commit -m "update" # 너무 모호함
```

---

작성일: 2025-01-01
버전: 1.0.0