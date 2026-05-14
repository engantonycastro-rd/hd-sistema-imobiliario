import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { getInitials } from '@/lib/utils'
import AppLayout from '@/components/layout/AppLayout'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Users, Trophy, Target, TrendingDown } from 'lucide-react'

interface TeamMember {
  id: string; nome: string; email: string; role: string; telefone: string | null; avatar_url: string | null; ativo: boolean
  total_leads: number; leads_ganhos: number; leads_perdidos: number; leads_ativos: number
}

const ROLE_BADGE = {
  admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  gerente: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  corretor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}

export default function EquipePage() {
  const { user } = useAuth()
  useProfile() // hook carregado para contexto
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data: profiles } = await supabase.from('profiles').select('*').eq('ativo', true).order('nome')
      if (!profiles) { setLoading(false); return }

      const { data: leads } = await supabase.from('leads').select('*')

      const members: TeamMember[] = profiles.map(p => {
        const myLeads = (leads ?? []).filter(l => l.corretor_id === p.id)
        return {
          id: p.id, nome: p.nome, email: p.email, role: p.role, telefone: p.telefone, avatar_url: p.avatar_url, ativo: p.ativo,
          total_leads: myLeads.length,
          leads_ganhos: myLeads.filter(l => l.status === 'ganho').length,
          leads_perdidos: myLeads.filter(l => l.status === 'perdido').length,
          leads_ativos: myLeads.filter(l => !['ganho', 'perdido'].includes(l.status)).length,
        }
      })

      setTeam(members)
      setLoading(false)
    }
    load()
  }, [user])

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Equipe</h1>
          <p className="text-sm text-white/40 mt-1">{team.length} membros ativos</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="glass-card h-[200px] animate-pulse" />)}</div>
        ) : team.length === 0 ? (
          <EmptyState icon={Users} title="Nenhum membro" description="Crie usuários no Supabase para exibir aqui" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.map((m) => {
              const convRate = m.total_leads > 0 ? Math.round((m.leads_ganhos / m.total_leads) * 100) : 0
              return (
                <div key={m.id} className="glass-card p-5 hover:border-glass-border-hover transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center flex-shrink-0">
                      {m.avatar_url
                        ? <img src={m.avatar_url} alt={m.nome} className="w-full h-full rounded-full object-cover" />
                        : <span className="text-sm font-bold text-accent">{getInitials(m.nome)}</span>
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{m.nome}</p>
                      <p className="text-xs text-white/30 truncate">{m.email}</p>
                    </div>
                    <Badge className={ROLE_BADGE[m.role as keyof typeof ROLE_BADGE] ?? ROLE_BADGE.corretor}>
                      {m.role}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="py-2 rounded-lg bg-white/3">
                      <Target className="w-3.5 h-3.5 mx-auto mb-1 text-blue-400" />
                      <p className="text-sm font-bold">{m.total_leads}</p>
                      <p className="text-[10px] text-white/30">Total</p>
                    </div>
                    <div className="py-2 rounded-lg bg-white/3">
                      <Trophy className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-400" />
                      <p className="text-sm font-bold">{m.leads_ganhos}</p>
                      <p className="text-[10px] text-white/30">Ganhos</p>
                    </div>
                    <div className="py-2 rounded-lg bg-white/3">
                      <TrendingDown className="w-3.5 h-3.5 mx-auto mb-1 text-red-400" />
                      <p className="text-sm font-bold">{m.leads_perdidos}</p>
                      <p className="text-[10px] text-white/30">Perdidos</p>
                    </div>
                    <div className="py-2 rounded-lg bg-white/3">
                      <p className="text-sm font-bold text-accent mt-1">{convRate}%</p>
                      <p className="text-[10px] text-white/30">Conversão</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
