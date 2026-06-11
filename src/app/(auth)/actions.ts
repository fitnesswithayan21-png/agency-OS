'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get('email')),
    password: String(formData.get('password')),
  })
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`)
  redirect('/')
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: String(formData.get('email')),
    password: String(formData.get('password')),
    options: { data: { full_name: String(formData.get('full_name')) } },
  })
  if (error) redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  redirect('/login?message=Check your email to confirm your account')
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(String(formData.get('email')), {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  })
  if (error) redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`)
  redirect('/forgot-password?message=Password reset link sent')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password: String(formData.get('password')),
  })
  if (error) redirect(`/reset-password?error=${encodeURIComponent(error.message)}`)
  redirect('/login?message=Password updated. Please sign in.')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
