"use client"

import { useState } from "react"
import BottomSheet from "@/components/ui/bottom-sheet"
import { Button } from "@/components/ui/button"
import { type Address } from "@/lib/address-service"
import { Home, Building, MapPin } from "lucide-react"

interface AddressSelectionBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  addresses: Address[]
  selectedAddressId?: string
  onSelect: (address: Address) => void
}

export function AddressSelectionBottomSheet({
  isOpen,
  onClose,
  addresses,
  selectedAddressId,
  onSelect
}: AddressSelectionBottomSheetProps) {
  const [tempSelectedId, setTempSelectedId] = useState<string | undefined>(selectedAddressId)

  const handleConfirm = () => {
    const selected = addresses.find(addr => addr.id === tempSelectedId)
    if (selected) {
      onSelect(selected)
      onClose()
    }
  }

  const getAddressIcon = (name: string | null) => {
    if (!name) return <MapPin className="w-5 h-5 text-orange-500" />
    const lowerName = name.toLowerCase()
    if (lowerName.includes('집') || lowerName.includes('home')) {
      return <Home className="w-5 h-5 text-orange-500" />
    }
    if (lowerName.includes('회사') || lowerName.includes('office') || lowerName.includes('work')) {
      return <Building className="w-5 h-5 text-orange-500" />
    }
    return <MapPin className="w-5 h-5 text-orange-500" />
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="p-5">
        {/* 제목 */}
        <div className="mb-5 text-center">
          <h3 className="text-lg font-bold text-gray-900">주소 선택</h3>
        </div>

        {/* 주소 목록 */}
        <div className="space-y-3 mb-5">
          {addresses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm mb-4">등록된 주소가 없습니다.</p>
              <p className="text-gray-400 text-xs">주소를 먼저 등록해주세요.</p>
            </div>
          ) : (
            addresses.map((address) => (
              <button
                key={address.id}
                onClick={() => setTempSelectedId(address.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  tempSelectedId === address.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 bg-white hover:border-orange-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* 라디오 버튼 */}
                  <div className="mt-0.5">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      tempSelectedId === address.id
                        ? 'border-orange-500'
                        : 'border-gray-300'
                    }`}>
                      {tempSelectedId === address.id && (
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      )}
                    </div>
                  </div>

                  {/* 주소 정보 */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      {getAddressIcon(address.address_name)}
                      <span className="font-medium text-gray-800">{address.address_name || '주소'}</span>
                      {address.is_default && (
                        <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                          기본
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-0.5">
                      {address.address}
                    </p>
                    <p className="text-sm text-gray-500">
                      {address.detail_address}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 h-12 rounded-lg text-sm font-medium"
          >
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!tempSelectedId}
            className={`flex-1 h-12 rounded-lg text-sm font-bold transition-colors ${
              !tempSelectedId
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-[#E67E22] hover:bg-[#D35400] text-white'
            }`}
          >
            선택 완료
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}

export default AddressSelectionBottomSheet
