import { LayoutProvider } from "@/components/layout-provider"
import type { Metadata } from "next"
import { Inter, Nanum_Gothic } from "next/font/google"
import type React from "react"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const nanumGothic = Nanum_Gothic({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-nanum-gothic"
})

export const metadata: Metadata = {
  title: "칼가는곳 - 칼갈이 서비스",
  description: "전문 장인이 직접 연마하는 칼갈이 서비스",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} ${nanumGothic.variable}`}>
        <LayoutProvider>
          {children}
        </LayoutProvider>
      </body>
    </html>
  )
}
