"use client"

import { AlertTriangleIcon, ArrowLeftIcon, CheckCircleIcon, TruckIcon } from "@/components/ui/icon"
import { BodySmall, Heading1, Heading2, Heading3 } from "@/components/ui/typography"
import { useRouter } from "next/navigation"

export default function GuidePage() {
  const router = useRouter()

  const steps = [
    {
      step: 1,
      title: "신청하기",
      description: "앱에서 칼갈이 서비스를 신청해주세요",
      icon: <CheckCircleIcon size={24} color="#10B981" />,
    },
    {
      step: 2,
      title: "수거",
      description: "지정된 시간에 칼을 수거해갑니다",
      icon: <TruckIcon size={24} color="#3B82F6" />,
    },
    {
      step: 3,
      title: "연마 작업",
      description: "전문 장인이 정성스럽게 연마합니다",
      icon: <CheckCircleIcon size={24} color="#E67E22" />,
    },
    {
      step: 4,
      title: "배송",
      description: "연마 완료 후 안전하게 배송해드립니다",
      icon: <TruckIcon size={24} color="#10B981" />,
    },
  ]

  const tips = [
    "칼은 깨끗이 세척 후 준비해주세요",
    "심하게 손상된 칼은 사전에 알려주세요",
    "수거 시간에 맞춰 준비해주세요",
    "특별한 요청사항이 있으면 미리 말씀해주세요",
  ]

  return (
    <>
      {/* System Title */}
      <div className="flex flex-col gap-2 px-4 py-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-6 h-6"
          >
            <ArrowLeftIcon size={24} color="#FFFFFF" />
          </button>
          <Heading1 className="text-5xl text-white leading-none">이용 가이드</Heading1>
        </div>
        <div className="w-full h-0 border-t-2 border-white" />
      </div>

      {/* Content */}
      <div className="px-5 py-6 bg-gray-50 space-y-6">
        <div className="text-center">
          <Heading2 color="#333333" className="mb-2">서비스 이용 방법</Heading2>
          <BodySmall color="#767676">간단한 4단계로 완료!</BodySmall>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {step.step}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {step.icon}
                  <Heading3 color="#333333">{step.title}</Heading3>
                </div>
                <BodySmall color="#767676">{step.description}</BodySmall>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangleIcon size={24} color="#D97706" />
            <Heading3 color="#92400E">이용 팁</Heading3>
          </div>
          <ul className="space-y-3">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-yellow-500 mt-1 text-sm">•</span>
                <BodySmall color="#92400E">{tip}</BodySmall>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
