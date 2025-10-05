"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import BottomSheet from "@/components/ui/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { BodyMedium, BodySmall } from "@/components/ui/typography"
import { isDaeguAddress } from "@/lib/kakao-address"
import { AlertTriangle, MapPin } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export interface AddressData {
  name: string
  address: string
  detailAddress: string
  zonecode?: string
}

interface DaumAddressSearchBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  onAddressSelect: (address: AddressData) => void
  showAddressName?: boolean
  showDetailAddress?: boolean
  title?: string
}

// 다음 우편번호 서비스 타입 정의
declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: DaumAddressData) => void
        width: string
        height: string
        theme?: {
          bgColor?: string
          searchBgColor?: string
          contentBgColor?: string
          pageBgColor?: string
          textColor?: string
          queryTextColor?: string
          outlineColor?: string
        }
      }) => {
        embed: (element: HTMLElement) => void
      }
    }
  }
}

interface DaumAddressData {
  address: string // 지번 주소
  addressEnglish: string
  addressType: "R" | "J" // R: 도로명, J: 지번
  apartment: "Y" | "N"
  autoJibunAddress: string
  autoJibunAddressEnglish: string
  autoRoadAddress: string
  autoRoadAddressEnglish: string
  bcode: string
  bname: string
  bname1: string
  bname2: string
  buildingCode: string
  buildingName: string
  hname: string
  jibunAddress: string
  jibunAddressEnglish: string
  noSelected: "Y" | "N"
  postcode: string
  postcode1: string
  postcode2: string
  postcodeSeq: string
  query: string
  roadAddress: string // 도로명 주소
  roadAddressEnglish: string
  roadname: string
  roadnameCode: string
  sido: string
  sigungu: string
  sigunguCode: string
  userLanguageType: "K" | "E"
  userSelectedType: "R" | "J"
  zonecode: string
}

export function DaumAddressSearchBottomSheet({
  isOpen,
  onClose,
  onAddressSelect,
  showAddressName = true,
  showDetailAddress = true,
  title = "주소 검색"
}: DaumAddressSearchBottomSheetProps) {
  const [selectedAddress, setSelectedAddress] = useState<AddressData>({
    name: "",
    address: "",
    detailAddress: "",
    zonecode: ""
  })
  const [addressError, setAddressError] = useState("")
  const [showAddressInput, setShowAddressInput] = useState(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const embedRef = useRef<HTMLDivElement>(null)

  // 다음 우편번호 서비스 스크립트 로드
  useEffect(() => {
    // 이미 스크립트가 로드되어 있는지 확인
    if (window.daum?.Postcode) {
      console.log("다음 우편번호 스크립트 이미 로드됨")
      setIsScriptLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
    script.async = true
    script.onload = () => {
      console.log("다음 우편번호 스크립트 로드 완료")
      setIsScriptLoaded(true)
    }
    script.onerror = () => {
      console.error("다음 우편번호 스크립트 로드 실패")
    }
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  // 다음 우편번호 서비스 임베드
  useEffect(() => {
    if (isOpen && isScriptLoaded && embedRef.current && !showAddressInput) {
      const postcode = new window.daum.Postcode({
        oncomplete: function (data: DaumAddressData) {
          // 도로명 주소 우선, 없으면 지번 주소
          const fullAddress = data.roadAddress || data.jibunAddress
          const zonecode = data.zonecode

          setSelectedAddress(prev => ({
            ...prev,
            address: fullAddress,
            zonecode: zonecode
          }))

          // 대구 지역 체크
          const isDaegu = isDaeguAddress(fullAddress)
          if (!isDaegu) {
            setAddressError("아직 이용할 수 없는 지역이에요. 조금만 기다려 주세요!")
          } else {
            setAddressError("")
          }

          setShowAddressInput(true)
        },
        width: "100%",
        height: "450px",
        theme: {
          bgColor: "#FFFFFF00",         // 전체 배경색
          searchBgColor: "#F97316",   // 검색창 배경색 (오렌지)
          contentBgColor: "#FFFFFF00",  // 본문 배경색
          pageBgColor: "#FFFFFF00",     // 페이지 배경색 (연한 회색)
          textColor: "#333333",       // 기본 글자색
          queryTextColor: "#FFFFFF",  // 검색어 글자색 (흰색)c
          outlineColor: "#FFFFFF00"     // 선택 테두리색 (오렌지)
        }
      })

      // 기존 내용 제거 후 임베드
      if (embedRef.current) {
        embedRef.current.innerHTML = ""
        postcode.embed(embedRef.current)
      }
    }
  }, [isOpen, isScriptLoaded, showAddressInput])

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

        {/* 다음 우편번호 서비스 임베드 */}
        {!showAddressInput && (
          <div className="mb-4">
            <div ref={embedRef} className="border border-gray-200 rounded-lg overflow-hidden" />
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

export default DaumAddressSearchBottomSheet
