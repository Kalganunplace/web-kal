import { createClient } from '@/lib/auth/supabase'

export interface PaymentSettings {
  bank_name: string
  account_number: string
  account_holder: string
}

class PaymentSettingsService {
  private supabase = createClient()

  /**
   * 결제 설정 정보 가져오기
   * 관리자가 설정한 기본 계좌 정보를 가져옵니다.
   */
  async getPaymentSettings(): Promise<PaymentSettings> {
    try {
      // API를 통해 관리자가 설정한 계좌 정보 가져오기
      const response = await fetch('/api/bank-accounts')
      const result = await response.json()

      if (result.success && result.data && result.data.length > 0) {
        // 기본 계좌 또는 첫 번째 활성 계좌 사용
        const defaultAccount = result.data.find((acc: any) => acc.is_default) || result.data[0]

        return {
          bank_name: defaultAccount.bank_name,
          account_number: defaultAccount.account_number,
          account_holder: defaultAccount.account_holder
        }
      }

      // 계좌 정보가 없으면 기본값 반환
      return this.getDefaultPaymentSettings()
    } catch (error) {
      console.error('결제 설정 조회 실패:', error)
      // 오류 시 기본값 반환
      return this.getDefaultPaymentSettings()
    }
  }

  /**
   * 기본 결제 설정 (fallback)
   */
  private getDefaultPaymentSettings(): PaymentSettings {
    return {
      bank_name: '대구은행',
      account_number: '793901-04-265174',
      account_holder: '(주)칼가는곳'
    }
  }
}

export const paymentSettingsService = new PaymentSettingsService()
