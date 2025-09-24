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
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Plus, Trash2, Users, Gift, Calendar, Percent } from "lucide-react"
import { toast } from "sonner"
import { useAdminAuth } from "@/hooks/useAdminAuth"

interface CouponTemplate {
  id: string
  name: string
  description?: string
  coupon_type: 'discount' | 'free_service' | 'cashback'
  discount_amount?: number
  discount_percent?: number
  min_order_amount: number
  max_discount_amount?: number
  usage_limit: number
  valid_days: number
  is_stackable: boolean
  target_knife_types?: string[]
  is_first_order_only: boolean
  is_active: boolean
  created_at: string
}

interface UserCoupon {
  id: string
  user_id: string
  user_name: string
  coupon_name: string
  status: 'active' | 'used' | 'expired'
  expires_at: string
  used_at?: string
  created_at: string
}

export default function CouponManagement() {
  const router = useRouter()
  const { requireAuth, hasPermission } = useAdminAuth()
  const [activeTab, setActiveTab] = useState<'templates' | 'issued'>('templates')
  const [couponTemplates, setCouponTemplates] = useState<CouponTemplate[]>([])
  const [userCoupons, setUserCoupons] = useState<UserCoupon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    coupon_type: "discount" as const,
    discount_amount: 0,
    discount_percent: 0,
    min_order_amount: 0,
    max_discount_amount: 0,
    usage_limit: 1,
    valid_days: 30,
    is_stackable: false,
    is_first_order_only: false,
    target_user_ids: [] as string[]
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // 쿠폰 템플릿 로드 (임시 데이터)
      setCouponTemplates([
        {
          id: "1",
          name: "신규 고객 2000원 할인",
          description: "첫 주문 시 2000원 할인 쿠폰",
          coupon_type: "discount",
          discount_amount: 2000,
          min_order_amount: 10000,
          usage_limit: 1,
          valid_days: 30,
          is_stackable: false,
          is_first_order_only: true,
          is_active: true,
          created_at: "2025-09-01"
        },
        {
          id: "2",
          name: "정기 고객 10% 할인",
          description: "3회 이상 이용 고객 10% 할인",
          coupon_type: "discount",
          discount_percent: 10,
          min_order_amount: 15000,
          max_discount_amount: 5000,
          usage_limit: 1,
          valid_days: 14,
          is_stackable: false,
          is_first_order_only: false,
          is_active: true,
          created_at: "2025-09-01"
        }
      ])
      
      // 발급된 쿠폰 로드 (임시 데이터)
      setUserCoupons([
        {
          id: "1",
          user_id: "user1",
          user_name: "심재형",
          coupon_name: "신규 고객 2000원 할인",
          status: "active",
          expires_at: "2025-10-03",
          created_at: "2025-09-03"
        },
        {
          id: "2",
          user_id: "user2", 
          user_name: "테스트 사용자",
          coupon_name: "신규 고객 2000원 할인",
          status: "active",
          expires_at: "2025-10-03",
          created_at: "2025-09-03"
        }
      ])
    } catch (error) {
      console.error("데이터 로드 실패:", error)
      toast.error("데이터를 불러올 수 없습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // 유효성 검사
      if (!formData.name) {
        toast.error("쿠폰 이름을 입력해주세요.")
        return
      }

      if (formData.coupon_type === 'discount') {
        if (formData.discount_amount <= 0 && formData.discount_percent <= 0) {
          toast.error("할인 금액 또는 할인율을 입력해주세요.")
          return
        }
      }

      const newTemplate: CouponTemplate = {
        id: Date.now().toString(),
        ...formData,
        is_active: true,
        created_at: new Date().toISOString()
      }
      
      setCouponTemplates([...couponTemplates, newTemplate])
      
      // 폼 초기화
      setFormData({
        name: "",
        description: "",
        coupon_type: "discount",
        discount_amount: 0,
        discount_percent: 0,
        min_order_amount: 0,
        max_discount_amount: 0,
        usage_limit: 1,
        valid_days: 30,
        is_stackable: false,
        is_first_order_only: false,
        target_user_ids: []
      })
      setShowCreateForm(false)
      
      toast.success("쿠폰 템플릿이 생성되었습니다.")
    } catch (error) {
      console.error("쿠폰 생성 실패:", error)
      toast.error("쿠폰 생성에 실패했습니다.")
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("이 쿠폰 템플릿을 삭제하시겠습니까?")) return

    try {
      const updatedTemplates = couponTemplates.filter(template => template.id !== templateId)
      setCouponTemplates(updatedTemplates)
      toast.success("쿠폰 템플릿이 삭제되었습니다.")
    } catch (error) {
      console.error("쿠폰 삭제 실패:", error)
      toast.error("쿠폰 삭제에 실패했습니다.")
    }
  }

  const handleIssueCoupon = async (templateId: string) => {
    // 쿠폰 발급 로직 (향후 구현)
    toast.success("쿠폰이 발급되었습니다.")
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'used': return 'bg-gray-100 text-gray-800'
      case 'expired': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return '사용 가능'
      case 'used': return '사용 완료'
      case 'expired': return '만료됨'
      default: return status
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
                <h1 className="text-2xl font-bold text-gray-900">쿠폰 관리</h1>
                <p className="text-gray-600">쿠폰을 생성하고 발급 현황을 관리합니다.</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              쿠폰 템플릿 생성
            </Button>
          </div>
        {/* 탭 */}
        <div className="flex space-x-1 mb-6">
          <Button
            variant={activeTab === 'templates' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('templates')}
            className={activeTab === 'templates' ? 'bg-orange-500 hover:bg-orange-600' : ''}
          >
            <Gift className="w-4 h-4 mr-2" />
            쿠폰 템플릿 ({couponTemplates.length})
          </Button>
          <Button
            variant={activeTab === 'issued' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('issued')}
            className={activeTab === 'issued' ? 'bg-orange-500 hover:bg-orange-600' : ''}
          >
            <Users className="w-4 h-4 mr-2" />
            발급된 쿠폰 ({userCoupons.length})
          </Button>
        </div>

        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 템플릿 목록 */}
            <div>
              <h2 className="text-xl font-semibold mb-4">쿠폰 템플릿</h2>
              <div className="space-y-4">
                {couponTemplates.map((template) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {template.name}
                          {template.is_first_order_only && (
                            <Badge variant="secondary" className="text-xs">신규전용</Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleIssueCoupon(template.id)}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            발급
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>할인 혜택:</span>
                          <span className="font-medium text-orange-500">
                            {template.discount_amount 
                              ? `${template.discount_amount.toLocaleString()}원 할인`
                              : `${template.discount_percent}% 할인`
                            }
                          </span>
                        </div>
                        
                        {template.min_order_amount > 0 && (
                          <div className="flex justify-between">
                            <span>최소 주문:</span>
                            <span>{template.min_order_amount.toLocaleString()}원 이상</span>
                          </div>
                        )}
                        
                        {template.max_discount_amount && (
                          <div className="flex justify-between">
                            <span>최대 할인:</span>
                            <span>{template.max_discount_amount.toLocaleString()}원</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between">
                          <span>사용 제한:</span>
                          <span>{template.usage_limit}회</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span>유효 기간:</span>
                          <span>발급 후 {template.valid_days}일</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 쿠폰 생성 폼 */}
            {showCreateForm && (
              <div>
                <h2 className="text-xl font-semibold mb-4">새 쿠폰 템플릿 생성</h2>
                <Card>
                  <CardContent className="p-6">
                    <form onSubmit={handleCreateTemplate} className="space-y-4">
                      <div>
                        <Label htmlFor="name">쿠폰 이름 *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">설명</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label htmlFor="coupon_type">쿠폰 종류</Label>
                        <Select 
                          value={formData.coupon_type} 
                          onValueChange={(value: any) => setFormData({...formData, coupon_type: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="discount">할인 쿠폰</SelectItem>
                            <SelectItem value="free_service">무료 서비스</SelectItem>
                            <SelectItem value="cashback">캐시백</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.coupon_type === 'discount' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="discount_amount">할인 금액 (원)</Label>
                            <Input
                              id="discount_amount"
                              type="number"
                              min="0"
                              value={formData.discount_amount}
                              onChange={(e) => setFormData({...formData, discount_amount: parseInt(e.target.value) || 0})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="discount_percent">할인율 (%)</Label>
                            <Input
                              id="discount_percent"
                              type="number"
                              min="0"
                              max="100"
                              value={formData.discount_percent}
                              onChange={(e) => setFormData({...formData, discount_percent: parseInt(e.target.value) || 0})}
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="min_order_amount">최소 주문 금액 (원)</Label>
                          <Input
                            id="min_order_amount"
                            type="number"
                            min="0"
                            value={formData.min_order_amount}
                            onChange={(e) => setFormData({...formData, min_order_amount: parseInt(e.target.value) || 0})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="max_discount_amount">최대 할인 금액 (원)</Label>
                          <Input
                            id="max_discount_amount"
                            type="number"
                            min="0"
                            value={formData.max_discount_amount}
                            onChange={(e) => setFormData({...formData, max_discount_amount: parseInt(e.target.value) || 0})}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="usage_limit">사용 제한 (회)</Label>
                          <Input
                            id="usage_limit"
                            type="number"
                            min="1"
                            value={formData.usage_limit}
                            onChange={(e) => setFormData({...formData, usage_limit: parseInt(e.target.value) || 1})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="valid_days">유효 기간 (일)</Label>
                          <Input
                            id="valid_days"
                            type="number"
                            min="1"
                            value={formData.valid_days}
                            onChange={(e) => setFormData({...formData, valid_days: parseInt(e.target.value) || 30})}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={formData.is_first_order_only}
                            onCheckedChange={(checked) => setFormData({...formData, is_first_order_only: checked})}
                          />
                          <Label>신규 고객 전용</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={formData.is_stackable}
                            onCheckedChange={(checked) => setFormData({...formData, is_stackable: checked})}
                          />
                          <Label>다른 쿠폰과 중복 사용 가능</Label>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          생성
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowCreateForm(false)}
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
        )}

        {activeTab === 'issued' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">발급된 쿠폰 현황</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userCoupons.map((userCoupon) => (
                <Card key={userCoupon.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{userCoupon.user_name}</CardTitle>
                      <Badge className={getStatusBadgeColor(userCoupon.status)}>
                        {getStatusLabel(userCoupon.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">{userCoupon.coupon_name}</p>
                      <div className="flex justify-between">
                        <span>발급일:</span>
                        <span>{new Date(userCoupon.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>만료일:</span>
                        <span>{new Date(userCoupon.expires_at).toLocaleDateString()}</span>
                      </div>
                      {userCoupon.used_at && (
                        <div className="flex justify-between">
                          <span>사용일:</span>
                          <span>{new Date(userCoupon.used_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
    </div>
  )
}