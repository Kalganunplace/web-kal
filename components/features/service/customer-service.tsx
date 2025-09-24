"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Phone, MessageCircle, Mail, Clock, ChevronRight } from "lucide-react"

export default function CustomerService() {
  const contactMethods = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "전화 상담",
      description: "1588-1234",
      subtitle: "평일 09:00 - 18:00",
      action: "전화걸기",
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "채팅 상담",
      description: "실시간 채팅 상담",
      subtitle: "평일 09:00 - 18:00",
      action: "채팅시작",
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "이메일 문의",
      description: "support@kalganeun.com",
      subtitle: "24시간 접수 가능",
      action: "메일보내기",
    },
  ]

  const faqItems = [
    {
      question: "칼갈이 서비스는 어떻게 이용하나요?",
      category: "서비스 이용",
    },
    {
      question: "수거 시간을 변경할 수 있나요?",
      category: "예약 변경",
    },
    {
      question: "칼이 손상되면 어떻게 하나요?",
      category: "손상 보상",
    },
    {
      question: "구독 서비스는 언제든 해지 가능한가요?",
      category: "구독 관리",
    },
    {
      question: "서비스 지역은 어디까지인가요?",
      category: "서비스 지역",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
          <h1 className="text-lg font-medium">고객센터</h1>
          <div className="w-6" />
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Operating Hours */}
          <Card className="mb-6 bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <h3 className="font-medium text-orange-800">운영시간</h3>
              </div>
              <div className="text-sm text-orange-700">
                <p>평일: 09:00 - 18:00</p>
                <p>토요일: 09:00 - 13:00</p>
                <p>일요일 및 공휴일: 휴무</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Methods */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-800 mb-3">문의 방법</h3>
            <div className="space-y-3">
              {contactMethods.map((method, index) => (
                <Card key={index} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-orange-500">{method.icon}</div>
                        <div>
                          <h4 className="font-medium text-gray-800">{method.title}</h4>
                          <p className="text-sm text-gray-600">{method.description}</p>
                          <p className="text-xs text-gray-500">{method.subtitle}</p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                        {method.action}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h3 className="font-medium text-gray-800 mb-3">자주 묻는 질문</h3>
            <div className="space-y-2">
              {faqItems.map((faq, index) => (
                <Card key={index} className="border-gray-200 cursor-pointer hover:border-orange-200 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 mb-1">{faq.question}</p>
                        <p className="text-xs text-gray-500">{faq.category}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
