'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/stores/auth-store';
import { AccountSwitchModal } from '@/components/auth/account-switch-modal';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, signInAdmin, signOut } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  // URL 파라미터 확인
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('message') === 'admin_required') {
      setInfoMessage('관리자 권한이 필요합니다. 관리자 계정으로 로그인해주세요.');
    }
  }, []);

  // 이미 로그인된 경우 처리
  useEffect(() => {
    if (user?.type === 'admin') {
      router.push('/admin');
    } else if (user?.type === 'client') {
      setShowSwitchModal(true);
    }
  }, [user, router]);

  // 계정 전환 확인
  const handleSwitchAccount = async () => {
    await signOut();
    setShowSwitchModal(false);
  };

  // 계정 전환 취소
  const handleCancelSwitch = () => {
    router.push('/');
  };

  // 클라이언트가 관리자 로그인 접근 시 모달 표시
  if (showSwitchModal && user?.type === 'client') {
    return (
      <AccountSwitchModal
        currentUserName={user.name || '사용자'}
        currentUserType="client"
        targetType="admin"
        onConfirm={handleSwitchAccount}
        onCancel={handleCancelSwitch}
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username) {
      setError('아이디를 입력해주세요.');
      return;
    }

    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const result = await signInAdmin(username, password);

      if (result.success) {
        router.push('/admin');
      } else {
        setError(result.error || '로그인에 실패했습니다.');
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">관리자 로그인</CardTitle>
          <CardDescription className="text-center">
            칼가는곳 관리자 대시보드에 접속하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">아이디</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                className="pl-10"
              />
            </div>
          </div>

          {infoMessage && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">{infoMessage}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="pt-2 text-sm text-gray-600">
            <p>테스트 계정:</p>
            <p>• admin / admin123!</p>
            <p>• staff / staff123!</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSubmit}
            className="w-full bg-orange-500 hover:bg-orange-600"
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}