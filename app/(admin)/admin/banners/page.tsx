"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ChevronLeft, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { useAdminAuth } from "@/hooks/useAdminAuth"

interface HomeBanner {
  id: string
  title: string
  subtitle?: string
  image_url?: string
  background_color: string
  text_color: string
  link_url?: string
  button_text?: string
  display_order: number
  is_active: boolean
  start_date?: string
  end_date?: string
  created_at: string
}

export default function BannerManagement() {
  const router = useRouter()
  const { requireAuth, hasPermission } = useAdminAuth()
  const [banners, setBanners] = useState<HomeBanner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState<HomeBanner | null>(null)
  
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image_url: "",
    background_color: "#F97316",
    text_color: "#FFFFFF",
    link_url: "",
    button_text: "",
    display_order: 1,
    is_active: true,
    start_date: "",
    end_date: ""
  })

  useEffect(() => {
    loadBanners()
  }, [])

  const loadBanners = async () => {
    try {
      setIsLoading(true)
      // TODO: API 연동으로 배너 목록 로드
      // 임시 데이터
      setBanners([
        {
          id: "1",
          title: "프리미엄 칼갈이 서비스",
          subtitle: "전문가가 직접 방문하여 칼을 날카롭게!",
          background_color: "#F97316",
          text_color: "#FFFFFF",
          display_order: 1,
          is_active: true,
          created_at: "2025-09-01"
        },
        {
          id: "2", 
          title: "지금 예약하면 20% 할인",
          subtitle: "첫 이용 고객 특별 혜택",
          background_color: "#10B981",
          text_color: "#FFFFFF",
          display_order: 2,
          is_active: true,
          created_at: "2025-09-02"
        }
      ])
    } catch (error) {
      console.error("배너 로드 실패:", error)
      toast.error("배너 목록을 불러올 수 없습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingBanner) {
        // 배너 수정
        const updatedBanners = banners.map(banner =>
          banner.id === editingBanner.id
            ? { ...banner, ...formData, updated_at: new Date().toISOString() }
            : banner
        )
        setBanners(updatedBanners)
        toast.success("배너가 수정되었습니다.")
      } else {
        // 새 배너 추가
        const newBanner: HomeBanner = {
          id: Date.now().toString(),
          ...formData,
          created_at: new Date().toISOString()
        }
        setBanners([...banners, newBanner])
        toast.success("배너가 추가되었습니다.")
      }
      
      resetForm()
    } catch (error) {
      console.error("배너 저장 실패:", error)
      toast.error("배너 저장에 실패했습니다.")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      image_url: "",
      background_color: "#F97316",
      text_color: "#FFFFFF",
      link_url: "",
      button_text: "",
      display_order: 1,
      is_active: true,
      start_date: "",
      end_date: ""
    })
    setShowCreateForm(false)
    setEditingBanner(null)
  }

  const handleEdit = (banner: HomeBanner) => {
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      image_url: banner.image_url || "",
      background_color: banner.background_color,
      text_color: banner.text_color,
      link_url: banner.link_url || "",
      button_text: banner.button_text || "",
      display_order: banner.display_order,
      is_active: banner.is_active,
      start_date: banner.start_date || "",
      end_date: banner.end_date || ""
    })
    setEditingBanner(banner)
    setShowCreateForm(true)
  }

  const handleDelete = async (bannerId: string) => {
    if (!confirm("이 배너를 삭제하시겠습니까?")) return

    try {
      const updatedBanners = banners.filter(banner => banner.id !== bannerId)
      setBanners(updatedBanners)
      toast.success("배너가 삭제되었습니다.")
    } catch (error) {
      console.error("배너 삭제 실패:", error)
      toast.error("배너 삭제에 실패했습니다.")
    }
  }

  const toggleBannerStatus = async (bannerId: string) => {
    try {
      const updatedBanners = banners.map(banner =>
        banner.id === bannerId
          ? { ...banner, is_active: !banner.is_active }
          : banner
      )
      setBanners(updatedBanners)
      toast.success("배너 상태가 변경되었습니다.")
    } catch (error) {
      console.error("배너 상태 변경 실패:", error)
      toast.error("배너 상태 변경에 실패했습니다.")
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
              <h1 className="text-2xl font-bold text-gray-900">홈 배너 관리</h1>
              <p className="text-gray-600">메인 화면에 표시되는 배너를 관리합니다.</p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-orange-500 hover:bg-orange-600"
            disabled={!hasPermission('banners')}
          >
            <Plus className="w-4 h-4 mr-2" />
            새 배너 추가
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Banner List */}
          <div>
            <h2 className="text-xl font-semibold mb-4">배너 목록</h2>
            <div className="space-y-4">
              {banners.map((banner) => (
                <Card key={banner.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {banner.title}
                        {banner.is_active ? (
                          <Eye className="w-4 h-4 text-green-500" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBannerStatus(banner.id)}
                        >
                          {banner.is_active ? "숨기기" : "표시"}
                        </Button>
                        <Button
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(banner)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(banner.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="p-4 rounded-lg text-center mb-4"
                      style={{ 
                        backgroundColor: banner.background_color,
                        color: banner.text_color 
                      }}
                    >
                      <h3 className="font-bold text-lg">{banner.title}</h3>
                      {banner.subtitle && (
                        <p className="text-sm opacity-90 mt-1">{banner.subtitle}</p>
                      )}
                      {banner.button_text && (
                        <div className="mt-2">
                          <span className="bg-white text-gray-800 px-3 py-1 rounded text-sm">
                            {banner.button_text}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>순서: {banner.display_order}</p>
                      <p>생성일: {new Date(banner.created_at).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                {editingBanner ? "배너 수정" : "새 배너 추가"}
              </h2>
              <Card>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="title">제목 *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="subtitle">부제목</Label>
                      <Input
                        id="subtitle"
                        value={formData.subtitle}
                        onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="background_color">배경색</Label>
                        <Input
                          id="background_color"
                          type="color"
                          value={formData.background_color}
                          onChange={(e) => setFormData({...formData, background_color: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="text_color">텍스트 색상</Label>
                        <Input
                          id="text_color"
                          type="color"
                          value={formData.text_color}
                          onChange={(e) => setFormData({...formData, text_color: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="button_text">버튼 텍스트</Label>
                      <Input
                        id="button_text"
                        value={formData.button_text}
                        onChange={(e) => setFormData({...formData, button_text: e.target.value})}
                        placeholder="예: 지금 예약하기"
                      />
                    </div>

                    <div>
                      <Label htmlFor="display_order">표시 순서</Label>
                      <Input
                        id="display_order"
                        type="number"
                        min="1"
                        value={formData.display_order}
                        onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                      />
                      <Label>활성화</Label>
                    </div>

                    {/* Preview */}
                    <div>
                      <Label>미리보기</Label>
                      <div 
                        className="p-4 rounded-lg text-center mt-2"
                        style={{ 
                          backgroundColor: formData.background_color,
                          color: formData.text_color 
                        }}
                      >
                        <h3 className="font-bold text-lg">{formData.title || "제목을 입력하세요"}</h3>
                        {formData.subtitle && (
                          <p className="text-sm opacity-90 mt-1">{formData.subtitle}</p>
                        )}
                        {formData.button_text && (
                          <div className="mt-2">
                            <span className="bg-white text-gray-800 px-3 py-1 rounded text-sm">
                              {formData.button_text}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        {editingBanner ? "수정" : "추가"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                      >
                        취소
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
    </div>
  )
}