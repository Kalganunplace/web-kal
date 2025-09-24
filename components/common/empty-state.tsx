"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, User, Building2, CreditCard } from "lucide-react"

interface EmptyStateProps {
  type: 'user' | 'bank_account' | 'payment' | 'general'
  title: string
  description: string
  actionText?: string
  onAction?: () => void
  icon?: React.ReactNode
}

export function EmptyState({
  type,
  title,
  description,
  actionText,
  onAction,
  icon
}: EmptyStateProps) {
  const getDefaultIcon = () => {
    switch (type) {
      case 'user':
        return <User className="w-12 h-12 text-gray-400" />
      case 'bank_account':
        return <Building2 className="w-12 h-12 text-gray-400" />
      case 'payment':
        return <CreditCard className="w-12 h-12 text-gray-400" />
      default:
        return <AlertCircle className="w-12 h-12 text-gray-400" />
    }
  }

  return (
    <Card className="border-2 border-dashed border-gray-200">
      <CardContent className="p-8 text-center">
        <div className="mb-4 flex justify-center">
          {icon || getDefaultIcon()}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        {actionText && onAction && (
          <Button
            onClick={onAction}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// 특정 상황에 맞는 미리 정의된 컴포넌트들
export function NoUserState({ onLogin }: { onLogin: () => void }) {
  return (
    <EmptyState
      type="user"
      title="로그인이 필요해요"
      description="이 기능을 사용하려면 먼저 로그인해 주세요."
      actionText="로그인하기"
      onAction={onLogin}
    />
  )
}

export function NoBankAccountState({ onAddAccount }: { onAddAccount: () => void }) {
  return (
    <EmptyState
      type="bank_account"
      title="은행 계좌 정보가 없어요"
      description="입금 받을 계좌 정보가 등록되지 않았습니다. 관리자에게 문의해 주세요."
      actionText="고객센터 문의"
      onAction={onAddAccount}
    />
  )
}

export function NoPaymentState({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      type="payment"
      title="결제 정보를 불러올 수 없어요"
      description="네트워크 문제거나 일시적인 오류일 수 있습니다."
      actionText="다시 시도"
      onAction={onRetry}
    />
  )
}