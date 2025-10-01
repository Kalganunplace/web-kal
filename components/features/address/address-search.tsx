"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, MapPin } from "lucide-react"
import { toast } from "sonner"

declare global {
  interface Window {
    daum: any
  }
}

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
  const [postalCode, setPostalCode] = useState(defaultAddress?.postalCode || "")
  const [address, setAddress] = useState(defaultAddress?.address || "")
  const [detailAddress, setDetailAddress] = useState(defaultAddress?.detailAddress || "")
  const searchButtonRef = useRef<HTMLButtonElement>(null)

  // Daum 우편번호 서비스 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script')
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // 주소 검색 실행
  const handleAddressSearch = () => {
    if (!window.daum || !window.daum.Postcode) {
      toast.error('주소 검색 서비스를 로드하는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    new window.daum.Postcode({
      oncomplete: function(data: any) {
        // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드
        let addr = '' // 주소 변수
        let extraAddr = '' // 참고항목 변수

        // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
        if (data.userSelectedType === 'R') { 
          // 사용자가 도로명 주소를 선택했을 경우
          addr = data.roadAddress
        } else { 
          // 사용자가 지번 주소를 선택했을 경우(J)
          addr = data.jibunAddress
        }

        // 사용자가 선택한 주소가 도로명 타입일때 참고항목을 조합한다.
        if(data.userSelectedType === 'R'){
          // 법정동명이 있을 경우 추가한다. (법정리는 제외)
          // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
          if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
            extraAddr += data.bname
          }
          // 건물명이 있고, 공동주택일 경우 추가한다.
          if(data.buildingName !== '' && data.apartment === 'Y'){
            extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName)
          }
          // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
          if(extraAddr !== ''){
            extraAddr = ' (' + extraAddr + ')'
          }
          // 조합된 참고항목을 주소 변수에 넣는다.
          addr += extraAddr
        }

        // 우편번호와 주소 정보를 해당 필드에 넣는다.
        setPostalCode(data.zonecode)
        setAddress(addr)
        
        // 커서를 상세주소 필드로 이동한다.
        setTimeout(() => {
          document.getElementById('detail-address')?.focus()
        }, 100)
      }
    }).open()
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

  return (
    <div className="space-y-4">
      {/* 우편번호 */}
      <div className="space-y-2">
        <Label htmlFor="postal-code">우편번호</Label>
        <div className="flex gap-2">
          <Input
            id="postal-code"
            value={postalCode}
            placeholder="우편번호"
            readOnly
            className="flex-1"
          />
          <Button
            ref={searchButtonRef}
            type="button"
            onClick={handleAddressSearch}
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            <Search className="w-4 h-4 mr-1" />
            주소 검색
          </Button>
        </div>
      </div>

      {/* 기본 주소 */}
      <div className="space-y-2">
        <Label htmlFor="address">주소</Label>
        <Input
          id="address"
          value={address}
          placeholder="주소를 검색해주세요"
          readOnly
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