import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Upload, Image, Star } from 'lucide-react'
import { useAmbassador } from '../../context/AmbassadorContext'

export default function AmbassadorAdmin() {
  const { ambassador, loading, updateAmbassador } = useAmbassador()
  const fileInputRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveOk, setSaveOk] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [form, setForm] = useState({
    name: '',
    club: '',
    role: 'Embaixadora',
    description: '',
    highlight: '',
  })

  useEffect(() => {
    if (!ambassador) return
    setForm({
      name: ambassador.name || '',
      club: ambassador.club || '',
      role: ambassador.role || 'Embaixadora',
      description: ambassador.description || '',
      highlight: ambassador.highlight || '',
    })
    setImagePreview(ambassador.image || '')
    setImageFile(null)
    setSaveError('')
    setSaveOk(false)
  }, [ambassador])

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setSaveOk(false)
    e.target.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setSaveError('Informe o nome da embaixadora.')
      return
    }
    if (!imagePreview) {
      setSaveError('Adicione uma foto.')
      return
    }

    setSaving(true)
    setSaveError('')
    setSaveOk(false)
    try {
      const result = await updateAmbassador(
        {
          name: form.name.trim(),
          club: form.club.trim(),
          role: form.role.trim() || 'Embaixadora',
          description: form.description.trim(),
          highlight: form.highlight.trim(),
          image: imagePreview && !imageFile ? imagePreview : ambassador.image,
        },
        imageFile
      )
      if (result?.success === false) {
        setSaveError(result.error || 'Não foi possível salvar.')
        return
      }
      setImageFile(null)
      setSaveOk(true)
    } catch (err) {
      setSaveError(err?.message || 'Não foi possível salvar.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-shiro rounded-2xl border border-washi-dark p-10 text-center text-kuro/30 text-sm">
        Carregando embaixadora...
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-shiro rounded-2xl border border-washi-dark overflow-hidden"
    >
      <div className="p-4 sm:p-6 border-b border-washi-dark">
        <h2 className="text-base sm:text-lg font-bold text-kuro flex items-center gap-2">
          <Star size={18} className="text-aka" />
          Embaixadora
        </h2>
        <p className="text-[10px] sm:text-xs text-kuro/40 mt-0.5">
          Altere nome, textos e foto da seção Embaixadora na página Parceiros
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-w-2xl">
        {saveError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{saveError}</p>
        )}
        {saveOk && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
            Embaixadora atualizada com sucesso.
          </p>
        )}

        <div>
          <label className="text-xs font-medium text-kuro/50 uppercase tracking-wider block mb-1.5">Foto *</label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-washi border border-washi-dark shrink-0">
              {imagePreview ? (
                <img src={imagePreview} alt="" className="w-full h-full object-cover object-top" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image size={24} className="text-kuro/20" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 bg-washi border border-washi-dark rounded-xl text-xs font-medium text-kuro/70 hover:bg-kuro/5"
            >
              <Upload size={14} /> Escolher foto
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-kuro/50 uppercase tracking-wider block mb-1.5">Nome *</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="Nome da embaixadora"
            className="w-full min-h-[48px] px-4 py-3 bg-shiro border border-washi-dark rounded-xl text-sm focus:outline-none focus:border-aka/30"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-kuro/50 uppercase tracking-wider block mb-1.5">Clube</label>
            <input
              value={form.club}
              onChange={(e) => setForm({ ...form, club: e.target.value })}
              placeholder="Ex: Reação"
              className="w-full min-h-[48px] px-4 py-3 bg-shiro border border-washi-dark rounded-xl text-sm focus:outline-none focus:border-aka/30"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-kuro/50 uppercase tracking-wider block mb-1.5">Rótulo</label>
            <input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="Embaixadora"
              className="w-full min-h-[48px] px-4 py-3 bg-shiro border border-washi-dark rounded-xl text-sm focus:outline-none focus:border-aka/30"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-kuro/50 uppercase tracking-wider block mb-1.5">Texto / descrição</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={5}
            placeholder="Texto apresentado na página"
            className="w-full px-4 py-3 bg-shiro border border-washi-dark rounded-xl text-sm focus:outline-none focus:border-aka/30 resize-y min-h-[120px]"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-kuro/50 uppercase tracking-wider block mb-1.5">Destaque (linha dourada)</label>
          <input
            value={form.highlight}
            onChange={(e) => setForm({ ...form, highlight: e.target.value })}
            placeholder="Ex: Campeã Olímpica · Bicampeã Mundial"
            className="w-full min-h-[48px] px-4 py-3 bg-shiro border border-washi-dark rounded-xl text-sm focus:outline-none focus:border-aka/30"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto min-h-[48px] px-6 bg-aka hover:bg-aka-light text-shiro rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-aka/20"
        >
          <Save size={18} />
          {saving ? 'Salvando...' : 'Salvar embaixadora'}
        </button>
      </form>
    </motion.div>
  )
}
