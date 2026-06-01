export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🏠 임장노트</h1>
          <p className="text-gray-500 mt-1 text-sm">부동산 임장 기록 앱</p>
        </div>
        {children}
      </div>
    </div>
  )
}
