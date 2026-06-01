'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login } from '@/features/auth/actions'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null)

  return (
    <div className="bg-white shadow rounded-xl p-8">
      <h2 className="text-xl font-semibold mb-6">로그인</h2>

      {state?.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
          <input
            name="email"
            type="email"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="email@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
          <input
            name="password"
            type="password"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {pending ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        계정이 없으신가요?{' '}
        <Link href="/signup" className="text-blue-600 hover:underline">회원가입</Link>
      </p>
    </div>
  )
}
