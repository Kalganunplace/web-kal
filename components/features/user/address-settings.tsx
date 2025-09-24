"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Plus, Home, Building } from "lucide-react"

export default function AddressSettings() {
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: "집",
      address: "대구광역시 중구 동성로 123",
      detail: "101동 1001호",
      isDefault: true,
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 2,
      name: "회사",
      address: "대구광역시 수성구 범어동 456",
      detail: "5층 501호",
      isDefault: false,
      icon: <Building className="w-5 h-5" />,
    },
  ])

  const [isAdding, setIsAdding] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
          <h1 className="text-lg font-medium">주소 설정</h1>
          <button onClick={() => setIsAdding(true)} className="text-orange-500">
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="space-y-3">
            {addresses.map((address) => (
              <Card
                key={address.id}
                className={`border-2 ${address.isDefault ? "border-orange-200 bg-orange-50" : "border-gray-200"}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-orange-500 mt-1">{address.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-800">{address.name}</h3>
                          {address.isDefault && (
                            <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">기본</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{address.address}</p>
                        <p className="text-sm text-gray-500">{address.detail}</p>
                      </div>
                    </div>
                    <button className="text-gray-400 text-sm">수정</button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {isAdding && (
            <Card className="mt-4 border-orange-200">
              <CardContent className="p-4">
                <h3 className="font-medium mb-4">새 주소 추가</h3>
                <div className="space-y-3">
                  <Input placeholder="주소 별칭 (예: 집, 회사)" />
                  <Input placeholder="주소 검색" />
                  <Input placeholder="상세 주소" />
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsAdding(false)} className="flex-1">
                      취소
                    </Button>
                    <Button
                      onClick={() => setIsAdding(false)}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      추가
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
