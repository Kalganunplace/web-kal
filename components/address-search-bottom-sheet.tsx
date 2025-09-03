"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import BottomSheet from "@/components/ui/bottom-sheet"
import { Loader2, AlertTriangle, MapPin } from "lucide-react"
import { BodyMedium, BodySmall } from "@/components/ui/typography"
import { useAddressSearch, type AddressData } from "@/hooks/useAddressSearch"
import { getKakaoAddressService } from "@/lib/kakao-address"
import { useEffect } from "react"

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
  const {
    isSearching,
    searchResults,
    searchQuery,
    addressError,
    selectedAddress,
    searchPlaces,
    selectAddress,
    updateAddressData,
    resetSearch,
    isAddressValid,
    isAddressSupported
  } = useAddressSearch()

  // 초기 데이터 설정
  useEffect(() => {
    if (isOpen && initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        if (value) {
          updateAddressData(key as keyof AddressData, value)
        }
      })
    }
  }, [isOpen, initialData, updateAddressData])

  const handleClose = () => {
    resetSearch()
    onClose()
  }

  const handleSave = () => {
    if (isAddressValid && isAddressSupported) {
      onAddressSelect(selectedAddress)
      handleClose()
    }
  }

  const handleNaverMapSearch = () => {
    // 네이버 지도는 별도 팝업이 필요 없으므로 일반 검색과 동일하게 처리
    // 사용자가 더 정확한 검색을 원할 때 사용할 수 있는 기능으로 유지
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose}>
      <div className="p-5">
        {/* 제목 (선택사항) */}
        {title && (
          <div className="mb-5 text-center">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
        )}

        {/* 주소 검색 필드 */}
        <div className="mb-5 space-y-3">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => searchPlaces(e.target.value)}
            className={`w-full h-12 px-5 text-sm font-bold rounded-lg border-2 ${
              addressError 
                ? "border-red-500 bg-white text-gray-900" 
                : "border-gray-300 bg-white text-gray-600"
            }`}
            placeholder={placeholder}
          />
          

          {isSearching && (
            <div className="flex justify-center mt-3">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          )}
        </div>

        {/* 에러 메시지 */}
        {addressError && (
          <Alert className="border-red-500 bg-red-50 mb-4">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-500 text-sm font-bold">
              {addressError}
            </AlertDescription>
          </Alert>
        )}

        {/* 주소 검색 결과 */}
        {searchResults.length > 0 && (
          <div className="space-y-3 max-h-60 overflow-y-auto mb-5">
            {searchResults.map((result) => (
              <button
                key={result.id}
                onClick={() => selectAddress(result)}
                className="w-full p-4 text-left bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1 flex-1">
                    <BodyMedium color="#333333" className="text-sm font-bold">
                      {result.structured_formatting.main_text}
                    </BodyMedium>
                    <BodySmall color="#666666" className="text-xs">
                      {result.structured_formatting.secondary_text}
                    </BodySmall>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 검색 결과가 없을 때 */}
        {searchQuery.length > 1 && !isSearching && searchResults.length === 0 && !addressError && (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <BodyMedium color="#666666" className="text-sm">
              검색된 지역이 없습니다
            </BodyMedium>
            <BodySmall color="#999999" className="text-xs mt-1">
              다른 검색어로 시도해보세요
            </BodySmall>
          </div>
        )}

        {/* 선택된 주소 표시 */}
        {selectedAddress.address && (
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <BodyMedium color="#E67E22" className="font-bold text-sm mb-1">
                    선택된 주소
                  </BodyMedium>
                  <BodySmall color="#333333" className="text-sm">
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
                <Input
                  id="addressName"
                  type="text"
                  value={selectedAddress.name}
                  onChange={(e) => updateAddressData('name', e.target.value)}
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
                <Input
                  id="detailAddress"
                  type="text"
                  value={selectedAddress.detailAddress}
                  onChange={(e) => updateAddressData('detailAddress', e.target.value)}
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg bg-white text-sm"
                  placeholder="상세 주소를 입력해 주세요"
                />
              </div>
            )}

            {/* 저장 버튼 */}
            <div className="flex gap-3">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1 h-12 rounded-lg text-sm font-medium"
              >
                취소
              </Button>
              <Button
                onClick={handleSave}
                className={`flex-1 h-12 rounded-lg text-sm font-bold transition-colors ${
                  !isAddressValid || !isAddressSupported
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-[#E67E22] hover:bg-[#D35400] text-white"
                }`}
                disabled={!isAddressValid || !isAddressSupported}
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