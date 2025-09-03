import { createClient } from '@/lib/auth/supabase'

export interface Term {
  id: string
  title: string
  type: 'service' | 'privacy' | 'location' | 'marketing'
  content: string
  version: string
  is_active: boolean
  is_required: boolean
  created_at: string
  updated_at: string
}

export interface UserTermAgreement {
  id: string
  user_id: string
  term_id: string
  agreed_at: string
  is_agreed: boolean
  version: string
}

export interface CreateTermAgreementData {
  term_id: string
  is_agreed: boolean
  version: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  type: 'general' | 'notice' | 'event' | 'maintenance'
  is_important: boolean
  is_active: boolean
  start_date?: string
  end_date?: string
  created_at: string
  updated_at: string
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export class TermsService {
  private supabase = createClient()

  // 약관 관련 메소드
  async getActiveTerms(): Promise<Term[]> {
    const { data, error } = await this.supabase
      .from('terms')
      .select('*')
      .eq('is_active', true)
      .order('is_required', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('활성 약관 조회 오류:', error)
      throw new Error('약관을 불러올 수 없습니다.')
    }

    return data || []
  }

  async getTermById(termId: string): Promise<Term | null> {
    const { data, error } = await this.supabase
      .from('terms')
      .select('*')
      .eq('id', termId)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('약관 조회 오류:', error)
      throw new Error('약관을 조회할 수 없습니다.')
    }

    return data
  }

  async getTermsByType(type: string): Promise<Term[]> {
    const { data, error } = await this.supabase
      .from('terms')
      .select('*')
      .eq('type', type)
      .eq('is_active', true)
      .order('version', { ascending: false })

    if (error) {
      console.error('타입별 약관 조회 오류:', error)
      throw new Error('약관을 불러올 수 없습니다.')
    }

    return data || []
  }

  // 사용자 약관 동의 관련 메소드
  async getUserTermAgreements(userId: string): Promise<UserTermAgreement[]> {
    const { data, error } = await this.supabase
      .from('user_term_agreements')
      .select('*')
      .eq('user_id', userId)
      .eq('is_agreed', true)

    if (error) {
      console.error('사용자 약관 동의 내역 조회 오류:', error)
      throw new Error('약관 동의 내역을 불러올 수 없습니다.')
    }

    return data || []
  }

  async createTermAgreement(userId: string, data: CreateTermAgreementData): Promise<UserTermAgreement> {
    const { data: agreement, error } = await this.supabase
      .from('user_term_agreements')
      .upsert({
        user_id: userId,
        term_id: data.term_id,
        is_agreed: data.is_agreed,
        version: data.version,
        agreed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('약관 동의 생성 오류:', error)
      throw new Error('약관 동의를 저장할 수 없습니다.')
    }

    return agreement
  }

  async createBulkTermAgreements(userId: string, agreements: CreateTermAgreementData[]): Promise<UserTermAgreement[]> {
    const agreementsToInsert = agreements.map(agreement => ({
      user_id: userId,
      term_id: agreement.term_id,
      is_agreed: agreement.is_agreed,
      version: agreement.version,
      agreed_at: new Date().toISOString()
    }))

    const { data, error } = await this.supabase
      .from('user_term_agreements')
      .upsert(agreementsToInsert)
      .select()

    if (error) {
      console.error('일괄 약관 동의 생성 오류:', error)
      throw new Error('약관 동의를 저장할 수 없습니다.')
    }

    return data || []
  }

  async checkUserTermAgreements(userId: string): Promise<{ hasAgreedToRequired: boolean; missingTerms: Term[] }> {
    // 필수 약관 조회
    const requiredTerms = await this.supabase
      .from('terms')
      .select('*')
      .eq('is_active', true)
      .eq('is_required', true)

    if (requiredTerms.error) {
      throw new Error('필수 약관을 조회할 수 없습니다.')
    }

    // 사용자 동의 내역 조회
    const userAgreements = await this.getUserTermAgreements(userId)
    const agreedTermIds = userAgreements.map(agreement => agreement.term_id)

    // 동의하지 않은 필수 약관 찾기
    const missingTerms = requiredTerms.data?.filter(term => !agreedTermIds.includes(term.id)) || []

    return {
      hasAgreedToRequired: missingTerms.length === 0,
      missingTerms
    }
  }

  // 공지사항 관련 메소드
  async getActiveAnnouncements(): Promise<Announcement[]> {
    const now = new Date().toISOString()
    
    const { data, error } = await this.supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('is_important', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('공지사항 조회 오류:', error)
      throw new Error('공지사항을 불러올 수 없습니다.')
    }

    return data || []
  }

  async getImportantAnnouncements(): Promise<Announcement[]> {
    const announcements = await this.getActiveAnnouncements()
    return announcements.filter(announcement => announcement.is_important)
  }

  async getAnnouncementById(announcementId: string): Promise<Announcement | null> {
    const { data, error } = await this.supabase
      .from('announcements')
      .select('*')
      .eq('id', announcementId)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('공지사항 조회 오류:', error)
      throw new Error('공지사항을 조회할 수 없습니다.')
    }

    return data
  }

  // FAQ 관련 메소드
  async getActiveFAQs(): Promise<FAQ[]> {
    const { data, error } = await this.supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('FAQ 조회 오류:', error)
      throw new Error('FAQ를 불러올 수 없습니다.')
    }

    return data || []
  }

  async getFAQsByCategory(category: string): Promise<FAQ[]> {
    const { data, error } = await this.supabase
      .from('faqs')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('카테고리별 FAQ 조회 오류:', error)
      throw new Error('FAQ를 불러올 수 없습니다.')
    }

    return data || []
  }

  async getFAQCategories(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('faqs')
      .select('category')
      .eq('is_active', true)

    if (error) {
      console.error('FAQ 카테고리 조회 오류:', error)
      throw new Error('FAQ 카테고리를 불러올 수 없습니다.')
    }

    const categories = [...new Set(data?.map(item => item.category) || [])]
    return categories
  }

  // 유틸리티 메소드
  getTermTypeLabel(type: string): string {
    switch (type) {
      case 'service':
        return '서비스 이용약관'
      case 'privacy':
        return '개인정보 처리방침'
      case 'location':
        return '위치정보 이용약관'
      case 'marketing':
        return '마케팅 정보 수신 동의'
      default:
        return '약관'
    }
  }

  getAnnouncementTypeLabel(type: string): string {
    switch (type) {
      case 'notice':
        return '공지사항'
      case 'event':
        return '이벤트'
      case 'maintenance':
        return '점검 안내'
      case 'general':
      default:
        return '일반'
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    })
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    })
  }
}

export const termsService = new TermsService()