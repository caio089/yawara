import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Save, X, FolderOpen } from 'lucide-react'
import { useProducts } from '../../context/ProductsContext'
import { slugifyCategory, isValidCategorySlug } from '../../utils/categorySlug'

function CategoryForm({ initial, onSave, onCancel, title, isEdit }) {
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [form, setForm] = useState({
    name: initial?.name || '',
    nameJp: initial?.nameJp || initial?.name_jp || '',
    slug: initial?.id || initial?.slug || '',
    sortOrder: initial?.sortOrder?.toString() ?? '0',
  })

  const handleNameChange = (name) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: isEdit ? prev.slug : slugifyCategory(name),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const slug = form.slug.trim()
    if (!form.name.trim()) {
      setSaveError('Informe o nome da categoria.')
      return
    }
    if (!isValidCategorySlug(slug)) {
      setSaveError('Identificador inválido. Use apenas letras minúsculas, números e hífens.')
      return
    }
    setSaving(true)
    setSaveError('')
    try {
      const result = await onSave({
        id: slug,
        name: form.name.trim(),
        nameJp: form.nameJp.trim() || null,
        sortOrder: parseInt(form.sortOrder, 10) || 0,
      })
      if (result?.success === false) {
        setSaveError(result.error || 'Não foi possível salvar.')
      }
    } catch (err) {
      setSaveError(err?.message || 'Não foi possível salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-kuro/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        exit={{ y: 40 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-shiro w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl"
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-washi-dark">
          <h2 className="text-base sm:text-lg font-bold text-kuro">{title}</h2>
          <button type="button" onClick={onCancel} className="p-2 hover:bg-washi rounded-lg text-kuro/40">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {saveError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{saveError}</p>
          )}

          <div>
            <label className="text-xs font-medium text-kuro/50 uppercase tracking-wider block mb-1.5">Nome *</label>
            <input
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              placeholder="Ex: Acessórios"
              className="w-full min-h-[48px] px-4 py-3 bg-shiro border border-washi-dark rounded-xl text-sm focus:outline-none focus:border-aka/30"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-kuro/50 uppercase tracking-wider block mb-1.5">Identificador *</label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: slugifyCategory(e.target.value) })}
              required
              readOnly={isEdit}
              placeholder="acessorios"
              className={`w-full min-h-[48px] px-4 py-3 border border-washi-dark rounded-xl text-sm font-mono focus:outline-none focus:border-aka/30 ${
                isEdit ? 'bg-washi text-kuro/50 cursor-not-allowed' : 'bg-shiro'
              }`}
            />
            <p className="text-[10px] text-kuro/40 mt-1.5">
              {isEdit ? 'O identificador não pode ser alterado após criar.' : 'Gerado automaticamente a partir do nome.'}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-kuro/50 uppercase tracking-wider block mb-1.5">Nome em japonês</label>
            <input
              value={form.nameJp}
              onChange={(e) => setForm({ ...form, nameJp: e.target.value })}
              placeholder="例: アクセサリー"
              className="w-full min-h-[48px] px-4 py-3 bg-shiro border border-washi-dark rounded-xl text-sm focus:outline-none focus:border-aka/30"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-kuro/50 uppercase tracking-wider block mb-1.5">Ordem</label>
            <input
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              className="w-full min-h-[48px] px-4 py-3 bg-shiro border border-washi-dark rounded-xl text-sm"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel} className="flex-1 min-h-[48px] border border-washi-dark rounded-xl text-sm text-kuro/60">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 min-h-[48px] bg-aka hover:bg-aka-light text-shiro rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default function CategoriesAdmin() {
  const {
    productCategories,
    categoriesLoading,
    addCategory,
    updateCategory,
    deleteCategory,
    countProductsInCategory,
  } = useProducts()

  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const nextSortOrder = () => {
    if (!productCategories.length) return 0
    return Math.max(...productCategories.map((c) => c.sortOrder ?? 0)) + 1
  }

  const sorted = [...productCategories].sort((a, b) => {
    if ((a.sortOrder ?? 0) !== (b.sortOrder ?? 0)) return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    return a.name.localeCompare(b.name)
  })

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-shiro rounded-2xl border border-washi-dark overflow-hidden"
      >
        <div className="p-4 sm:p-6 border-b border-washi-dark flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-kuro flex items-center gap-2">
              <FolderOpen size={18} className="text-aka" />
              Categorias de produto
            </h2>
            <p className="text-[10px] sm:text-xs text-kuro/40 mt-0.5">
              Categorias exibidas no catálogo e no formulário de produtos · {productCategories.length} cadastrada(s)
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-aka hover:bg-aka-light text-shiro rounded-lg text-xs font-medium shadow-md shadow-aka/20"
          >
            <Plus size={14} /> Nova categoria
          </button>
        </div>

        {categoriesLoading ? (
          <div className="text-center py-16 text-kuro/30 text-sm">Carregando categorias...</div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16 px-6">
            <p className="text-kuro/40 text-sm">Nenhuma categoria cadastrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="bg-washi/50">
                  <th className="text-left px-3 sm:px-6 py-3 text-[10px] font-semibold text-kuro/40 uppercase">Categoria</th>
                  <th className="text-left px-2 sm:px-4 py-3 text-[10px] font-semibold text-kuro/40 uppercase hidden sm:table-cell">Identificador</th>
                  <th className="text-center px-2 sm:px-4 py-3 text-[10px] font-semibold text-kuro/40 uppercase">Ordem</th>
                  <th className="text-right px-3 sm:px-6 py-3 text-[10px] font-semibold text-kuro/40 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-washi-dark">
                {sorted.map((cat) => (
                  <tr key={cat.id} className="hover:bg-washi/30 transition-colors">
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <p className="text-sm font-medium text-kuro">{cat.name}</p>
                      {cat.nameJp && <p className="text-[10px] text-kuro/35 font-jp">{cat.nameJp}</p>}
                    </td>
                    <td className="px-2 sm:px-4 py-3 sm:py-4 hidden sm:table-cell">
                      <code className="text-xs text-kuro/50 bg-washi px-2 py-1 rounded">{cat.id}</code>
                    </td>
                    <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-xs text-kuro/50">{cat.sortOrder}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditing(cat)} className="p-2 hover:bg-blue-50 text-kuro/40 hover:text-blue-600 rounded-lg" title="Editar">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => setDeleteConfirm(cat)} className="p-2 hover:bg-red-50 text-kuro/40 hover:text-red-500 rounded-lg" title="Excluir">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showAdd && (
          <CategoryForm
            title="Nova categoria"
            initial={{ sortOrder: nextSortOrder() }}
            onCancel={() => setShowAdd(false)}
            onSave={async (data) => {
              const result = await addCategory(data)
              if (result?.success !== false) setShowAdd(false)
              return result
            }}
          />
        )}
        {editing && (
          <CategoryForm
            title="Editar categoria"
            initial={editing}
            isEdit
            onCancel={() => setEditing(null)}
            onSave={async (data) => {
              const result = await updateCategory(editing.id, data)
              if (result?.success !== false) setEditing(null)
              return result
            }}
          />
        )}
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-kuro/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-shiro rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-14 h-14 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-kuro mb-2">Excluir categoria?</h3>
              <p className="text-sm text-kuro/50 mb-6">
                <strong>{deleteConfirm.name}</strong> será removida.
                {countProductsInCategory(deleteConfirm.id) > 0 && (
                  <span className="block mt-2 text-red-600">
                    {countProductsInCategory(deleteConfirm.id)} produto(s) usam esta categoria — não é possível excluir.
                  </span>
                )}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-3 border border-washi-dark rounded-xl text-sm text-kuro/60">
                  Cancelar
                </button>
                <button
                  disabled={countProductsInCategory(deleteConfirm.id) > 0}
                  onClick={async () => {
                    const result = await deleteCategory(deleteConfirm.id)
                    if (result?.success !== false) setDeleteConfirm(null)
                  }}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-shiro rounded-xl text-sm font-medium disabled:opacity-40"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
