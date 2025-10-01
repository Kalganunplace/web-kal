'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Gift, 
  Ticket, 
  Users, 
  Calendar,
  Percent,
  AlertCircle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface CouponType {
  id: string;
  name: string;
  description: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  valid_days: number;
  is_active: boolean;
}

interface UserCoupon {
  id: string;
  user_id: string;
  coupon_type_id: string;
  code: string;
  issued_at: string;
  expires_at: string;
  used_at?: string;
  is_used: boolean;
  user?: any;
  coupon_type?: CouponType;
}

export default function CouponsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('issued');
  const [couponTypes, setCouponTypes] = useState<CouponType[]>([]);
  const [userCoupons, setUserCoupons] = useState<UserCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<CouponType | null>(null);

  const [issueForm, setIssueForm] = useState({
    userPhone: '',
    couponTypeId: '',
    issueReason: '',
  });

  const [typeForm, setTypeForm] = useState({
    name: '',
    description: '',
    discount_type: 'percentage' as const,
    discount_value: '',
    min_order_amount: '0',
    max_discount_amount: '',
    valid_days: '30',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [typesRes, couponsRes] = await Promise.all([
        fetch('/api/admin/coupon-types'),
        fetch('/api/admin/coupons?includeExpired=true')
      ]);

      const typesData = await typesRes.json();
      const couponsData = await couponsRes.json();

      if (typesData.success) setCouponTypes(typesData.data);
      if (couponsData.success) setUserCoupons(couponsData.data);
    } catch (error) {
      toast({
        title: '오류',
        description: '데이터를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCoupon = async () => {
    try {
      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPhone: issueForm.userPhone,
          couponTypeId: issueForm.couponTypeId,
          issueReason: issueForm.issueReason,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: '성공',
          description: '쿠폰이 발급되었습니다.',
        });
        fetchData();
        setIsIssueDialogOpen(false);
        setIssueForm({ userPhone: '', couponTypeId: '', issueReason: '' });
      } else {
        toast({
          title: '오류',
          description: data.error || '쿠폰 발급에 실패했습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '오류',
        description: '쿠폰 발급에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveCouponType = async () => {
    try {
      const url = '/api/admin/coupon-types';
      const method = editingType ? 'PUT' : 'POST';
      const body = editingType
        ? { id: editingType.id, ...typeForm }
        : typeForm;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...body,
          discount_value: parseFloat(typeForm.discount_value),
          min_order_amount: parseFloat(typeForm.min_order_amount),
          max_discount_amount: typeForm.max_discount_amount ? parseFloat(typeForm.max_discount_amount) : null,
          valid_days: parseInt(typeForm.valid_days),
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: '성공',
          description: editingType ? '쿠폰 타입이 수정되었습니다.' : '쿠폰 타입이 추가되었습니다.',
        });
        fetchData();
        setIsTypeDialogOpen(false);
        resetTypeForm();
      }
    } catch (error) {
      toast({
        title: '오류',
        description: '작업을 완료하는데 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const resetTypeForm = () => {
    setEditingType(null);
    setTypeForm({
      name: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_amount: '0',
      max_discount_amount: '',
      valid_days: '30',
    });
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy.MM.dd HH:mm', { locale: ko });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price);
  };

  const getDiscountDisplay = (type: CouponType) => {
    if (type.discount_type === 'percentage') {
      return `${type.discount_value}% 할인`;
    } else {
      return `${formatPrice(type.discount_value)} 할인`;
    }
  };

  const getCouponStatusBadge = (coupon: UserCoupon) => {
    if (coupon.is_used) {
      return <Badge variant="secondary">사용완료</Badge>;
    }
    const isExpired = new Date(coupon.expires_at) < new Date();
    if (isExpired) {
      return <Badge variant="destructive">만료</Badge>;
    }
    return <Badge variant="default">사용가능</Badge>;
  };

  const filteredCoupons = userCoupons.filter((coupon) => {
    const matchesSearch = 
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.user?.phone?.includes(searchTerm) ||
      coupon.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">쿠폰 관리</h1>
          <p className="text-gray-600 mt-1">할인 쿠폰을 발급하고 관리합니다.</p>
        </div>
        <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Gift className="h-4 w-4 mr-2" />
              쿠폰 발급
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>쿠폰 수동 발급</DialogTitle>
              <DialogDescription>
                고객에게 쿠폰을 직접 발급합니다.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>고객 전화번호</Label>
                <Input
                  placeholder="01012345678"
                  value={issueForm.userPhone}
                  onChange={(e) => setIssueForm({ ...issueForm, userPhone: e.target.value })}
                />
              </div>
              <div>
                <Label>쿠폰 종류</Label>
                <Select
                  value={issueForm.couponTypeId}
                  onValueChange={(value) => setIssueForm({ ...issueForm, couponTypeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="쿠폰을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {couponTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name} - {getDiscountDisplay(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>발급 사유</Label>
                <Textarea
                  placeholder="예: 서비스 보상, 이벤트 당첨 등"
                  value={issueForm.issueReason}
                  onChange={(e) => setIssueForm({ ...issueForm, issueReason: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsIssueDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleIssueCoupon} className="bg-orange-500 hover:bg-orange-600">
                발급
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>전체 발급</CardDescription>
            <CardTitle className="text-2xl">{userCoupons.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>사용 가능</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {userCoupons.filter(c => !c.is_used && new Date(c.expires_at) > new Date()).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>사용 완료</CardDescription>
            <CardTitle className="text-2xl text-blue-600">
              {userCoupons.filter(c => c.is_used).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>만료</CardDescription>
            <CardTitle className="text-2xl text-gray-600">
              {userCoupons.filter(c => !c.is_used && new Date(c.expires_at) < new Date()).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="issued">발급된 쿠폰</TabsTrigger>
          <TabsTrigger value="types">쿠폰 종류</TabsTrigger>
        </TabsList>

        <TabsContent value="issued">
          <Card>
            <CardHeader>
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="쿠폰 코드, 전화번호, 이름 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>쿠폰 코드</TableHead>
                    <TableHead>고객 정보</TableHead>
                    <TableHead>쿠폰 종류</TableHead>
                    <TableHead>할인</TableHead>
                    <TableHead>유효기간</TableHead>
                    <TableHead>상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-mono text-sm">{coupon.code}</TableCell>
                      <TableCell>
                        {coupon.user && (
                          <div>
                            <div className="font-medium">{coupon.user.name || '미등록'}</div>
                            <div className="text-sm text-gray-500">{coupon.user.phone}</div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{coupon.coupon_type?.name}</TableCell>
                      <TableCell>
                        {coupon.coupon_type && getDiscountDisplay(coupon.coupon_type)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(coupon.expires_at)}</div>
                          {coupon.used_at && (
                            <div className="text-gray-500">사용: {formatDate(coupon.used_at)}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getCouponStatusBadge(coupon)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>쿠폰 종류 설정</CardTitle>
                <Dialog open={isTypeDialogOpen} onOpenChange={setIsTypeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetTypeForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      새 쿠폰 타입
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingType ? '쿠폰 타입 수정' : '새 쿠폰 타입 추가'}</DialogTitle>
                      <DialogDescription>
                        쿠폰 타입 정보를 입력하세요.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>쿠폰 이름</Label>
                        <Input
                          placeholder="예: 특별 10% 할인 쿠폰"
                          value={typeForm.name}
                          onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>설명</Label>
                        <Textarea
                          placeholder="쿠폰 설명"
                          value={typeForm.description}
                          onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>할인 방식</Label>
                        <Select
                          value={typeForm.discount_type}
                          onValueChange={(value: 'percentage' | 'fixed_amount') => 
                            setTypeForm({ ...typeForm, discount_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">퍼센트 할인</SelectItem>
                            <SelectItem value="fixed_amount">정액 할인</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>할인 값</Label>
                        <Input
                          type="number"
                          placeholder={typeForm.discount_type === 'percentage' ? '10' : '1000'}
                          value={typeForm.discount_value}
                          onChange={(e) => setTypeForm({ ...typeForm, discount_value: e.target.value })}
                        />
                        {typeForm.discount_type === 'percentage' && (
                          <p className="text-xs text-gray-500 mt-1">퍼센트 값을 입력하세요 (예: 10)</p>
                        )}
                      </div>
                      <div>
                        <Label>최소 주문 금액</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={typeForm.min_order_amount}
                          onChange={(e) => setTypeForm({ ...typeForm, min_order_amount: e.target.value })}
                        />
                      </div>
                      {typeForm.discount_type === 'percentage' && (
                        <div>
                          <Label>최대 할인 금액</Label>
                          <Input
                            type="number"
                            placeholder="선택사항"
                            value={typeForm.max_discount_amount}
                            onChange={(e) => setTypeForm({ ...typeForm, max_discount_amount: e.target.value })}
                          />
                        </div>
                      )}
                      <div>
                        <Label>유효 기간 (일)</Label>
                        <Input
                          type="number"
                          placeholder="30"
                          value={typeForm.valid_days}
                          onChange={(e) => setTypeForm({ ...typeForm, valid_days: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsTypeDialogOpen(false)}>
                        취소
                      </Button>
                      <Button onClick={handleSaveCouponType} className="bg-orange-500 hover:bg-orange-600">
                        {editingType ? '수정' : '추가'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>쿠폰 이름</TableHead>
                    <TableHead>할인</TableHead>
                    <TableHead>최소 주문금액</TableHead>
                    <TableHead>최대 할인금액</TableHead>
                    <TableHead>유효기간</TableHead>
                    <TableHead>상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {couponTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{type.name}</div>
                          <div className="text-sm text-gray-500">{type.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getDiscountDisplay(type)}</TableCell>
                      <TableCell>{formatPrice(type.min_order_amount)}</TableCell>
                      <TableCell>
                        {type.max_discount_amount ? formatPrice(type.max_discount_amount) : '-'}
                      </TableCell>
                      <TableCell>{type.valid_days}일</TableCell>
                      <TableCell>
                        <Badge variant={type.is_active ? 'default' : 'secondary'}>
                          {type.is_active ? '활성' : '비활성'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}