import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subscriptionService, type SubscriptionPlan, type UserSubscription, type CreateSubscriptionData } from '@/lib/subscription-service'
import { useAuthStore } from '@/stores/auth-store'

// Query Keys
export const subscriptionKeys = {
  all: ['subscription'] as const,
  plans: () => [...subscriptionKeys.all, 'plans'] as const,
  userSubscription: (userId: string) => [...subscriptionKeys.all, 'user', userId] as const,
}

// 구독 플랜 목록 조회
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: () => subscriptionService.getActivePlans(),
    staleTime: 10 * 60 * 1000, // 10분 (플랜은 자주 변경되지 않음)
  })
}

// 사용자 구독 조회
export function useUserSubscription() {
  const { user, isAuthenticated } = useAuthStore()
  
  return useQuery({
    queryKey: subscriptionKeys.userSubscription(user?.id || ''),
    queryFn: () => {
      if (!user?.id) return null
      return subscriptionService.getUserSubscription(user.id)
    },
    enabled: isAuthenticated && !!user?.id, // 로그인 상태일 때만 실행
  })
}

// 구독 생성
export function useCreateSubscription() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  return useMutation({
    mutationFn: (data: CreateSubscriptionData) => {
      if (!user?.id) throw new Error('User not authenticated')
      return subscriptionService.createSubscription(user.id, data)
    },
    onSuccess: (newSubscription) => {
      // 사용자 구독 캐시 업데이트
      queryClient.setQueryData(
        subscriptionKeys.userSubscription(user?.id || ''),
        newSubscription
      )
      // 또는 전체 구독 데이터 다시 가져오기
      queryClient.invalidateQueries({
        queryKey: subscriptionKeys.userSubscription(user?.id || '')
      })
    },
  })
}

// 구독 취소
export function useCancelSubscription() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  return useMutation({
    mutationFn: (subscriptionId: string) => {
      if (!user?.id) throw new Error('User not authenticated')
      return subscriptionService.cancelSubscription(subscriptionId, user.id)
    },
    onMutate: async (subscriptionId) => {
      // Optimistic update: UI를 즉시 업데이트
      await queryClient.cancelQueries({
        queryKey: subscriptionKeys.userSubscription(user?.id || '')
      })
      
      const previousSubscription = queryClient.getQueryData(
        subscriptionKeys.userSubscription(user?.id || '')
      )
      
      // 구독 상태를 'cancelled'로 즉시 변경
      queryClient.setQueryData(
        subscriptionKeys.userSubscription(user?.id || ''),
        (old: UserSubscription | null) => {
          if (!old) return null
          return { ...old, status: 'cancelled' as const }
        }
      )
      
      return { previousSubscription }
    },
    onError: (err, subscriptionId, context) => {
      // 에러 발생 시 이전 상태로 복구
      if (context?.previousSubscription) {
        queryClient.setQueryData(
          subscriptionKeys.userSubscription(user?.id || ''),
          context.previousSubscription
        )
      }
    },
    onSettled: () => {
      // 완료 후 서버 데이터와 동기화
      queryClient.invalidateQueries({
        queryKey: subscriptionKeys.userSubscription(user?.id || '')
      })
    },
  })
}

// 구독 일시정지
export function usePauseSubscription() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  return useMutation({
    mutationFn: (subscriptionId: string) => {
      if (!user?.id) throw new Error('User not authenticated')
      return subscriptionService.pauseSubscription(subscriptionId, user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: subscriptionKeys.userSubscription(user?.id || '')
      })
    },
  })
}

// 구독 재개
export function useResumeSubscription() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  return useMutation({
    mutationFn: (subscriptionId: string) => {
      if (!user?.id) throw new Error('User not authenticated')
      return subscriptionService.resumeSubscription(subscriptionId, user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: subscriptionKeys.userSubscription(user?.id || '')
      })
    },
  })
}