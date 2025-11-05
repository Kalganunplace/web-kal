"use client"

import { useState } from "react"
import BottomSheet from "@/components/ui/bottom-sheet"
import { Button } from "@/components/ui/button"
import { knifeService } from "@/lib/knife-service"
import type { PaymentSettings } from "@/lib/payment-settings-service"

interface PaymentBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  totalAmount: number
  paymentSettings: PaymentSettings
  onSubmit: (depositorName: string) => void | Promise<void>
  isSubmitting?: boolean
}

export default function PaymentBottomSheet({
  isOpen,
  onClose,
  totalAmount,
  paymentSettings,
  onSubmit,
  isSubmitting = false
}: PaymentBottomSheetProps) {
  const [depositorName, setDepositorName] = useState("")

  const handleSubmit = async () => {
    if (!depositorName.trim()) {
      alert('송금자명을 입력해주세요.')
      return
    }

    await onSubmit(depositorName)
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setDepositorName("")
      onClose()
    }
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose}>
      <div className="p-6 space-y-5">
        <h3 className="text-xl font-bold text-gray-800 text-center">결제금액</h3>

        {/* 결제금액 */}
        <div className="bg-[#FFF7ED] rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-[#E67E22]">
            총 금액: {knifeService.formatPrice(totalAmount)}
          </p>
        </div>

        {/* 입금은행 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            입금은행
          </label>
          <input
            type="text"
            value={paymentSettings.bank_name}
            disabled
            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
          />
        </div>

        {/* 입금 계좌번호 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            입금 계좌번호
          </label>
          <input
            type="text"
            value={paymentSettings.account_number}
            disabled
            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
          />
        </div>

        {/* 예금주 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            예금주
          </label>
          <input
            type="text"
            value={paymentSettings.account_holder}
            disabled
            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
          />
        </div>

        {/* 송금자명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            송금자명
          </label>
          <input
            type="text"
            value={depositorName}
            onChange={(e) => setDepositorName(e.target.value)}
            placeholder="홍길동"
            disabled={isSubmitting}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#E67E22] focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* 안내 문구 */}
        <div className="text-xs text-gray-600 text-center leading-relaxed">
          주문 후 48시간 이내 입금을 완료해 주세요.<br />
          입금이 확인되면 바로 예약 확정을 안내드립니다!
        </div>

        {/* 버튼 */}
        <div className="space-y-3">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-[#E67E22] hover:bg-[#D35400] text-white rounded-lg py-3 font-bold text-lg disabled:bg-gray-300"
          >
            {isSubmitting ? '처리 중...' : '입금하기'}
          </Button>

          <Button
            onClick={handleClose}
            disabled={isSubmitting}
            variant="outline"
            className="w-full border-gray-300 text-gray-700 rounded-lg py-3 font-medium disabled:cursor-not-allowed"
          >
            취소하기
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
