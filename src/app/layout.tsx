import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '임장노트',
  description: '부동산 임장 기록 앱',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        {children}
      </body>
    </html>
  )
}
