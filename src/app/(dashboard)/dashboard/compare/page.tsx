import Link from 'next/link'
import { getProperties } from '@/features/properties/queries'
import { CompareView } from '@/features/properties/components/CompareView'

export default async function ComparePage() {
  const properties = await getProperties()

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-700 transition">
          ← 목록
        </Link>
        <h1 className="text-xl font-bold text-gray-900">매물 비교표</h1>
      </div>

      {properties.length < 2 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-4">📊</p>
          <p className="font-medium">비교할 매물이 부족합니다</p>
          <p className="text-sm mt-1">매물을 2개 이상 등록하면 비교할 수 있습니다</p>
          <Link
            href="/dashboard/new"
            className="mt-4 inline-block bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            매물 추가하기
          </Link>
        </div>
      ) : (
        <CompareView properties={properties} />
      )}
    </div>
  )
}
