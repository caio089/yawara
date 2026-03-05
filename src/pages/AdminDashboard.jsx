import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, PackageCheck, PackageX, DollarSign, Plus, Pencil,
  Trash2, Eye, EyeOff, LogOut, X, Save, Search, Upload, Image, Copy,
} from 'lucide-react'
import { useAdminAuth } from '../context/AdminAuthContext'
import { useProducts } from '../context/ProductsContext'

const categoryOptions = [
  { value: 'judogi', label: 'Judogi' },
  { value: 'faixas', label: 'Faixas' },
  { value: 'bolsa', label: 'Bolsa' },
  { value: 'chinelo', label: 'Chinelo' },
  { value: 'garrafa', label: 'Garrafa' },
  { value: 'sobretudo', label: 'Sobretudo' },
  { value: 'conjunto', label: 'Conjunto' },
  { value: 'caneca', label: 'Caneca' },
  { value: 'acessorios', label: 'Acessórios' },
]

const JUDOGI_SIZES = ['1,50', '1,55', '1,60', '1,65', '1,70', '1,75', '1,80', 'Enviar medidas via WhatsApp']
const JUDOGI_COLORS = ['Azul', 'Branco']
const JUDOGI_EMBROIDERY = ['Bordado na Lapela e na Calça', 'Bordado no Peito', 'Sem Bordado']
const FAIXA_EMBROIDERY = ['Com bordado', 'Sem bordado']

