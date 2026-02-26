import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const PLACEHOLDER = 'https://placeholder.supabase.co'

export const isSupabaseConfigured = () =>
  Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== PLACEHOLDER)

export const supabase = createClient(
  supabaseUrl || PLACEHOLDER,
  supabaseAnonKey || 'placeholder-key'
)
