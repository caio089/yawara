import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/admin" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    if (result.success) {
      navigate('/admin')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-kuro flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 seigaiha-pattern opacity-15" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <img src="/images/logo-yawara.png" alt="Yawara" className="w-20 mx-auto mb-6 drop-shadow-[0_0_30px_rgba(0,0,0,0.4)]" />
          <h1 className="font-jp text-2xl font-bold text-shiro tracking-wider">Painel Administrativo</h1>
          <p className="text-shiro/40 text-sm mt-2">Acesse com suas credenciais</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-shiro/5 backdrop-blur-sm border border-shiro/10 rounded-2xl p-8 space-y-5">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-aka/10 border border-aka/20 text-aka text-sm px-4 py-3 rounded-xl">
              <AlertCircle size={16} /> {error}
            </motion.div>
          )}

          <div>
            <label className="text-shiro/60 text-xs font-medium uppercase tracking-wider block mb-2">E-mail</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-shiro/30" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full pl-11 pr-4 py-3.5 bg-shiro/5 border border-shiro/10 rounded-xl text-sm text-shiro placeholder:text-shiro/20 focus:outline-none focus:border-aka/40 focus:ring-2 focus:ring-aka/10 transition-all" />
            </div>
          </div>

          <div>
            <label className="text-shiro/60 text-xs font-medium uppercase tracking-wider block mb-2">Senha</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-shiro/30" />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                className="w-full pl-11 pr-12 py-3.5 bg-shiro/5 border border-shiro/10 rounded-xl text-sm text-shiro placeholder:text-shiro/20 focus:outline-none focus:border-aka/40 focus:ring-2 focus:ring-aka/10 transition-all" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-shiro/30 hover:text-shiro/60 transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-aka hover:bg-aka-light text-shiro py-4 rounded-xl font-medium text-sm tracking-wide transition-all duration-300 shadow-lg shadow-aka/20 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Autenticando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-shiro/20 text-xs mt-6">Acesso restrito a administradores Yawara Japan</p>
      </motion.div>
    </div>
  )
}
