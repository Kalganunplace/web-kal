import type { Metadata } from "next"
import "./globals.css"
import { LayoutProvider } from "@/components/common/layout-provider"

export const metadata: Metadata = {
  title: "칼가는곳 - 칼갈이 서비스",
  description: "전문 칼갈이 서비스를 만나보세요",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <LayoutProvider>
          {children}
        </LayoutProvider>
      </body>
    </html>
  )
}