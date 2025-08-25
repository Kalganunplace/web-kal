// 이용내역 페이지 더미 데이터

export type ServiceStatus =
  | "신청 중"
  | "결제 중"
  | "예약 확정 중"
  | "픽업 대기 중"
  | "연마 중"
  | "배송 중"
  | "완료"

export type UserStatus = "logged_in" | "logged_out"

export interface CurrentService {
  icon: string
  title: string
  description: string
  status: ServiceStatus
}

export interface YearlyStats {
  year: string
  sharpening_count: string
  total_amount: string
}

export interface OrderItem {
  name: string
  price: number
  quantity: number
}

export interface HistoryItem {
  date: string
  amount: string
  items: string
  order_number?: string
  payment_method?: string
  discount?: string
  tax?: string
  time?: string
  // 상세 정보 (영수증용)
  detailed?: {
    order_number: string
    time: string
    order_type: string
    order_items: OrderItem[]
    subtotal: number
    discount: number
    discount_name: string
    tax: number
    total: number
    payment_method: string
  }
}

export interface UsageHistoryData {
  userStatus: UserStatus
  isLoading: boolean
  hasCurrentService: boolean
  hasHistory: boolean
  currentService?: CurrentService
  yearlyStats: YearlyStats
  historyItems: HistoryItem[]
}

// 서비스 진행 상태별 데이터
export const serviceStatusData: Record<ServiceStatus, CurrentService> = {
  "신청 중": {
    icon: "✏️",
    title: "칼갈이 신청이 접수되었어요!",
    description: "이제 결제를 진행해 주시면 됩니다",
    status: "신청 중"
  },
  "결제 중": {
    icon: "💳",
    title: "결제 진행 중입니다!",
    description: "클릭해서 결제를 마무리 해주세요",
    status: "결제 중"
  },
  "예약 확정 중": {
    icon: "📅",
    title: "방문 예약 확정 중입니다",
    description: "장인분과 일정 조율 중이에요 :)",
    status: "예약 확정 중"
  },
  "픽업 대기 중": {
    icon: "📦",
    title: "칼을 준비해주세요!",
    description: "저희가 곧 픽업하러 갑니다",
    status: "픽업 대기 중"
  },
  "연마 중": {
    icon: "🔪",
    title: "장인이 칼을 연마하고 있어요",
    description: "실시간으로 날카로워 지고 있어요",
    status: "연마 중"
  },
  "배송 중": {
    icon: "🚚",
    title: "칼이 배송중입니다!",
    description: "연마 완료! 안전하게 배송 중이에요 :)",
    status: "배송 중"
  },
  "완료": {
    icon: "✅",
    title: "칼갈이 완료!",
    description: "날이 무뎌질때 또 봐요 우리!",
    status: "완료"
  }
}

