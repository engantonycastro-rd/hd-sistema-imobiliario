import { useEffect, useState, useCallback } from 'react'
import { db } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { ATIVIDADE_TIPO_LABEL, formatDateTime } from '@/lib/utils'
import AppLayout from '@/components/layout/AppLayout'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Plus, CalendarDays, Check, Clock, Phone, Eye, FileText, MessageSquare, Users as UsersIcon, CircleDot } from 'lucide-react'
import toast from 'react-hot-toast'

interface Atividade {
  id: string; created_at: string; tipo: string; descricao: string; lead_id: string | null
  imovel_id: string | null; user_id: string; data_agendada: string | null; concluida: boolean
}

const TIPO_ICON: Record<string, typeof Phone> = {
  ligacao: Phone, visita: Eye, proposta: FileText, mensagem: MessageSquare, reuniao: UsersIcon, outro: CircleDot,
}

export default function AtividadesPage() {
  const { user } = useAuth()
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [filter, setFilter] = useState<'todas' | 'pendentes' | 'concluidas'>('todas')

  const fetchData = useCallback(async () => {
    const { data } = await db.from('atividades').select('*').order('created_at', { ascending: false })
    setAtividades((data ?? []) as Atividade[])
    setLoading(false)
  }, [])

  useEffect(() => { if (user) fetchData() }, [user, fetchData])

  const toggleConcluida = async (id: string, current: boolean) => {
    setAtividades(prev => prev.map(a => a.id === id ? { ...a, concluida: !current } : a))
    const { error } = await db.from('atividades').update({ concluida: !current }).eq('id', id)
    if (error) { toast.error('Erro'); fetchData() }
  }

  const handleSave = async (data: Record<string, unknown>) => {
    const { error } = await db.from('atividades').insert({ ...data, user_id: user!.id })
    if (error) { toast.error('Erro ao criar'); return }
    toast.success('Atividade criada')
    setModalOpen(false); fetchData()
  }

  const filtered = atividades.filter(a => {
    if (filter === 'pendentes') return !a.concluida
    if (filter === 'concluidas') return a.concluida
    return true
  })

  const pendentes = atividades.filter(a => !a.concluida).length

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Atividades</h1>
            <p className="text-sm text-white/40 mt-1">{pendentes} pendentes de {atividades.length} total</p>
          </div>
          <button onClick={() => setModalOpen(true)} className="btn-primary text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Nova Atividade</button>
        </div>

        <div className="flex gap-2">
          {(['todas', 'pendentes', 'concluidas'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-accent/15 text-accent border border-accent/25' : 'text-white/40 hover:text-white/60 border border-transparent'}`}>
              {f === 'todas' ? 'Todas' : f === 'pendentes' ? 'Pendentes' : 'Concluídas'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="glass-card h-16 animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={CalendarDays} title="Nenhuma atividade" description="Registre ligações, visitas e tarefas" action={{ label: '+ Nova Atividade', onClick: () => setModalOpen(true) }} />
        ) : (
          <div className="space-y-2">
            {filtered.map(a => {
              const Icon = TIPO_ICON[a.tipo] ?? CircleDot
              return (
                <div key={a.id} className="glass-card px-4 py-3 flex items-center gap-4 hover:border-glass-border-hover transition-all">
                  <button onClick={() => toggleConcluida(a.id, a.concluida)} className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${a.concluida ? 'bg-emerald-500/20 border-emerald-500/40' : 'border-white/15 hover:border-white/30'}`}>
                    {a.concluida && <Check className="w-3 h-3 text-emerald-400" />}
                  </button>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${a.concluida ? 'bg-white/3' : 'bg-accent/10'}`}>
                    <Icon className={`w-4 h-4 ${a.concluida ? 'text-white/20' : 'text-accent'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${a.concluida ? 'text-white/30 line-through' : 'text-white/80'}`}>{a.descricao}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <Badge className={a.concluida ? 'bg-white/5 text-white/25 border-white/8' : 'bg-accent/10 text-accent border-accent/20'}>
                        {ATIVIDADE_TIPO_LABEL[a.tipo as keyof typeof ATIVIDADE_TIPO_LABEL] ?? a.tipo}
                      </Badge>
                      {a.data_agendada && <span className="text-[11px] text-white/25 flex items-center gap-1"><Clock className="w-3 h-3" />{formatDateTime(a.data_agendada)}</span>}
                    </div>
                  </div>
                  <span className="text-[11px] text-white/20 flex-shrink-0">{formatDateTime(a.created_at)}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <AtividadeFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </AppLayout>
  )
}

function AtividadeFormModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (d: Record<string, unknown>) => void }) {
  const [tipo, setTipo] = useState('ligacao'); const [descricao, setDescricao] = useState(''); const [dataAgendada, setDataAgendada] = useState('')

  useEffect(() => { if (open) { setTipo('ligacao'); setDescricao(''); setDataAgendada('') } }, [open])

  const handleSubmit = () => {
    if (!descricao.trim()) { toast.error('Descrição é obrigatória'); return }
    onSave({ tipo, descricao, data_agendada: dataAgendada || null, concluida: false })
  }

  return (
    <Modal open={open} onClose={onClose} title="Nova Atividade" maxWidth="max-w-md">
      <div className="space-y-4">
        <div><label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Tipo</label>
          <select value={tipo} onChange={e => setTipo(e.target.value)} className="input-field">{Object.entries(ATIVIDADE_TIPO_LABEL).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select></div>
        <div><label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Descrição *</label>
          <textarea value={descricao} onChange={e => setDescricao(e.target.value)} className="input-field min-h-[80px] resize-none" placeholder="O que precisa ser feito..." /></div>
        <div><label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Data agendada</label>
          <input type="datetime-local" value={dataAgendada} onChange={e => setDataAgendada(e.target.value)} className="input-field" /></div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-ghost text-sm">Cancelar</button>
          <button onClick={handleSubmit} className="btn-primary text-sm">Criar</button>
        </div>
      </div>
    </Modal>
  )
}
