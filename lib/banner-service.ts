import { createClient } from '@/lib/auth/supabase'

export interface Banner {
  id: string
  position: string
  title: string
  subtitle?: string
  image_url: string
  link_url?: string
  button_text?: string
  background_color?: string
  text_color?: string
  display_order: number
  is_active: boolean
  start_date?: string
  end_date?: string
  created_at: string
  updated_at: string
}

export class BannerService {
  private supabase = createClient()

  /**
   * 특정 위치의 활성 배너 조회
   */
  async getBannersByPosition(position: string): Promise<Banner[]> {
    const now = new Date().toISOString()

    const { data, error } = await this.supabase
      .from('banners')
      .select('*')
      .eq('position', position)
      .eq('is_active', true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('배너 조회 오류:', error)
      return []
    }

    return data || []
  }

  /**
   * 프로필 페이지 구독 배너 조회
   */
  async getProfileSubscriptionBanner(): Promise<Banner | null> {
    const banners = await this.getBannersByPosition('profile_subscription')
    return banners.length > 0 ? banners[0] : null
  }

  /**
   * 홈 페이지 메인 배너 조회
   */
  async getHomeMainBanners(): Promise<Banner[]> {
    return this.getBannersByPosition('home_main')
  }

  /**
   * 홈 페이지 프로모션 배너 조회
   */
  async getHomePromotionBanners(): Promise<Banner[]> {
    return this.getBannersByPosition('home_promotion')
  }
}

export const bannerService = new BannerService()
