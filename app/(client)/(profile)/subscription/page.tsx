"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import TopBanner from "@/components/ui/top-banner"
import { BodyMedium, BodySmall, CaptionMedium, Heading3, Heading2 } from "@/components/ui/typography"
import { subscriptionService } from '@/lib/subscription-service'
import { useAuthStore } from '@/stores/auth-store'
import { 
  useSubscriptionPlans, 
  useUserSubscription, 
  useCreateSubscription, 
  useCancelSubscription 
} from '@/hooks/queries/use-subscription'

export default function SubscriptionPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  
  // React Query 훅 사용
  const { data: plans = [], isLoading: isLoadingPlans } = useSubscriptionPlans()
  const { data: userSubscription, isLoading: isLoadingUserSub } = useUserSubscription()
  const createSubscription = useCreateSubscription()
  const cancelSubscription = useCancelSubscription()
  
  const isLoadingData = isLoadingPlans || isLoadingUserSub

  const handleSubscribe = async (plan: typeof plans[0]) => {
    if (!isAuthenticated) {
      alert('구독하려면 로그인이 필요합니다.')
      router.push('/login')
      return
    }

    try {
      await createSubscription.mutateAsync({
        subscription_plan_id: plan.id,
        auto_renew: true
      })
      
      alert(`${plan.name} 구독이 완료되었습니다!`)
      
      // 실제로는 결제 페이지로 이동
      // router.push(`/payment?plan=${plan.id}`)
    } catch (error) {
      console.error("구독 처리 중 오류:", error)
      alert("구독 처리 중 오류가 발생했습니다.")
    }
  }

  const handleCancelSubscription = async () => {
    if (!userSubscription) return
    
    if (confirm("정말로 구독을 취소하시겠습니까?")) {
      try {
        await cancelSubscription.mutateAsync(userSubscription.id)
        alert("구독이 취소되었습니다.")
      } catch (error) {
        console.error("구독 취소 중 오류:", error)
        alert("구독 취소 중 오류가 발생했습니다.")
      }
    }
  }

  return (
    <>
      <TopBanner
        title="구독 관리"
        onBackClick={() => router.back()}
      />

      <div className="flex-1 px-5 py-6 bg-gray-50 space-y-6">
        {/* 로딩 상태 */}
        {isLoadingData ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              ⏳
            </div>
            <BodyMedium color="#666666">구독 정보를 불러오는 중...</BodyMedium>
          </div>
        ) : (
          <>
            {/* 현재 구독 상태 */}
            {userSubscription && userSubscription.subscription_plan ? (
              <div className="bg-white rounded-xl p-6 border-2 border-orange-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      ⭐
                    </div>
                    <div>
                      <Heading3 color="#333333" className="font-bold">
                        {userSubscription.subscription_plan.name}
                      </Heading3>
                      <BodySmall color="#E67E22" className="font-medium">
                        {subscriptionService.getStatusText(userSubscription.status)}
                      </BodySmall>
                    </div>
                  </div>
                  <div className="text-right">
                    <Heading3 color="#333333" className="font-bold">
                      {userSubscription.subscription_plan.price.toLocaleString()}원
                    </Heading3>
                    <BodySmall color="#666666">
                      /{subscriptionService.getBillingCycleText(userSubscription.subscription_plan.billing_cycle)}
                    </BodySmall>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <BodySmall color="#666666" className="mb-2">다음 결제일</BodySmall>
                  <BodyMedium color="#333333" className="font-bold">
                    {subscriptionService.getNextPaymentDate(userSubscription.current_period_end)}
                  </BodyMedium>
                </div>
                
                <Button
                  onClick={handleCancelSubscription}
                  variant="outline"
                  className="w-full border-red-200 text-red-500 hover:bg-red-50"
                  disabled={cancelSubscription.isPending}
                >
                  {cancelSubscription.isPending ? "처리 중..." : "구독 취소"}
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  📋
                </div>
                <Heading3 color="#333333" className="font-bold mb-2">
                  활성 구독이 없습니다
                </Heading3>
                <BodyMedium color="#666666">
                  구독을 통해 더 편리하고 저렴하게 서비스를 이용하세요
                </BodyMedium>
              </div>
            )}

        {/* 구독 혜택 안내 */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6">
          <Heading3 color="#E67E22" className="font-bold mb-4">구독의 장점</Heading3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm">
                ✓
              </div>
              <BodyMedium color="#333333">개별 서비스 대비 최대 40% 절약</BodyMedium>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm">
                ✓
              </div>
              <BodyMedium color="#333333">예약 우선권 및 당일 서비스</BodyMedium>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm">
                ✓
              </div>
              <BodyMedium color="#333333">전담 전문가 배정</BodyMedium>
            </div>
          </div>
        </div>

            {/* 구독 플랜 목록 */}
            <div>
              <Heading3 color="#333333" className="font-bold mb-4">구독 플랜 선택</Heading3>
              
              <div className="space-y-4">
                {plans.map((plan, index) => {
                  const isPopular = index === 1 // 중간 플랜을 인기로 표시
                  const planFeatures = subscriptionService.formatPlanFeatures(plan)
                  const isCurrentPlan = userSubscription?.subscription_plan_id === plan.id
                  
                  return (
                    <div
                      key={plan.id}
                      className={`bg-white rounded-xl p-6 border-2 transition-colors ${
                        isPopular
                          ? "border-orange-500 bg-orange-50"
                          : isCurrentPlan
                          ? "border-orange-200"
                          : "border-gray-200"
                      }`}
                    >
                      {/* 플랜 헤더 */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Heading3 color="#333333" className="font-bold">
                              {plan.name}
                            </Heading3>
                            {isPopular && (
                              <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                인기
                              </div>
                            )}
                            {isCurrentPlan && (
                              <div className="bg-green-100 text-green-500 px-2 py-1 rounded-full text-xs font-bold">
                                현재 플랜
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-baseline gap-2">
                            <Heading2 color="#333333" className="font-bold">
                              {plan.price.toLocaleString()}원
                            </Heading2>
                            {plan.billing_cycle === 'yearly' && (
                              <BodySmall color="#999999" className="line-through">
                                {(plan.price * 1.2).toLocaleString()}원
                              </BodySmall>
                            )}
                            <BodyMedium color="#666666">
                              /{subscriptionService.getBillingCycleText(plan.billing_cycle)}
                            </BodyMedium>
                          </div>
                        </div>
                      </div>

                      {/* 플랜 특징 */}
                      <div className="space-y-2 mb-6">
                        {planFeatures.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-3">
                            <div className="w-4 h-4 text-green-500">✓</div>
                            <BodyMedium color="#666666">{feature}</BodyMedium>
                          </div>
                        ))}
                      </div>

                      {/* 구독 버튼 */}
                      {isCurrentPlan ? (
                        <div className="text-center py-3">
                          <BodyMedium color="#E67E22" className="font-bold">
                            현재 이용 중인 플랜
                          </BodyMedium>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleSubscribe(plan)}
                          className={`w-full h-12 font-bold rounded-xl ${
                            isPopular
                              ? "bg-orange-500 hover:bg-orange-600 text-white"
                              : "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                          }`}
                          disabled={createSubscription.isPending}
                        >
                          {createSubscription.isPending ? "처리 중..." : "구독하기"}
                        </Button>
                      )}
                    </div>
                  )
                })}
          </div>
        </div>

            {/* 구독 안내사항 */}
            <div className="bg-blue-50 rounded-xl p-4">
              <BodySmall color="#4A90E2" className="font-medium mb-2">
                구독 안내사항
              </BodySmall>
              <div className="space-y-1">
                <CaptionMedium color="#4A90E2">
                  • 구독은 언제든지 취소 가능합니다
                </CaptionMedium>
                <CaptionMedium color="#4A90E2">
                  • 첫 달은 50% 할인가로 이용 가능
                </CaptionMedium>
                <CaptionMedium color="#4A90E2">
                  • 사용하지 않은 서비스는 다음 달로 이월됩니다
                </CaptionMedium>
              </div>
            </div>

            {/* Spacer for bottom navigation */}
            <div className="h-20" />
          </>
        )}
      </div>
    </>
  )
}