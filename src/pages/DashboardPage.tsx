import { useAuth } from '@/hooks/useAuth'
import AppLayout from '@/components/layout/AppLayout'
import { TrendingUp, Users, Home, CalendarDays } from 'lucide-react'

const stats = [
  { label: 'Leads este mês', value: '—', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { label: 'Imóveis ativos', value: '—', icon: Home, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { label: 'Visitas agendadas', value: '—', icon: CalendarDays, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { label: 'Vendas no mês', value: '—', icon: TrendingUp, color: 'text-accent', bg: 'bg-accent/10' },
]

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-white/40 mt-1">
            Bem-vindo, {user?.email?.split('@')[0] ?? 'Corretor'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/40 font-medium">{s.label}</span>
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
              <p className="font-display text-3xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Placeholder Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 glass-card p-6 min-h-[300px] flex items-center justify-center">
            <p className="text-white/20 text-sm">Gráfico de performance — em breve</p>
          </div>
          <div className="glass-card p-6 min-h-[300px] flex items-center justify-center">
            <p className="text-white/20 text-sm">Atividades recentes — em breve</p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
