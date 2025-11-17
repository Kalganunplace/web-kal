"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import TopBanner from "@/components/ui/top-banner"
import { BodyMedium, BodySmall } from "@/components/ui/typography"
import { createClient } from "@/lib/auth/supabase"

interface Term {
  id: string
  type: string
  title: string
  content: string
  version: string
  created_at: string
}

export default function TermDetailPage() {
  const router = useRouter()
  const params = useParams()
  const termId = params.id as string
  const [term, setTerm] = useState<Term | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTerm = async () => {
      try {
        const supabase = await createClient()
        const { data, error } = await supabase
          .from('terms')
          .select('*')
          .eq('id', termId)
          .eq('is_active', true)
          .single()

        if (error) {
          console.error('약관 조회 오류:', error)
          router.push('/client/terms-detail')
          return
        }

        setTerm(data)
      } catch (error) {
        console.error('약관 로드 실패:', error)
        router.push('/client/terms-detail')
      } finally {
        setLoading(false)
      }
    }

    if (termId) {
      fetchTerm()
    }
  }, [termId, router])

  if (loading || !term) {
    return (
      <div className="min-h-screen bg-white">
        <TopBanner
          title="이용약관"
          onBackClick={() => router.back()}
        />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <TopBanner
        title={term.title}
        onBackClick={() => router.back()}
      />

      <div className="px-5 py-6 space-y-6">
        {/* 버전 정보 */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <BodySmall color="#666666">버전 {term.version}</BodySmall>
          <BodySmall color="#666666">
            {new Date(term.created_at).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }).replace(/\. /g, '.').replace(/\.$/, '')}
          </BodySmall>
        </div>

        {/* 약관 내용 */}
        <div className="space-y-4">
          <BodyMedium color="#333333" className="leading-relaxed whitespace-pre-line">
            {term.content}
          </BodyMedium>
        </div>
      </div>
    </div>
  )
}
