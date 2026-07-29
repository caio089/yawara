import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Save, X, Image, Upload, Handshake } from 'lucide-react'
import { useBrandPartners } from '../../context/PartnersContext'

function PartnerForm({ initial, onSave, onCancel, title }) {
  const fileInputRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(initial?.image || '')
  const [form, setForm] = useState({
    name: initial?.name || '',
    club: initial?.club || '',
    sortOrder: initial?.sortOrder?.toString() ?? '0',
    role: initial?.role === 'Amigo da Marca' ? 'Amigo da Marca' : 'Parceiro',
    imagePosition: initial?.imagePosition === 'center' ? 'center' : 'top',
  })

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setSaveError('Informe o nome do parceiro.')
      return
    }
    if (!imagePreview && !initial?.image) {
      setSaveError('Adicione uma foto.')
      return
    }
    setSaving(true)
    setSaveError('')
    const payload = {
      name: form.name.trim(),
      club: form.club.trim(),
      sortOrder: parseInt(form.sortOrder, 10) || 0,
      role: form.role,
      imagePosition: form.imagePosition,
      image: imagePreview && !imageFile ? imagePreview : initial?.image,
    }
    try {
      const result = await onSave(payload, imageFile)
      if (result?.success === false) {
        setSaveError(result.error || 'Não foi possível salvar.')
        return
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
        className="bg-shiro w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col"
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-washi-dark shrink-0">
          <h2 className="text-base sm:text-lg font-bold text-kuro">{title}</h2>
          <button type="button" onClick={onCancel} className="p-2 hover:bg-washi rounded-lg text-kuro/40">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {saveError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{saveError}</p>
            )}

            <div>
              <label className="text-xs font-medium text-kuro/50 uppercase tracking-wider block mb-1.5">Foto *</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-washi border border-washi-dark shrink-0">
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
                placeholder="Nome do parceiro"
                className="w-full min-h-[48px] px-4 py-3 bg-shiro border border-washi-dark rounded-xl text-sm focus:outline-none focus:border-aka/30"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-kuro/50 uppercase tracking-wider block mb-1.5">Clube / instituição</label>
              <input
                value={form.club}
                onChange={(e) => setForm({ ...form, club: e.target.value })}
                placeholder="Ex: Sogipa"
                className="w-full min-h-[48px] px-4 py-3 bg-shiro border border-washi-dark rounded-xl text-sm focus:outline-none focus:border-aka/30"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-kuro/50 uppercase tracking-wider block mb-1.5">Posição na lista</label>
              <input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                className="w-full min-h-[48px] px-4 py-3 bg-shiro border border-washi-dark rounded-xl text-sm"
              />
              <p className="text-[10px] text-kuro/40 mt-1.5">Ordem na grade de Parceiros Oficiais (menor número primeiro).</p>
            </div>

            <div>
              <label className="text-xs font-medium text-kuro/50 uppercase tracking-wider block mb-2">Tipo</label>
              <div className="flex gap-2">
                {['Parceiro', 'Amigo da Marca'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setForm({ ...form, role })}
                    className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                      form.role === role ? 'bg-aka text-shiro' : 'bg-shiro text-kuro/60 border border-washi-dark'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="shrink-0 flex gap-3 border-t border-washi-dark p-4 sm:p-6">
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

function PartnerRow({ partner, onEdit, onDelete }) {
  return (
    <tr className="hover:bg-washi/30 transition-colors">
      <td className="px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-3 min-w-0">
          {partner.image ? (
            <img src={partner.image} alt={partner.name} className="w-10 h-10 rounded-lg object-cover object-top shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-washi flex items-center justify-center shrink-0">
              <Image size={14} className="text-kuro/20" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-kuro truncate">{partner.name}</p>
            <p className="text-[10px] text-kuro/40 truncate">
              {partner.role}
              {partner.club ? ` · ${partner.club}` : ''}
            </p>
          </div>
        </div>
      </td>
      <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-xs text-kuro/50">{(partner.sortOrder ?? 0) + 1}</td>
      <td className="px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => onEdit(partner)} className="p-2 hover:bg-blue-50 text-kuro/40 hover:text-blue-600 rounded-lg" title="Editar">
            <Pencil size={16} />
          </button>
          <button onClick={() => onDelete(partner)} className="p-2 hover:bg-red-50 text-kuro/40 hover:text-red-500 rounded-lg" title="Excluir">
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function PartnersAdmin() {
  const { partners, loading, addPartner, updatePartner, deletePartner } = useBrandPartners()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const nextSortOrder = () => {
    if (!partners.length) return 0
    return Math.max(...partners.map((p) => p.sortOrder ?? 0)) + 1
  }

  const sortedPartners = [...partners].sort((a, b) => {
    if ((a.sortOrder ?? 0) !== (b.sortOrder ?? 0)) return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    return (a.id ?? 0) - (b.id ?? 0)
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
              <Handshake size={18} className="text-aka" />
              Parceiros Oficiais
            </h2>
            <p className="text-[10px] sm:text-xs text-kuro/40 mt-0.5">
              Gerencie a seção Parceiros Oficiais · {partners.length} cadastrado(s)
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-aka hover:bg-aka-light text-shiro rounded-lg text-xs font-medium shadow-md shadow-aka/20"
          >
            <Plus size={14} /> Novo parceiro
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-kuro/30 text-sm">Carregando parceiros...</div>
        ) : partners.length === 0 ? (
          <div className="text-center py-16 px-6">
            <p className="text-kuro/40 text-sm mb-2">Nenhum parceiro cadastrado.</p>
            <p className="text-kuro/30 text-xs">Adicione parceiros com foto, nome e clube para exibir na página pública.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="bg-washi/50">
                  <th className="text-left px-3 sm:px-6 py-3 text-[10px] font-semibold text-kuro/40 uppercase">Parceiro</th>
                  <th className="text-center px-2 sm:px-4 py-3 text-[10px] font-semibold text-kuro/40 uppercase">Posição</th>
                  <th className="text-right px-3 sm:px-6 py-3 text-[10px] font-semibold text-kuro/40 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-washi-dark">
                {sortedPartners.map((partner) => (
                  <PartnerRow
                    key={partner.id}
                    partner={partner}
                    onEdit={setEditing}
                    onDelete={setDeleteConfirm}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showAdd && (
          <PartnerForm
            title="Adicionar parceiro"
            initial={{ sortOrder: nextSortOrder() }}
            onCancel={() => setShowAdd(false)}
            onSave={async (data, file) => {
              const result = await addPartner(data, file)
              if (result?.success !== false) setShowAdd(false)
              return result
            }}
          />
        )}
        {editing && (
          <PartnerForm
            title="Editar parceiro"
            initial={editing}
            onCancel={() => setEditing(null)}
            onSave={async (data, file) => {
              const result = await updatePartner(editing.id, data, file)
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
              <h3 className="text-lg font-bold text-kuro mb-2">Remover parceiro?</h3>
              <p className="text-sm text-kuro/50 mb-6">
                <strong>{deleteConfirm.name}</strong> será removido da página Parceiros.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-3 border border-washi-dark rounded-xl text-sm text-kuro/60">
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    await deletePartner(deleteConfirm.id)
                    setDeleteConfirm(null)
                  }}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-shiro rounded-xl text-sm font-medium"
                >
                  Remover
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
