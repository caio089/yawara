import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, PackageCheck, PackageX, DollarSign, Plus, Pencil,
  Trash2, Eye, EyeOff, LogOut, X, Save, Search, Upload, Image,
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

function ProductForm({ initial, onSave, onCancel, title }) {
  const fileInputRef = useRef(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(initial?.image || '')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(() => ({
    name: initial?.name || '',
    nameJp: initial?.nameJp || initial?.name_jp || '',
    description: initial?.description || '',
    price: initial?.price?.toString() || '',
    category: initial?.category || 'judogi',
    badge: initial?.badge || '',
    sizes: Array.isArray(initial?.sizes) ? initial.sizes : [],
    colors: Array.isArray(initial?.colors) ? initial.colors : [],
    embroidery: Array.isArray(initial?.embroidery) ? initial.embroidery : [],
    sizesText: Array.isArray(initial?.sizes) ? initial.sizes.join(', ') : '',
    colorsText: Array.isArray(initial?.colors) ? initial.colors.join(', ') : '',
  }))

  const isJudogi = form.category === 'judogi'

  const toggleArrayItem = (key, item) => {
    setForm((prev) => {
      const arr = prev[key]
      return { ...prev, [key]: arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item] }
    })
  }

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const sizes = isJudogi
      ? form.sizes
      : form.sizesText ? form.sizesText.split(',').map((s) => s.trim()).filter(Boolean) : undefined
    const colors = isJudogi
      ? form.colors
      : form.colorsText ? form.colorsText.split(',').map((s) => s.trim()).filter(Boolean) : undefined
    const product = {
      name: form.name,
      nameJp: form.nameJp,
      description: form.description,
      price: parseFloat(form.price) || 0,
      category: form.category,
      image: initial?.image || '',
      badge: form.badge || undefined,
      sizes: sizes?.length ? sizes : undefined,
      colors: colors?.length ? colors : undefined,
      embroidery: isJudogi && form.embroidery.length ? form.embroidery : undefined,
    }
    await onSave(product, imageFile)
    setSaving(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-kuro/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-washi rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="sticky top-0 bg-washi border-b border-washi-dark px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-kuro">{title}</h3>
          <button onClick={onCancel} className="p-2 hover:bg-kuro/5 rounded-lg transition-colors">
            <X size={18} className="text-kuro/50" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field label="Nome *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Ex: Judogi Elite" required />

          <div>
            <label className="text-xs font-medium text-kuro/50 uppercase tracking-wider block mb-1.5">Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Descrição detalhada do produto..."
              className="w-full px-4 py-3 bg-shiro border border-washi-dark rounded-xl text-sm focus:outline-none focus:border-aka/30 focus:ring-2 focus:ring-aka/10 transition-all placeholder:text-kuro/25 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Preço (R$) *" value={form.price} onChange={(v) => setForm({ ...form, price: v })} type="number" placeholder="0.00" required />
            <div>
              <label className="text-xs font-medium text-kuro/50 uppercase tracking-wider block mb-1.5">Categoria</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 bg-shiro border border-washi-dark rounded-xl text-sm focus:outline-none focus:border-aka/30 cursor-pointer"
              >
                {categoryOptions.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <Field label="Badge" value={form.badge} onChange={(v) => setForm({ ...form, badge: v })} placeholder="Ex: Novo" />
          </div>

          <div>
            <label className="text-xs font-medium text-kuro/50 uppercase tracking-wider block mb-1.5">Imagem do produto *</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-washi-dark rounded-xl p-6 text-center cursor-pointer hover:border-aka/30 hover:bg-aka/5 transition-all"
            >
              {imagePreview ? (
                <div className="flex items-center gap-4">
                  <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-kuro">{imageFile?.name || 'Imagem atual'}</p>
                    <p className="text-xs text-kuro/40 mt-1">Clique para trocar</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="w-12 h-12 bg-washi rounded-xl flex items-center justify-center">
                    <Upload size={20} className="text-kuro/30" />
                  </div>
                  <p className="text-sm text-kuro/50">Clique para selecionar uma imagem</p>
                  <p className="text-[10px] text-kuro/30">PNG, JPG ou WEBP</p>
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
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
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
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
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
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
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

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel} className="flex-1 px-6 py-3.5 border border-washi-dark rounded-xl text-sm font-medium text-kuro/60 hover:bg-kuro/5 transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || (!imagePreview && !imageFile)}
              className="flex-1 px-6 py-3.5 bg-aka hover:bg-aka-light text-shiro rounded-xl text-sm font-medium transition-colors shadow-lg shadow-aka/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
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
        className="w-full px-4 py-3 bg-shiro border border-washi-dark rounded-xl text-sm focus:outline-none focus:border-aka/30 focus:ring-2 focus:ring-aka/10 transition-all placeholder:text-kuro/25"
      />
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { logout } = useAdminAuth()
  const {
    products, activeProducts, averageTicket, loading,
    addProduct, updateProduct, deleteProduct, toggleAvailability,
  } = useProducts()

  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.includes(search.toLowerCase())
  )

  const stats = [
    { label: 'Total de Produtos', value: products.length, icon: Package, color: 'bg-blue-500/10 text-blue-600' },
    { label: 'Produtos Ativos', value: activeProducts.length, icon: PackageCheck, color: 'bg-green-500/10 text-green-600' },
    { label: 'Indisponíveis', value: products.length - activeProducts.length, icon: PackageX, color: 'bg-orange-500/10 text-orange-600' },
    { label: 'Ticket Médio', value: `R$ ${averageTicket.toFixed(2)}`, icon: DollarSign, color: 'bg-purple-500/10 text-purple-600' },
  ]

  return (
    <div className="min-h-screen bg-washi">
      <header className="bg-kuro sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/images/logo-yawara.png" alt="Yawara" className="w-8 h-8" />
            <div>
              <h1 className="text-shiro font-bold text-sm tracking-wide">Painel Admin</h1>
              <p className="text-shiro/30 text-[10px]">Yawara Japan</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-shiro/40 hover:text-shiro text-xs transition-colors">Ver site</button>
            <button
              onClick={() => { logout(); navigate('/admin/login') }}
              className="flex items-center gap-2 px-4 py-2 bg-shiro/5 hover:bg-shiro/10 text-shiro/60 hover:text-shiro rounded-lg text-xs transition-all"
            >
              <LogOut size={14} /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-shiro rounded-xl p-5 border border-washi-dark">
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                  <Icon size={20} />
                </div>
                <p className="text-2xl font-bold text-kuro">{stat.value}</p>
                <p className="text-[11px] text-kuro/40 mt-0.5">{stat.label}</p>
              </div>
            )
          })}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-shiro rounded-2xl border border-washi-dark overflow-hidden">
          <div className="p-6 border-b border-washi-dark flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-kuro">Produtos</h2>
              <p className="text-xs text-kuro/40 mt-0.5">Gerencie todos os produtos do catálogo</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-kuro/30" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-56 pl-9 pr-4 py-2.5 bg-washi border border-washi-dark rounded-lg text-xs focus:outline-none focus:border-aka/30 transition-all placeholder:text-kuro/25"
                />
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-aka hover:bg-aka-light text-shiro rounded-lg text-xs font-medium transition-colors shadow-md shadow-aka/20 shrink-0"
              >
                <Plus size={16} /> Novo Produto
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 text-kuro/30 text-sm">Carregando produtos...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-washi/50">
                    <th className="text-left px-6 py-3 text-[10px] font-semibold text-kuro/40 uppercase tracking-wider">Produto</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-kuro/40 uppercase tracking-wider hidden sm:table-cell">Categoria</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-kuro/40 uppercase tracking-wider">Preço</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold text-kuro/40 uppercase tracking-wider">Status</th>
                    <th className="text-right px-6 py-3 text-[10px] font-semibold text-kuro/40 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-washi-dark">
                  {filtered.map((product) => (
                    <tr key={product.id} className={`hover:bg-washi/30 transition-colors ${!product.available ? 'opacity-50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-washi flex items-center justify-center shrink-0">
                              <Image size={16} className="text-kuro/20" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-kuro truncate">{product.name}</p>
                            <p className="text-[10px] text-kuro/30 font-jp">{product.nameJp || product.name_jp}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <span className="px-2.5 py-1 bg-washi rounded-md text-[10px] font-medium text-kuro/60 capitalize">{product.category}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-kuro">R$ {product.price.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => toggleAvailability(product.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium transition-all ${
                            product.available ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                          }`}
                        >
                          {product.available ? <Eye size={12} /> : <EyeOff size={12} />}
                          {product.available ? 'Ativo' : 'Inativo'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setEditingProduct(product)} className="p-2 hover:bg-blue-50 text-kuro/40 hover:text-blue-600 rounded-lg transition-all" title="Editar">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => setDeleteConfirm(product)} className="p-2 hover:bg-red-50 text-kuro/40 hover:text-red-500 rounded-lg transition-all" title="Excluir">
                            <Trash2 size={15} />
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
            onSave={async (product, file) => {
              await addProduct(product, file)
              setShowAddForm(false)
            }}
          />
        )}
        {editingProduct && (
          <ProductForm
            title="Editar Produto"
            initial={editingProduct}
            onCancel={() => setEditingProduct(null)}
            onSave={async (updates, file) => {
              await updateProduct(editingProduct.id, updates, file)
              setEditingProduct(null)
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
