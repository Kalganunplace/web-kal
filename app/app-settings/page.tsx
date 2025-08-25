"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Bell, ChevronLeft, Shield, Smartphone } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function AppSettingsPage() {
  const router = useRouter()

  // 설정 상태 관리
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    smsNotifications: true,
    marketingAlerts: false,
    darkMode: false,
    soundEffects: true,
    vibration: true,
    autoUpdate: true,
    dataUsage: false,
    locationService: true,
  })

  const handleSettingChange = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const settingGroups = [
    {
      title: "알림 설정",
      icon: <Bell className="w-5 h-5 text-orange-500" />,
      items: [
        {
          key: "pushNotifications" as const,
          label: "푸시 알림",
          description: "칼갈이 진행 상황 및 중요 안내"
        },
        {
          key: "emailNotifications" as const,
          label: "이메일 알림",
          description: "주문 확인 및 서비스 안내 메일"
        },
        {
          key: "smsNotifications" as const,
          label: "SMS 알림",
          description: "긴급 알림 및 픽업 안내"
        },
        {
          key: "marketingAlerts" as const,
          label: "마케팅 알림",
          description: "할인 혜택 및 이벤트 정보"
        },
      ]
    },
    {
      title: "앱 환경",
      icon: <Smartphone className="w-5 h-5 text-orange-500" />,
      items: [
        {
          key: "darkMode" as const,
          label: "다크 모드",
          description: "어두운 테마로 화면 보호"
        },
        {
          key: "soundEffects" as const,
          label: "효과음",
          description: "버튼 클릭 및 알림 소리"
        },
        {
          key: "vibration" as const,
          label: "진동",
          description: "터치 피드백 및 알림 진동"
        },
      ]
    },
    {
      title: "시스템",
      icon: <Shield className="w-5 h-5 text-orange-500" />,
      items: [
        {
          key: "autoUpdate" as const,
          label: "자동 업데이트",
          description: "앱 자동 업데이트 허용"
        },
        {
          key: "dataUsage" as const,
          label: "데이터 절약",
          description: "모바일 데이터 사용량 최적화"
        },
        {
          key: "locationService" as const,
          label: "위치 서비스",
          description: "주소 자동 입력 및 배송 최적화"
        },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-[500px] mx-auto bg-white min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center p-4 border-b bg-white">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold ml-2" style={{ fontFamily: "var(--font-nanum-gothic, NanumGothic)" }}>
            앱 설정
          </h1>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-6">
          {settingGroups.map((group, groupIndex) => (
            <Card key={groupIndex} className="bg-white shadow-sm">
              <CardContent className="p-0">
                {/* Group Header */}
                <div className="flex items-center p-4 pb-3">
                  {group.icon}
                  <h2 className="text-lg font-bold ml-3 text-gray-800"
                      style={{ fontFamily: "var(--font-nanum-gothic, NanumGothic)" }}>
                    {group.title}
                  </h2>
                </div>

                <Separator className="mx-4" />

                {/* Setting Items */}
                <div className="p-4 pt-3 space-y-4">
                  {group.items.map((item, itemIndex) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div className="flex-1 pr-4">
                        <div className="font-medium text-gray-800 mb-1"
                             style={{ fontFamily: "var(--font-nanum-gothic, NanumGothic)" }}>
                          {item.label}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.description}
                        </div>
                      </div>
                      <Switch
                        checked={settings[item.key]}
                        onCheckedChange={() => handleSettingChange(item.key)}
                        className="ml-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Additional Info */}
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h3 className="font-bold text-orange-800 mb-1"
                    style={{ fontFamily: "var(--font-nanum-gothic, NanumGothic)" }}>
                  설정 안내
                </h3>
                <p className="text-sm text-orange-700">
                  일부 설정은 앱 재시작 후 적용됩니다.
                  위치 서비스 비활성화 시 배송 서비스 이용에 제한이 있을 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          {/* Version Info */}
          <Card className="bg-gray-50">
            <CardContent className="p-4 text-center">
              <div className="text-sm text-gray-600 space-y-1">
                <p>칼가는곳 앱 버전 1.0.0</p>
                <p>최근 업데이트: 2024년 1월 15일</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
