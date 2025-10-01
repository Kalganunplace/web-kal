'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Switch } from '@/components/ui/switch';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Shield,
  User,
  Mail,
  Phone,
  Key,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Admin {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: 'super_admin' | 'admin' | 'manager';
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
}

const ROLE_LABELS = {
  super_admin: '슈퍼 관리자',
  admin: '일반 관리자',
  manager: '매니저',
};

const ROLE_DESCRIPTIONS = {
  super_admin: '모든 권한 + 관리자 관리',
  admin: '상품, 주문, 쿠폰, 배너 관리',
  manager: '주문 조회 및 상태 변경',
};

export default function AdminsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    name: '',
    password: '',
    role: 'admin' as const,
    is_active: true,
  });

  useEffect(() => {
    checkAuth();
    fetchAdmins();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth');
      const data = await response.json();
      if (!data.success || data.data.role !== 'super_admin') {
        toast({
          title: '권한 없음',
          description: '슈퍼 관리자만 접근할 수 있습니다.',
          variant: 'destructive',
        });
        router.push('/admin');
        return;
      }
      setCurrentAdmin(data.data);
    } catch (error) {
      router.push('/admin');
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admin/admins');
      const data = await response.json();
      if (data.success) {
        setAdmins(data.data);
      }
    } catch (error) {
      toast({
        title: '오류',
        description: '관리자 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.name) {
      toast({
        title: '오류',
        description: '이메일과 이름은 필수입니다.',
        variant: 'destructive',
      });
      return;
    }

    if (!editingAdmin && !formData.password) {
      toast({
        title: '오류',
        description: '새 관리자 등록 시 비밀번호는 필수입니다.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const url = '/api/admin/admins';
      const method = editingAdmin ? 'PUT' : 'POST';
      const body = editingAdmin
        ? { 
            id: editingAdmin.id, 
            ...formData,
            password: formData.password || undefined 
          }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: '성공',
          description: editingAdmin ? '관리자 정보가 수정되었습니다.' : '새 관리자가 등록되었습니다.',
        });
        fetchAdmins();
        setIsDialogOpen(false);
        resetForm();
      } else {
        toast({
          title: '오류',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '오류',
        description: '작업을 완료하는데 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (id === currentAdmin?.id) {
      toast({
        title: '오류',
        description: '자기 자신은 삭제할 수 없습니다.',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm('정말로 이 관리자를 비활성화하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/admins?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: '성공',
          description: '관리자가 비활성화되었습니다.',
        });
        fetchAdmins();
      }
    } catch (error) {
      toast({
        title: '오류',
        description: '비활성화에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      email: admin.email,
      phone: admin.phone || '',
      name: admin.name,
      password: '',
      role: admin.role,
      is_active: admin.is_active,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingAdmin(null);
    setFormData({
      email: '',
      phone: '',
      name: '',
      password: '',
      role: 'admin',
      is_active: true,
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'yyyy.MM.dd HH:mm', { locale: ko });
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      super_admin: 'default' as const,
      admin: 'secondary' as const,
      manager: 'outline' as const,
    };
    
    return (
      <Badge variant={variants[role as keyof typeof variants]}>
        {ROLE_LABELS[role as keyof typeof ROLE_LABELS]}
      </Badge>
    );
  };

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
          <h1 className="text-3xl font-bold">관리자 계정 관리</h1>
          <p className="text-gray-600 mt-1">관리자 계정을 등록하고 관리합니다.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              새 관리자 등록
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAdmin ? '관리자 정보 수정' : '새 관리자 등록'}</DialogTitle>
              <DialogDescription>
                관리자 정보를 입력하세요. 권한에 따라 접근 가능한 메뉴가 다릅니다.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>이메일 *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@example.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>이름 *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="홍길동"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>전화번호</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="01012345678 (선택)"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>비밀번호 {!editingAdmin && '*'}</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingAdmin ? '변경시에만 입력' : '비밀번호'}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>권한 *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'super_admin' | 'admin' | 'manager') => 
                    setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        <div>
                          <div>{label}</div>
                          <div className="text-xs text-gray-500">
                            {ROLE_DESCRIPTIONS[value as keyof typeof ROLE_DESCRIPTIONS]}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>계정 활성화</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600">
                {editingAdmin ? '수정' : '등록'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>전체 관리자</CardDescription>
            <CardTitle className="text-2xl">{admins.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>활성 계정</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {admins.filter(a => a.is_active).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>비활성 계정</CardDescription>
            <CardTitle className="text-2xl text-gray-600">
              {admins.filter(a => !a.is_active).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>전화번호</TableHead>
                <TableHead>권한</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>마지막 로그인</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {admin.role === 'super_admin' && (
                        <Shield className="h-4 w-4 text-orange-500" />
                      )}
                      {admin.name}
                      {admin.id === currentAdmin?.id && (
                        <Badge variant="outline" className="text-xs">
                          본인
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.phone || '-'}</TableCell>
                  <TableCell>{getRoleBadge(admin.role)}</TableCell>
                  <TableCell>
                    {admin.is_active ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">활성</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-500">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">비활성</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(admin.last_login_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(admin)}
                        disabled={admin.id === currentAdmin?.id && admin.role === 'super_admin'}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(admin.id)}
                        disabled={admin.id === currentAdmin?.id}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>권한 안내:</strong>
          <ul className="mt-2 text-sm space-y-1">
            <li>• <strong>슈퍼 관리자:</strong> 모든 기능 접근 + 관리자 계정 관리</li>
            <li>• <strong>일반 관리자:</strong> 상품, 주문, 쿠폰, 배너 관리</li>
            <li>• <strong>매니저:</strong> 주문 조회 및 상태 변경</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}