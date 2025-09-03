"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, 
         Calendar, MapPin, PocketKnifeIcon as Knife, 
         Truck, CheckCircle, Star, Clock, Shield, 
         Phone, MessageCircle, ArrowRight } from "lucide-react"

interface GuideStep {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  details: string[]
  tips?: string[]
}

export default function ServiceGuide() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  const guideSteps: GuideStep[] = [
    {
      id: 1,
      title: "칼갈이 신청",
      description: "원하는 날짜와 시간을 선택하고 칼갈이를 신청해보세요",
      icon: <Calendar className="w-8 h-8 text-orange-500" />,
      details: [
        "홈 화면에서 '칼갈이 신청' 버튼을 터치하세요",
        "수거받을 주소를 확인하거나 새로 등록하세요", 
        "원하는 수거 날짜와 시간을 선택하세요",
        "갈고 싶은 칼의 종류와 개수를 선택하세요",
        "특별한 요청사항이 있으면 입력해주세요"
      ],
      tips: [
        "수거 가능 시간은 오전 9시부터 오후 6시까지입니다",
        "칼의 상태를 정확히 알려주시면 더 좋은 서비스를 받을 수 있어요"
      ]
    },
    {
      id: 2,
      title: "주소 확인 및 수거",
      description: "전문 기사님이 정확한 시간에 방문하여 칼을 수거해갑니다",
      icon: <MapPin className="w-8 h-8 text-blue-500" />,
      details: [
        "예약한 시간에 전문 기사님이 방문합니다",
        "칼의 상태를 직접 확인하고 수거해갑니다",
        "수거 완료 후 예상 작업 시간을 안내해드립니다",
        "수거증을 받으시면 안전하게 보관해주세요",
        "수거 완료 알림을 받게 됩니다"
      ],
      tips: [
        "기사님 방문 30분 전에 알림을 보내드려요",
        "외출 예정이시면 미리 연락 주시면 시간 조정이 가능해요"
      ]
    },
    {
      id: 3,
      title: "전문 연마 작업",
      description: "숙련된 장인이 하나하나 정성껏 칼을 연마합니다",
      icon: <Knife className="w-8 h-8 text-purple-500" />,
      details: [
        "수거된 칼은 전문 작업장으로 운송됩니다",
        "20년 경력의 숙련된 장인이 직접 작업합니다",
        "칼의 상태에 따라 맞춤형 연마를 진행합니다",
        "연마 완료 후 품질 검사를 거칩니다",
        "작업 시작 및 완료 알림을 보내드립니다"
      ],
      tips: [
        "일반적으로 수거 후 1-2일 내에 작업이 완료됩니다",
        "칼 상태가 심각한 경우 추가 시간이 소요될 수 있어요"
      ]
    },
    {
      id: 4,
      title: "안전한 배송",
      description: "연마가 완료된 칼을 안전하게 포장하여 배송해드립니다",
      icon: <Truck className="w-8 h-8 text-green-500" />,
      details: [
        "연마 완료된 칼을 전용 케이스에 안전하게 포장합니다",
        "배송 출발 전 배송 예정 알림을 보내드립니다",
        "전문 배송 기사가 직접 배송합니다",
        "수령 시 칼의 상태를 확인해주세요",
        "만족스럽지 않으시면 무료로 재작업해드립니다"
      ],
      tips: [
        "배송 완료 후 사용법과 관리 방법을 안내해드려요",
        "배송 시간은 오전 9시부터 오후 6시까지입니다"
      ]
    },
    {
      id: 5,
      title: "서비스 완료",
      description: "칼갈이 서비스가 완료되고 날카로운 칼을 사용하세요",
      icon: <CheckCircle className="w-8 h-8 text-emerald-500" />,
      details: [
        "배송 완료와 함께 결제가 자동으로 진행됩니다",
        "서비스 이용 내역을 앱에서 확인할 수 있습니다",
        "칼 사용법과 관리 방법 가이드를 제공합니다",
        "다음 연마 시기를 알림으로 안내해드립니다",
        "후기와 평점을 남겨주시면 감사하겠습니다"
      ],
      tips: [
        "일반 가정용 칼은 3-6개월마다 연마를 권장해요",
        "정기 서비스를 신청하시면 할인 혜택을 받을 수 있어요"
      ]
    }
  ]

  const nextStep = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <h1 className="text-lg font-medium">서비스 이용 안내</h1>
          <div className="w-6" />
        </div>

        {/* Progress Indicator */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              {currentStep + 1}단계 / {guideSteps.length}단계
            </span>
            <Badge className="bg-orange-100 text-orange-800 text-xs">
              이용 가이드
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / guideSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="p-4 flex-1">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {guideSteps[currentStep].icon}
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {guideSteps[currentStep].title}
            </h2>
            <p className="text-sm text-gray-600">
              {guideSteps[currentStep].description}
            </p>
          </div>

          <Card className="mb-4">
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-800 mb-3">📋 진행 과정</h3>
              <div className="space-y-3">
                {guideSteps[currentStep].details.map((detail, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-orange-600">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{detail}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          {guideSteps[currentStep].tips && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  💡 유용한 팁
                </h3>
                <div className="space-y-2">
                  {guideSteps[currentStep].tips.map((tip, index) => (
                    <p key={index} className="text-sm text-blue-700">
                      • {tip}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Step Navigation */}
        <div className="p-4 bg-gray-50 border-t">
          {/* Step Indicators */}
          <div className="flex justify-center mb-4">
            {guideSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`w-2 h-2 rounded-full mx-1 transition-all duration-200 ${
                  index === currentStep 
                    ? 'bg-orange-500 w-6' 
                    : index < currentStep
                    ? 'bg-orange-300'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex-1 mr-2"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              이전
            </Button>
            
            {currentStep < guideSteps.length - 1 ? (
              <Button
                onClick={nextStep}
                className="flex-1 ml-2 bg-orange-500 hover:bg-orange-600"
              >
                다음
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={() => router.push('/knife-request')}
                className="flex-1 ml-2 bg-orange-500 hover:bg-orange-600"
              >
                바로 신청하기
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="p-4 bg-orange-50 border-t border-orange-200">
          <h3 className="font-medium text-orange-800 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            서비스 보장
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-orange-600" />
              <span className="text-orange-700">정시 방문</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-orange-600" />
              <span className="text-orange-700">손실 보장</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-orange-600" />
              <span className="text-orange-700">품질 보증</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-3 h-3 text-orange-600" />
              <span className="text-orange-700">24시간 상담</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}