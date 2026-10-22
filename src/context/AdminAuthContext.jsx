import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AdminAuthContext = createContext()

const LOCAL_CREDENTIALS = { email: 'admin@yawara.com', password: 'yawara2026' }

export function AdminAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const configured = isSupabaseConfigured()

  useEffect(() => {
    if (!configured) {
      setIsAuthenticated(localStorage.getItem('yawara_admin_auth') === 'true')
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
    })
    return () => subscription.unsubscribe()
  }, [configured])

  const login = async (email, password) => {
    if (!configured) {
      if (email === LOCAL_CREDENTIALS.email && password === LOCAL_CREDENTIALS.password) {
        setIsAuthenticated(true)
        localStorage.setItem('yawara_admin_auth', 'true')
        return { success: true }
      }
      return { success: false, error: 'E-mail ou senha incorretos.' }
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const raw = (error.message || '').toLowerCase()
      if (raw.includes('invalid login') || raw.includes('invalid credentials')) {
        return { success: false, error: 'E-mail ou senha incorretos.' }
      }
      return { success: false, error: error.message || 'Não foi possível entrar. Tente novamente.' }
    }
    return { success: true }
  }

  const logout = async () => {
    if (!configured) {
      setIsAuthenticated(false)
      localStorage.removeItem('yawara_admin_auth')
      return
    }
    await supabase.auth.signOut()
  }

  if (loading) return null

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return context
}
