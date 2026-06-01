'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionState } from './types'

function toInt(v: FormDataEntryValue | null): number | null {
  if (!v || v === '') return null
  const n = parseInt(v as string, 10)
  return isNaN(n) ? null : n
}

function toFloat(v: FormDataEntryValue | null): number | null {
  if (!v || v === '') return null
  const n = parseFloat(v as string)
  return isNaN(n) ? null : n
}

function toDate(v: FormDataEntryValue | null): string | null {
  if (!v || v === '') return null
  return v as string
}

function parseFormData(formData: FormData) {
  return {
    address: (formData.get('address') as string)?.trim(),
    deposit: toInt(formData.get('deposit')),
    monthly_rent: toInt(formData.get('monthly_rent')),
    sale_price: toInt(formData.get('sale_price')),
    area_sqm: toFloat(formData.get('area_sqm')),
    floor: toInt(formData.get('floor')),
    room_count: toInt(formData.get('room_count')),
    visit_date: toDate(formData.get('visit_date')),
    agent_contact: (formData.get('agent_contact') as string) || null,
    memo: (formData.get('memo') as string) || null,
    sunlight: toInt(formData.get('sunlight')),
    noise: toInt(formData.get('noise')),
    water_pressure: toInt(formData.get('water_pressure')),
    has_parking: formData.get('has_parking') === 'on',
    has_elevator: formData.get('has_elevator') === 'on',
    management_fee: toInt(formData.get('management_fee')),
  }
}

export async function createProperty(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (profile?.plan === 'free') {
    const { data: count } = await supabase.rpc('get_property_count', { p_user_id: user.id })
    if (count >= 3) {
      return { error: '무료 플랜은 매물을 최대 3개까지 저장할 수 있습니다.' }
    }
  }

  const fields = parseFormData(formData)
  if (!fields.address) return { error: '주소를 입력해주세요' }

  const { error } = await supabase.from('properties').insert({ ...fields, user_id: user.id })
  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function updateProperty(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다' }

  const fields = parseFormData(formData)
  if (!fields.address) return { error: '주소를 입력해주세요' }

  const { error } = await supabase
    .from('properties')
    .update(fields)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/${id}`)
  revalidatePath('/dashboard')
  redirect(`/dashboard/${id}`)
}

export async function deleteProperty(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('properties')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function addPhoto(
  propertyId: string,
  storagePath: string
): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다' }

  const { data: photos } = await supabase
    .from('property_photos')
    .select('id')
    .eq('property_id', propertyId)

  if ((photos?.length ?? 0) >= 5) {
    return { error: '사진은 최대 5장까지 저장할 수 있습니다' }
  }

  const { error } = await supabase.from('property_photos').insert({
    property_id: propertyId,
    user_id: user.id,
    storage_path: storagePath,
  })

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/${propertyId}`)
  return null
}

export async function deletePhoto(photoId: string, propertyId: string): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다' }

  const { data: photo } = await supabase
    .from('property_photos')
    .select('storage_path')
    .eq('id', photoId)
    .eq('user_id', user.id)
    .single()

  if (photo) {
    await supabase.storage.from('property-photos').remove([photo.storage_path])
  }

  await supabase.from('property_photos').delete().eq('id', photoId).eq('user_id', user.id)

  revalidatePath(`/dashboard/${propertyId}`)
  return null
}
