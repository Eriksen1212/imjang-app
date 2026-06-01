import Link from 'next/link'
import { logout } from '@/features/auth/actions'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="font-bold text-gray-900 text-lg">
            🏠 임장노트
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/compare"
              className="text-sm text-gray-600 hover:text-blue-600 transition"
            >
              비교표
            </Link>
            <span className="text-xs text-gray-400">{user?.email}</span>
            <form action={logout}>
              <button type="submit" className="text-sm text-gray-500 hover:text-gray-800 transition">
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