function ProductForm({ initial, onSave, onCancel, title }) {
  const fileInputRef = useRef(null)
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState(() => {
    if (initial?.images?.length) return [...initial.images]
    if (initial?.image) return [initial.image]
    return []
  })
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(() => ({
    name: initial?.name || '',
    nameJp: initial?.nameJp || initial?.name_jp || '',
    description: initial?.description || '',
    price: initial?.price?.toString() || '',
    pixPrice: initial?.pixPrice != null ? String(initial.pixPrice) : (initial?.pix_price != null ? String(initial.pix_price) : ''),
    category: initial?.category || 'judogi',
    available: initial?.available !== false,
    sizes: Array.isArray(initial?.sizes) ? initial.sizes : [],
    colors: Array.isArray(initial?.colors) ? initial.colors : [],
    embroidery: Array.isArray(initial?.embroidery) ? initial.embroidery : [],
    sizesText: Array.isArray(initial?.sizes) ? initial.sizes.join(', ') : '',
    colorsText: Array.isArray(initial?.colors) ? initial.colors.join(', ') : '',
  }))

  const isJudogi = form.category === 'judogi'
  const isFaixa = form.category === 'faixas'

  const toggleArrayItem = (key, item) => {
    setForm((prev) => {
      const arr = prev[key]
      return { ...prev, [key]: arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item] }
    })
  }

  const handleImageSelect = (e) => {
    const files = e.target.files ? [...e.target.files] : []
    if (!files.length) return
    const newFiles = Array.from(files)
    setImageFiles((prev) => [...prev, ...newFiles])
    const readers = newFiles.map((file) => {
      return new Promise((resolve) => {
        const r = new FileReader()
        r.onloadend = () => resolve(r.result)
        r.readAsDataURL(file)
      })
    })
    Promise.all(readers).then((results) => {
      setImagePreviews((prev) => [...prev, ...results])
    })
    e.target.value = ''
  }

  const removeImage = (index) => {
    const existingCount = imagePreviews.length - imageFiles.length
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    if (index >= existingCount) {
      const fileIndex = index - existingCount
      setImageFiles((prev) => prev.filter((_, i) => i !== fileIndex))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const parseList = (text) => (text || '').split(',').map((s) => s.trim()).filter(Boolean)
    const sizes = isJudogi ? form.sizes : parseList(form.sizesText)
    const colors = isJudogi ? form.colors : parseList(form.colorsText)
    const embroideryVal = isJudogi ? form.embroidery : (isFaixa ? form.embroidery : undefined)
    const filesToSend = imageFiles.length > 0 ? imageFiles : null
    const existingUrls = filesToSend ? imagePreviews.slice(0, imagePreviews.length - filesToSend.length) : []
    const imageValue = !filesToSend && imagePreviews.length > 0
      ? (imagePreviews.length === 1 ? imagePreviews[0] : JSON.stringify(imagePreviews))
      : (initial?.image || '')
    const product = {
      name: form.name,
      nameJp: form.nameJp,
      description: form.description,
      price: parseFloat(form.price) || 0,
      pixPrice: form.pixPrice ? parseFloat(form.pixPrice) : null,
      category: form.category,
      available: form.available,
      image: imageValue,
      sizes: sizes?.length ? sizes : undefined,
      colors: colors?.length ? colors : undefined,
      embroidery: embroideryVal?.length ? embroideryVal : undefined,
    }
    await onSave(product, filesToSend, existingUrls)
    setSaving(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-kuro/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4 overscroll-contain"
      onClick={onCancel}
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-washi rounded-t-2xl sm:rounded-2xl w-full max-w-2xl h-[92dvh] max-h-[92dvh] sm:h-auto sm:max-h-[90vh] flex flex-col shadow-2xl"
      >
        <div className="shrink-0 bg-washi border-b border-washi-dark px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-kuro truncate pr-2">{title}</h3>
          <button type="button" onClick={onCancel} className="shrink-0 p-2.5 -m-2.5 hover:bg-kuro/5 rounded-lg transition-colors touch-manipulation" aria-label="Fechar">
            <X size={20} className="text-kuro/50" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-4 pb-28 sm:pb-6">
          <Field label="Nome *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Ex: Judogi Elite" required />

          <div>
            <label className="text-xs font-medium text-kuro/50 uppercase tracking-wider block mb-1.5">Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Descrição detalhada do produto..."
              className="w-full min-h-[80px] px-4 py-3 bg-shiro border border-washi-dark rounded-xl text-base sm:text-sm focus:outline-none focus:border-aka/30 focus:ring-2 focus:ring-aka/10 transition-all placeholder:text-kuro/25 resize-none touch-manipulation"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Preço (R$) *" value={form.price} onChange={(v) => setForm({ ...form, price: v })} type="number" placeholder="0.00" required />
            <Field label="Valor promocional PIX (R$) — opcional" value={form.pixPrice} onChange={(v) => setForm({ ...form, pixPrice: v })} type="number" placeholder="Ex: 89.90" />
            <div>
              <label className="text-xs font-medium text-kuro/50 uppercase tracking-wider block mb-1.5">Categoria</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full min-h-[48px] px-4 py-3 bg-shiro border border-washi-dark rounded-xl text-base sm:text-sm focus:outline-none focus:border-aka/30 cursor-pointer touch-manipulation"
              >
                {categoryOptions.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-xs font-medium text-kuro/50 uppercase tracking-wider w-full sm:w-auto">Status no site</span>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, available: !prev.available }))}
              className={`min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all touch-manipulation ${
                form.available ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              }`}
            >
              {form.available ? <Eye size={14} /> : <EyeOff size={14} />}
              <span className="whitespace-nowrap">{form.available ? 'Ativo' : 'Inativo'}</span>
            </button>
          </div>

          <div>
            <label className="text-xs font-medium text-kuro/50 uppercase tracking-wider block mb-1.5">Imagens do produto *</label>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[120px] sm:min-h-0 border-2 border-dashed border-washi-dark rounded-xl p-4 sm:p-6 text-center cursor-pointer hover:border-aka/30 hover:bg-aka/5 transition-all touch-manipulation active:bg-aka/10"
            >
              {imagePreviews.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-3 justify-center">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative group">
                        <img src={src} alt={`Preview ${i + 1}`} className="w-14 h-14 sm:w-20 sm:h-20 object-cover rounded-lg shrink-0 border border-washi-dark" />
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(i) }} className="absolute -top-0.5 -right-0.5 w-7 h-7 sm:w-6 sm:h-6 bg-kuro text-shiro rounded-full flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow touch-manipulation" aria-label="Remover imagem">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-lg border-2 border-dashed border-kuro/20 flex flex-col items-center justify-center shrink-0 text-kuro/40 hover:border-aka/40 hover:text-aka/60 transition-colors">
                      <Plus size={20} />
                      <span className="text-[10px] mt-0.5">Adicionar</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-kuro/40">Clique em uma foto para remover (X) ou no quadro “Adicionar” para mais fotos</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-1 sm:py-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-washi rounded-xl flex items-center justify-center">
                    <Upload size={18} className="text-kuro/30" />
                  </div>
                  <p className="text-xs sm:text-sm text-kuro/50">Clique para selecionar uma ou mais imagens</p>
                  <p className="text-[10px] text-kuro/30">Você pode escolher várias de uma vez ou ir adicionando aos poucos</p>
                </div>
              )}
            </div>
          </div>

          {isJudogi ? (
            <>
              <div>
                <label className="text-xs font-medium text-kuro/50 uppercase tracking-wider block mb-2">Tamanhos (altura)</label>
                <div className="flex flex-wrap gap-2">
                  {JUDOGI_SIZES.map((size) => (
                    <button key={size} type="button" onClick={() => toggleArrayItem('sizes', size)}
                      className={`min-h-[44px] px-3 py-2.5 rounded-lg text-xs font-medium transition-all touch-manipulation ${
                        form.sizes.includes(size) ? 'bg-kuro text-shiro shadow-md' : 'bg-shiro text-kuro/60 border border-washi-dark hover:bg-kuro/5'
                      }`}>{size}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-kuro/50 uppercase tracking-wider block mb-2">Cores</label>
                <div className="flex flex-wrap gap-2">
                  {JUDOGI_COLORS.map((color) => (
                    <button key={color} type="button" onClick={() => toggleArrayItem('colors', color)}
                      className={`min-h-[44px] px-3 py-2.5 rounded-lg text-xs font-medium transition-all touch-manipulation ${
                        form.colors.includes(color) ? 'bg-kuro text-shiro shadow-md' : 'bg-shiro text-kuro/60 border border-washi-dark hover:bg-kuro/5'
                      }`}>{color}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-kuro/50 uppercase tracking-wider block mb-2">Opções de Bordado</label>
                <div className="flex flex-wrap gap-2">
                  {JUDOGI_EMBROIDERY.map((opt) => (
                    <button key={opt} type="button" onClick={() => toggleArrayItem('embroidery', opt)}
                      className={`min-h-[44px] px-3 py-2.5 rounded-lg text-xs font-medium transition-all touch-manipulation ${
                        form.embroidery.includes(opt) ? 'bg-aka text-shiro shadow-md' : 'bg-shiro text-kuro/60 border border-washi-dark hover:bg-kuro/5'
                      }`}>{opt}</button>
                  ))}
                </div>
              </div>
            </>
          ) : isFaixa ? (
            <>
              <Field label="Tamanhos (digite separados por vírgula)" value={form.sizesText} onChange={(v) => setForm({ ...form, sizesText: v })} placeholder="Ex: 3, 4, 5, 6" />
              <Field label="Cor da faixa" value={form.colorsText} onChange={(v) => setForm({ ...form, colorsText: v })} placeholder="Ex: Preta, Azul marinho" />
              <div>
                <label className="text-xs font-medium text-kuro/50 uppercase tracking-wider block mb-2">Bordado</label>
                <div className="flex flex-wrap gap-2">
                  {FAIXA_EMBROIDERY.map((opt) => (
                    <button key={opt} type="button" onClick={() => toggleArrayItem('embroidery', opt)}
                      className={`min-h-[44px] px-3 py-2.5 rounded-lg text-xs font-medium transition-all touch-manipulation ${
                        form.embroidery.includes(opt) ? 'bg-aka text-shiro shadow-md' : 'bg-shiro text-kuro/60 border border-washi-dark hover:bg-kuro/5'
                      }`}>{opt}</button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Tamanhos (vírgula)" value={form.sizesText} onChange={(v) => setForm({ ...form, sizesText: v })} placeholder="P, M, G, GG" />
              <Field label="Cores (vírgula)" value={form.colorsText} onChange={(v) => setForm({ ...form, colorsText: v })} placeholder="Branca, Azul" />
            </div>
          )}
          </div>

          <div className="shrink-0 flex gap-3 bg-washi border-t border-washi-dark p-4 sm:p-6 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-4">
            <button type="button" onClick={onCancel} className="flex-1 min-h-[48px] px-4 sm:px-6 py-3 border border-washi-dark rounded-xl text-sm font-medium text-kuro/60 hover:bg-kuro/5 transition-colors touch-manipulation">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || imagePreviews.length === 0}
              className="flex-1 min-h-[48px] px-4 sm:px-6 py-3 bg-aka hover:bg-aka-light text-shiro rounded-xl text-sm font-medium transition-colors shadow-lg shadow-aka/20 flex items-center justify-center gap-2 disabled:opacity-50 touch-manipulation"
            >
              <Save size={18} className="sm:w-4 sm:h-4" />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder = '', required = false }) {
  return (
    <div>
      <label className="text-xs font-medium text-kuro/50 uppercase tracking-wider block mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        step={type === 'number' ? '0.01' : undefined}
        className="w-full min-h-[48px] px-4 py-3 bg-shiro border border-washi-dark rounded-xl text-base sm:text-sm focus:outline-none focus:border-aka/30 focus:ring-2 focus:ring-aka/10 transition-all placeholder:text-kuro/25 touch-manipulation"
      />
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { logout } = useAdminAuth()
  const {
    products, activeProducts, totalValueProducts, loading,
    addProduct, updateProduct, deleteProduct, toggleAvailability,
  } = useProducts()

  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [duplicatingProduct, setDuplicatingProduct] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.includes(search.toLowerCase())
  )

  const stats = [
    { label: 'Total de Produtos', value: products.length, icon: Package, color: 'bg-blue-500/10 text-blue-600' },
    { label: 'Produtos Ativos', value: activeProducts.length, icon: PackageCheck, color: 'bg-green-500/10 text-green-600' },
    { label: 'Indisponíveis', value: products.length - activeProducts.length, icon: PackageX, color: 'bg-orange-500/10 text-orange-600' },
    { label: 'Valor total em produtos', value: `R$ ${totalValueProducts.toFixed(2)}`, icon: DollarSign, color: 'bg-purple-500/10 text-purple-600' },
  ]

  return (
    <div className="min-h-screen bg-washi">
      <header className="bg-kuro sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <img src="/images/logo-yawara.png" alt="Yawara" className="w-7 h-7 sm:w-8 sm:h-8" />
            <div>
              <h1 className="text-shiro font-bold text-xs sm:text-sm tracking-wide">Painel Admin</h1>
              <p className="text-shiro/30 text-[10px] hidden sm:block">Yawara Japan</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => navigate('/')} className="text-shiro/40 hover:text-shiro text-[10px] sm:text-xs transition-colors">Ver site</button>
            <button
              onClick={() => { logout(); navigate('/admin/login') }}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-shiro/5 hover:bg-shiro/10 text-shiro/60 hover:text-shiro rounded-lg text-[10px] sm:text-xs transition-all"
            >
              <LogOut size={12} className="sm:w-3.5 sm:h-3.5" /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-10">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-shiro rounded-xl p-3 sm:p-5 border border-washi-dark min-w-0">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${stat.color} flex items-center justify-center mb-2 sm:mb-3`}>
                  <Icon size={18} className="sm:w-5 sm:h-5" />
                </div>
                <p className="text-lg sm:text-2xl font-bold text-kuro truncate">{stat.value}</p>
                <p className="text-[10px] sm:text-[11px] text-kuro/40 mt-0.5 line-clamp-2">{stat.label}</p>
              </div>
            )
          })}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-shiro rounded-2xl border border-washi-dark overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-washi-dark flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-kuro">Produtos</h2>
              <p className="text-[10px] sm:text-xs text-kuro/40 mt-0.5">Gerencie todos os produtos do catálogo</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-kuro/30" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-56 pl-8 sm:pl-9 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-washi border border-washi-dark rounded-lg text-[10px] sm:text-xs focus:outline-none focus:border-aka/30 transition-all placeholder:text-kuro/25"
                />
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-aka hover:bg-aka-light text-shiro rounded-lg text-[10px] sm:text-xs font-medium transition-colors shadow-md shadow-aka/20 shrink-0"
              >
                <Plus size={14} /> <span className="hidden sm:inline">Novo Produto</span><span className="sm:hidden">Novo</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 text-kuro/30 text-sm">Carregando produtos...</div>
          ) : (
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="bg-washi/50">
                    <th className="text-left px-3 sm:px-6 py-2.5 sm:py-3 text-[10px] font-semibold text-kuro/40 uppercase tracking-wider">Produto</th>
                    <th className="text-left px-2 sm:px-4 py-2.5 sm:py-3 text-[10px] font-semibold text-kuro/40 uppercase tracking-wider hidden sm:table-cell">Categoria</th>
                    <th className="text-left px-2 sm:px-4 py-2.5 sm:py-3 text-[10px] font-semibold text-kuro/40 uppercase tracking-wider">Preço</th>
                    <th className="text-center px-2 sm:px-4 py-2.5 sm:py-3 text-[10px] font-semibold text-kuro/40 uppercase tracking-wider">Status</th>
                    <th className="text-right px-3 sm:px-6 py-2.5 sm:py-3 text-[10px] font-semibold text-kuro/40 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-washi-dark">
                  {filtered.map((product) => (
                    <tr key={product.id} className={`hover:bg-washi/30 transition-colors ${!product.available ? 'opacity-50' : ''}`}>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-washi flex items-center justify-center shrink-0">
                              <Image size={14} className="text-kuro/20 sm:w-4 sm:h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-kuro truncate">{product.name}</p>
                            <p className="text-[10px] text-kuro/30 font-jp truncate hidden sm:block">{product.nameJp || product.name_jp}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-3 sm:py-4 hidden sm:table-cell">
                        <span className="px-2 py-0.5 bg-washi rounded-md text-[10px] font-medium text-kuro/60 capitalize">{product.category}</span>
                      </td>
                      <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                        <span className="text-xs sm:text-sm font-semibold text-kuro">R$ {product.price.toFixed(2)}</span>
                      </td>
                      <td className="px-2 sm:px-4 py-3 sm:py-4 text-center">
                        <button
                          onClick={() => toggleAvailability(product.id)}
                          className={`min-h-[36px] inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full text-[10px] font-medium transition-all touch-manipulation ${
                            product.available ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                          }`}
                        >
                          {product.available ? <Eye size={12} /> : <EyeOff size={12} />}
                          <span className="hidden sm:inline">{product.available ? 'Ativo' : 'Inativo'}</span>
                        </button>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                          <button onClick={() => setEditingProduct(product)} className="p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center hover:bg-blue-50 text-kuro/40 hover:text-blue-600 rounded-lg transition-all touch-manipulation" title="Editar" aria-label="Editar">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => setDuplicatingProduct(product)} className="p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center hover:bg-aka/10 text-kuro/40 hover:text-aka rounded-lg transition-all touch-manipulation" title="Duplicar" aria-label="Duplicar">
                            <Copy size={16} />
                          </button>
                          <button onClick={() => setDeleteConfirm(product)} className="p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center hover:bg-red-50 text-kuro/40 hover:text-red-500 rounded-lg transition-all touch-manipulation" title="Excluir" aria-label="Excluir">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-12 text-kuro/30 text-sm">Nenhum produto encontrado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>

      <AnimatePresence>
        {showAddForm && (
          <ProductForm
            title="Adicionar Produto"
            onCancel={() => setShowAddForm(false)}
            onSave={async (product, file, existingUrls) => {
              await addProduct(product, file, existingUrls)
              setShowAddForm(false)
            }}
          />
        )}
        {editingProduct && (
          <ProductForm
            title="Editar Produto"
            initial={editingProduct}
            onCancel={() => setEditingProduct(null)}
            onSave={async (updates, file, existingUrls) => {
              await updateProduct(editingProduct.id, updates, file, existingUrls)
              setEditingProduct(null)
            }}
          />
        )}
        {duplicatingProduct && (
          <ProductForm
            title="Duplicar Produto"
            initial={duplicatingProduct}
            onCancel={() => setDuplicatingProduct(null)}
            onSave={async (product, file, existingUrls) => {
              await addProduct(product, file, existingUrls)
              setDuplicatingProduct(null)
            }}
          />
        )}
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-kuro/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-shiro rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-14 h-14 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-kuro mb-2">Excluir produto?</h3>
              <p className="text-sm text-kuro/50 mb-6">
                Tem certeza que deseja excluir <strong>"{deleteConfirm.name}"</strong>?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-3 border border-washi-dark rounded-xl text-sm font-medium text-kuro/60 hover:bg-washi transition-colors">Cancelar</button>
                <button
                  onClick={async () => { await deleteProduct(deleteConfirm.id); setDeleteConfirm(null) }}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-shiro rounded-xl text-sm font-medium transition-colors"
                >Excluir</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
