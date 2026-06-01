export type Property = {
  id: string
  user_id: string
  address: string
  deposit: number | null
  monthly_rent: number | null
  sale_price: number | null
  area_sqm: number | null
  floor: number | null
  room_count: number | null
  visit_date: string | null
  agent_contact: string | null
  memo: string | null
  sunlight: number | null
  noise: number | null
  water_pressure: number | null
  has_parking: boolean | null
  has_elevator: boolean | null
  management_fee: number | null
  created_at: string
  updated_at: string
}

export type PropertyWithPhotos = Property & {
  property_photos: { id: string; storage_path: string; created_at: string }[]
}

export type ActionState = { error: string } | null
