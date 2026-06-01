'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

const MESSAGES: Record<string, string> = {
  saved: '✅ 매물이 저장되었습니다',
  updated: '✅ 매물이 수정되었습니다',
  deleted: '🗑️ 매물이 삭제되었습니다',
}

export function Toast() {
  const params = useSearchParams()
  const [visible, setVisible] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const key = params.get('message')
    if (key && MESSAGES[key]) {
      setMsg(MESSAGES[key])
      setVisible(true)
      const t = setTimeout(() => setVisible(false), 3000)
      return () => clearTimeout(t)
    }
  }, [params])

  if (!visible) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-5 py-3 rounded-xl shadow-lg animate-fade-in">
      {msg}
    </div>
  )
}
