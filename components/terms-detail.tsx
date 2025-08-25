"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"

export default function TermsDetail() {
  const termsContent = [
    {
      title: "제1조 (목적)",
      content:
        "이 약관은 칼가는곳 주식회사(이하 '회사')가 제공하는 칼갈이 서비스(이하 '서비스')의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.",
    },
    {
      title: "제2조 (정의)",
      content:
        "1. '서비스'라 함은 회사가 제공하는 칼갈이 및 관련 서비스를 의미합니다.\n2. '이용자'라 함은 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.\n3. '회원'이라 함은 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며, 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.",
    },
    {
      title: "제3조 (약관의 효력 및 변경)",
      content:
        "1. 이 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.\n2. 회사는 필요하다고 인정되는 경우 이 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항을 통해 공지합니다.\n3. 이용자가 변경된 약관에 동의하지 않을 경우, 서비스 이용을 중단하고 탈퇴할 수 있습니다.",
    },
    {
      title: "제4조 (서비스의 제공 및 변경)",
      content:
        "1. 회사는 다음과 같은 업무를 수행합니다:\n   - 칼갈이 서비스 제공\n   - 수거 및 배송 서비스\n   - 기타 회사가 정하는 업무\n2. 회사는 운영상, 기술상의 필요에 따라 제공하고 있는 전부 또는 일부 서비스를 변경할 수 있습니다.",
    },
    {
      title: "제5조 (서비스 이용시간)",
      content:
        "1. 서비스 이용은 회사의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간 운영을 원칙으로 합니다.\n2. 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신두절 또는 운영상 상당한 이유가 있는 경우 서비스의 제공을 일시적으로 중단할 수 있습니다.",
    },
    {
      title: "제6조 (회원가입)",
      content:
        "1. 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다.\n2. 회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.",
    },
    {
      title: "제7조 (회원탈퇴 및 자격상실)",
      content:
        "1. 회원은 회사에 언제든지 탈퇴를 요청할 수 있으며 회사는 즉시 회원탈퇴를 처리합니다.\n2. 회원이 다음 각 호의 사유에 해당하는 경우, 회사는 회원자격을 제한 및 정지시킬 수 있습니다.",
    },
    {
      title: "제8조 (회원에 대한 통지)",
      content:
        "1. 회사가 회원에 대한 통지를 하는 경우, 회원이 회사와 미리 약정하여 지정한 전자우편 주소로 할 수 있습니다.\n2. 회사는 불특정다수 회원에 대한 통지의 경우 1주일이상 회사 게시판에 게시함으로서 개별 통지에 갈음할 수 있습니다.",
    },
    {
      title: "제9조 (개인정보보호)",
      content:
        "회사는 이용자의 개인정보를 보호하기 위해 관련 법령이 정하는 바를 준수하며, 개인정보의 보호 및 사용에 대해서는 관련법령 및 회사의 개인정보처리방침이 적용됩니다.",
    },
    {
      title: "제10조 (회사의 의무)",
      content:
        "1. 회사는 법령과 이 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며 이 약관이 정하는 바에 따라 지속적이고, 안정적으로 서비스를 제공하는데 최선을 다하여야 합니다.\n2. 회사는 이용자가 안전하게 인터넷 서비스를 이용할 수 있도록 이용자의 개인정보보호를 위한 보안 시스템을 구축합니다.",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
          <h1 className="text-lg font-medium">서비스 이용 약관</h1>
          <div className="w-6" />
        </div>

        {/* Content */}
        <div className="p-4 max-h-[600px] overflow-y-auto">
          <div className="space-y-4">
            {termsContent.map((section, index) => (
              <Card key={index} className="border-gray-200">
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-800 mb-2">{section.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{section.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
