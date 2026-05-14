import { Search, Bell } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function TopBar() {
  const { user } = useAuth()
  const initials = user?.email?.substring(0, 2).toUpperCase() ?? 'HD'

  return (
    <header className="h-16 border-b border-white/5 bg-navy-800/30 backdrop-blur-md flex items-center justify-between px-6 lg:px-8 flex-shrink-0">
      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
        <input
          type="text"
          placeholder="Buscar leads, imóveis..."
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/8 rounded-lg text-sm text-white placeholder:text-white/25 outline-none focus:border-white/15 transition-colors"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
          <Bell className="w-[18px] h-[18px] text-white/40" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
        </button>

        <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
          <span className="text-xs font-bold text-accent">{initials}</span>
        </div>
      </div>
    </header>
  )
}
