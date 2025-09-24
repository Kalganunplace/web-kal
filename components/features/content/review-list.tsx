"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import BottomSheet from "@/components/ui/bottom-sheet"
import { Loader2, ChevronLeft, Star, ThumbsUp, MessageCircle, 
         Calendar, Award, Filter, TrendingUp, Clock } from "lucide-react"
import { toast } from "sonner"

import { reviewService, type Review, type ReviewStats } from "@/lib/review-service"
import { useAuthStore } from "@/stores/auth-store"

type SortOption = 'created_at' | 'rating' | 'helpful_count'
type SortDirection = 'asc' | 'desc'

export default function ReviewList() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [minRating, setMinRating] = useState<number>(0)
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)

  const REVIEWS_PER_PAGE = 10

  // 데이터 로드
  useEffect(() => {
    loadData()
  }, [sortBy, sortDirection, minRating, featuredOnly, currentPage])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      const [reviewsData, statsData] = await Promise.all([
        reviewService.getReviews({
          page: currentPage,
          limit: REVIEWS_PER_PAGE,
          orderBy: sortBy,
          orderDirection: sortDirection,
          minRating: minRating || undefined,
          featuredOnly
        }),
        reviewService.getReviewStats()
      ])
      
      setReviews(reviewsData.reviews)
      setTotalCount(reviewsData.totalCount)
      setStats(statsData)
    } catch (error) {
      console.error('리뷰 데이터 로드 실패:', error)
      toast.error('리뷰를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 필터/정렬 변경 시 첫 페이지로 이동
  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  // 리뷰 상세 보기
  const viewReviewDetail = (review: Review) => {
    setSelectedReview(review)
    setIsBottomSheetOpen(true)
  }

  const handleCloseBottomSheet = () => {
    setIsBottomSheetOpen(false)
    setSelectedReview(null)
  }

  // 도움이 됐어요 토글
  const toggleHelpful = async (reviewId: string) => {
    if (!isAuthenticated || !user?.id) {
      toast.error('로그인이 필요합니다.')
      return
    }

    try {
      const { isHelpful, helpfulCount } = await reviewService.toggleReviewHelpful(user.id, reviewId)
      
      // 로컬 상태 업데이트
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, helpful_count: helpfulCount }
          : review
      ))

      if (selectedReview && selectedReview.id === reviewId) {
        setSelectedReview({ ...selectedReview, helpful_count: helpfulCount })
      }

      toast.success(isHelpful ? '도움이 됐어요!' : '도움됨 취소')
    } catch (error) {
      console.error('도움됨 토글 실패:', error)
      toast.error('처리 중 오류가 발생했습니다.')
    }
  }

  // 페이지네이션
  const totalPages = Math.ceil(totalCount / REVIEWS_PER_PAGE)
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  // 별점 표시 컴포넌트
  const StarDisplay = ({ rating, size = "w-4 h-4" }: { rating: number, size?: string }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star}
          className={`${size} ${
            star <= rating 
              ? 'text-yellow-400 fill-yellow-400' 
              : 'text-gray-200'
          }`}
        />
      ))}
    </div>
  )

  // 리뷰 카드 렌더링
  const renderReviewCard = (review: Review) => (
    <Card 
      key={review.id}
      className="cursor-pointer hover:shadow-md transition-all duration-200"
      onClick={() => viewReviewDetail(review)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <StarDisplay rating={review.rating} />
            <span className="text-sm font-medium text-gray-700">
              {reviewService.getRatingDescription(review.rating)}
            </span>
            {review.is_featured && (
              <Badge className="bg-orange-100 text-orange-800 text-xs">
                <Award className="w-3 h-3 mr-1" />
                베스트
              </Badge>
            )}
          </div>
          <span className="text-xs text-gray-500">
            {reviewService.formatReviewDate(review.created_at)}
          </span>
        </div>

        <div className="mb-3">
          <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
            {review.comment}
          </p>
        </div>

        {/* 세부 평가 */}
        {(review.service_quality_rating || review.delivery_rating || review.value_rating) && (
          <div className="mb-3 p-2 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-600 space-y-1">
              {review.service_quality_rating && (
                <div className="flex justify-between">
                  <span>서비스 품질:</span>
                  <div className="flex items-center gap-1">
                    <StarDisplay rating={review.service_quality_rating} size="w-3 h-3" />
                    <span>({review.service_quality_rating})</span>
                  </div>
                </div>
              )}
              {review.delivery_rating && (
                <div className="flex justify-between">
                  <span>수거/배송:</span>
                  <div className="flex items-center gap-1">
                    <StarDisplay rating={review.delivery_rating} size="w-3 h-3" />
                    <span>({review.delivery_rating})</span>
                  </div>
                </div>
              )}
              {review.value_rating && (
                <div className="flex justify-between">
                  <span>가격 만족도:</span>
                  <div className="flex items-center gap-1">
                    <StarDisplay rating={review.value_rating} size="w-3 h-3" />
                    <span>({review.value_rating})</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span>{reviewService.formatUserName(review.user, review.is_anonymous)}</span>
            {review.is_verified && (
              <Badge variant="outline" className="text-xs py-0">
                실제 이용고객
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation()
                toggleHelpful(review.id)
              }}
              className="flex items-center gap-1 hover:text-orange-500 transition-colors"
            >
              <ThumbsUp className="w-3 h-3" />
              <span>{review.helpful_count}</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // 로딩 상태
  if (isLoading && currentPage === 1) {
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

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </Button>
            <h1 className="text-lg font-medium">고객 리뷰</h1>
            <div className="w-6" />
          </div>

          {/* 통계 정보 */}
          {stats && (
            <div className="p-4 bg-orange-50 border-b">
              <div className="text-center mb-3">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <StarDisplay rating={Math.round(stats.average_rating)} size="w-5 h-5" />
                  <span className="text-2xl font-bold text-gray-800">{stats.average_rating}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {stats.total_reviews}개의 리뷰
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <p className="font-medium text-gray-700">{stats.service_quality_average}</p>
                  <p className="text-gray-500">서비스 품질</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-700">{stats.delivery_average}</p>
                  <p className="text-gray-500">수거/배송</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-700">{stats.value_average}</p>
                  <p className="text-gray-500">가격 만족도</p>
                </div>
              </div>
            </div>
          )}

          {/* 필터/정렬 */}
          <div className="p-4 bg-gray-50 border-b">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">필터 & 정렬</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(value: SortOption) => { setSortBy(value); handleFilterChange() }}>
                  <SelectTrigger className="flex-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">최신순</SelectItem>
                    <SelectItem value="rating">평점순</SelectItem>
                    <SelectItem value="helpful_count">도움됨순</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={minRating.toString()} onValueChange={(value) => { setMinRating(parseInt(value)); handleFilterChange() }}>
                  <SelectTrigger className="flex-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">전체 평점</SelectItem>
                    <SelectItem value="5">5점만</SelectItem>
                    <SelectItem value="4">4점 이상</SelectItem>
                    <SelectItem value="3">3점 이상</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant={featuredOnly ? "default" : "outline"}
                size="sm"
                onClick={() => { setFeaturedOnly(!featuredOnly); handleFilterChange() }}
                className={`w-full h-8 text-xs ${featuredOnly ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
              >
                <Award className="w-3 h-3 mr-1" />
                베스트 리뷰만 보기
              </Button>
            </div>
          </div>

          {/* 리뷰 목록 */}
          <div className="flex-1 p-4">
            {reviews.length > 0 ? (
              <>
                <div className="space-y-3 mb-4">
                  {reviews.map(renderReviewCard)}
                </div>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      disabled={!hasPrevPage || isLoading}
                    >
                      이전
                    </Button>
                    
                    <span className="text-sm text-gray-600">
                      {currentPage} / {totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={!hasNextPage || isLoading}
                    >
                      다음
                    </Button>
                  </div>
                )}
              </>
            ) : (
              // 리뷰가 없을 때
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {minRating > 0 || featuredOnly ? '조건에 맞는 리뷰가 없어요' : '아직 등록된 리뷰가 없어요'}
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  {minRating > 0 || featuredOnly 
                    ? '다른 조건으로 검색해보세요'
                    : '첫 번째 리뷰를 남겨주세요!'
                  }
                </p>
                {(minRating > 0 || featuredOnly) && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setMinRating(0)
                      setFeaturedOnly(false)
                      handleFilterChange()
                    }}
                  >
                    전체 리뷰 보기
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 리뷰 상세 바텀시트 */}
      <BottomSheet isOpen={isBottomSheetOpen} onClose={handleCloseBottomSheet}>
        {selectedReview && (
          <div className="p-6 space-y-4">
            {/* 리뷰 헤더 */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <StarDisplay rating={selectedReview.rating} size="w-6 h-6" />
                <span className="text-xl font-bold text-gray-800">
                  {selectedReview.rating}.0
                </span>
              </div>
              <p className="text-lg text-gray-600 mb-1">
                {reviewService.getRatingDescription(selectedReview.rating)}
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-gray-500">
                  {reviewService.formatUserName(selectedReview.user, selectedReview.is_anonymous)}
                </span>
                {selectedReview.is_verified && (
                  <Badge variant="outline" className="text-xs">
                    실제 이용고객
                  </Badge>
                )}
                {selectedReview.is_featured && (
                  <Badge className="bg-orange-100 text-orange-800 text-xs">
                    <Award className="w-3 h-3 mr-1" />
                    베스트
                  </Badge>
                )}
              </div>
            </div>

            {/* 리뷰 내용 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">
                {selectedReview.comment}
              </p>
            </div>

            {/* 세부 평가 */}
            {(selectedReview.service_quality_rating || selectedReview.delivery_rating || selectedReview.value_rating) && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-3">📊 세부 평가</h4>
                <div className="space-y-2 text-sm">
                  {selectedReview.service_quality_rating && (
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700">서비스 품질:</span>
                      <div className="flex items-center gap-2">
                        <StarDisplay rating={selectedReview.service_quality_rating} size="w-4 h-4" />
                        <span className="text-blue-700 font-medium">{selectedReview.service_quality_rating}.0</span>
                      </div>
                    </div>
                  )}
                  {selectedReview.delivery_rating && (
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700">수거/배송:</span>
                      <div className="flex items-center gap-2">
                        <StarDisplay rating={selectedReview.delivery_rating} size="w-4 h-4" />
                        <span className="text-blue-700 font-medium">{selectedReview.delivery_rating}.0</span>
                      </div>
                    </div>
                  )}
                  {selectedReview.value_rating && (
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700">가격 만족도:</span>
                      <div className="flex items-center gap-2">
                        <StarDisplay rating={selectedReview.value_rating} size="w-4 h-4" />
                        <span className="text-blue-700 font-medium">{selectedReview.value_rating}.0</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 주문 정보 */}
            {selectedReview.booking && (
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  주문 정보
                </h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p>주문일: {new Date(selectedReview.booking.booking_date).toLocaleDateString('ko-KR')}</p>
                  <p>결제금액: {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(selectedReview.booking.total_amount)}</p>
                  {selectedReview.booking.booking_items && selectedReview.booking.booking_items.length > 0 && (
                    <p>서비스: {selectedReview.booking.booking_items.map(item => 
                      `${item.knife_type?.name || '칼'} ${item.quantity}개`
                    ).join(', ')}</p>
                  )}
                </div>
              </div>
            )}

            {/* 작성일 및 도움됨 */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{reviewService.formatReviewDate(selectedReview.created_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>도움됨 {selectedReview.helpful_count}</span>
                </div>
              </div>

              {/* 도움됨 버튼 */}
              {isAuthenticated && (
                <Button
                  variant="outline"
                  onClick={() => toggleHelpful(selectedReview.id)}
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  도움이 됐어요
                </Button>
              )}
            </div>
          </div>
        )}
      </BottomSheet>
    </>
  )
}