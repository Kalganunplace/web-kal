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
   * TODO: 관리자가 설정할 수 있도록 admin_settings 테이블 생성 후 연결
   */
  async getPaymentSettings(): Promise<PaymentSettings> {
    try {
      // TODO: 실제 데이터베이스에서 가져오기
      // const { data, error } = await this.supabase
      //   .from('admin_settings')
      //   .select('bank_name, account_number, account_holder')
      //   .single()

      // if (error) throw error
      // return data

      // 임시 하드코딩 데이터
      return {
        bank_name: '대구은행',
        account_number: '793901-04-265174',
        account_holder: '(주)칼가는곳'
      }
    } catch (error) {
      console.error('결제 설정 조회 실패:', error)

      // 오류 시 기본값 반환
      return {
        bank_name: '대구은행',
        account_number: '793901-04-265174',
        account_holder: '(주)칼가는곳'
      }
    }
  }
}

export const paymentSettingsService = new PaymentSettingsService()
