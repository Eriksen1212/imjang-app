import { createClient } from '@/lib/supabase/server'
import type { Property, PropertyWithPhotos } from './types'

export async function getProperties(): Promise<Property[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getProperty(id: string): Promise<PropertyWithPhotos | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('properties')
    .select('*, property_photos(*)')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function getUserPlan(): Promise<'free' | 'premium'> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'free'

  const { data } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  return (data?.plan as 'free' | 'premium') ?? 'free'
}
