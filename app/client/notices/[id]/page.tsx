"use client"

import { useRouter } from "next/navigation"
import TopBanner from "@/components/ui/top-banner"
import { BodyMedium, Heading3 } from "@/components/ui/typography"

export default function NoticeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()

  // TODO: 나중에 Supabase에서 가져오기
  const notice = {
    id: parseInt(params.id),
    title: "[공지] 칼가는곳에 오신걸 환영합니다",
    date: "2025.06.06",
    content: `안녕하세요, 칼가는곳입니다.

저희 서비스를 이용해 주셔서 감사합니다.

칼가는곳은 고객님의 소중한 칼을 안전하고 정확하게 관리하는 프리미엄 칼갈이 서비스입니다.

앞으로도 최상의 서비스를 제공하기 위해 노력하겠습니다.

감사합니다.`
  }

  return (
    <div className="min-h-screen bg-white">
      <TopBanner
        title="공지사항"
        onBackClick={() => router.back()}
      />

      <div className="px-5 py-6">
        {/* 제목 */}
        <div className="mb-4">
          <Heading3 color="#333333" className="font-bold mb-2">
            {notice.title}
          </Heading3>
          <BodyMedium color="#999999">
            {notice.date}
          </BodyMedium>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-200 my-6"></div>

        {/* 내용 */}
        <div className="whitespace-pre-wrap">
          <BodyMedium color="#666666" className="leading-relaxed">
            {notice.content}
          </BodyMedium>
        </div>
      </div>
    </div>
  )
}
