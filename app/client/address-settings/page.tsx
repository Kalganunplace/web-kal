"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import TopBanner from "@/components/ui/top-banner"
import { BodyMedium, CaptionMedium, Heading3 } from "@/components/ui/typography"
import { AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
// import AddressSearchBottomSheet from "@/components/common/address-search-bottom-sheet"
import DaumAddressSearchBottomSheet from "@/components/common/daum-address-search-bottom-sheet"
import MapPinIcon from "@/components/icons/map-pin-icon"
import type { AddressData } from "@/hooks/useAddressSearch"
import { addressService, type Address, type CreateAddressData } from "@/lib/address-service"
import { isDaeguAddress } from "@/lib/kakao-address"
import { useAuthHydrated, useAuthUser } from "@/stores/auth-store"

export default function AddressSettingsPage() {
  const router = useRouter()
  const user = useAuthUser()
  const hydrated = useAuthHydrated()
  const [loading, setLoading] = useState(false)
  const [showAddressSheet, setShowAddressSheet] = useState(false)
  const [showUnsupportedModal, setShowUnsupportedModal] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true)

  // 주소 목록 로드
  useEffect(() => {
    // hydration이 완료될 때까지 기다림
    if (!hydrated) {
      console.log('Waiting for hydration...')
      return
    }

    console.log('address-settings auth check:', { user, userId: user?.id, userType: user?.type })

    if (!user) {
      console.log('No user, redirecting to /login')
      router.push('/client/login')
      return
    }

    if (user.type !== 'client') {
      console.log('Not a client user, user type:', user.type)
      router.push('/client/login')
      return
    }

    console.log('User authenticated, loading addresses')
    loadAddresses()
  }, [user, hydrated, router])

  const loadAddresses = async () => {
    if (!user?.id) return

    try {
      setIsLoadingAddresses(true)
      const userAddresses = await addressService.getUserAddresses(user.id)
      setAddresses(userAddresses)
    } catch (error) {
      console.error('주소 목록 로드 중 오류:', error)
    } finally {
      setIsLoadingAddresses(false)
    }
  }

  const handleAddressSelect = async (addressData: AddressData) => {
    if (!user?.id) return

    const isSupported = isDaeguAddress(addressData.address)

    if (!isSupported) {
      setShowUnsupportedModal(true)
      return
    }

    setLoading(true)

    try {
      const createData: CreateAddressData = {
        address_name: addressData.name,
        address: addressData.address,
        detail_address: addressData.detailAddress,
        is_default: addresses.length === 0 // 첫 번째 주소는 자동으로 기본 주소
      }

      await addressService.createAddress(user.id, createData)
      await loadAddresses() // 주소 목록 새로고침
      setShowAddressSheet(false)
    } catch (error) {
      console.error("주소 추가 중 오류 발생:", error)
      alert("주소 추가 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("이 주소를 삭제하시겠습니까?")) return
    if (!user?.id) return

    try {
      setLoading(true)
      await addressService.deleteAddress(id, user.id)
      await loadAddresses() // 주소 목록 새로고침
    } catch (error) {
      console.error("주소 삭제 중 오류 발생:", error)
      alert("주소 삭제 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleSetDefault = async (id: string) => {
    if (!user?.id) return

    try {
      setLoading(true)
      await addressService.setDefaultAddress(id, user.id)
      await loadAddresses() // 주소 목록 새로고침
    } catch (error) {
      console.error("기본 주소 설정 중 오류 발생:", error)
      alert("기본 주소 설정 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <TopBanner
        title="주소 설정"
        onBackClick={() => router.back()}
      />

      <div className="flex-1 px-5 py-6 bg-gray-50">
        <div className="space-y-6">
          {/* 현재 설정된 주소 목록 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Heading3 color="#333333" className="font-bold">등록된 주소</Heading3>
              <Button
                onClick={() => setShowAddressSheet(true)}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                주소 추가
              </Button>
            </div>

            <div className="space-y-3">
              {isLoadingAddresses ? (
                <div className="bg-white rounded-xl p-8 text-center">
                  <BodyMedium color="#666666">주소를 불러오는 중...</BodyMedium>
                </div>
              ) : (
                addresses.map((address) => (
                  <div
                    key={address.id}
                    className={address.is_default ? "bg-white rounded-xl p-4 border-2 border-[#E67E22]" : "bg-white border-2 rounded-xl p-4 border border-gray-200"}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <BodyMedium color="#333333" className="font-bold">
                            {address.address_name || '이름 없음'}
                          </BodyMedium>
                          {address.is_default && (
                            <div className="bg-orange-100 text-orange-500 px-2 py-1 rounded text-xs font-bold">
                              기본
                            </div>
                          )}
                        </div>
                        <BodyMedium color="#666666" className="mb-1">
                          {address.address}
                        </BodyMedium>
                        {address.detail_address && (
                          <CaptionMedium color="#999999">
                            {address.detail_address}
                          </CaptionMedium>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!address.is_default && (
                        <Button
                          onClick={() => handleSetDefault(address.id)}
                          size="sm"
                          variant="outline"
                          className="text-xs h-8"
                          disabled={loading}
                        >
                          기본 설정
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDeleteAddress(address.id)}
                        size="sm"
                        variant="outline"
                        className="text-xs h-8! text-red-500 border-2 border-red-500"
                        disabled={loading}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                ))
              )}

              {addresses.length === 0 && !isLoadingAddresses && (
                <div className="bg-white rounded-xl p-8 text-center">
                  <div className="flex items-center justify-center mb-4 pl-7">
                    <MapPinIcon size={64} />
                  </div>
                  <BodyMedium color="#666666">등록된 주소가 없습니다</BodyMedium>
                </div>
              )}
            </div>
          </div>

          {/* 서비스 지원 지역 안내 */}
          <div className="bg-[#F2F2F2] rounded-2xl p-4 ">
            <Heading3 color="#767676" className="font-bold mb-2">서비스 지원 지역</Heading3>
            <CaptionMedium color="#767676">• 대구광역시 전 지역</CaptionMedium>
            <div className="space-y-1">
              <CaptionMedium color="#767676">• 중구, 동구, 서구, 남구, 북구</CaptionMedium>
            </div>
              <CaptionMedium color="#767676">• 수성구, 달서구, 달성군</CaptionMedium>
          </div>
        </div>

        {/* Spacer for bottom navigation */}
        <div className="h-20" />
      </div>

      {/* 주소 추가 바텀시트 */}
      {/* <AddressSearchBottomSheet
        isOpen={showAddressSheet}
        onClose={() => setShowAddressSheet(false)}
        onAddressSelect={handleAddressSelect}
        showAddressName={true}
        showDetailAddress={true}
        placeholder="예) 판교역로 235, 분당 주공, 삼평동 681"
        title="주소 추가"
      /> */}
      <DaumAddressSearchBottomSheet
        isOpen={showAddressSheet}
        onClose={() => setShowAddressSheet(false)}
        onAddressSelect={handleAddressSelect}
        showAddressName={true}
        showDetailAddress={true}
        title="주소 추가"
      />

      {/* 지원 지역 외 지역 선택 시 모달 */}
      <Dialog open={showUnsupportedModal} onOpenChange={setShowUnsupportedModal}>
        <DialogContent className="max-w-sm mx-auto rounded-3xl p-6">
          <DialogHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900">
              서비스 지원 지역이 아니에요
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 text-center space-y-3">
            <p className="text-gray-600">
              현재 선택하신 지역은 아직 서비스를 제공하지 않습니다.
            </p>
            <p className="text-sm text-gray-500">
              빠른 시일 내에 서비스 지역을 확장할 예정이니 조금만 기다려 주세요!
            </p>
          </div>

          <DialogFooter className="gap-3">
            <Button
              onClick={() => setShowUnsupportedModal(false)}
              variant="outline"
              className="flex-1 h-12 rounded-lg"
            >
              다시 입력
            </Button>
            <Button
              onClick={() => setShowUnsupportedModal(false)}
              className="flex-1 h-12 bg-[#E67E22] text-white rounded-lg"
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
