"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Loader2, ChevronLeft, ChevronDown, ChevronUp, Search, HelpCircle, MessageCircle } from "lucide-react"
import { toast } from "sonner"

import { termsService, type FAQ } from "@/lib/terms-service"

export default function FAQList() {
  const router = useRouter()

  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('전체')
  const [searchQuery, setSearchQuery] = useState('')
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  // 데이터 로드
  useEffect(() => {
    const loadFAQs = async () => {
      try {
        setIsLoading(true)
        
        const [faqsData, categoriesData] = await Promise.all([
          termsService.getActiveFAQs(),
          termsService.getFAQCategories()
        ])
        
        setFaqs(faqsData)
        setFilteredFaqs(faqsData)
        setCategories(['전체', ...categoriesData])
      } catch (error) {
        console.error('FAQ 로드 실패:', error)
        toast.error('FAQ 정보를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    loadFAQs()
  }, [])

  // 검색 및 필터링
  useEffect(() => {
    let filtered = faqs

    // 카테고리 필터링
    if (selectedCategory !== '전체') {
      filtered = filtered.filter(faq => faq.category === selectedCategory)
    }

    // 검색 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      )
    }

    setFilteredFaqs(filtered)
  }, [faqs, selectedCategory, searchQuery])

  // FAQ 아이템 토글
  const toggleFAQItem = (faqId: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(faqId)) {
        newSet.delete(faqId)
      } else {
        newSet.add(faqId)
      }
      return newSet
    })
  }

  // 카테고리별 색상 매핑
  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      '서비스 지역': 'bg-blue-100 text-blue-800',
      '서비스 시간': 'bg-green-100 text-green-800',
      '서비스 범위': 'bg-purple-100 text-purple-800',
      '손해배상': 'bg-red-100 text-red-800',
      '예약 취소': 'bg-orange-100 text-orange-800',
      '결제': 'bg-yellow-100 text-yellow-800',
      '칼 상태': 'bg-indigo-100 text-indigo-800',
      '운영 시간': 'bg-gray-100 text-gray-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <h1 className="text-lg font-medium">자주 묻는 질문</h1>
          <div className="w-6" />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 pb-6">
          {/* 안내 메시지 */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <HelpCircle className="w-8 h-8 text-orange-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">자주 묻는 질문</h2>
            <p className="text-sm text-gray-600">
              궁금한 점이 있으시면 아래 FAQ를 확인해주세요
            </p>
          </div>

          {/* 검색 */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="궁금한 내용을 검색해보세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 카테고리 필터 */}
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap ${
                    selectedCategory === category 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* FAQ 목록 */}
          {filteredFaqs.length > 0 ? (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {filteredFaqs.map((faq) => (
                <Card key={faq.id} className="border">
                  <Collapsible>
                    <CollapsibleTrigger 
                      className="w-full"
                      onClick={() => toggleFAQItem(faq.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(faq.category)}`}>
                                {faq.category}
                              </span>
                            </div>
                            <h4 className="text-sm font-medium text-gray-800 leading-relaxed">
                              Q. {faq.question}
                            </h4>
                          </div>
                          <div className="ml-2 flex-shrink-0">
                            {openItems.has(faq.id) ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="px-4 pb-4 border-t bg-gray-50">
                        <div className="pt-4">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            A. {faq.answer}
                          </p>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          ) : (
            // 검색 결과가 없을 때
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">검색 결과가 없습니다</h3>
              <p className="text-sm text-gray-600 mb-6">
                다른 검색어로 시도해보시거나<br />
                아래 문의하기를 이용해주세요
              </p>
              <Button 
                variant="outline"
                onClick={() => setSearchQuery('')}
                className="mr-2"
              >
                검색 초기화
              </Button>
            </div>
          )}

          {/* 문의하기 섹션 */}
          <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              찾는 답변이 없으신가요?
            </h4>
            <p className="text-sm text-orange-700 mb-3">
              1:1 문의하기를 통해 직접 문의해주세요.
            </p>
            <Button 
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => router.push('/customer-service')}
            >
              1:1 문의하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}