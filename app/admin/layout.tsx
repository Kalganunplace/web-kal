'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Ticket,
  Image,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Banknote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { AccountSwitchModal } from '@/components/auth/account-switch-modal';
import { useAuth } from '@/stores/auth-store';

const menuItems = [
  {
    href: '/admin',
    label: '대시보드',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/products',
    label: '상품 관리',
    icon: Package,
  },
  {
    href: '/admin/orders',
    label: '주문 관리',
    icon: ShoppingCart,
  },
  {
    href: '/admin/coupons',
    label: '쿠폰 관리',
    icon: Ticket,
  },
  {
    href: '/admin/banners',
    label: '배너 관리',
    icon: Image,
  },
  {
    href: '/admin/bank-accounts',
    label: '계좌 관리',
    icon: Banknote,
  },
  {
    href: '/admin/admins',
    label: '관리자 관리',
    icon: Users,
  },
  {
    href: '/admin/settings',
    label: '설정',
    icon: Settings,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [admin, setAdmin] = useState<any>(null);
  const [clientUser, setClientUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          if (data.user.type === 'admin') {
            setAdmin(data.user);
            setShowSwitchModal(false);
          } else if (data.user.type === 'client' && pathname !== '/admin/login') {
            // 클라이언트가 관리자 페이지 접근 시 모달 표시
            setClientUser(data.user);
            setShowSwitchModal(true);
          }
        } else if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      } else if (pathname !== '/admin/login') {
        router.push('/admin/login');
      }
    } catch (error) {
      if (pathname !== '/admin/login') {
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // 계정 전환 확인
  const handleSwitchConfirm = async () => {
    await signOut();
    setShowSwitchModal(false);
    router.push('/admin/login');
  };

  // 계정 전환 취소
  const handleSwitchCancel = () => {
    setShowSwitchModal(false);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // 클라이언트 계정 전환 모달
  if (showSwitchModal && clientUser) {
    return (
      <AccountSwitchModal
        currentUserName={clientUser.name || '사용자'}
        currentUserType="client"
        targetType="admin"
        onConfirm={handleSwitchConfirm}
        onCancel={handleSwitchCancel}
      />
    );
  }

  if (!admin) {
    return null;
  }

  const SidebarContent = () => (
    <>
      <div className="px-4 py-6 border-b">
        <h2 className="text-2xl font-bold text-orange-500">칼가는곳</h2>
        <p className="text-sm text-gray-600 mt-1">관리자 대시보드</p>
      </div>

      <nav className="flex-1 px-4 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isDisabled = item.href === '/admin/admins' && admin.role !== 'super_admin';

            if (isDisabled) return null;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-orange-100 text-orange-600'
                      : 'hover:bg-gray-100 text-gray-700'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-4 py-4 border-t">
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-900">{admin.name}</p>
          <p className="text-xs text-gray-600">{admin.email}</p>
          <p className="text-xs text-gray-500 capitalize mt-1">
            {admin.role.replace('_', ' ')}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          로그아웃
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-xl font-bold text-orange-500">칼가는곳</h2>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="md:hidden h-14" />
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}