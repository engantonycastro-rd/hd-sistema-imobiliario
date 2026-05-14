import AppLayout from '@/components/layout/AppLayout'

export default function EquipePage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Equipe</h1>
            <p className="text-sm text-white/40 mt-1">Corretores e desempenho da equipe</p>
          </div>
          <button className="btn-primary text-sm">+ Convidar Corretor</button>
        </div>

        <div className="glass-card p-8 min-h-[500px] flex items-center justify-center">
          <p className="text-white/20 text-sm">Lista de corretores — em desenvolvimento</p>
        </div>
      </div>
    </AppLayout>
  )
}
