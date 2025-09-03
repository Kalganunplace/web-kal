import { createClient } from '@/lib/auth/supabase'

export interface Address {
  id: string
  user_id: string
  address_type: 'home' | 'work' | 'other'
  address_name: string | null
  address: string
  detail_address: string | null
  postal_code: string | null
  is_default: boolean
  latitude: number | null
  longitude: number | null
  created_at: string
  updated_at: string
}

export interface CreateAddressData {
  address_name: string
  address: string
  detail_address?: string
  address_type?: 'home' | 'work' | 'other'
  is_default?: boolean
  postal_code?: string
}

export interface UpdateAddressData {
  address_name?: string
  address?: string
  detail_address?: string
  address_type?: 'home' | 'work' | 'other'
  is_default?: boolean
  postal_code?: string
}

export class AddressService {
  private supabase = createClient()

  async getUserAddresses(userId: string): Promise<Address[]> {
    const { data, error } = await this.supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('주소 목록 조회 중 오류:', error)
      throw new Error('주소 목록을 불러올 수 없습니다.')
    }

    return data || []
  }

  async createAddress(userId: string, addressData: CreateAddressData): Promise<Address> {
    // 기본 주소로 설정하는 경우, 다른 주소들의 기본 설정을 해제
    if (addressData.is_default) {
      await this.supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
    }

    const { data, error } = await this.supabase
      .from('user_addresses')
      .insert({
        user_id: userId,
        address_name: addressData.address_name,
        address: addressData.address,
        detail_address: addressData.detail_address || null,
        address_type: addressData.address_type || 'home',
        is_default: addressData.is_default || false,
        postal_code: addressData.postal_code || null,
      })
      .select()
      .single()

    if (error) {
      console.error('주소 생성 중 오류:', error)
      throw new Error('주소를 추가할 수 없습니다.')
    }

    return data
  }

  async updateAddress(addressId: string, userId: string, addressData: UpdateAddressData): Promise<Address> {
    // 기본 주소로 설정하는 경우, 다른 주소들의 기본 설정을 해제
    if (addressData.is_default) {
      await this.supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
        .neq('id', addressId)
    }

    const { data, error } = await this.supabase
      .from('user_addresses')
      .update({
        ...addressData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', addressId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('주소 업데이트 중 오류:', error)
      throw new Error('주소를 수정할 수 없습니다.')
    }

    return data
  }

  async deleteAddress(addressId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', userId)

    if (error) {
      console.error('주소 삭제 중 오류:', error)
      throw new Error('주소를 삭제할 수 없습니다.')
    }
  }

  async setDefaultAddress(addressId: string, userId: string): Promise<void> {
    // 모든 주소의 기본 설정을 해제
    await this.supabase
      .from('user_addresses')
      .update({ is_default: false })
      .eq('user_id', userId)

    // 선택한 주소를 기본으로 설정
    const { error } = await this.supabase
      .from('user_addresses')
      .update({ is_default: true, updated_at: new Date().toISOString() })
      .eq('id', addressId)
      .eq('user_id', userId)

    if (error) {
      console.error('기본 주소 설정 중 오류:', error)
      throw new Error('기본 주소를 설정할 수 없습니다.')
    }
  }

  async getDefaultAddress(userId: string): Promise<Address | null> {
    const { data, error } = await this.supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null
      }
      console.error('기본 주소 조회 중 오류:', error)
      throw new Error('기본 주소를 불러올 수 없습니다.')
    }

    return data
  }
}

export const addressService = new AddressService()