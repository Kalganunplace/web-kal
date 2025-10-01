'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  Store,
  Bell,
  Clock,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  Save,
  RefreshCw,
  Shield,
  Database,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  
  const [businessInfo, setBusinessInfo] = useState({
    name: '칼가는곳',
    phone: '1588-0000',
    email: 'support@kalganun.com',
    address: '대구광역시 중구 동성로3길 21',
    businessNumber: '123-45-67890',
    ceo: '홍길동',
  });

  const [operationSettings, setOperationSettings] = useState({
    operationHours: '오전 9시 - 오후 6시',
    holidayNotice: '일요일, 공휴일 휴무',
    minOrderAmount: 10000,
    deliveryFee: 0,
    freeDeliveryAmount: 0,
    autoConfirmMinutes: 30,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    adminEmail: 'admin@kalganun.com',
    adminPhone: '01012345678',
    orderNotification: true,
    lowStockNotification: false,
    dailyReport: true,
  });

  const [systemInfo, setSystemInfo] = useState({
    version: '1.0.0',
    lastBackup: '2025-01-29 03:00',
    dbSize: '125 MB',
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    checkAuth();
    fetchSystemInfo();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth');
      const data = await response.json();
      if (data.success) {
        setCurrentAdmin(data.data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const fetchSystemInfo = async () => {
    try {
      // 시스템 정보 가져오기
      const [ordersRes, productsRes] = await Promise.all([
        fetch('/api/admin/orders?limit=1'),
        fetch('/api/admin/products')
      ]);

      const ordersData = await ordersRes.json();
      const productsData = await productsRes.json();

      if (ordersData.success && productsData.success) {
        setSystemInfo(prev => ({
          ...prev,
          totalOrders: ordersData.pagination?.total || 0,
          totalProducts: productsData.data.length,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch system info:', error);
    }
  };

  const handleSaveBusinessInfo = async () => {
    setLoading(true);
    try {
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: '성공',
        description: '사업자 정보가 저장되었습니다.',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: '저장에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOperationSettings = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: '성공',
        description: '운영 설정이 저장되었습니다.',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: '저장에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: '성공',
        description: '알림 설정이 저장되었습니다.',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: '저장에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    if (!confirm('데이터베이스 백업을 진행하시겠습니까?')) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: '성공',
        description: '데이터베이스 백업이 완료되었습니다.',
      });
      
      setSystemInfo(prev => ({
        ...prev,
        lastBackup: new Date().toLocaleString('ko-KR'),
      }));
    } catch (error) {
      toast({
        title: '오류',
        description: '백업에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">설정</h1>
        <p className="text-gray-600 mt-1">시스템 설정을 관리합니다.</p>
      </div>

      <Tabs defaultValue="business" className="space-y-4">
        <TabsList>
          <TabsTrigger value="business">사업자 정보</TabsTrigger>
          <TabsTrigger value="operation">운영 설정</TabsTrigger>
          <TabsTrigger value="notifications">알림 설정</TabsTrigger>
          <TabsTrigger value="system">시스템 정보</TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                사업자 정보
              </CardTitle>
              <CardDescription>
                고객에게 표시되는 사업자 정보를 설정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>상호명</Label>
                  <Input
                    value={businessInfo.name}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>대표자</Label>
                  <Input
                    value={businessInfo.ceo}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, ceo: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>사업자등록번호</Label>
                <Input
                  value={businessInfo.businessNumber}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, businessNumber: e.target.value })}
                />
              </div>

              <div>
                <Label>사업장 주소</Label>
                <Input
                  value={businessInfo.address}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>대표 전화번호</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={businessInfo.phone}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label>대표 이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={businessInfo.email}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveBusinessInfo}
                  disabled={loading}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  저장
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                운영 설정
              </CardTitle>
              <CardDescription>
                서비스 운영에 관한 설정을 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>영업 시간</Label>
                  <Input
                    value={operationSettings.operationHours}
                    onChange={(e) => setOperationSettings({ ...operationSettings, operationHours: e.target.value })}
                  />
                </div>
                <div>
                  <Label>휴무일</Label>
                  <Input
                    value={operationSettings.holidayNotice}
                    onChange={(e) => setOperationSettings({ ...operationSettings, holidayNotice: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-3">주문 설정</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>최소 주문 금액</Label>
                      <Input
                        type="number"
                        value={operationSettings.minOrderAmount}
                        onChange={(e) => setOperationSettings({ 
                          ...operationSettings, 
                          minOrderAmount: parseInt(e.target.value) 
                        })}
                      />
                    </div>
                    <div>
                      <Label>자동 확정 시간 (분)</Label>
                      <Input
                        type="number"
                        value={operationSettings.autoConfirmMinutes}
                        onChange={(e) => setOperationSettings({ 
                          ...operationSettings, 
                          autoConfirmMinutes: parseInt(e.target.value) 
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveOperationSettings}
                  disabled={loading}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  저장
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                알림 설정
              </CardTitle>
              <CardDescription>
                알림 수신 방법과 대상을 설정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-3">알림 수신 방법</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications">이메일 알림</Label>
                    <Switch
                      id="email-notifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sms-notifications">SMS 알림</Label>
                    <Switch
                      id="sms-notifications"
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, smsNotifications: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-3">알림 수신 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>관리자 이메일</Label>
                    <Input
                      value={notificationSettings.adminEmail}
                      onChange={(e) => setNotificationSettings({ 
                        ...notificationSettings, 
                        adminEmail: e.target.value 
                      })}
                    />
                  </div>
                  <div>
                    <Label>관리자 전화번호</Label>
                    <Input
                      value={notificationSettings.adminPhone}
                      onChange={(e) => setNotificationSettings({ 
                        ...notificationSettings, 
                        adminPhone: e.target.value 
                      })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-3">알림 종류</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="order-notification">신규 주문 알림</Label>
                      <p className="text-xs text-gray-500">새로운 주문이 접수되면 알림을 받습니다</p>
                    </div>
                    <Switch
                      id="order-notification"
                      checked={notificationSettings.orderNotification}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, orderNotification: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="daily-report">일일 리포트</Label>
                      <p className="text-xs text-gray-500">매일 오후 9시에 일일 매출 리포트를 받습니다</p>
                    </div>
                    <Switch
                      id="daily-report"
                      checked={notificationSettings.dailyReport}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, dailyReport: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveNotifications}
                  disabled={loading}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  저장
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  시스템 정보
                </CardTitle>
                <CardDescription>
                  시스템 상태와 통계를 확인합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">버전</p>
                    <p className="text-lg font-semibold">{systemInfo.version}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">총 주문 수</p>
                    <p className="text-lg font-semibold">{systemInfo.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">총 상품 수</p>
                    <p className="text-lg font-semibold">{systemInfo.totalProducts}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">데이터베이스 크기</p>
                    <p className="text-lg font-semibold">{systemInfo.dbSize}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">마지막 백업</p>
                    <p className="text-lg font-semibold">{systemInfo.lastBackup}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">현재 관리자</p>
                    <p className="text-lg font-semibold">{currentAdmin?.name || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  데이터베이스 관리
                </CardTitle>
                <CardDescription>
                  데이터베이스 백업 및 관리 작업을 수행합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      데이터베이스 백업은 시스템 리소스를 많이 사용할 수 있습니다.
                      가급적 사용자가 적은 시간대에 진행해주세요.
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleBackup}
                      disabled={loading}
                      variant="outline"
                    >
                      <Database className="h-4 w-4 mr-2" />
                      데이터베이스 백업
                    </Button>
                    <Button 
                      onClick={() => window.location.reload()}
                      variant="outline"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      캐시 초기화
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {currentAdmin?.role === 'super_admin' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    보안 설정
                  </CardTitle>
                  <CardDescription>
                    시스템 보안 관련 설정을 관리합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>슈퍼 관리자 권한</strong>으로 접속 중입니다.
                      모든 시스템 설정에 접근할 수 있습니다.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}