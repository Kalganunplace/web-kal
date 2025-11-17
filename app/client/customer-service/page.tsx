"use client"

import { useRouter } from "next/navigation"
import TopBanner from "@/components/ui/top-banner"

export default function CustomerServicePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white">
      <TopBanner
        title="고객센터"
        onBackClick={() => router.back()}
      />

      <div className="px-5 py-6 space-y-6">
        {/* 문의하기 버튼 */}
        <div className="pt-4">
          <button
            onClick={() => {
              // TODO: 문의하기 기능 구현
              alert("문의하기 기능은 준비 중입니다.")
            }}
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors"
          >
            1:1 문의하기
          </button>
        </div>
      </div>
    </div>
  )
}
