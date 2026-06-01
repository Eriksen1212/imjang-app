import Link from 'next/link'
import type { Property } from '../types'
import { StarDisplay } from './StarRating'

function formatPrice(deposit: number | null, rent: number | null, sale: number | null) {
  if (sale) return `매매 ${sale.toLocaleString()}만원`
  if (deposit && rent) return `전월세 ${deposit.toLocaleString()}/${rent.toLocaleString()}`
  if (deposit) return `전세 ${deposit.toLocaleString()}만원`
  if (rent) return `월세 ${rent.toLocaleString()}만원`
  return '가격 미입력'
}

function calcScore(p: Property): number | null {
  const ratings = [p.sunlight, p.noise, p.water_pressure].filter(Boolean) as number[]
  if (ratings.length === 0) return null
  const ratingSum = ratings.reduce((a, b) => a + b, 0)
  const bonus = (p.has_parking ? 1 : 0) + (p.has_elevator ? 1 : 0)
  return Math.round(((ratingSum + bonus) / (ratings.length * 5 + 2)) * 100)
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? 'bg-green-100 text-green-700' :
    score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {score}점
    </span>
  )
}

export function PropertyCard({ property }: { property: Property }) {
  const score = calcScore(property)

  return (
    <Link href={`/dashboard/${property.id}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
            {property.address}
          </h3>
          <div className="flex items-center gap-2 ml-2 shrink-0">
            {score !== null && <ScoreBadge score={score} />}
            {property.visit_date && (
              <span className="text-xs text-gray-400">
                {new Date(property.visit_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        <p className="text-blue-600 font-medium text-sm mb-3">
          {formatPrice(property.deposit, property.monthly_rent, property.sale_price)}
        </p>

        <div className="flex gap-3 text-xs text-gray-500 mb-3">
          {property.area_sqm && <span>{property.area_sqm}평</span>}
          {property.floor && <span>{property.floor}층</span>}
          {property.room_count && <span>{property.room_count}룸</span>}
        </div>

        {(property.sunlight || property.noise || property.water_pressure) && (
          <div className="space-y-1">
            {property.sunlight && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-8">채광</span>
                <StarDisplay value={property.sunlight} />
              </div>
            )}
            {property.noise && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-8">소음</span>
                <StarDisplay value={property.noise} />
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
