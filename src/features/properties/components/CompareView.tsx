'use client'

import { useState } from 'react'
import type { Property } from '../types'
import { StarDisplay } from './StarRating'

function formatPrice(p: Property) {
  if (p.sale_price) return `${p.sale_price.toLocaleString()}만`
  if (p.deposit && p.monthly_rent) return `${p.deposit.toLocaleString()}/${p.monthly_rent.toLocaleString()}`
  if (p.deposit) return `전세 ${p.deposit.toLocaleString()}만`
  if (p.monthly_rent) return `월세 ${p.monthly_rent.toLocaleString()}만`
  return '-'
}

function calcScore(p: Property): number {
  let score = 0
  let count = 0
  const fields = [p.sunlight, p.noise, p.water_pressure]
  fields.forEach(v => { if (v) { score += v; count++ } })
  if (p.has_parking) score += 1
  if (p.has_elevator) score += 1
  return count > 0 ? Math.round((score / (count * 5 + 2)) * 100) : 0
}

type Row = { label: string; render: (p: Property) => React.ReactNode }

const ROWS: Row[] = [
  { label: '주소', render: p => p.address },
  { label: '가격', render: p => formatPrice(p) },
  { label: '평수', render: p => p.area_sqm ? `${p.area_sqm}평` : '-' },
  { label: '층수', render: p => p.floor ? `${p.floor}층` : '-' },
  { label: '방 수', render: p => p.room_count ? `${p.room_count}룸` : '-' },
  { label: '관리비', render: p => p.management_fee ? `${p.management_fee}만원` : '-' },
  { label: '주차', render: p => p.has_parking ? '✅' : '❌' },
  { label: '엘리베이터', render: p => p.has_elevator ? '✅' : '❌' },
  { label: '채광', render: p => <StarDisplay value={p.sunlight} /> },
  { label: '소음', render: p => <StarDisplay value={p.noise} /> },
  { label: '수압', render: p => <StarDisplay value={p.water_pressure} /> },
  { label: '총점', render: p => <span className="font-bold text-blue-600">{calcScore(p)}점</span> },
]

export function CompareView({ properties }: { properties: Property[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < 3) {
        next.add(id)
      }
      return next
    })
  }

  const comparing = properties.filter(p => selected.has(p.id))

  return (
    <div className="space-y-6">
      {/* 매물 선택 */}
      <div>
        <p className="text-sm text-gray-500 mb-3">비교할 매물을 최대 3개 선택하세요</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {properties.map(p => (
            <label key={p.id} className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-blue-400 transition">
              <input
                type="checkbox"
                checked={selected.has(p.id)}
                onChange={() => toggle(p.id)}
                disabled={!selected.has(p.id) && selected.size >= 3}
                className="rounded text-blue-600"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{p.address}</p>
                <p className="text-xs text-blue-600">{formatPrice(p)}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 비교표 */}
      {comparing.length >= 2 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-sm font-medium text-gray-600 p-3 border-b border-gray-200 w-24">항목</th>
                {comparing.map(p => (
                  <th key={p.id} className="text-sm font-medium text-gray-800 p-3 border-b border-gray-200 text-center">
                    <span className="block truncate max-w-32">{p.address.split(' ').slice(-2).join(' ')}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(row => (
                <tr key={row.label} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="text-sm text-gray-500 p-3 font-medium">{row.label}</td>
                  {comparing.map(p => (
                    <td key={p.id} className="text-sm text-gray-800 p-3 text-center">
                      {row.render(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {comparing.length === 1 && (
        <p className="text-center text-gray-400 text-sm py-8">매물을 1개 더 선택하면 비교표가 나타납니다</p>
      )}

      {comparing.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-8">매물을 2개 이상 선택해주세요</p>
      )}
    </div>
  )
}
