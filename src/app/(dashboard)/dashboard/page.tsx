import Link from 'next/link'
import { getProperties, getUserPlan } from '@/features/properties/queries'
import { PropertyCard } from '@/features/properties/components/PropertyCard'

export default async function DashboardPage() {
  const [properties, plan] = await Promise.all([getProperties(), getUserPlan()])
  const isFree = plan === 'free'
  const atLimit = isFree && properties.length >= 3

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">내 매물 목록</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {properties.length}개{isFree && ' / 3개 (무료)'}
          </p>
        </div>

        {atLimit ? (
          <div className="text-right">
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
              무료 한도 도달
            </span>
          </div>
        ) : (
          <Link
            href="/dashboard/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            + 매물 추가
          </Link>
        )}
      </div>

      {atLimit && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          무료 플랜은 매물을 최대 3개까지 저장할 수 있습니다.
          기존 매물을 삭제하면 새로 추가할 수 있습니다.
        </div>
      )}

      {properties.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-4">🏠</p>
          <p className="font-medium">아직 기록한 매물이 없습니다</p>
          <p className="text-sm mt-1">임장 다녀온 매물을 기록해 보세요</p>
          <Link
            href="/dashboard/new"
            className="mt-4 inline-block bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            첫 매물 추가하기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {properties.map(p => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  )
}
