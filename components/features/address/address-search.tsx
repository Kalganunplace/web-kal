"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, MapPin, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getKakaoAddressService } from "@/lib/kakao-address"
import type { AddressResult } from "@/lib/kakao-address"

interface AddressSearchProps {
  onAddressSelect: (address: {
    postalCode: string
    address: string
    detailAddress: string
  }) => void
  defaultAddress?: {
    postalCode?: string
    address?: string
    detailAddress?: string
  }
}

export default function AddressSearch({
  onAddressSelect,
  defaultAddress
}: AddressSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<AddressResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [postalCode, setPostalCode] = useState(defaultAddress?.postalCode || "")
  const [address, setAddress] = useState(defaultAddress?.address || "")
  const [detailAddress, setDetailAddress] = useState(defaultAddress?.detailAddress || "")
  const [showResults, setShowResults] = useState(false)

  // 주소 검색 실행
  const handleAddressSearch = async () => {
    if (!searchQuery || searchQuery.length < 2) {
      toast.error("검색어를 2자 이상 입력해주세요.")
      return
    }

    setIsSearching(true)
    setShowResults(true)

    try {
      const kakaoService = getKakaoAddressService()
      const results = await kakaoService.search(searchQuery)
      setSearchResults(results)

      if (results.length === 0) {
        toast.error("검색 결과가 없습니다.")
      }
    } catch (error) {
      console.error("주소 검색 오류:", error)
      toast.error("주소 검색 중 오류가 발생했습니다.")
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // 검색 결과 선택
  const handleSelectResult = (result: AddressResult) => {
    const selectedAddress = result.roadAddress || result.address
    setPostalCode(result.zonecode || "")
    setAddress(selectedAddress)
    setShowResults(false)
    setSearchQuery("")
    setSearchResults([])

    // 커서를 상세주소 필드로 이동
    setTimeout(() => {
      document.getElementById('detail-address')?.focus()
    }, 100)
  }

  // 주소 선택 완료
  const handleComplete = () => {
    if (!address) {
      toast.error('주소를 검색해주세요.')
      return
    }

    onAddressSelect({
      postalCode,
      address,
      detailAddress
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddressSearch()
    }
  }

  return (
    <div className="space-y-4">
      {/* 검색 입력 */}
      <div className="space-y-2">
        <Label htmlFor="search-query">주소 검색</Label>
        <div className="flex gap-2">
          <Input
            id="search-query"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="도로명, 건물명, 지번 검색"
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleAddressSearch}
            disabled={isSearching || searchQuery.length < 2}
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Search className="w-4 h-4 mr-1" />
            )}
            검색
          </Button>
        </div>
      </div>

      {/* 검색 결과 */}
      {showResults && (
        <div className="border border-gray-200 rounded-lg max-h-[300px] overflow-y-auto">
          {searchResults.length === 0 && !isSearching && (
            <div className="text-center py-8 text-gray-500">
              검색 결과가 없습니다.
            </div>
          )}

          {searchResults.map((result) => (
            <button
              key={result.id}
              onClick={() => handleSelectResult(result)}
              className="w-full p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-left transition-colors"
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900">
                    {result.structured_formatting.main_text}
                  </div>
                  <div className="text-xs text-gray-600">
                    {result.structured_formatting.secondary_text}
                  </div>
                  {result.zonecode && (
                    <div className="text-xs text-gray-500 mt-1">
                      [{result.zonecode}]
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 우편번호 */}
      <div className="space-y-2">
        <Label htmlFor="postal-code">우편번호</Label>
        <Input
          id="postal-code"
          value={postalCode}
          placeholder="우편번호"
          readOnly
          className="bg-gray-50"
        />
      </div>

      {/* 기본 주소 */}
      <div className="space-y-2">
        <Label htmlFor="address">주소</Label>
        <Input
          id="address"
          value={address}
          placeholder="주소를 검색해주세요"
          readOnly
          className="bg-gray-50"
        />
      </div>

      {/* 상세 주소 */}
      <div className="space-y-2">
        <Label htmlFor="detail-address">상세주소</Label>
        <Input
          id="detail-address"
          value={detailAddress}
          onChange={(e) => setDetailAddress(e.target.value)}
          placeholder="상세주소를 입력해주세요 (예: 101동 202호)"
        />
      </div>

      {/* 주소 미리보기 */}
      {address && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
            <div className="flex-1 text-sm">
              <div className="font-medium">입력한 주소</div>
              <div className="text-gray-600">
                {address}
                {detailAddress && ` ${detailAddress}`}
              </div>
              <div className="text-gray-500">우편번호: {postalCode}</div>
            </div>
          </div>
        </div>
      )}

      <Button
        onClick={handleComplete}
        className="w-full"
        disabled={!address}
      >
        주소 사용하기
      </Button>
    </div>
  )
}
