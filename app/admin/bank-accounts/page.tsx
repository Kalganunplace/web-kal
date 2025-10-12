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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Building2,
  CreditCard,
  User,
  Star,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  is_default: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

const BANK_LIST = [
  '농협은행',
  '국민은행',
  '신한은행',
  '우리은행',
  '하나은행',
  '기업은행',
  '대구은행',
  'SC제일은행',
  '씨티은행',
  '케이뱅크',
  '카카오뱅크',
  '토스뱅크',
  '새마을금고',
  '신협',
  '우체국',
  '수협은행',
];

export default function BankAccountsPage() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    bank_name: '',
    account_number: '',
    account_holder: '',
    is_default: false,
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/admin/bank-accounts');
      const data = await response.json();
      if (data.success) {
        setAccounts(data.data);
      }
    } catch (error) {
      toast({
        title: '오류',
        description: '계좌 정보를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.bank_name || !formData.account_number || !formData.account_holder) {
      toast({
        title: '오류',
        description: '모든 필드를 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const url = '/api/admin/bank-accounts';
      const method = editingAccount ? 'PUT' : 'POST';
      const body = editingAccount
        ? { id: editingAccount.id, ...formData }
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
          description: editingAccount ? '계좌 정보가 수정되었습니다.' : '새 계좌가 추가되었습니다.',
        });
        fetchAccounts();
        setIsDialogOpen(false);
        resetForm();
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
    const accountToDelete = accounts.find(acc => acc.id === id);
    if (accountToDelete?.is_default) {
      toast({
        title: '오류',
        description: '기본 계좌는 삭제할 수 없습니다. 다른 계좌를 기본으로 설정한 후 삭제해주세요.',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm('정말로 이 계좌를 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/bank-accounts?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: '성공',
          description: '계좌가 삭제되었습니다.',
        });
        fetchAccounts();
      }
    } catch (error) {
      toast({
        title: '오류',
        description: '삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleSetDefault = async (account: BankAccount) => {
    if (account.is_default) return;

    try {
      const response = await fetch('/api/admin/bank-accounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: account.id,
          is_default: true,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: '성공',
          description: '기본 계좌가 변경되었습니다.',
        });
        fetchAccounts();
      }
    } catch (error) {
      toast({
        title: '오류',
        description: '기본 계좌 변경에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setFormData({
      bank_name: account.bank_name,
      account_number: account.account_number,
      account_holder: account.account_holder,
      is_default: account.is_default,
    });
    setIsDialogOpen(true);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: '복사됨',
      description: '클립보드에 복사되었습니다.',
    });
  };

  const resetForm = () => {
    setEditingAccount(null);
    setFormData({
      bank_name: '',
      account_number: '',
      account_holder: '',
      is_default: false,
    });
  };

  const formatAccountNumber = (accountNumber: string) => {
    // 계좌번호를 하이픈으로 포맷팅 (예: 123-456-789012)
    return accountNumber;
  };

  const defaultAccount = accounts.find(acc => acc.is_default);

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
          <h1 className="text-3xl font-bold">계좌 관리</h1>
          <p className="text-gray-600 mt-1">무통장입금 계좌를 관리합니다.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              새 계좌 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAccount ? '계좌 정보 수정' : '새 계좌 추가'}</DialogTitle>
              <DialogDescription>
                무통장입금에 사용할 계좌 정보를 입력하세요.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>은행</Label>
                <RadioGroup
                  value={formData.bank_name}
                  onValueChange={(value) => setFormData({ ...formData, bank_name: value })}
                  className="grid grid-cols-3 gap-2 mt-2"
                >
                  {BANK_LIST.map((bank) => (
                    <div key={bank} className="flex items-center">
                      <RadioGroupItem value={bank} id={bank} />
                      <Label htmlFor={bank} className="ml-2 text-sm cursor-pointer">
                        {bank}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label>계좌번호</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    placeholder="123-456-789012"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>예금주</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    value={formData.account_holder}
                    onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
                    placeholder="칼가는곳"
                    className="pl-10"
                  />
                </div>
              </div>

              {accounts.length === 0 && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="is_default">기본 계좌로 설정</Label>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600">
                {editingAccount ? '수정' : '추가'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {defaultAccount && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-orange-500 fill-current" />
              기본 계좌
            </CardTitle>
            <CardDescription>고객에게 안내되는 입금 계좌입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold mb-1">
                  {defaultAccount.bank_name}
                </div>
                <div className="text-lg font-mono">
                  {formatAccountNumber(defaultAccount.account_number)}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  예금주: {defaultAccount.account_holder}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(
                  `${defaultAccount.bank_name} ${defaultAccount.account_number} (예금주: ${defaultAccount.account_holder})`,
                  defaultAccount.id
                )}
              >
                {copiedId === defaultAccount.id ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>등록된 계좌</CardTitle>
          <CardDescription>총 {accounts.length}개의 계좌가 등록되어 있습니다</CardDescription>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">등록된 계좌가 없습니다.</p>
              <p className="text-sm text-gray-400 mt-2">새 계좌를 추가해주세요.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>은행</TableHead>
                  <TableHead>계좌번호</TableHead>
                  <TableHead>예금주</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        {account.bank_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{formatAccountNumber(account.account_number)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(account.account_number, `number-${account.id}`)}
                        >
                          {copiedId === `number-${account.id}` ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{account.account_holder}</TableCell>
                    <TableCell>
                      {account.is_default ? (
                        <Badge className="bg-orange-500">기본</Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(account)}
                        >
                          기본으로 설정
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(account)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(account.id)}
                          disabled={account.is_default}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>계좌 관리 안내</strong>
          <ul className="mt-2 text-sm space-y-1">
            <li>• 기본 계좌는 고객에게 자동으로 안내됩니다</li>
            <li>• 여러 계좌를 등록하고 필요에 따라 변경할 수 있습니다</li>
            <li>• 기본 계좌는 삭제할 수 없습니다</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}