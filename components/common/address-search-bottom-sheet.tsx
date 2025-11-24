"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import BottomSheet from "@/components/ui/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BodyMedium, BodySmall } from "@/components/ui/typography"
import type { AddressResult } from "@/lib/kakao-address"
import { getKakaoAddressService, isDaeguAddress } from "@/lib/kakao-address"
import { AlertTriangle, Loader2, MapPin, Search } from "lucide-react"
import { useState } from "react"

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
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<AddressResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<AddressData>({
    name: "",
    address: "",
    detailAddress: "",
    zonecode: ""
  })
  const [addressError, setAddressError] = useState("")
  const [showAddressInput, setShowAddressInput] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery || searchQuery.length < 2) {
      return
    }

    setIsSearching(true)
    try {
      const kakaoService = getKakaoAddressService()
      const results = await kakaoService.search(searchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error("주소 검색 오류:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectResult = (result: AddressResult) => {
    const fullAddress = result.roadAddress || result.address

    setSelectedAddress(prev => ({
      ...prev,
      address: fullAddress,
      zonecode: result.zonecode
    }))

    // 대구 지역 체크
    const isDaegu = isDaeguAddress(fullAddress)
    if (!isDaegu) {
      setAddressError("아직 이용할 수 없는 지역이에요. 조금만 기다려 주세요!")
    } else {
      setAddressError("")
    }

    setShowAddressInput(true)
    setSearchResults([])
    setSearchQuery("")
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
    setSearchQuery("")
    setSearchResults([])
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
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

        {/* 주소 검색 UI */}
        {!showAddressInput && (
          <>
            {/* 검색 입력 */}
            <div className="mb-4">
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className="flex-1"
                />
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || searchQuery.length < 2}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* 검색 결과 */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {searchResults.length === 0 && !isSearching && searchQuery && (
                <div className="text-center py-8 text-gray-500">
                  검색 결과가 없습니다.
                </div>
              )}

              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelectResult(result)}
                  className="w-full p-4 bg-white border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-left"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 mb-1">
                        {result.structured_formatting.main_text}
                      </div>
                      <div className="text-sm text-gray-600">
                        {result.structured_formatting.secondary_text}
                      </div>
                      {result.zonecode && (
                        <div className="text-xs text-gray-500 mt-1">
                          우편번호: {result.zonecode}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
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
                    : "bg-[#E67E22]  text-white"
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
