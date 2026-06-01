import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProperty } from '@/features/properties/queries'
import { deleteProperty } from '@/features/properties/actions'
import { StarDisplay } from '@/features/properties/components/StarRating'
import { PhotoUpload } from '@/features/properties/components/PhotoUpload'
import { createClient } from '@/lib/supabase/server'

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value && value !== false) return null
  return (
    <div className="flex gap-4 py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 w-24 shrink-0">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  )
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const property = await getProperty(id)
  if (!property) notFound()

  const deleteWithId = deleteProperty.bind(null, id)

  function formatPrice(p: NonNullable<typeof property>) {
    const parts = []
    if (p.sale_price) parts.push(`매매 ${p.sale_price.toLocaleString()}만원`)
    if (p.deposit) parts.push(`보증금 ${p.deposit.toLocaleString()}만원`)
    if (p.monthly_rent) parts.push(`월세 ${p.monthly_rent.toLocaleString()}만원`)
    return parts.join(' / ') || '-'
  }

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-700 transition">
            ← 목록
          </Link>
          <h1 className="text-xl font-bold text-gray-900 mt-1">{property.address}</h1>
          {property.visit_date && (
            <p className="text-sm text-gray-400 mt-0.5">
              방문일: {new Date(property.visit_date).toLocaleDateString('ko-KR')}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/${id}/edit`}
            className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
          >
            수정
          </Link>
          <form action={deleteWithId}>
            <button
              type="submit"
              className="text-sm border border-red-300 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
              onClick={(e) => { if (!confirm('정말 삭제할까요?')) e.preventDefault() }}
            >
              삭제
            </button>
          </form>
        </div>
      </div>

      {/* 가격 */}
      <div className="bg-blue-50 rounded-xl p-4">
        <p className="text-blue-800 font-semibold">{formatPrice(property)}</p>
      </div>

      {/* 기본 정보 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-3">기본 정보</h3>
        <Row label="평수" value={property.area_sqm ? `${property.area_sqm}평` : null} />
        <Row label="층수" value={property.floor ? `${property.floor}층` : null} />
        <Row label="방 개수" value={property.room_count ? `${property.room_count}룸` : null} />
        <Row label="관리비" value={property.management_fee ? `${property.management_fee}만원` : null} />
        <Row label="주차" value={property.has_parking !== null ? (property.has_parking ? '가능' : '불가') : null} />
        <Row label="엘리베이터" value={property.has_elevator !== null ? (property.has_elevator ? '있음' : '없음') : null} />
        <Row label="연락처" value={property.agent_contact} />
      </div>

      {/* 체크리스트 */}
      {(property.sunlight || property.noise || property.water_pressure) && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-3">체크리스트</h3>
          <div className="space-y-2">
            {property.sunlight && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-10">채광</span>
                <StarDisplay value={property.sunlight} />
              </div>
            )}
            {property.noise && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-10">소음</span>
                <StarDisplay value={property.noise} />
              </div>
            )}
            {property.water_pressure && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-10">수압</span>
                <StarDisplay value={property.water_pressure} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 메모 */}
      {property.memo && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-2">메모</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{property.memo}</p>
        </div>
      )}

      {/* 사진 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-3">사진</h3>
        <PhotoUpload
          propertyId={id}
          userId={user!.id}
          photos={property.property_photos}
        />
      </div>
    </div>
  )
}
