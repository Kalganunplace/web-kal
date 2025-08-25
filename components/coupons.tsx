"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Gift, Calendar, Percent } from "lucide-react"

export default function Coupons() {
  const coupons = [
    {
      id: 1,
      name: "첫 주문 할인",
      discount: "5,000원",
      type: "amount",
      description: "첫 칼갈이 서비스 이용시",
      expiry: "2023.12.31",
      isUsed: false,
      minOrder: "10,000원",
    },
    {
      id: 2,
      name: "친구 추천 할인",
      discount: "20%",
      type: "percent",
      description: "친구 추천 완료시",
      expiry: "2023.08.15",
      isUsed: false,
      minOrder: "15,000원",
    },
    {
      id: 3,
      name: "생일 축하 쿠폰",
      discount: "3,000원",
      type: "amount",
      description: "생일 축하 선물",
      expiry: "2023.07.10",
      isUsed: true,
      minOrder: "5,000원",
    },
  ]

  const availableCoupons = coupons.filter((coupon) => !coupon.isUsed)
  const usedCoupons = coupons.filter((coupon) => coupon.isUsed)

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
          <h1 className="text-lg font-medium">내 쿠폰</h1>
          <div className="w-6" />
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Summary */}
          <Card className="mb-6 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4 text-center">
              <Gift className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-orange-800 mb-1">{availableCoupons.length}개</h2>
              <p className="text-sm text-orange-600">사용 가능한 쿠폰</p>
            </CardContent>
          </Card>

          {/* Available Coupons */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-800 mb-3">사용 가능</h3>
            <div className="space-y-3">
              {availableCoupons.map((coupon) => (
                <Card key={coupon.id} className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Percent className="w-4 h-4 text-orange-500" />
                          <h4 className="font-medium text-gray-800">{coupon.name}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{coupon.expiry}까지</span>
                          </div>
                          <span>{coupon.minOrder} 이상 주문시</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-orange-500 mb-1">{coupon.discount}</div>
                        <Badge className="bg-orange-500 text-white text-xs">할인</Badge>
                      </div>
                    </div>
                    <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                      사용하기
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Used Coupons */}
          {usedCoupons.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-800 mb-3">사용 완료</h3>
              <div className="space-y-3">
                {usedCoupons.map((coupon) => (
                  <Card key={coupon.id} className="border-gray-200 bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Percent className="w-4 h-4 text-gray-400" />
                            <h4 className="font-medium text-gray-500">{coupon.name}</h4>
                          </div>
                          <p className="text-sm text-gray-400">{coupon.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-400 mb-1">{coupon.discount}</div>
                          <Badge variant="secondary" className="text-xs">
                            사용완료
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {coupons.length === 0 && (
            <div className="text-center py-20">
              <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">보유한 쿠폰이 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
