"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ChevronLeft, Edit, Save, X } from "lucide-react"
import { toast } from "sonner"
import { useAdminAuth } from "@/hooks/useAdminAuth"

interface KnifeType {
  id: string
  name: string
  description?: string
  image_url?: string
  market_price: number
  discount_price: number
  care_instructions?: string
  additional_notes?: string
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export default function PricingManagement() {
  const router = useRouter()
  const { requireAuth, hasPermission } = useAdminAuth()
  const [knifeTypes, setKnifeTypes] = useState<KnifeType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<KnifeType>>({})

  useEffect(() => {
    loadKnifeTypes()
  }, [])

  const loadKnifeTypes = async () => {
    try {
      setIsLoading(true)
      // TODO: API 연동으로 칼 종류 데이터 로드
      // 임시 데이터
      setKnifeTypes([
        {
          id: "1",
          name: "일반 식도류",
          description: "가정용 칼, 채칼, 과일칼 등",
          market_price: 5000,
          discount_price: 4000,
          care_instructions: "사용 후 즉시 세척하고 완전히 건조",
          is_active: true,
          display_order: 1,
          created_at: "2025-09-01",
          updated_at: "2025-09-01"
        },
        {
          id: "2",
          name: "정육도",
          description: "고기 절단용 칼",
          market_price: 7000,
          discount_price: 5000,
          care_instructions: "기름기 완전 제거 필수",
          is_active: true,
          display_order: 2,
          created_at: "2025-09-01",
          updated_at: "2025-09-01"
        },
        {
          id: "3",
          name: "회칼",
          description: "생선회 전용 칼",
          market_price: 8000,
          discount_price: 6000,
          care_instructions: "생선 비린내 제거",
          is_active: true,
          display_order: 3,
          created_at: "2025-09-01",
          updated_at: "2025-09-01"
        },
        {
          id: "4",
          name: "일반가위",
          description: "주방용 가위",
          market_price: 4000,
          discount_price: 3000,
          care_instructions: "관절 부분 정기적 오일링",
          is_active: true,
          display_order: 4,
          created_at: "2025-09-01",
          updated_at: "2025-09-01"
        },
        {
          id: "5",
          name: "과도류",
          description: "소형 과일칼",
          market_price: 3000,
          discount_price: 2500,
          care_instructions: "작은 크기로 인한 분실 주의",
          is_active: true,
          display_order: 5,
          created_at: "2025-09-01",
          updated_at: "2025-09-01"
        }
      ])
    } catch (error) {
      console.error("가격표 로드 실패:", error)
      toast.error("가격표를 불러올 수 없습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (knifeType: KnifeType) => {
    setEditingId(knifeType.id)
    setEditForm({ ...knifeType })
  }

  const handleSave = async () => {
    if (!editingId || !editForm) return

    try {
      // 유효성 검사
      if (!editForm.name || !editForm.market_price || !editForm.discount_price) {
        toast.error("필수 정보를 입력해주세요.")
        return
      }

      if (editForm.discount_price > editForm.market_price) {
        toast.error("할인가가 정가보다 높을 수 없습니다.")
        return
      }

      const updatedKnifeTypes = knifeTypes.map(knifeType =>
        knifeType.id === editingId
          ? { ...knifeType, ...editForm, updated_at: new Date().toISOString() }
          : knifeType
      )
      
      setKnifeTypes(updatedKnifeTypes)
      setEditingId(null)
      setEditForm({})
      toast.success("가격이 수정되었습니다.")
    } catch (error) {
      console.error("가격 수정 실패:", error)
      toast.error("가격 수정에 실패했습니다.")
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({})
  }

  const toggleStatus = async (knifeTypeId: string) => {
    try {
      const updatedKnifeTypes = knifeTypes.map(knifeType =>
        knifeType.id === knifeTypeId
          ? { ...knifeType, is_active: !knifeType.is_active }
          : knifeType
      )
      setKnifeTypes(updatedKnifeTypes)
      toast.success("상태가 변경되었습니다.")
    } catch (error) {
      console.error("상태 변경 실패:", error)
      toast.error("상태 변경에 실패했습니다.")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/dashboard')}
            >
              <ChevronLeft className="w-5 h-5" />
              관리자 대시보드
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">가격표 관리</h1>
              <p className="text-gray-600">서비스 가격을 수정하고 관리합니다.</p>
            </div>
          </div>
        </div>
        {/* 총 수익 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">평균 서비스 가격</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {Math.round(knifeTypes.reduce((sum, kt) => sum + kt.discount_price, 0) / knifeTypes.length).toLocaleString()}원
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">활성 서비스</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {knifeTypes.filter(kt => kt.is_active).length}개
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">평균 할인율</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {Math.round(knifeTypes.reduce((sum, kt) => 
                  sum + ((kt.market_price - kt.discount_price) / kt.market_price * 100), 0
                ) / knifeTypes.length)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 가격표 목록 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {knifeTypes.map((knifeType) => (
            <Card key={knifeType.id} className={!knifeType.is_active ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {knifeType.name}
                    <Switch
                      checked={knifeType.is_active}
                      onCheckedChange={() => toggleStatus(knifeType.id)}
                    />
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {editingId === knifeType.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={handleSave}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(knifeType)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {editingId === knifeType.id ? (
                  // 편집 모드
                  <div className="space-y-4">
                    <div>
                      <Label>서비스명</Label>
                      <Input
                        value={editForm.name || ""}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label>설명</Label>
                      <Textarea
                        value={editForm.description || ""}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        rows={2}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>정가 (원)</Label>
                        <Input
                          type="number"
                          value={editForm.market_price || ""}
                          onChange={(e) => setEditForm({...editForm, market_price: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label>할인가 (원)</Label>
                        <Input
                          type="number"
                          value={editForm.discount_price || ""}
                          onChange={(e) => setEditForm({...editForm, discount_price: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>관리 방법</Label>
                      <Textarea
                        value={editForm.care_instructions || ""}
                        onChange={(e) => setEditForm({...editForm, care_instructions: e.target.value})}
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <Label>표시 순서</Label>
                      <Input
                        type="number"
                        min="1"
                        value={editForm.display_order || ""}
                        onChange={(e) => setEditForm({...editForm, display_order: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                ) : (
                  // 보기 모드
                  <div className="space-y-3">
                    <p className="text-gray-600 text-sm">{knifeType.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-orange-500">
                            {knifeType.discount_price.toLocaleString()}원
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            {knifeType.market_price.toLocaleString()}원
                          </span>
                        </div>
                        <div className="text-sm text-green-600">
                          {Math.round((knifeType.market_price - knifeType.discount_price) / knifeType.market_price * 100)}% 할인
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        순서: {knifeType.display_order}
                      </div>
                    </div>
                    
                    {knifeType.care_instructions && (
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <span className="font-medium">관리 방법: </span>
                        {knifeType.care_instructions}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-400 border-t pt-2">
                      최종 수정: {new Date(knifeType.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 가격 정책 안내 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>가격 정책 안내</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• 가격 변경 시 기존 예약 건에는 영향을 주지 않습니다.</p>
              <p>• 할인가는 정가보다 높을 수 없습니다.</p>
              <p>• 서비스를 비활성화하면 새로운 예약에서 선택할 수 없습니다.</p>
              <p>• 표시 순서는 앱에서 보여지는 순서를 결정합니다.</p>
            </div>
          </CardContent>
        </Card>
    </div>
  )
}