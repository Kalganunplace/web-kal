"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function ServiceAgreement() {
  const [agreements, setAgreements] = useState({
    all: false,
    service: false,
    privacy: false,
    marketing: false,
    location: false,
    push: false,
  })

  const handleAllAgreement = (checked: boolean) => {
    setAgreements({
      all: checked,
      service: checked,
      privacy: checked,
      marketing: checked,
      location: checked,
      push: checked,
    })
  }

  const agreementItems = [
    { key: "service", label: "(필수) 서비스 이용 약관", required: true },
    { key: "privacy", label: "(필수) 개인정보 수집 및 이용", required: true },
    { key: "marketing", label: "(필수) 위치기반 서비스 이용약관", required: true },
    { key: "location", label: "(선택) 마케팅 정보 수신 및 수집 동의", required: false },
    { key: "push", label: "(선택) 앱푸시 알림 수신 개인정보 수집 이용", required: false },
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
          <h1 className="text-lg font-medium">서비스 약관 동의</h1>
          <div className="w-6" />
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-600 text-sm mb-6">
            원활한 고객님의 서비스 신청을 수신을 위한 개인정보 수집에 동의해주세요.
          </p>

          <Card className="mb-4">
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">서비스 약관 동의하기</h3>

              {/* All Agreement */}
              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg mb-4">
                <Checkbox id="all" checked={agreements.all} onCheckedChange={handleAllAgreement} />
                <label htmlFor="all" className="text-sm font-medium">
                  모두 동의
                </label>
              </div>

              <p className="text-xs text-gray-500 mb-4">
                서비스 이용을 위해서는 아래 약관에 동의가 필요합니다. 선택 항목에 동의하지 않아도 서비스 이용이
                가능합니다.
              </p>

              {/* Individual Agreements */}
              <div className="space-y-3">
                {agreementItems.map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={item.key}
                        checked={agreements[item.key as keyof typeof agreements]}
                        onCheckedChange={(checked) => setAgreements((prev) => ({ ...prev, [item.key]: checked }))}
                      />
                      <label htmlFor={item.key} className="text-sm">
                        {item.label}
                      </label>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg">확인</Button>
        </div>
      </div>
    </div>
  )
}
