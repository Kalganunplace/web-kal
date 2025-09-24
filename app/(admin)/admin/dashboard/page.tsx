"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAdminAuth } from "@/hooks/useAdminAuth"
import {
    BarChart3,
    Bell,
    Calendar,
    CreditCard,
    DollarSign,
    Image,
    Settings,
    Shield,
    Tag,
    Users
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AdminDashboard() {
  const router = useRouter()
  const { requireAuth } = useAdminAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeBookings: 0,
    pendingPayments: 0,
    monthlyRevenue: 0
  })

  useEffect(() => {
    // 인증 확인
    try {
      requireAuth()
    } catch {
      return
    }

    // 통계 데이터 로드 (향후 API 연동)
    setStats({
      totalUsers: 2,
      activeBookings: 0,
      pendingPayments: 0,
      monthlyRevenue: 0
    })
  }, [])

  const adminMenuItems = [
    {
      title: "홈 배너 관리",
      description: "메인 화면 배너 수정 및 관리",
      icon: Image,
      href: "/admin/banners",
      color: "bg-blue-500"
    },
    {
      title: "가격표 관리",
      description: "서비스 가격 수정 및 설정",
      icon: DollarSign,
      href: "/admin/pricing",
      color: "bg-green-500"
    },
    {
      title: "쿠폰 관리",
      description: "쿠폰 발행, 제거 및 관리",
      icon: Tag,
      href: "/admin/coupons",
      color: "bg-purple-500"
    },
    {
      title: "사용자 관리",
      description: "회원 정보 및 상태 관리",
      icon: Users,
      href: "/admin/users",
      color: "bg-indigo-500"
    },
    {
      title: "예약 관리",
      description: "예약 현황 및 스케줄 관리",
      icon: Calendar,
      href: "/admin/bookings",
      color: "bg-orange-500"
    },
    {
      title: "결제 관리",
      description: "결제 확인 및 입금 처리",
      icon: CreditCard,
      href: "/admin/payments",
      color: "bg-red-500"
    },
    {
      title: "직원 관리",
      description: "직원 스케줄 및 배정 관리",
      icon: Shield,
      href: "/admin/staff",
      color: "bg-teal-500"
    },
    {
      title: "알림 관리",
      description: "푸시 알림 및 공지사항 관리",
      icon: Bell,
      href: "/admin/notifications",
      color: "bg-yellow-500"
    },
    {
      title: "통계 및 분석",
      description: "매출 및 이용 현황 분석",
      icon: BarChart3,
      href: "/admin/analytics",
      color: "bg-pink-500"
    },
    {
      title: "시스템 설정",
      description: "앱 전반적인 설정 관리",
      icon: Settings,
      href: "/admin/settings",
      color: "bg-gray-500"
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">칼가는곳 관리자</h1>
          <p className="text-gray-600 mt-1">서비스 운영 및 관리 대시보드</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/')}
        >
          메인 사이트로
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">전체 등록 사용자</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 예약</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeBookings}</div>
            <p className="text-xs text-muted-foreground">처리 중인 예약</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">대기 결제</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">확인 대기 중</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">월 매출</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyRevenue.toLocaleString()}원</div>
            <p className="text-xs text-muted-foreground">이번 달 총 매출</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminMenuItems.map((item) => {
          const IconComponent = item.icon
          return (
            <Card
              key={item.href}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(item.href)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.color}`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">빠른 작업</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            className="h-12 bg-orange-500 hover:bg-orange-600"
            onClick={() => router.push('/admin/banners')}
          >
            <Image className="h-4 w-4 mr-2" />
            배너 수정
          </Button>
          <Button
            variant="outline"
            className="h-12"
            onClick={() => router.push('/admin/coupons/create')}
          >
            <Tag className="h-4 w-4 mr-2" />
            쿠폰 발행
          </Button>
          <Button
            variant="outline"
            className="h-12"
            onClick={() => router.push('/admin/payments')}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            입금 확인
          </Button>
        </div>
      </div>
    </div>
  )
}
