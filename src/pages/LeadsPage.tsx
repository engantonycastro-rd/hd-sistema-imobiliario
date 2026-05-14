import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { LEAD_STATUS_CONFIG, ORIGEM_LABEL, formatPhone, formatDateTime } from '@/lib/utils'
import AppLayout from '@/components/layout/AppLayout'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Plus, Users, Phone, Mail, GripVertical, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Database } from '@/types/database'

type Lead = Database['public']['Tables']['leads']['Row']
type LeadStatus = Lead['status']

const KANBAN_COLUMNS: LeadStatus[] = ['novo', 'contato', 'visita', 'proposta', 'negociacao', 'ganho', 'perdido']

export default function LeadsPage() {
  const { user } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [search, setSearch] = useState('')
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const fetchLeads = useCallback(async () => {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
    setLeads(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { if (user) fetchLeads() }, [user, fetchLeads])

  const handleDragStart = (id: string) => setDraggedId(id)

  const handleDrop = async (newStatus: LeadStatus) => {
    if (!draggedId) return
    const lead = leads.find(l => l.id === draggedId)
    if (!lead || lead.status === newStatus) { setDraggedId(null); return }

    setLeads(prev => prev.map(l => l.id === draggedId ? { ...l, status: newStatus } : l))
    setDraggedId(null)

    const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', draggedId)
    if (error) {
      toast.error('Erro ao mover lead')
      fetchLeads()
    } else {
      toast.success(`Lead movido para ${LEAD_STATUS_CONFIG[newStatus].label}`)
    }
  }

  const handleSave = async (formData: Partial<Lead>) => {
    if (editingLead) {
      const { error } = await supabase.from('leads').update(formData).eq('id', editingLead.id)
      if (error) { toast.error('Erro ao salvar'); return }
      toast.success('Lead atualizado')
    } else {
      const { error } = await supabase.from('leads').insert({ ...formData, corretor_id: user?.id } as Lead)
      if (error) { toast.error('Erro ao criar lead'); return }
      toast.success('Lead criado')
    }
    setModalOpen(false)
    setEditingLead(null)
    fetchLeads()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return
    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) { toast.error('Erro ao excluir'); return }
    toast.success('Lead excluído')
    fetchLeads()
  }

  const filtered = search
    ? leads.filter(l => l.nome.toLowerCase().includes(search.toLowerCase()) || l.telefone.includes(search))
    : leads

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Leads</h1>
            <p className="text-sm text-white/40 mt-1">{leads.length} leads no funil</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar lead..." className="input-field pl-10 py-2 text-sm w-56" />
            </div>
            <button onClick={() => { setEditingLead(null); setModalOpen(true) }} className="btn-primary text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Novo Lead
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-3 overflow-x-auto pb-4">{[1,2,3,4,5].map(i => <div key={i} className="glass-card w-64 flex-shrink-0 h-[400px] animate-pulse" />)}</div>
        ) : leads.length === 0 ? (
          <EmptyState icon={Users} title="Nenhum lead" description="Comece adicionando seu primeiro lead" action={{ label: '+ Novo Lead', onClick: () => setModalOpen(true) }} />
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-4">
            {KANBAN_COLUMNS.map((status) => {
              const cfg = LEAD_STATUS_CONFIG[status]
              const columnLeads = filtered.filter(l => l.status === status)
              return (
                <div
                  key={status}
                  className="flex-shrink-0 w-64"
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => handleDrop(status)}
                >
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <Badge className={cfg.color}>{cfg.label}</Badge>
                    <span className="text-xs text-white/30">{columnLeads.length}</span>
                  </div>
                  <div className="space-y-2 min-h-[200px]">
                    {columnLeads.map((lead) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={() => handleDragStart(lead.id)}
                        onClick={() => { setEditingLead(lead); setModalOpen(true) }}
                        className="glass-card p-3 cursor-grab active:cursor-grabbing hover:border-glass-border-hover transition-all group"
                      >
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium truncate flex-1">{lead.nome}</p>
                          <GripVertical className="w-3.5 h-3.5 text-white/15 group-hover:text-white/30 flex-shrink-0" />
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-white/40 flex items-center gap-1.5"><Phone className="w-3 h-3" />{formatPhone(lead.telefone)}</p>
                          {lead.email && <p className="text-xs text-white/40 flex items-center gap-1.5 truncate"><Mail className="w-3 h-3" />{lead.email}</p>}
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                          <span className="text-[10px] text-white/25">{ORIGEM_LABEL[lead.origem as keyof typeof ORIGEM_LABEL] ?? lead.origem}</span>
                          <span className="text-[10px] text-white/25">{formatDateTime(lead.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <LeadFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingLead(null) }}
        lead={editingLead}
        onSave={handleSave}
        onDelete={editingLead ? () => { handleDelete(editingLead.id); setModalOpen(false); setEditingLead(null) } : undefined}
      />
    </AppLayout>
  )
}

function LeadFormModal({ open, onClose, lead, onSave, onDelete }: {
  open: boolean; onClose: () => void; lead: Lead | null
  onSave: (data: Partial<Lead>) => void; onDelete?: () => void
}) {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [origem, setOrigem] = useState('whatsapp')
  const [status, setStatus] = useState('novo')
  const [interesse, setInteresse] = useState('')
  const [observacoes, setObservacoes] = useState('')

  useEffect(() => {
    if (lead) {
      setNome(lead.nome); setTelefone(lead.telefone); setEmail(lead.email ?? '')
      setOrigem(lead.origem); setStatus(lead.status); setInteresse(lead.interesse ?? ''); setObservacoes(lead.observacoes ?? '')
    } else {
      setNome(''); setTelefone(''); setEmail(''); setOrigem('whatsapp'); setStatus('novo'); setInteresse(''); setObservacoes('')
    }
  }, [lead, open])

  const handleSubmit = () => {
    if (!nome.trim() || !telefone.trim()) { toast.error('Nome e telefone são obrigatórios'); return }
    onSave({ nome, telefone, email: email || null, origem, status, interesse: interesse || null, observacoes: observacoes || null })
  }

  return (
    <Modal open={open} onClose={onClose} title={lead ? 'Editar Lead' : 'Novo Lead'} maxWidth="max-w-md">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Nome *</label>
          <input value={nome} onChange={e => setNome(e.target.value)} className="input-field" placeholder="Nome do lead" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Telefone *</label>
            <input value={telefone} onChange={e => setTelefone(e.target.value)} className="input-field" placeholder="(84) 99999-9999" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">E-mail</label>
            <input value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="email@exemplo.com" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Origem</label>
            <select value={origem} onChange={e => setOrigem(e.target.value)} className="input-field">
              {Object.entries(ORIGEM_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="input-field">
              {Object.entries(LEAD_STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Interesse</label>
          <input value={interesse} onChange={e => setInteresse(e.target.value)} className="input-field" placeholder="Ex: Casa 2 quartos Pajuçara" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Observações</label>
          <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} className="input-field min-h-[80px] resize-none" placeholder="Notas sobre o lead..." />
        </div>
        <div className="flex items-center justify-between pt-2">
          {onDelete ? <button onClick={onDelete} className="text-sm text-red-400/60 hover:text-red-400 transition-colors">Excluir</button> : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-ghost text-sm">Cancelar</button>
            <button onClick={handleSubmit} className="btn-primary text-sm">{lead ? 'Salvar' : 'Criar Lead'}</button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
