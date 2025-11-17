"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import TopBanner from "@/components/ui/top-banner"
import { BodyMedium } from "@/components/ui/typography"
import { ChevronRight } from "lucide-react"
import { createClient } from "@/lib/auth/supabase"

interface Term {
  id: string
  type: string
  title: string
  version: string
}

export default function TermsDetailPage() {
  const router = useRouter()
  const [terms, setTerms] = useState<Term[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const supabase = await createClient()
        const { data, error } = await supabase
          .from('terms')
          .select('id, type, title, version')
          .eq('is_active', true)
          .order('type', { ascending: true })

        if (error) {
          console.error('약관 조회 오류:', error)
          return
        }

        setTerms(data || [])
      } catch (error) {
        console.error('약관 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTerms()
  }, [])

  if (loading) {
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
        title="이용약관"
        onBackClick={() => router.back()}
      />

      {/* 약관 리스트 */}
      <div className="px-5 py-4">
        {terms.map((term) => (
          <div
            key={term.id}
            onClick={() => router.push(`/client/terms-detail/${term.id}`)}
            className="border-b border-gray-200 py-4 cursor-pointer active:bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <BodyMedium color="#333333" className="font-medium mb-1">
                  {term.title}
                </BodyMedium>
                <p className="text-sm text-gray-500">버전 {term.version}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" />
            </div>
          </div>
        ))}

        {terms.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-gray-500">이용약관이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}
