import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { supabase } from '@/lib/supabase'
import { formatCurrency, LEAD_STATUS_CONFIG, formatDateTime } from '@/lib/utils'
import AppLayout from '@/components/layout/AppLayout'
import { Badge } from '@/components/ui/Badge'
import { TrendingUp, Users, Home, CalendarDays, ArrowUpRight, Clock } from 'lucide-react'

interface DashStats {
  totalLeads: number
  leadsNovos: number
  leadsGanhos: number
  totalImoveis: number
  imoveisDisponiveis: number
  valorCarteira: number
  atividadesPendentes: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const [stats, setStats] = useState<DashStats | null>(null)
  const [recentLeads, setRecentLeads] = useState<{ id: string; nome: string; status: string; created_at: string; origem: string }[]>([])
  const [recentActivities, setRecentActivities] = useState<{ id: string; tipo: string; descricao: string; created_at: string; concluida: boolean }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const [leadsRes, imoveisRes, atividadesRes, rLeads, rAct] = await Promise.all([
        supabase.from('leads').select('status'),
        supabase.from('imoveis').select('status, valor'),
        supabase.from('atividades').select('id', { count: 'exact' }).eq('concluida', false),
        supabase.from('leads').select('id, nome, status, created_at, origem').order('created_at', { ascending: false }).limit(5),
        supabase.from('atividades').select('id, tipo, descricao, created_at, concluida').order('created_at', { ascending: false }).limit(5),
      ])
      const leads = leadsRes.data ?? []
      const imoveis = imoveisRes.data ?? []
      setStats({
        totalLeads: leads.length,
        leadsNovos: leads.filter(l => l.status === 'novo').length,
        leadsGanhos: leads.filter(l => l.status === 'ganho').length,
        totalImoveis: imoveis.length,
        imoveisDisponiveis: imoveis.filter(i => i.status === 'disponivel').length,
        valorCarteira: imoveis.filter(i => i.status === 'disponivel').reduce((s, i) => s + Number(i.valor), 0),
        atividadesPendentes: atividadesRes.count ?? 0,
      })
      setRecentLeads(rLeads.data ?? [])
      setRecentActivities(rAct.data ?? [])
      setLoading(false)
    }
    load()
  }, [user])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  const statCards = stats ? [
    { label: 'Leads total', value: String(stats.totalLeads), sub: `${stats.leadsNovos} novos`, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Imóveis disponíveis', value: String(stats.imoveisDisponiveis), sub: `${stats.totalImoveis} total`, icon: Home, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Valor da carteira', value: formatCurrency(stats.valorCarteira), sub: 'imóveis disponíveis', icon: TrendingUp, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Pendentes', value: String(stats.atividadesPendentes), sub: 'atividades a concluir', icon: CalendarDays, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  ] : []

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {greeting()}, {profile?.nome?.split(' ')[0] ?? 'Corretor'}
          </h1>
          <p className="text-sm text-white/40 mt-1">Resumo da sua imobiliária</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="glass-card p-5 h-[110px] animate-pulse" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((s) => (
                <div key={s.label} className="glass-card p-5 hover:border-glass-border-hover transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-white/40 font-medium">{s.label}</span>
                    <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                      <s.icon className={`w-4 h-4 ${s.color}`} />
                    </div>
                  </div>
                  <p className="font-display text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-white/30 mt-1">{s.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-sm font-semibold text-white/60">Leads recentes</h3>
                  <a href="/leads" className="text-xs text-accent flex items-center gap-1 hover:text-accent-hover">Ver todos <ArrowUpRight className="w-3 h-3" /></a>
                </div>
                {recentLeads.length === 0 ? (
                  <p className="text-sm text-white/20 text-center py-8">Nenhum lead cadastrado ainda</p>
                ) : (
                  <div className="space-y-2">
                    {recentLeads.map((lead) => {
                      const cfg = LEAD_STATUS_CONFIG[lead.status as keyof typeof LEAD_STATUS_CONFIG]
                      return (
                        <div key={lead.id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                          <div><p className="text-sm font-medium">{lead.nome}</p><p className="text-xs text-white/30">{lead.origem} • {formatDateTime(lead.created_at)}</p></div>
                          <Badge className={cfg?.color}>{cfg?.label ?? lead.status}</Badge>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-sm font-semibold text-white/60">Atividades</h3>
                  <a href="/atividades" className="text-xs text-accent flex items-center gap-1 hover:text-accent-hover">Ver todas <ArrowUpRight className="w-3 h-3" /></a>
                </div>
                {recentActivities.length === 0 ? (
                  <p className="text-sm text-white/20 text-center py-8">Nenhuma atividade registrada</p>
                ) : (
                  <div className="space-y-2">
                    {recentActivities.map((a) => (
                      <div key={a.id} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.concluida ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        <div className="min-w-0"><p className="text-sm text-white/70 truncate">{a.descricao}</p><p className="text-xs text-white/30 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" />{formatDateTime(a.created_at)}</p></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
