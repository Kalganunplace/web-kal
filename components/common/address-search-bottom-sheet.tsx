"use client"

import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import BottomSheet from "@/components/ui/bottom-sheet"
import { AlertTriangle, MapPin } from "lucide-react"
import { BodyMedium, BodySmall } from "@/components/ui/typography"
import { useState } from "react"
import DaumPostcodeEmbed from "react-daum-postcode"
import type { Address } from "react-daum-postcode"

export interface AddressData {
  name: string
  address: string
  detailAddress: string
  zonecode?: string
}

interface AddressSearchBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  onAddressSelect: (address: AddressData) => void
  initialData?: Partial<AddressData>
  showAddressName?: boolean
  showDetailAddress?: boolean
  placeholder?: string
  title?: string
}

export function AddressSearchBottomSheet({
  isOpen,
  onClose,
  onAddressSelect,
  initialData = {},
  showAddressName = true,
  showDetailAddress = true,
  placeholder = "예) 판교역로 235, 분당 주공, 삼평동 681",
  title = "주소 검색"
}: AddressSearchBottomSheetProps) {
  const [selectedAddress, setSelectedAddress] = useState<AddressData>({
    name: "",
    address: "",
    detailAddress: "",
    zonecode: ""
  })
  const [addressError, setAddressError] = useState("")
  const [showAddressInput, setShowAddressInput] = useState(false)

  const handleComplete = (data: Address) => {
    // 도로명 주소 우선, 없으면 지번 주소
    const fullAddress = data.roadAddress || data.jibunAddress

    setSelectedAddress(prev => ({
      ...prev,
      address: fullAddress,
      zonecode: data.zonecode
    }))

    // 대구 지역 체크
    const isDaegu = fullAddress.includes('대구')
    if (!isDaegu) {
      setAddressError("아직 이용할 수 없는 지역이에요. 조금만 기다려 주세요!")
    } else {
      setAddressError("")
    }

    setShowAddressInput(true)
  }

  const handleClose = () => {
    setSelectedAddress({
      name: "",
      address: "",
      detailAddress: "",
      zonecode: ""
    })
    setAddressError("")
    setShowAddressInput(false)
    onClose()
  }

  const handleSave = () => {
    const isValid = Boolean(selectedAddress.address && selectedAddress.name)
    const isSupported = !addressError

    if (isValid && isSupported) {
      onAddressSelect(selectedAddress)
      handleClose()
    }
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose}>
      <div className="p-5">
        {/* 제목 */}
        {title && (
          <div className="mb-5 text-center">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
        )}

        {/* Daum 우편번호 검색 */}
        {!showAddressInput && (
          <div className="mb-5">
            <DaumPostcodeEmbed
              onComplete={handleComplete}
              style={{ height: "400px" }}
            />
          </div>
        )}

        {/* 에러 메시지 */}
        {addressError && (
          <Alert className="border-red-500 bg-red-50 mb-4">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-500 text-sm font-bold">
              {addressError}
            </AlertDescription>
          </Alert>
        )}

        {/* 선택된 주소 표시 및 추가 정보 입력 */}
        {showAddressInput && selectedAddress.address && (
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-500 mt-0.5" />
                <div className="flex-1">
                  <BodyMedium color="#E67E22" className="font-bold text-sm mb-1">
                    선택된 주소
                  </BodyMedium>
                  <BodySmall color="#333333" className="text-sm">
                    {selectedAddress.zonecode && `(${selectedAddress.zonecode}) `}
                    {selectedAddress.address}
                  </BodySmall>
                </div>
              </div>
            </div>

            {/* 주소 별칭 입력 (조건부) */}
            {showAddressName && (
              <div>
                <Label htmlFor="addressName" className="text-sm font-medium text-gray-700 mb-2 block">
                  주소 별칭
                </Label>
                <input
                  id="addressName"
                  type="text"
                  value={selectedAddress.name}
                  onChange={(e) => setSelectedAddress(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg bg-white text-sm"
                  placeholder="예: 집, 회사"
                />
              </div>
            )}

            {/* 상세 주소 입력 (조건부) */}
            {showDetailAddress && (
              <div>
                <Label htmlFor="detailAddress" className="text-sm font-medium text-gray-700 mb-2 block">
                  상세 주소 (선택사항)
                </Label>
                <input
                  id="detailAddress"
                  type="text"
                  value={selectedAddress.detailAddress}
                  onChange={(e) => setSelectedAddress(prev => ({ ...prev, detailAddress: e.target.value }))}
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg bg-white text-sm"
                  placeholder="상세 주소를 입력해 주세요"
                />
              </div>
            )}

            {/* 저장 버튼 */}
            <div className="flex gap-3">
              <Button
                onClick={() => setShowAddressInput(false)}
                variant="outline"
                className="flex-1 h-12 rounded-lg text-sm font-medium"
              >
                다시 검색
              </Button>
              <Button
                onClick={handleSave}
                className={`flex-1 h-12 rounded-lg text-sm font-bold transition-colors ${
                  !selectedAddress.address || !selectedAddress.name || addressError
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-[#E67E22] hover:bg-[#D35400] text-white"
                }`}
                disabled={!selectedAddress.address || !selectedAddress.name || !!addressError}
              >
                저장
              </Button>
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}

export default AddressSearchBottomSheet