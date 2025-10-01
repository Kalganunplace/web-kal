// SMS 서비스 인터페이스
export interface SMSProvider {
  sendSMS(phone: string, message: string): Promise<boolean>
}

// 개발용 콘솔 SMS 프로바이더
export class ConsoleSMSProvider implements SMSProvider {
  async sendSMS(phone: string, message: string): Promise<boolean> {
    console.log('=====================================')
    console.log(`📱 [DEV SMS] To: ${phone}`)
    console.log(`📨 Message: ${message}`)
    console.log('=====================================')
    return true
  }
}

// Twilio SMS 프로바이더 (나중에 구현)
export class TwilioSMSProvider implements SMSProvider {
  private accountSid: string
  private authToken: string
  private fromNumber: string

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || ''
    this.authToken = process.env.TWILIO_AUTH_TOKEN || ''
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || ''
  }

  async sendSMS(phone: string, message: string): Promise<boolean> {
    if (!this.accountSid || !this.authToken) {
      console.warn('Twilio credentials not configured, falling back to console')
      return new ConsoleSMSProvider().sendSMS(phone, message)
    }

    try {
      // Twilio 연동 코드 (twilio 패키지 설치 필요)
      // const twilio = require('twilio')
      // const client = twilio(this.accountSid, this.authToken)
      // 
      // await client.messages.create({
      //   body: message,
      //   to: `+82${phone.replace(/^0/, '')}`, // 한국 국가코드 추가
      //   from: this.fromNumber
      // })
      
      // 임시로 콘솔 출력
      console.log('[Twilio SMS would be sent]', { phone, message })
      return true
    } catch (error) {
      console.error('Twilio SMS 발송 실패:', error)
      return false
    }
  }
}

// 알리고 SMS 프로바이더
export class AligoSMSProvider implements SMSProvider {
  private apiKey: string
  private userId: string
  private sender: string

  constructor() {
    this.apiKey = process.env.ALIGO_API_KEY || ''
    this.userId = process.env.ALIGO_USER_ID || ''
    this.sender = process.env.ALIGO_SENDER || ''
  }

  async sendSMS(phone: string, message: string): Promise<boolean> {
    if (!this.apiKey || !this.userId) {
      console.warn('Aligo credentials not configured, falling back to console')
      return new ConsoleSMSProvider().sendSMS(phone, message)
    }

    try {
      // 알리고 API 연동
      const formData = new FormData()
      formData.append('key', this.apiKey)
      formData.append('user_id', this.userId)
      formData.append('sender', this.sender)
      formData.append('receiver', phone)
      formData.append('msg', message)
      formData.append('msg_type', 'SMS')

      const response = await fetch('https://apis.aligo.in/send/', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      
      if (result.result_code === '1') {
        console.log('알리고 SMS 발송 성공:', result.message_id)
        return true
      } else {
        console.error('알리고 SMS 발송 실패:', result.message)
        return false
      }
    } catch (error) {
      console.error('알리고 SMS 발송 오류:', error)
      return false
    }
  }
}

// SMS 서비스 팩토리
export class SMSService {
  private static provider: SMSProvider

  static getProvider(): SMSProvider {
    if (!this.provider) {
      // 환경변수로 프로바이더 선택
      const providerType = process.env.SMS_PROVIDER || 'console'
      
      switch (providerType) {
        case 'twilio':
          this.provider = new TwilioSMSProvider()
          break
        case 'aligo':
          this.provider = new AligoSMSProvider()
          break
        case 'console':
        default:
          this.provider = new ConsoleSMSProvider()
          break
      }
    }
    
    return this.provider
  }

  static async sendVerificationCode(phone: string, code: string): Promise<boolean> {
    const provider = this.getProvider()
    const message = `[칼가는곳] 인증번호는 ${code}입니다. 5분 이내에 입력해주세요.`
    
    return await provider.sendSMS(phone, message)
  }

  static async sendNotification(phone: string, message: string): Promise<boolean> {
    const provider = this.getProvider()
    const fullMessage = `[칼가는곳] ${message}`
    
    return await provider.sendSMS(phone, fullMessage)
  }
}