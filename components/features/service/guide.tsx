"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, CheckCircle, AlertTriangle, Truck } from "lucide-react"

export default function Guide() {
  const steps = [
    {
      step: 1,
      title: "신청하기",
      description: "앱에서 칼갈이 서비스를 신청해주세요",
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
    },
    {
      step: 2,
      title: "수거",
      description: "지정된 시간에 칼을 수거해갑니다",
      icon: <Truck className="w-6 h-6 text-blue-500" />,
    },
    {
      step: 3,
      title: "연마 작업",
      description: "전문 장인이 정성스럽게 연마합니다",
      icon: <CheckCircle className="w-6 h-6 text-orange-500" />,
    },
    {
      step: 4,
      title: "배송",
      description: "연마 완료 후 안전하게 배송해드립니다",
      icon: <Truck className="w-6 h-6 text-green-500" />,
    },
  ]

  const tips = [
    "칼은 깨끗이 세척 후 준비해주세요",
    "심하게 손상된 칼은 사전에 알려주세요",
    "수거 시간에 맞춰 준비해주세요",
    "특별한 요청사항이 있으면 미리 말씀해주세요",
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
          <h1 className="text-lg font-medium">이용 가이드</h1>
          <div className="w-6" />
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">서비스 이용 방법</h2>
            <p className="text-sm text-gray-600">간단한 4단계로 완료!</p>
          </div>

          {/* Steps */}
          <div className="space-y-4 mb-6">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {step.icon}
                    <h3 className="font-medium text-gray-800">{step.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h3 className="font-medium text-yellow-800">이용 팁</h3>
              </div>
              <ul className="space-y-2">
                {tips.map((tip, index) => (
                  <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
