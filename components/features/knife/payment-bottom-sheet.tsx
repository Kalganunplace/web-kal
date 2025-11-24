"use client"

import BottomSheet from "@/components/ui/bottom-sheet"
import { Button } from "@/components/ui/button"
import { knifeService } from "@/lib/knife-service"
import type { PaymentSettings } from "@/lib/payment-settings-service"
import { ChevronRight } from "lucide-react"
import { useState } from "react"

interface PaymentBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  totalAmount: number
  paymentSettings: PaymentSettings
  onSubmit: (depositorName: string) => void | Promise<void>
  isSubmitting?: boolean
}

// 은행 목록
const BANKS = [
  "KB국민은행",
  "신한은행",
  "우리은행",
  "하나은행",
  "SC제일은행",
  "NH농협은행",
  "대구은행",
  "부산은행",
  "경남은행",
  "광주은행",
  "전북은행",
  "제주은행",
  "IBK기업은행",
  "케이뱅크",
  "카카오뱅크",
  "토스뱅크",
]

export default function PaymentBottomSheet({
  isOpen,
  onClose,
  totalAmount,
  paymentSettings,
  onSubmit,
  isSubmitting = false
}: PaymentBottomSheetProps) {
  const [depositorName, setDepositorName] = useState("")
  const [selectedBank, setSelectedBank] = useState(paymentSettings.bank_name)
  const [requestCashReceipt, setRequestCashReceipt] = useState(false)

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
      setSelectedBank(paymentSettings.bank_name)
      setRequestCashReceipt(false)
      onClose()
    }
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose}>
      <div className="p-5 space-y-5">
        {/* Header with collapsible amount */}
        <div className="flex items-center justify-between border-b border-gray-500 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-800">결제금액</span>
          </div>
          <span className="text-lg font-bold text-[#E67E22]">
            총 금액: {knifeService.formatPrice(totalAmount)}
          </span>
        </div>

        {/* 입금은행 */}
        <div>
          <label className="block text-lg font-bold text-gray-700 mb-2">
            입금은행
          </label>
          <div className="relative">
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-white border-2  border-gray-300 rounded-lg text-gray-800 appearance-none cursor-pointer focus:border-[#E67E22] focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {BANKS.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* 입금 계좌번호 */}
        <div>
          <label className="block text-lg font-bold text-gray-700 mb-2">
            입금 계좌번호
          </label>
          <input
            type="text"
            value={paymentSettings.account_number}
            disabled
            className="w-full px-4 py-3 bg-gray-100 border  border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
          />
        </div>

        {/* 예금주 */}
        <div>
          <label className="block text-lg font-bold text-gray-700 mb-2">
            예금주
          </label>
          <input
            type="text"
            value={paymentSettings.account_holder}
            disabled
            className="w-full px-4 py-3 bg-gray-100 border  border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
          />
        </div>

        {/* 송금자명 */}
        <div>
          <label className="block text-lg font-bold text-gray-700 mb-2">
            송금자명
          </label>
          <input
            type="text"
            value={depositorName}
            onChange={(e) => setDepositorName(e.target.value)}
            placeholder="송금자명을 입력해 주세요"
            disabled={isSubmitting}
            className="w-full px-4 py-3  border-gray-300 rounded-lg focus:border-[#E67E22] border-2 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed placeholder:text-gray-400"
          />
        </div>

        {/* 현금영수증 신청 체크박스 */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="checkbox"
              id="cash-receipt"
              checked={requestCashReceipt}
              onChange={(e) => setRequestCashReceipt(e.target.checked)}
              disabled={isSubmitting}
              className="peer sr-only"
            />
            <label
              htmlFor="cash-receipt"
              className="flex items-center justify-center w-6 h-6 border-2 border-gray-300 rounded cursor-pointer peer-checked:bg-[#E67E22] peer-checked:border-[#E67E22] peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
            >
              {requestCashReceipt && (
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  strokeWidth="3"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </label>
          </div>
          <label
            htmlFor="cash-receipt"
            className="text-lg font-bold text-gray-700 cursor-pointer select-none"
          >
            현금영수증 신청
          </label>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-500 pt-5">
          {/* 안내 문구 */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="text-xs text-center text-gray-400 font-bold leading-relaxed">
              주문 후 48시간 안에 입금해 주세요.<br />
              입금이 확인되면 바로 예약 확정 안내를 드릴께요!
            </div>
          </div>

          {/* 버튼 */}
          <div className="space-y-3">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-[#E67E22]  text-white rounded-lg py-3 font-bold text-lg disabled:bg-gray-300"
            >
              {isSubmitting ? '처리 중...' : '입금하기'}
            </Button>

            <Button
              onClick={handleClose}
              disabled={isSubmitting}
              variant="outline"
              className="w-full border-gray-300 text-[#E67E22] rounded-lg py-3 font-medium disabled:cursor-not-allowed hover:bg-gray-50"
            >
              취소하기
            </Button>
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}
