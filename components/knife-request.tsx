"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, MapPin, Clock, PocketKnifeIcon as Knife } from "lucide-react"

export default function KnifeRequest() {
  const [selectedTime, setSelectedTime] = useState("")
  const [knifeCount, setKnifeCount] = useState(1)

  const timeSlots = [
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "14:00 - 15:00",
    "15:00 - 16:00",
    "16:00 - 17:00",
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
          <h1 className="text-lg font-medium">칼갈이 신청</h1>
          <div className="w-6" />
        </div>

        {/* Content */}
        <div className="p-4 pb-20">
          {/* Address Section */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                <span className="font-medium">수거 주소</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">대구광역시 중구 동성로 123</p>
              <Button variant="outline" size="sm" className="text-orange-500 border-orange-500 bg-transparent">
                주소 변경
              </Button>
            </CardContent>
          </Card>

          {/* Time Selection */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="font-medium">수거 시간 선택</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-2 text-sm rounded-lg border ${
                      selectedTime === time
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Knife Count */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Knife className="w-5 h-5 text-orange-500" />
                <span className="font-medium">칼 개수</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setKnifeCount(Math.max(1, knifeCount - 1))}
                  className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-lg font-medium">{knifeCount}개</span>
                <button
                  onClick={() => setKnifeCount(knifeCount + 1)}
                  className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Special Requests */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <label className="block font-medium mb-2">특별 요청사항</label>
              <Textarea placeholder="칼의 상태나 특별한 요청사항을 입력해주세요" className="resize-none" rows={3} />
            </CardContent>
          </Card>

          {/* Price Summary */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">예상 비용</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>칼갈이 ({knifeCount}개)</span>
                  <span>{(knifeCount * 5000).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>수거/배송비</span>
                  <span>3,000원</span>
                </div>
                <hr />
                <div className="flex justify-between font-medium">
                  <span>총 금액</span>
                  <span className="text-orange-500">{(knifeCount * 5000 + 3000).toLocaleString()}원</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-3">신청하기</Button>
        </div>
      </div>
    </div>
  )
}
