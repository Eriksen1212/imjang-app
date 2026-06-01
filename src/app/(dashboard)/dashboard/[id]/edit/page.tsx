import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProperty } from '@/features/properties/queries'
import { updateProperty } from '@/features/properties/actions'
import { PropertyForm } from '@/features/properties/components/PropertyForm'

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const property = await getProperty(id)
  if (!property) notFound()

  const updateWithId = updateProperty.bind(null, id)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/dashboard/${id}`} className="text-gray-400 hover:text-gray-700 transition">
          ← 상세
        </Link>
        <h1 className="text-xl font-bold text-gray-900">매물 수정</h1>
      </div>

      <PropertyForm
        action={updateWithId}
        defaultValues={property}
        submitLabel="수정 저장"
      />
    </div>
  )
}
