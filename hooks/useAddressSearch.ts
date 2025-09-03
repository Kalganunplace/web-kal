import { useState, useCallback } from "react"
import { getNaverAddressService, isDaeguAddress, type AddressResult } from "@/lib/kakao-address"

export interface AddressData {
  name: string
  address: string
  detailAddress: string
}

export function useAddressSearch() {
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<AddressResult[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [addressError, setAddressError] = useState("")
  const [selectedAddress, setSelectedAddress] = useState<AddressData>({
    name: "",
    address: "",
    detailAddress: ""
  })

  const searchPlaces = useCallback(async (query: string) => {
    setSearchQuery(query)
    setAddressError("")
    
    if (query.length > 1) {
      setIsSearching(true)
      
      try {
        const naverAddressService = getNaverAddressService()
        const results = await naverAddressService.searchPlaces(query)
        
        setSearchResults(results.slice(0, 5))
      } catch (error) {
        console.error("주소 검색 중 오류 발생:", error)
        setAddressError("주소 검색 중 오류가 발생했습니다.")
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    } else {
      setSearchResults([])
      setAddressError("")
    }
  }, [])

  const selectAddress = useCallback((selectedPlace: AddressResult) => {
    const isSupported = isDaeguAddress(selectedPlace.address)
    
    const newAddress = {
      ...selectedAddress,
      address: selectedPlace.address
    }
    
    setSelectedAddress(newAddress)
    setSearchResults([])
    setSearchQuery(selectedPlace.address)
    
    if (!isSupported) {
      setAddressError("아직 이용할 수 없는 지역이에요. 조금만 기다려 주세요!")
    } else {
      setAddressError("")
    }
  }, [selectedAddress])

  const updateAddressData = useCallback((field: keyof AddressData, value: string) => {
    setSelectedAddress(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const resetSearch = useCallback(() => {
    setSearchResults([])
    setSearchQuery("")
    setAddressError("")
    setSelectedAddress({
      name: "",
      address: "",
      detailAddress: ""
    })
  }, [])

  return {
    // 상태
    isSearching,
    searchResults,
    searchQuery,
    addressError,
    selectedAddress,
    
    // 액션
    searchPlaces,
    selectAddress,
    updateAddressData,
    resetSearch,
    
    // 유틸리티
    isAddressValid: Boolean(selectedAddress.address && selectedAddress.name),
    isAddressSupported: selectedAddress.address ? isDaeguAddress(selectedAddress.address) : true,
  }
}