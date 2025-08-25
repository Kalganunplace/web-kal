"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Crown, Calendar, Gift } from "lucide-react"

export default function Subscription() {
  const [selectedPlan, setSelectedPlan] = useState("")

  const plans = [
    {
      id: "basic",
      name: "베이직 플랜",
      price: "19,900원",
      period: "월",
      features: ["월 2회 칼갈이", "무료 수거/배송", "기본 연마 서비스"],
      popular: false,
    },
    {
      id: "premium",
      name: "프리미엄 플랜",
      price: "29,900원",
      period: "월",
      features: ["월 4회 칼갈이", "무료 수거/배송", "프리미엄 연마", "긴급 서비스"],
      popular: true,
    },
    {
      id: "family",
      name: "패밀리 플랜",
      price: "39,900원",
      period: "월",
      features: ["월 6회 칼갈이", "무료 수거/배송", "프리미엄 연마", "가족 공유"],
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
          <h1 className="text-lg font-medium">구독 관리</h1>
          <div className="w-6" />
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Current Status */}
          <Card className="mb-6 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Crown className="w-6 h-6 text-orange-500" />
                <div>
                  <h3 className="font-medium text-orange-800">현재 구독 중</h3>
                  <p className="text-sm text-orange-600">베이직 플랜</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-orange-700">
                <Calendar className="w-4 h-4" />
                <span>다음 결제일: 2023.07.06</span>
              </div>
            </CardContent>
          </Card>

          {/* Plans */}
          <div className="space-y-3 mb-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`border-2 cursor-pointer transition-all ${
                  selectedPlan === plan.id ? "border-orange-500 bg-orange-50" : "border-gray-200"
                } ${plan.popular ? "ring-2 ring-orange-200" : ""}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-800">{plan.name}</h3>
                        {plan.popular && <Badge className="bg-orange-500 text-white">인기</Badge>}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-orange-500">{plan.price}</span>
                        <span className="text-sm text-gray-500">/{plan.period}</span>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 ${
                        selectedPlan === plan.id ? "border-orange-500 bg-orange-500" : "border-gray-300"
                      }`}
                    >
                      {selectedPlan === plan.id && <div className="w-full h-full rounded-full bg-white scale-50"></div>}
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Benefits */}
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-5 h-5 text-blue-500" />
                <h3 className="font-medium text-blue-800">구독 혜택</h3>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 개별 주문 대비 최대 40% 할인</li>
                <li>• 우선 예약 서비스</li>
                <li>• 전용 고객센터</li>
              </ul>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">플랜 변경하기</Button>
            <Button variant="outline" className="w-full text-gray-600 bg-transparent">
              구독 해지
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
