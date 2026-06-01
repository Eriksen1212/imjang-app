'use client'

import { useActionState, useState } from 'react'
import { StarRating } from './StarRating'
import type { Property, ActionState } from '../types'

type Props = {
  action: (_prevState: ActionState, formData: FormData) => Promise<ActionState>
  defaultValues?: Partial<Property>
  submitLabel?: string
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

export function PropertyForm({ action, defaultValues = {}, submitLabel = '저장' }: Props) {
  const [state, formAction, pending] = useActionState(action, null)

  const [sunlight, setSunlight] = useState<number | null>(defaultValues.sunlight ?? null)
  const [noise, setNoise] = useState<number | null>(defaultValues.noise ?? null)
  const [waterPressure, setWaterPressure] = useState<number | null>(defaultValues.water_pressure ?? null)

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {state.error}
        </div>
      )}

      {/* hidden inputs for star values */}
      <input type="hidden" name="sunlight" value={sunlight ?? ''} />
      <input type="hidden" name="noise" value={noise ?? ''} />
      <input type="hidden" name="water_pressure" value={waterPressure ?? ''} />

      {/* 기본 정보 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="font-semibold text-gray-800">기본 정보</h3>

        <Field label="주소 *">
          <input
            name="address"
            type="text"
            required
            defaultValue={defaultValues.address ?? ''}
            className={inputClass}
            placeholder="예) 서울시 마포구 합정동 123-4"
          />
        </Field>

        <Field label="방문 날짜">
          <input
            name="visit_date"
            type="date"
            defaultValue={defaultValues.visit_date ?? ''}
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="보증금 (만원)">
            <input name="deposit" type="number" defaultValue={defaultValues.deposit ?? ''} className={inputClass} placeholder="0" />
          </Field>
          <Field label="월세 (만원)">
            <input name="monthly_rent" type="number" defaultValue={defaultValues.monthly_rent ?? ''} className={inputClass} placeholder="0" />
          </Field>
          <Field label="매매가 (만원)">
            <input name="sale_price" type="number" defaultValue={defaultValues.sale_price ?? ''} className={inputClass} placeholder="0" />
          </Field>
        </div>
      </div>

      {/* 상세 정보 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="font-semibold text-gray-800">상세 정보</h3>

        <div className="grid grid-cols-3 gap-3">
          <Field label="평수">
            <input name="area_sqm" type="number" step="0.1" defaultValue={defaultValues.area_sqm ?? ''} className={inputClass} placeholder="0.0" />
          </Field>
          <Field label="층수">
            <input name="floor" type="number" defaultValue={defaultValues.floor ?? ''} className={inputClass} placeholder="0" />
          </Field>
          <Field label="방 개수">
            <input name="room_count" type="number" defaultValue={defaultValues.room_count ?? ''} className={inputClass} placeholder="0" />
          </Field>
        </div>

        <Field label="관리비 (만원)">
          <input name="management_fee" type="number" defaultValue={defaultValues.management_fee ?? ''} className={inputClass} placeholder="0" />
        </Field>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input name="has_parking" type="checkbox" defaultChecked={defaultValues.has_parking ?? false} className="rounded" />
            주차 가능
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input name="has_elevator" type="checkbox" defaultChecked={defaultValues.has_elevator ?? false} className="rounded" />
            엘리베이터
          </label>
        </div>
      </div>

      {/* 체크리스트 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="font-semibold text-gray-800">체크리스트</h3>

        <div className="space-y-3">
          {[
            { label: '채광', value: sunlight, onChange: setSunlight },
            { label: '소음', value: noise, onChange: setNoise },
            { label: '수압', value: waterPressure, onChange: setWaterPressure },
          ].map(({ label, value, onChange }) => (
            <div key={label} className="flex items-center gap-4">
              <span className="text-sm text-gray-600 w-10">{label}</span>
              <StarRating value={value} onChange={onChange} />
              {value && (
                <button type="button" onClick={() => onChange(0)} className="text-xs text-gray-400 hover:text-gray-600">
                  초기화
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 메모 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="font-semibold text-gray-800">메모 & 연락처</h3>

        <Field label="메모">
          <textarea
            name="memo"
            rows={4}
            defaultValue={defaultValues.memo ?? ''}
            className={inputClass}
            placeholder="자유롭게 기록하세요"
          />
        </Field>

        <Field label="부동산 연락처">
          <input
            name="agent_contact"
            type="text"
            defaultValue={defaultValues.agent_contact ?? ''}
            className={inputClass}
            placeholder="010-0000-0000"
          />
        </Field>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {pending ? '저장 중...' : submitLabel}
      </button>
    </form>
  )
}
