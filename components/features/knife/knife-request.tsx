"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DatePicker } from "@/components/common/date-picker"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Loader2, ChevronLeft, MapPin, Clock, Calendar as CalendarIcon, PocketKnifeIcon as Knife, Plus, Minus } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

import { knifeService, type KnifeType } from "@/lib/knife-service"
import { bookingService, type CreateBookingData } from "@/lib/booking-service"
import { addressService, type Address } from "@/lib/address-service"
import { useAuthStore } from "@/stores/auth-store"
import { useAuthModal } from "@/contexts/auth-modal-context"

interface KnifeSelection {
  knife_type_id: string
  quantity: number
}

interface KnifeRequestProps {
  onComplete?: (bookingData: CreateBookingData) => void
  showSubmitButton?: boolean
}

export default function KnifeRequest({
  onComplete,
  showSubmitButton = true
}: KnifeRequestProps = {}) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { openModal } = useAuthModal()

  // 상태 관리
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<[number]>([9])
  const [knifeTypes, setKnifeTypes] = useState<KnifeType[]>([])
  const [knifeSelections, setKnifeSelections] = useState<KnifeSelection[]>([])
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null)
  const [userAddresses, setUserAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 시간 슬롯 생성 (9시~18시)
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour <= 18; hour++) {
      slots.push({
        value: hour,
        label: `${hour.toString().padStart(2, '0')}:00`
      })
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // 칼 종류 데이터 로드
        const knifesData = await knifeService.getAllKnifeTypes()
        setKnifeTypes(knifesData)
        
        // 로그인된 사용자의 주소 목록 로드
        if (isAuthenticated && user?.id) {
          try {
            // 모든 주소 가져오기
            const addresses = await addressService.getUserAddresses(user.id)
            setUserAddresses(addresses)
            
            // 기본 주소 찾기
            const defaultAddr = addresses.find(addr => addr.is_default) || addresses[0]
            if (defaultAddr) {
              setDefaultAddress(defaultAddr)
              setSelectedAddress(defaultAddr)
            }
          } catch (error) {
            console.error('주소 로드 실패:', error)
          }
        }
      } catch (error) {
        console.error('데이터 로드 실패:', error)
        toast.error('데이터를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [isAuthenticated, user?.id])

  // 칼 종류별 수량 업데이트
  const updateKnifeQuantity = (knifeTypeId: string, quantity: number) => {
    setKnifeSelections(prev => {
      const existing = prev.find(item => item.knife_type_id === knifeTypeId)
      if (existing) {
        if (quantity === 0) {
          return prev.filter(item => item.knife_type_id !== knifeTypeId)
        }
        return prev.map(item =>
          item.knife_type_id === knifeTypeId ? { ...item, quantity } : item
        )
      } else if (quantity > 0) {
        return [...prev, { knife_type_id: knifeTypeId, quantity }]
      }
      return prev
    })
  }

  // 총 수량 및 금액 계산
  const totalQuantity = knifeSelections.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = knifeSelections.reduce((sum, item) => {
    const knifeType = knifeTypes.find(kt => kt.id === item.knife_type_id)
    return sum + (knifeType ? knifeType.discount_price * item.quantity : 0)
  }, 0)

  // 예약 신청 또는 다음 단계
  const handleSubmit = async () => {
    if (!isAuthenticated || !user?.id) {
      openModal('login')
      return
    }

    if (!selectedDate) {
      toast.error('날짜를 선택해주세요.')
      return
    }

    if (knifeSelections.length === 0) {
      toast.error('연마할 칼을 선택해주세요.')
      return
    }

    if (!selectedAddress) {
      toast.error('배송 주소를 선택해주세요.')
      router.push('/address-settings')
      return
    }

    const bookingData: CreateBookingData = {
      booking_date: format(selectedDate, 'yyyy-MM-dd'),
      booking_time: `${selectedTimeSlot[0].toString().padStart(2, '0')}:00:00`,
      items: knifeSelections,
      special_instructions: specialInstructions || undefined
    }

    // onComplete 콜백이 있으면 다음 단계로, 없으면 직접 예약 생성
    if (onComplete) {
      onComplete(bookingData)
      return
    }

    try {
      setIsSubmitting(true)

      await bookingService.createBooking(user.id, bookingData)

      toast.success('예약이 성공적으로 접수되었습니다!')
      router.push('/usage-history')
    } catch (error) {
      console.error('예약 생성 실패:', error)
      toast.error('예약 접수 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
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
          <h1 className="text-lg font-medium">칼갈이 신청</h1>
          <div className="w-6" />
        </div>

        {/* Content */}
        <div className="p-4 pb-20 max-h-[80vh] overflow-y-auto">
          {/* Address Section */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                <span className="font-medium">수거 주소</span>
              </div>
              
              {userAddresses.length > 0 ? (
                <>
                  {/* 주소 선택 드롭다운 */}
                  {userAddresses.length > 1 ? (
                    <Select
                      value={selectedAddress?.id}
                      onValueChange={(value) => {
                        const addr = userAddresses.find(a => a.id === value)
                        setSelectedAddress(addr || null)
                      }}
                    >
                      <SelectTrigger className="w-full mb-2">
                        <SelectValue placeholder="주소를 선택해주세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {userAddresses.map((addr) => (
                          <SelectItem key={addr.id} value={addr.id}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {addr.address_name || (addr.is_default ? '기본 주소' : addr.address_type)}
                              </span>
                              {addr.is_default && (
                                <span className="text-xs bg-orange-100 text-orange-600 px-1 rounded">기본</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {addr.address} {addr.detail_address}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}
                  
                  {/* 선택된 주소 표시 */}
                  {selectedAddress && (
                    <div className="p-3 bg-gray-50 rounded-lg mb-2">
                      <p className="text-sm font-medium mb-1">
                        {selectedAddress.address_name || (selectedAddress.is_default ? '기본 주소' : selectedAddress.address_type)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedAddress.address}
                        {selectedAddress.detail_address && ` ${selectedAddress.detail_address}`}
                      </p>
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-orange-500 border-orange-500 bg-transparent w-full"
                    onClick={() => router.push('/address-settings')}
                  >
                    주소 관리
                  </Button>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-2">등록된 주소가 없습니다</p>
                  <Button 
                    size="sm" 
                    className="bg-orange-500 hover:bg-orange-600"
                    onClick={() => router.push('/address-settings')}
                  >
                    주소 등록하기
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Date Selection */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <CalendarIcon className="w-5 h-5 text-orange-500" />
                <span className="font-medium">수거 날짜</span>
              </div>
              <DatePicker
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                placeholder="수거 날짜 선택"
              />
            </CardContent>
          </Card>

          {/* Time Selection */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="font-medium">수거 시간</span>
              </div>
              <div className="space-y-2">
                <Slider
                  value={selectedTimeSlot}
                  onValueChange={setSelectedTimeSlot}
                  max={18}
                  min={9}
                  step={1}
                  className="w-full"
                />
                <div className="text-center text-lg font-medium text-orange-500">
                  {selectedTimeSlot[0].toString().padStart(2, '0')}:00
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>09:00</span>
                  <span>18:00</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Knife Selection */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Knife className="w-5 h-5 text-orange-500" />
                <span className="font-medium">연마할 칼 선택</span>
              </div>
              <div className="space-y-3">
                {knifeTypes.map((knifeType) => {
                  const currentQuantity = knifeSelections.find(
                    item => item.knife_type_id === knifeType.id
                  )?.quantity || 0

                  return (
                    <div key={knifeType.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{knifeType.name}</h4>
                          <p className="text-xs text-gray-500">{knifeType.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400 line-through">
                              {knifeService.formatPrice(knifeType.market_price)}
                            </span>
                            <span className="text-sm font-medium text-orange-500">
                              {knifeService.formatPrice(knifeType.discount_price)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateKnifeQuantity(knifeType.id, Math.max(0, currentQuantity - 1))}
                            disabled={currentQuantity === 0}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{currentQuantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateKnifeQuantity(knifeType.id, currentQuantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {currentQuantity > 0 && (
                        <div className="text-right text-sm text-orange-500 font-medium">
                          소계: {knifeService.formatPrice(knifeType.discount_price * currentQuantity)}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Special Requests */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <label className="block font-medium mb-2">특별 요청사항</label>
              <Textarea 
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="칼의 상태나 특별한 요청사항을 입력해주세요" 
                className="resize-none" 
                rows={3} 
              />
            </CardContent>
          </Card>

          {/* Price Summary */}
          {totalQuantity > 0 && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">예상 비용</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>칼갈이 ({totalQuantity}개)</span>
                    <span>{knifeService.formatPrice(totalAmount)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-medium">
                    <span>총 금액</span>
                    <span className="text-orange-500">{knifeService.formatPrice(totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {showSubmitButton && (
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-3"
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedDate || totalQuantity === 0}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSubmitting
                ? '처리 중...'
                : onComplete
                  ? '다음 단계'
                  : '바로 신청'
              }
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
