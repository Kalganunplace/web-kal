import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingService, type Booking, type CreateBookingData } from '@/lib/booking-service'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'

// Query Keys
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (userId: string) => [...bookingKeys.lists(), userId] as const,
  detail: (bookingId: string) => [...bookingKeys.all, 'detail', bookingId] as const,
}

// 사용자 예약 목록 조회
export function useUserBookings() {
  const { user, isAuthenticated } = useAuthStore()
  
  return useQuery({
    queryKey: bookingKeys.list(user?.id || ''),
    queryFn: () => {
      if (!user?.id) return []
      return bookingService.getUserBookings(user.id)
    },
    enabled: isAuthenticated && !!user?.id,
    refetchInterval: 30000, // 30초마다 새로운 데이터 확인 (상태 업데이트 감지)
  })
}

// 특정 예약 조회
export function useBookingDetail(bookingId: string) {
  const { user } = useAuthStore()
  
  return useQuery({
    queryKey: bookingKeys.detail(bookingId),
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated')
      return bookingService.getBookingById(bookingId, user.id)
    },
    enabled: !!bookingId && !!user?.id,
  })
}

// 예약 생성
export function useCreateBooking() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  return useMutation({
    mutationFn: (data: CreateBookingData) => {
      if (!user?.id) throw new Error('User not authenticated')
      return bookingService.createBooking(user.id, data)
    },
    onSuccess: (newBooking) => {
      // 예약 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: bookingKeys.list(user?.id || '')
      })
      
      // 성공 토스트
      toast.success('예약이 완료되었습니다!')
      
      // 새 예약을 목록에 추가 (optimistic update)
      queryClient.setQueryData(
        bookingKeys.list(user?.id || ''),
        (old: Booking[] = []) => [newBooking, ...old]
      )
    },
    onError: (error) => {
      console.error('예약 생성 실패:', error)
      toast.error('예약에 실패했습니다. 다시 시도해주세요.')
    }
  })
}

// 예약 취소
export function useCancelBooking() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  return useMutation({
    mutationFn: (bookingId: string) => {
      if (!user?.id) throw new Error('User not authenticated')
      return bookingService.cancelBooking(bookingId, user.id)
    },
    onMutate: async (bookingId) => {
      // 이전 데이터 백업
      await queryClient.cancelQueries({
        queryKey: bookingKeys.list(user?.id || '')
      })
      
      const previousBookings = queryClient.getQueryData(
        bookingKeys.list(user?.id || '')
      )
      
      // Optimistic update: 즉시 취소 상태로 변경
      queryClient.setQueryData(
        bookingKeys.list(user?.id || ''),
        (old: Booking[] = []) => {
          return old.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: 'cancelled' as const }
              : booking
          )
        }
      )
      
      return { previousBookings }
    },
    onError: (err, bookingId, context) => {
      // 에러 시 이전 상태로 복구
      if (context?.previousBookings) {
        queryClient.setQueryData(
          bookingKeys.list(user?.id || ''),
          context.previousBookings
        )
      }
      toast.error('예약 취소에 실패했습니다.')
    },
    onSuccess: () => {
      toast.success('예약이 취소되었습니다.')
    },
    onSettled: () => {
      // 서버와 동기화
      queryClient.invalidateQueries({
        queryKey: bookingKeys.list(user?.id || '')
      })
    }
  })
}

// 예약 상태 업데이트
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  return useMutation({
    mutationFn: ({ bookingId, status }: { 
      bookingId: string
      status: Booking['status'] 
    }) => {
      return bookingService.updateBookingStatus(bookingId, status, user?.id)
    },
    onSuccess: (_, variables) => {
      // 특정 예약 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: bookingKeys.detail(variables.bookingId)
      })
      // 목록 캐시도 무효화
      queryClient.invalidateQueries({
        queryKey: bookingKeys.list(user?.id || '')
      })
    }
  })
}