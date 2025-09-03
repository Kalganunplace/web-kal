"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, ChevronLeft, Star, Camera, X } from "lucide-react"
import { toast } from "sonner"

import { reviewService, type CreateReviewData } from "@/lib/review-service"
import { bookingService, type Booking } from "@/lib/booking-service"
import { useAuthStore } from "@/stores/auth-store"
import { useAuthModal } from "@/contexts/auth-modal-context"

interface RatingCategory {
  key: keyof CreateReviewData
  label: string
  description: string
}

export default function WriteReview() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('booking')
  
  const { user, isAuthenticated } = useAuthStore()
  const { openModal } = useAuthModal()

  const [booking, setBooking] = useState<Booking | null>(null)
  const [rating, setRating] = useState(0)
  const [serviceQualityRating, setServiceQualityRating] = useState(0)
  const [deliveryRating, setDeliveryRating] = useState(0)
  const [valueRating, setValueRating] = useState(0)
  const [comment, setComment] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const ratingCategories: RatingCategory[] = [
    {
      key: 'service_quality_rating',
      label: '서비스 품질',
      description: '칼갈이 작업의 완성도와 품질'
    },
    {
      key: 'delivery_rating',
      label: '수거/배송',
      description: '수거와 배송 서비스의 만족도'
    },
    {
      key: 'value_rating',
      label: '가격 만족도',
      description: '서비스 대비 가격의 합리성'
    }
  ]

  // 데이터 로드
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setIsLoading(false)
      return
    }

    if (!bookingId) {
      toast.error('잘못된 접근입니다.')
      router.back()
      return
    }

    loadBookingData()
  }, [isAuthenticated, user?.id, bookingId])

  const loadBookingData = async () => {
    if (!user?.id || !bookingId) return

    try {
      setIsLoading(true)
      
      const bookingData = await bookingService.getBooking(bookingId, user.id)
      
      if (!bookingData) {
        toast.error('해당 주문을 찾을 수 없습니다.')
        router.back()
        return
      }

      if (bookingData.status !== 'completed') {
        toast.error('완료된 주문에만 리뷰를 작성할 수 있습니다.')
        router.back()
        return
      }

      // 이미 리뷰를 작성했는지 확인
      const existingReview = await reviewService.getReviewByBooking(user.id, bookingId)
      if (existingReview) {
        toast.error('이미 해당 주문에 대한 리뷰를 작성하셨습니다.')
        router.back()
        return
      }

      setBooking(bookingData)
    } catch (error) {
      console.error('예약 데이터 로드 실패:', error)
      toast.error('데이터를 불러오는 중 오류가 발생했습니다.')
      router.back()
    } finally {
      setIsLoading(false)
    }
  }

  // 별점 컴포넌트
  const StarRating = ({ 
    rating, 
    onRatingChange, 
    size = "w-8 h-8" 
  }: { 
    rating: number
    onRatingChange: (rating: number) => void
    size?: string 
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className="transition-colors duration-150"
        >
          <Star 
            className={`${size} ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  )

  // 리뷰 제출
  const handleSubmit = async () => {
    if (!user?.id || !bookingId) {
      openModal('login')
      return
    }

    if (rating === 0) {
      toast.error('전체 만족도를 선택해주세요.')
      return
    }

    if (!comment.trim()) {
      toast.error('리뷰 내용을 입력해주세요.')
      return
    }

    try {
      setIsSubmitting(true)

      const reviewData: CreateReviewData = {
        booking_id: bookingId,
        rating,
        comment: comment.trim(),
        service_quality_rating: serviceQualityRating > 0 ? serviceQualityRating : undefined,
        delivery_rating: deliveryRating > 0 ? deliveryRating : undefined,
        value_rating: valueRating > 0 ? valueRating : undefined,
        photos,
        is_anonymous: isAnonymous
      }

      await reviewService.createReview(user.id, reviewData)
      
      toast.success('리뷰가 성공적으로 등록되었습니다!')
      router.push('/usage-history')
    } catch (error) {
      console.error('리뷰 작성 실패:', error)
      toast.error('리뷰 작성 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 사진 추가 (실제 구현에서는 파일 업로드 로직 필요)
  const addPhoto = () => {
    toast.info('사진 업로드 기능은 준비 중입니다.')
  }

  // 사진 삭제
  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  // 비로그인 상태
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </Button>
            <h1 className="text-lg font-medium">리뷰 작성</h1>
            <div className="w-6" />
          </div>

          <div className="p-6 text-center">
            <h3 className="text-lg font-medium text-gray-800 mb-2">로그인이 필요해요</h3>
            <p className="text-sm text-gray-600 mb-6">
              리뷰를 작성하려면 로그인해 주세요.
            </p>
            <div className="space-y-3">
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600"
                onClick={() => openModal('login')}
              >
                로그인
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.back()}
              >
                돌아가기
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="p-6 text-center">
            <h3 className="text-lg font-medium text-gray-800 mb-2">주문을 찾을 수 없습니다</h3>
            <Button onClick={() => router.back()}>돌아가기</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <h1 className="text-lg font-medium">리뷰 작성</h1>
          <div className="w-6" />
        </div>

        {/* Content */}
        <div className="p-4 pb-20 max-h-[80vh] overflow-y-auto">
          {/* 주문 정보 */}
          <Card className="mb-4 bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <h3 className="font-medium text-orange-800 mb-2">📦 서비스 정보</h3>
              <div className="text-sm space-y-1">
                <p className="text-orange-700">
                  주문일: {new Date(booking.booking_date).toLocaleDateString('ko-KR')}
                </p>
                {booking.booking_items && booking.booking_items.length > 0 && (
                  <p className="text-orange-700">
                    서비스: {booking.booking_items.map(item => 
                      `${item.knife_type?.name || '칼'} ${item.quantity}개`
                    ).join(', ')}
                  </p>
                )}
                <p className="text-orange-700">
                  결제금액: {new Intl.NumberFormat('ko-KR', { 
                    style: 'currency', 
                    currency: 'KRW' 
                  }).format(booking.total_amount)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 전체 만족도 */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-800 mb-3">⭐ 전체 만족도</h3>
              <div className="text-center">
                <StarRating rating={rating} onRatingChange={setRating} />
                <p className="text-sm text-gray-600 mt-2">
                  {rating > 0 ? reviewService.getRatingDescription(rating) : '별점을 선택해주세요'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 세부 평가 */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-800 mb-3">📊 세부 평가 (선택사항)</h3>
              <div className="space-y-4">
                {ratingCategories.map(({ key, label, description }) => {
                  const currentRating = key === 'service_quality_rating' ? serviceQualityRating 
                    : key === 'delivery_rating' ? deliveryRating 
                    : valueRating
                  
                  const setCurrentRating = key === 'service_quality_rating' ? setServiceQualityRating
                    : key === 'delivery_rating' ? setDeliveryRating
                    : setValueRating

                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{label}</p>
                          <p className="text-xs text-gray-500">{description}</p>
                        </div>
                      </div>
                      <StarRating 
                        rating={currentRating} 
                        onRatingChange={setCurrentRating}
                        size="w-6 h-6"
                      />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* 리뷰 내용 */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-800 mb-3">✍️ 리뷰 내용</h3>
              <Textarea
                placeholder="서비스에 대한 솔직한 후기를 남겨주세요. 다른 고객님들에게 도움이 되는 정보를 포함해주시면 더욱 좋습니다."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>최소 10자 이상 작성해주세요</span>
                <span>{comment.length}/500</span>
              </div>
            </CardContent>
          </Card>

          {/* 사진 첨부 */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-800 mb-3">📸 사진 첨부 (선택사항)</h3>
              <div className="grid grid-cols-4 gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img src={photo} alt={`리뷰 사진 ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {photos.length < 4 && (
                  <button
                    onClick={addPhoto}
                    className="aspect-square bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Camera className="w-6 h-6 text-gray-400" />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                최대 4장까지 업로드 가능합니다
              </p>
            </CardContent>
          </Card>

          {/* 익명 작성 옵션 */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={isAnonymous}
                  onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                  className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">익명으로 작성</p>
                  <p className="text-xs text-gray-500">이름 대신 '익명'으로 표시됩니다</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="fixed bottom-4 left-4 right-4 max-w-sm mx-auto">
          <Button
            className={`w-full py-3 rounded-lg ${
              rating > 0 && comment.trim().length >= 10
                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isSubmitting ? '등록 중...' : '리뷰 등록'}
          </Button>
        </div>
      </div>
    </div>
  )
}