import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency, IMOVEL_TIPO_LABEL, IMOVEL_STATUS_LABEL } from '@/lib/utils'
import AppLayout from '@/components/layout/AppLayout'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Plus, Home, Search, MapPin, BedDouble, Bath, Maximize } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Database } from '@/types/database'

type Imovel = Database['public']['Tables']['imoveis']['Row']

const STATUS_COLORS = {
  disponivel: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  reservado: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  vendido: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}

export default function ImoveisPage() {
  const { user } = useAuth()
  const [imoveis, setImoveis] = useState<Imovel[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Imovel | null>(null)
  const [search, setSearch] = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('imoveis').select('*').order('created_at', { ascending: false })
    setImoveis(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { if (user) fetch() }, [user, fetch])

  const handleSave = async (formData: Partial<Imovel>) => {
    if (editing) {
      const { error } = await supabase.from('imoveis').update(formData).eq('id', editing.id)
      if (error) { toast.error('Erro ao salvar'); return }
      toast.success('Imóvel atualizado')
    } else {
      const { error } = await supabase.from('imoveis').insert(formData as Imovel)
      if (error) { toast.error('Erro ao criar'); return }
      toast.success('Imóvel cadastrado')
    }
    setModalOpen(false); setEditing(null); fetch()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este imóvel?')) return
    await supabase.from('imoveis').delete().eq('id', id)
    toast.success('Imóvel excluído'); fetch()
  }

  const filtered = imoveis.filter(i => {
    if (search && !i.titulo.toLowerCase().includes(search.toLowerCase()) && !i.bairro.toLowerCase().includes(search.toLowerCase())) return false
    if (filterTipo && i.tipo !== filterTipo) return false
    if (filterStatus && i.status !== filterStatus) return false
    return true
  })

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Imóveis</h1>
            <p className="text-sm text-white/40 mt-1">{imoveis.length} imóveis na carteira</p>
          </div>
          <button onClick={() => { setEditing(null); setModalOpen(true) }} className="btn-primary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Novo Imóvel
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por título ou bairro..." className="input-field pl-10 py-2 text-sm" />
          </div>
          <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} className="input-field py-2 text-sm w-auto">
            <option value="">Todos os tipos</option>
            {Object.entries(IMOVEL_TIPO_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field py-2 text-sm w-auto">
            <option value="">Todos os status</option>
            {Object.entries(IMOVEL_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <div key={i} className="glass-card h-[260px] animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Home} title="Nenhum imóvel" description="Cadastre imóveis para exibir aqui" action={{ label: '+ Novo Imóvel', onClick: () => setModalOpen(true) }} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((im) => (
              <div key={im.id} onClick={() => { setEditing(im); setModalOpen(true) }} className="glass-card overflow-hidden cursor-pointer hover:border-glass-border-hover transition-all group">
                <div className="h-36 bg-navy-700/50 flex items-center justify-center">
                  {im.imagens && im.imagens.length > 0
                    ? <img src={im.imagens[0]} alt={im.titulo} className="w-full h-full object-cover" />
                    : <Home className="w-10 h-10 text-white/10" />
                  }
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold truncate">{im.titulo}</h3>
                    <Badge className={STATUS_COLORS[im.status as keyof typeof STATUS_COLORS]}>
                      {IMOVEL_STATUS_LABEL[im.status as keyof typeof IMOVEL_STATUS_LABEL]}
                    </Badge>
                  </div>
                  <p className="text-xs text-white/40 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{im.bairro}, {im.cidade}</p>
                  <p className="font-display text-lg font-bold text-accent mt-2">{formatCurrency(Number(im.valor))}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-white/30">
                    {im.quartos != null && <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" />{im.quartos}</span>}
                    {im.banheiros != null && <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{im.banheiros}</span>}
                    {im.area_m2 != null && <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" />{im.area_m2}m²</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ImovelFormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }} imovel={editing} onSave={handleSave} onDelete={editing ? () => { handleDelete(editing.id); setModalOpen(false); setEditing(null) } : undefined} />
    </AppLayout>
  )
}

function ImovelFormModal({ open, onClose, imovel, onSave, onDelete }: {
  open: boolean; onClose: () => void; imovel: Imovel | null
  onSave: (d: Partial<Imovel>) => void; onDelete?: () => void
}) {
  const [titulo, setTitulo] = useState(''); const [tipo, setTipo] = useState('casa'); const [status, setStatus] = useState('disponivel')
  const [valor, setValor] = useState(''); const [endereco, setEndereco] = useState(''); const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('Natal'); const [uf, setUf] = useState('RN')
  const [quartos, setQuartos] = useState(''); const [banheiros, setBanheiros] = useState(''); const [area, setArea] = useState('')
  const [descricao, setDescricao] = useState('')

  useEffect(() => {
    if (imovel) {
      setTitulo(imovel.titulo); setTipo(imovel.tipo); setStatus(imovel.status); setValor(String(imovel.valor))
      setEndereco(imovel.endereco); setBairro(imovel.bairro); setCidade(imovel.cidade); setUf(imovel.uf)
      setQuartos(imovel.quartos != null ? String(imovel.quartos) : ''); setBanheiros(imovel.banheiros != null ? String(imovel.banheiros) : '')
      setArea(imovel.area_m2 != null ? String(imovel.area_m2) : ''); setDescricao(imovel.descricao ?? '')
    } else {
      setTitulo(''); setTipo('casa'); setStatus('disponivel'); setValor(''); setEndereco(''); setBairro('')
      setCidade('Natal'); setUf('RN'); setQuartos(''); setBanheiros(''); setArea(''); setDescricao('')
    }
  }, [imovel, open])

  const handleSubmit = () => {
    if (!titulo.trim()) { toast.error('Título é obrigatório'); return }
    onSave({
      titulo, tipo, status, valor: Number(valor) || 0, endereco, bairro, cidade, uf,
      quartos: quartos ? Number(quartos) : null, banheiros: banheiros ? Number(banheiros) : null,
      area_m2: area ? Number(area) : null, descricao: descricao || null,
    })
  }

  return (
    <Modal open={open} onClose={onClose} title={imovel ? 'Editar Imóvel' : 'Novo Imóvel'} maxWidth="max-w-lg">
      <div className="space-y-4">
        <div><label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Título *</label><input value={titulo} onChange={e => setTitulo(e.target.value)} className="input-field" placeholder="Ex: Casa 3 quartos Pajuçara" /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Tipo</label><select value={tipo} onChange={e => setTipo(e.target.value)} className="input-field">{Object.entries(IMOVEL_TIPO_LABEL).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <div><label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Status</label><select value={status} onChange={e => setStatus(e.target.value)} className="input-field">{Object.entries(IMOVEL_STATUS_LABEL).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <div><label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Valor (R$)</label><input type="number" value={valor} onChange={e => setValor(e.target.value)} className="input-field" placeholder="250000" /></div>
        </div>
        <div><label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Endereço</label><input value={endereco} onChange={e => setEndereco(e.target.value)} className="input-field" /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Bairro</label><input value={bairro} onChange={e => setBairro(e.target.value)} className="input-field" /></div>
          <div><label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Cidade</label><input value={cidade} onChange={e => setCidade(e.target.value)} className="input-field" /></div>
          <div><label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">UF</label><input value={uf} onChange={e => setUf(e.target.value)} className="input-field" maxLength={2} /></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Quartos</label><input type="number" value={quartos} onChange={e => setQuartos(e.target.value)} className="input-field" /></div>
          <div><label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Banheiros</label><input type="number" value={banheiros} onChange={e => setBanheiros(e.target.value)} className="input-field" /></div>
          <div><label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Área (m²)</label><input type="number" value={area} onChange={e => setArea(e.target.value)} className="input-field" /></div>
        </div>
        <div><label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Descrição</label><textarea value={descricao} onChange={e => setDescricao(e.target.value)} className="input-field min-h-[80px] resize-none" /></div>
        <div className="flex items-center justify-between pt-2">
          {onDelete ? <button onClick={onDelete} className="text-sm text-red-400/60 hover:text-red-400">Excluir</button> : <span />}
          <div className="flex gap-2"><button onClick={onClose} className="btn-ghost text-sm">Cancelar</button><button onClick={handleSubmit} className="btn-primary text-sm">{imovel ? 'Salvar' : 'Cadastrar'}</button></div>
        </div>
      </div>
    </Modal>
  )
}
