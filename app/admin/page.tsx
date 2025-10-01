'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  Activity,
  CreditCard,
} from 'lucide-react';
import { useAdminAuth } from '@/stores/auth-store';
import { AccountSwitchModal } from '@/components/auth/account-switch-modal';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading, hydrated, signOut } = useAdminAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // 클라이언트가 관리자 페이지 접근 시 모달 표시
  useEffect(() => {
    if (hydrated && !loading) {
      if (!user) {
        router.push('/admin/login');
      } else if (user.type === 'client') {
        setShowLogoutModal(true);
      }
    }
  }, [user, loading, hydrated, router]);

  // 로그아웃 확인
  const handleLogout = async () => {
    await signOut();
    router.push('/admin/login');
  };

  // 취소 - 홈으로
  const handleCancel = () => {
    router.push('/');
  };

  // 로딩 중
  if (!hydrated || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 클라이언트 계정 로그아웃 확인 모달
  if (showLogoutModal && user?.type === 'client') {
    return (
      <AccountSwitchModal
        currentUserName={user.name || '사용자'}
        currentUserType="client"
        targetType="admin"
        onConfirm={handleLogout}
        onCancel={handleCancel}
      />
    );
  }

  // 관리자가 아닌 경우 (혹시 모를 상황)
  if (!user || user.type !== 'admin') {
    return null;
  }
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalCoupons: 0,
    usedCoupons: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 주문 데이터
      const ordersRes = await fetch('/api/admin/orders?limit=100');
      const ordersData = await ordersRes.json();
      
      // 상품 데이터
      const productsRes = await fetch('/api/admin/products');
      const productsData = await productsRes.json();
      
      // 쿠폰 데이터
      const couponsRes = await fetch('/api/admin/coupons');
      const couponsData = await couponsRes.json();

      if (ordersData.success && productsData.success && couponsData.success) {
        const orders = ordersData.data;
        const products = productsData.data;
        const coupons = couponsData.data;

        setStats({
          totalOrders: orders.length,
          pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
          completedOrders: orders.filter((o: any) => o.status === 'completed').length,
          totalRevenue: orders.reduce((sum: number, o: any) => sum + o.total_amount, 0),
          totalProducts: products.length,
          activeProducts: products.filter((p: any) => p.is_active).length,
          totalCoupons: coupons.length,
          usedCoupons: coupons.filter((c: any) => c.is_used).length,
        });
      }
    } catch (error) {
      console.error('대시보드 데이터 로딩 실패:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price);
  };

  // 차트 데이터
  const salesChartData = {
    labels: ['월', '화', '수', '목', '금', '토', '일'],
    datasets: [
      {
        label: '일별 매출',
        data: [120000, 190000, 150000, 250000, 220000, 300000, 280000],
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const orderStatusData = {
    labels: ['대기중', '진행중', '완료', '취소'],
    datasets: [
      {
        data: [
          stats.pendingOrders,
          stats.totalOrders - stats.pendingOrders - stats.completedOrders,
          stats.completedOrders,
          0,
        ],
        backgroundColor: [
          'rgba(156, 163, 175, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-gray-600 mt-1">칼가는곳 관리자 대시보드에 오신 것을 환영합니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 매출</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-600" />
              지난달 대비 12% 증가
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">주문 수</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              대기중 {stats.pendingOrders}건
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 상품</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProducts}</div>
            <p className="text-xs text-muted-foreground">
              전체 {stats.totalProducts}개 중
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">쿠폰 사용률</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalCoupons > 0 
                ? Math.round((stats.usedCoupons / stats.totalCoupons) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.usedCoupons}/{stats.totalCoupons} 사용
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>주간 매출 현황</CardTitle>
            <CardDescription>최근 7일간 매출 추이</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Line data={salesChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>주문 상태</CardTitle>
            <CardDescription>전체 주문 상태 분포</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Doughnut data={orderStatusData} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 최근 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>최근 주문</CardTitle>
            <CardDescription>최근 접수된 주문 목록</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <div>
                      <p className="text-sm font-medium">ORD20250{i}29001</p>
                      <p className="text-xs text-gray-500">홍길동 - 소형칼 외 2건</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">5분 전</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>인기 상품 TOP 5</CardTitle>
            <CardDescription>가장 많이 주문된 상품</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: '소형 칼', count: 45, price: 3000 },
                { name: '일반 칼', count: 38, price: 6000 },
                { name: '대형 칼', count: 25, price: 8000 },
                { name: '일반 가위', count: 22, price: 3000 },
                { name: '회칼', count: 15, price: 13000 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-bold text-orange-500">#{i + 1}</div>
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium">{item.count}건</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}