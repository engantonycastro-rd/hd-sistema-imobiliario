import AppLayout from '@/components/layout/AppLayout'

export default function ImoveisPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Imóveis</h1>
            <p className="text-sm text-white/40 mt-1">Catálogo de imóveis da carteira</p>
          </div>
          <button className="btn-primary text-sm">+ Novo Imóvel</button>
        </div>

        <div className="glass-card p-8 min-h-[500px] flex items-center justify-center">
          <p className="text-white/20 text-sm">Grid de imóveis — em desenvolvimento</p>
        </div>
      </div>
    </AppLayout>
  )
}