// 시나리오별 더미 데이터
export const usageHistoryScenarios: Record<string, UsageHistoryData> = {
  // 1. 로딩 중
  loading: {
    userStatus: "logged_in",
    isLoading: true,
    hasCurrentService: false,
    hasHistory: false,
    yearlyStats: {
      year: "2025년",
      sharpening_count: "0회",
      total_amount: "0원"
    },
    historyItems: []
  },

  // 2. 신청 중 상태 + 이용내역 있음
  with_current_service: {
    userStatus: "logged_in",
    isLoading: false,
    hasCurrentService: true,
    hasHistory: true,
    currentService: serviceStatusData["신청 중"],
    yearlyStats: {
      year: "2025년",
      sharpening_count: "1회",
      total_amount: "22,550원"
    },
    historyItems: [
      {
        date: "2025.06.06",
        amount: "22,550원",
        items: "일반 식도류 3, 정육도 2",
        order_number: "0000001",
        time: "2025.06.06.13:13",
        payment_method: "Kakao Pay",
        discount: "-9,000원",
        tax: "2,500원",
        detailed: {
          order_number: "0000001",
          time: "2025.06.06.13:13",
          order_type: "일반 주문",
          order_items: [
            { name: "일반 식도류", price: 12000, quantity: 3 },
            { name: "정육도", price: 10000, quantity: 2 }
          ],
          subtotal: 32000,
          discount: 9000,
          discount_name: "신규 유저 1+1 웰컴 쿠폰",
          tax: 2500,
          total: 25500,
          payment_method: "Kakao Pay"
        }
      }
    ]
  },

  // 3. 결제 중 상태
  payment_in_progress: {
    userStatus: "logged_in",
    isLoading: false,
    hasCurrentService: true,
    hasHistory: true,
    currentService: serviceStatusData["결제 중"],
    yearlyStats: {
      year: "2025년",
      sharpening_count: "2회",
      total_amount: "35,000원"
    },
    historyItems: [
      {
        date: "2025.06.06",
        amount: "22,550원",
        items: "일반 식도류 3, 정육도 2",
        detailed: {
          order_number: "0000001",
          time: "2025.06.06.13:13",
          order_type: "일반 주문",
          order_items: [
            { name: "일반 식도류", price: 12000, quantity: 3 },
            { name: "정육도", price: 10000, quantity: 2 }
          ],
          subtotal: 32000,
          discount: 9000,
          discount_name: "신규 유저 1+1 웰컴 쿠폰",
          tax: 2500,
          total: 25500,
          payment_method: "Kakao Pay"
        }
      },
      {
        date: "2025.05.15",
        amount: "12,450원",
        items: "과도 2, 가위 1",
        detailed: {
          order_number: "0000002",
          time: "2025.05.15.10:30",
          order_type: "일반 주문",
          order_items: [
            { name: "과도", price: 4000, quantity: 2 },
            { name: "가위", price: 4000, quantity: 1 }
          ],
          subtotal: 12000,
          discount: 0,
          discount_name: "",
          tax: 1200,
          total: 13200,
          payment_method: "신용카드"
        }
      }
    ]
  },

  // 4. 연마 중 상태
  sharpening_in_progress: {
    userStatus: "logged_in",
    isLoading: false,
    hasCurrentService: true,
    hasHistory: true,
    currentService: serviceStatusData["연마 중"],
    yearlyStats: {
      year: "2025년",
      sharpening_count: "3회",
      total_amount: "48,500원"
    },
    historyItems: [
      {
        date: "2025.06.06",
        amount: "22,550원",
        items: "일반 식도류 3, 정육도 2",
        detailed: {
          order_number: "0000001",
          time: "2025.06.06.13:13",
          order_type: "일반 주문",
          order_items: [
            { name: "일반 식도류", price: 12000, quantity: 3 },
            { name: "정육도", price: 10000, quantity: 2 }
          ],
          subtotal: 32000,
          discount: 9000,
          discount_name: "신규 유저 1+1 웰컴 쿠폰",
          tax: 2500,
          total: 25500,
          payment_method: "Kakao Pay"
        }
      },
      {
        date: "2025.05.15",
        amount: "12,450원",
        items: "과도 2, 가위 1"
      },
      {
        date: "2025.04.20",
        amount: "13,500원",
        items: "회칼 1, 정육도 1"
      }
    ]
  },

  // 5. 배송 중 상태
  delivery_in_progress: {
    userStatus: "logged_in",
    isLoading: false,
    hasCurrentService: true,
    hasHistory: true,
    currentService: serviceStatusData["배송 중"],
    yearlyStats: {
      year: "2025년",
      sharpening_count: "4회",
      total_amount: "62,000원"
    },
    historyItems: [
      {
        date: "2025.06.06",
        amount: "22,550원",
        items: "일반 식도류 3, 정육도 2"
      },
      {
        date: "2025.05.15",
        amount: "12,450원",
        items: "과도 2, 가위 1"
      },
      {
        date: "2025.04.20",
        amount: "13,500원",
        items: "회칼 1, 정육도 1"
      },
      {
        date: "2025.03.10",
        amount: "13,500원",
        items: "일반 식도류 2"
      }
    ]
  },

  // 6. 진행 중인 서비스 없음 + 이용내역 있음
  no_current_service: {
    userStatus: "logged_in",
    isLoading: false,
    hasCurrentService: false,
    hasHistory: true,
    yearlyStats: {
      year: "2025년",
      sharpening_count: "5회",
      total_amount: "75,500원"
    },
    historyItems: [
      {
        date: "2025.06.06",
        amount: "22,550원",
        items: "일반 식도류 3, 정육도 2"
      },
      {
        date: "2025.05.15",
        amount: "12,450원",
        items: "과도 2, 가위 1"
      },
      {
        date: "2025.04.20",
        amount: "13,500원",
        items: "회칼 1, 정육도 1"
      },
      {
        date: "2025.03.10",
        amount: "13,500원",
        items: "일반 식도류 2"
      },
      {
        date: "2025.02.05",
        amount: "13,500원",
        items: "정육도 1, 과도 1"
      }
    ]
  },

  // 7. 이용내역 없음
  no_history: {
    userStatus: "logged_in",
    isLoading: false,
    hasCurrentService: false,
    hasHistory: false,
    yearlyStats: {
      year: "2025년",
      sharpening_count: "0회",
      total_amount: "0원"
    },
    historyItems: []
  },

  // 8. 로그인 전
  logged_out: {
    userStatus: "logged_out",
    isLoading: false,
    hasCurrentService: false,
    hasHistory: false,
    yearlyStats: {
      year: "2025년",
      sharpening_count: "0회",
      total_amount: "0원"
    },
    historyItems: []
  }
}

// 현재 시나리오 선택을 위한 헬퍼
export const getCurrentScenario = (): UsageHistoryData => {
  // 개발 중에는 다양한 시나리오를 테스트할 수 있도록
  const scenarios = Object.keys(usageHistoryScenarios)
  const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)]

  // 특정 시나리오를 테스트하고 싶다면 여기서 직접 지정
  return usageHistoryScenarios["with_current_service"] // 기본값
}

// 시나리오 변경을 위한 함수
export const getScenario = (scenarioName: string): UsageHistoryData => {
  return usageHistoryScenarios[scenarioName] || usageHistoryScenarios["with_current_service"]
}
