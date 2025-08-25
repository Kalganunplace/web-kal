"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, PocketKnifeIcon as Knife, Scissors, Utensils } from "lucide-react"

export default function PriceList() {
  const priceItems = [
    {
      icon: <Knife className="w-6 h-6" />,
      name: "식칼",
      price: "5,000원",
      description: "일반 주방용 식칼",
    },
    {
      icon: <Knife className="w-6 h-6" />,
      name: "회칼",
      price: "7,000원",
      description: "회 전용 칼",
    },
    {
      icon: <Scissors className="w-6 h-6" />,
      name: "가위",
      price: "4,000원",
      description: "주방용 가위",
    },
    {
      icon: <Utensils className="w-6 h-6" />,
      name: "과도",
      price: "3,000원",
      description: "과일용 소형 칼",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
          <h1 className="text-lg font-medium">가격표</h1>
          <div className="w-6" />
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">칼갈이 서비스 가격</h2>
            <p className="text-sm text-gray-600">전문 장인이 직접 연마해드립니다</p>
          </div>

          <div className="space-y-3 mb-6">
            {priceItems.map((item, index) => (
              <Card key={index} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-orange-500">{item.icon}</div>
                      <div>
                        <h3 className="font-medium text-gray-800">{item.name}</h3>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                    </div>
                    <span className="font-bold text-orange-500">{item.price}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Info */}
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <h3 className="font-medium text-orange-800 mb-2">추가 정보</h3>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• 수거/배송비: 3,000원</li>
                <li>• 3개 이상 주문시 배송비 무료</li>
                <li>• 작업 시간: 1-2일</li>
                <li>• 품질 보장: 30일</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
