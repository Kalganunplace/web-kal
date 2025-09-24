"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ChevronLeft, Bell, Shield, Smartphone, Globe, ChevronRight } from "lucide-react"

export default function AppSettings() {
  const [settings, setSettings] = useState({
    pushNotifications: true,
    orderNotifications: true,
    marketingNotifications: false,
    autoLogin: true,
    biometric: false,
    locationService: true,
  })

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const notificationSettings = [
    {
      key: "pushNotifications",
      title: "푸시 알림",
      description: "앱 알림 수신",
      icon: <Bell className="w-5 h-5" />,
    },
    {
      key: "orderNotifications",
      title: "주문 알림",
      description: "주문 상태 변경 알림",
      icon: <Bell className="w-5 h-5" />,
    },
    {
      key: "marketingNotifications",
      title: "마케팅 알림",
      description: "이벤트 및 혜택 알림",
      icon: <Bell className="w-5 h-5" />,
    },
  ]

  const securitySettings = [
    {
      key: "autoLogin",
      title: "자동 로그인",
      description: "앱 실행시 자동 로그인",
      icon: <Shield className="w-5 h-5" />,
    },
    {
      key: "biometric",
      title: "생체 인증",
      description: "지문/얼굴 인식 로그인",
      icon: <Shield className="w-5 h-5" />,
    },
  ]

  const otherSettings = [
    {
      title: "언어 설정",
      description: "한국어",
      icon: <Globe className="w-5 h-5" />,
      hasSwitch: false,
    },
    {
      title: "앱 버전",
      description: "v2.1.0",
      icon: <Smartphone className="w-5 h-5" />,
      hasSwitch: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
          <h1 className="text-lg font-medium">앱 설정</h1>
          <div className="w-6" />
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Notification Settings */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-800 mb-3">알림 설정</h3>
            <Card>
              <CardContent className="p-0">
                {notificationSettings.map((setting, index) => (
                  <div
                    key={setting.key}
                    className={`p-4 ${index !== notificationSettings.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-gray-400">{setting.icon}</div>
                        <div>
                          <h4 className="font-medium text-gray-800">{setting.title}</h4>
                          <p className="text-sm text-gray-500">{setting.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings[setting.key as keyof typeof settings] as boolean}
                        onCheckedChange={(checked) => handleSettingChange(setting.key, checked)}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Security Settings */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-800 mb-3">보안 설정</h3>
            <Card>
              <CardContent className="p-0">
                {securitySettings.map((setting, index) => (
                  <div
                    key={setting.key}
                    className={`p-4 ${index !== securitySettings.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-gray-400">{setting.icon}</div>
                        <div>
                          <h4 className="font-medium text-gray-800">{setting.title}</h4>
                          <p className="text-sm text-gray-500">{setting.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings[setting.key as keyof typeof settings] as boolean}
                        onCheckedChange={(checked) => handleSettingChange(setting.key, checked)}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Other Settings */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-800 mb-3">기타 설정</h3>
            <Card>
              <CardContent className="p-0">
                {otherSettings.map((setting, index) => (
                  <div
                    key={index}
                    className={`p-4 ${index !== otherSettings.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-gray-400">{setting.icon}</div>
                        <div>
                          <h4 className="font-medium text-gray-800">{setting.title}</h4>
                          <p className="text-sm text-gray-500">{setting.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Location Service */}
          <div>
            <h3 className="font-medium text-gray-800 mb-3">위치 서비스</h3>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-gray-400">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">위치 서비스</h4>
                      <p className="text-sm text-gray-500">정확한 수거/배송을 위해 필요</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.locationService}
                    onCheckedChange={(checked) => handleSettingChange("locationService", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
