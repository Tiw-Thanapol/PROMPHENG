import { supabase } from './supabase'

export async function testSupabaseConnection() {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Supabase connection error:', error)
    return false
  }

  console.log('Supabase connected successfully!')
  console.log('Current session:', data.session)

  return true
}