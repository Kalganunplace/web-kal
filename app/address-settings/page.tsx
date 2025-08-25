"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import TopBanner from "@/components/ui/top-banner"
import { BodyMedium, BodySmall, CaptionMedium, Heading3 } from "@/components/ui/typography"

interface Address {
  id: string
  name: string
  address: string
  detailAddress: string
  isDefault: boolean
}

export default function AddressSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  
  // 지원 지역 목록
  const supportedRegions = ["대구 중구", "대구 동구", "대구 서구", "대구 남구", "대구 북구"]
  
  // 주소 목록 상태
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      name: "집",
      address: "대구 중구 동성로2가",
      detailAddress: "123번지 456호",
      isDefault: true
    }
  ])

  // 새 주소 입력 상태
  const [newAddress, setNewAddress] = useState({
    name: "",
    address: "",
    detailAddress: ""
  })

  // 주소 검색 결과 (시뮬레이션)
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const handleAddressSearch = (query: string) => {
    setSearchQuery(query)
    
    if (query.length > 1) {
      // 실제로는 주소 검색 API를 호출
      const mockResults = supportedRegions
        .filter(region => region.includes(query))
        .slice(0, 5)
      setSearchResults(mockResults)
    } else {
      setSearchResults([])
    }
  }

  const handleAddAddress = async () => {
    if (!newAddress.name || !newAddress.address) {
      alert("필수 정보를 입력해주세요.")
      return
    }

    // 지원 지역 확인
    const isSupported = supportedRegions.some(region => 
      newAddress.address.includes(region)
    )

    if (!isSupported) {
      alert("현재 해당 지역은 서비스 지원 지역이 아닙니다.")
      return
    }

    setLoading(true)
    
    try {
      // API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newId = Date.now().toString()
      setAddresses([...addresses, {
        id: newId,
        name: newAddress.name,
        address: newAddress.address,
        detailAddress: newAddress.detailAddress,
        isDefault: addresses.length === 0
      }])

      setNewAddress({ name: "", address: "", detailAddress: "" })
      setIsAddingAddress(false)
    } catch (error) {
      console.error("주소 추가 중 오류 발생:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAddress = (id: string) => {
    if (confirm("이 주소를 삭제하시겠습니까?")) {
      setAddresses(addresses.filter(addr => addr.id !== id))
    }
  }

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })))
  }

  return (
    <>
      <TopBanner
        title="주소 설정"
        onBackClick={() => router.back()}
      />

      <div className="flex-1 px-5 py-6 bg-gray-50">
        {!isAddingAddress ? (
          <div className="space-y-6">
            {/* 현재 설정된 주소 목록 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Heading3 color="#333333" className="font-bold">등록된 주소</Heading3>
                <Button
                  onClick={() => setIsAddingAddress(true)}
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  주소 추가
                </Button>
              </div>

              <div className="space-y-3">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="bg-white rounded-xl p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <BodyMedium color="#333333" className="font-bold">
                            {address.name}
                          </BodyMedium>
                          {address.isDefault && (
                            <div className="bg-orange-100 text-orange-500 px-2 py-1 rounded text-xs font-bold">
                              기본
                            </div>
                          )}
                        </div>
                        <BodyMedium color="#666666" className="mb-1">
                          {address.address}
                        </BodyMedium>
                        {address.detailAddress && (
                          <CaptionMedium color="#999999">
                            {address.detailAddress}
                          </CaptionMedium>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {!address.isDefault && (
                        <Button
                          onClick={() => handleSetDefault(address.id)}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                        >
                          기본 설정
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDeleteAddress(address.id)}
                        size="sm"
                        variant="outline"
                        className="text-xs text-red-500 border-red-200 hover:bg-red-50"
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                ))}

                {addresses.length === 0 && (
                  <div className="bg-white rounded-xl p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      📍
                    </div>
                    <BodyMedium color="#666666">등록된 주소가 없습니다</BodyMedium>
                  </div>
                )}
              </div>
            </div>

            {/* 서비스 지원 지역 안내 */}
            <div className="bg-blue-50 rounded-xl p-4">
              <Heading3 color="#4A90E2" className="font-bold mb-2">서비스 지원 지역</Heading3>
              <div className="space-y-1">
                {supportedRegions.map((region, index) => (
                  <CaptionMedium key={index} color="#4A90E2">
                    • {region}
                  </CaptionMedium>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* 새 주소 추가 폼 */
          <div className="space-y-6">
            <Heading3 color="#333333" className="font-bold">새 주소 추가</Heading3>

            {/* 주소 별칭 */}
            <div className="space-y-3">
              <Label htmlFor="addressName" className="text-sm font-medium text-gray-700">
                주소 별칭
              </Label>
              <Input
                id="addressName"
                type="text"
                value={newAddress.name}
                onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                className="w-full h-14 px-4 border border-gray-300 rounded-xl bg-white text-lg"
                placeholder="예: 집, 회사"
              />
            </div>

            {/* 주소 검색 */}
            <div className="space-y-3">
              <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                주소 검색
              </Label>
              <Input
                id="address"
                type="text"
                value={searchQuery}
                onChange={(e) => handleAddressSearch(e.target.value)}
                className="w-full h-14 px-4 border border-gray-300 rounded-xl bg-white text-lg"
                placeholder="지역명을 입력하세요"
              />
              
              {/* 검색 결과 */}
              {searchResults.length > 0 && (
                <div className="bg-white border border-gray-300 rounded-xl max-h-48 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setNewAddress({...newAddress, address: result})
                        setSearchResults([])
                        setSearchQuery(result)
                      }}
                      className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <BodyMedium color="#333333">{result}</BodyMedium>
                    </button>
                  ))}
                </div>
              )}
              
              {/* 선택된 주소 표시 */}
              {newAddress.address && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <BodyMedium color="#E67E22" className="font-medium">
                    선택된 주소: {newAddress.address}
                  </BodyMedium>
                </div>
              )}
            </div>

            {/* 상세 주소 */}
            <div className="space-y-3">
              <Label htmlFor="detailAddress" className="text-sm font-medium text-gray-700">
                상세 주소 (선택사항)
              </Label>
              <Input
                id="detailAddress"
                type="text"
                value={newAddress.detailAddress}
                onChange={(e) => setNewAddress({...newAddress, detailAddress: e.target.value})}
                className="w-full h-14 px-4 border border-gray-300 rounded-xl bg-white text-lg"
                placeholder="상세 주소를 입력하세요"
              />
            </div>

            {/* 버튼 영역 */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  setIsAddingAddress(false)
                  setNewAddress({ name: "", address: "", detailAddress: "" })
                  setSearchResults([])
                  setSearchQuery("")
                }}
                variant="outline"
                className="flex-1 h-14 border-gray-300 text-gray-700 font-medium rounded-xl text-lg"
                disabled={loading}
              >
                취소
              </Button>
              <Button
                onClick={handleAddAddress}
                className="flex-1 h-14 bg-[#E67E22] hover:bg-[#D35400] text-white font-bold rounded-xl text-lg"
                disabled={loading || !newAddress.name || !newAddress.address}
              >
                {loading ? "추가 중..." : "주소 추가"}
              </Button>
            </div>
          </div>
        )}

        {/* Spacer for bottom navigation */}
        <div className="h-20" />
      </div>
    </>
  )
}