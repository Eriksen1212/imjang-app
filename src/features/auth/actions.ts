'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message }

  redirect('/dashboard')
}

export async function signup(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (password.length < 6) return { error: '비밀번호는 6자 이상이어야 합니다' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ email, password })

  if (error) return { error: error.message }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
