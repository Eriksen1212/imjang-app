import Link from 'next/link'
import { PropertyForm } from '@/features/properties/components/PropertyForm'
import { createProperty } from '@/features/properties/actions'

export default function NewPropertyPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-700 transition">
          ← 목록
        </Link>
        <h1 className="text-xl font-bold text-gray-900">새 매물 추가</h1>
      </div>

      <PropertyForm action={createProperty} submitLabel="매물 저장" />
    </div>
  )
}
