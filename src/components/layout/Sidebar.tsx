import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Home,
  CalendarDays,
  MessageSquare,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/leads', label: 'Leads', icon: Users },
  { to: '/imoveis', label: 'Imóveis', icon: Home },
  { to: '/equipe', label: 'Equipe', icon: Users },
  { to: '/atividades', label: 'Atividades', icon: CalendarDays },
  { to: '/mensagens', label: 'Mensagens', icon: MessageSquare },
]

export default function Sidebar() {
  const { signOut } = useAuth()

  return (
    <aside className="hidden lg:flex flex-col w-[260px] bg-navy-800/50 border-r border-white/5 px-4 py-6">
      {/* Logo */}
      <div className="px-2 mb-8">
        <svg viewBox="0 0 200 80" className="h-10 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="4" width="16" height="60" rx="2" fill="white" />
          <rect x="60" y="4" width="16" height="60" rx="2" fill="white" />
          <rect x="24" y="24" width="36" height="16" rx="2" fill="white" />
          <polygon points="32,24 36,19 40,24" fill="white" />
          <polygon points="42,24 46,19 50,24" fill="white" />
          <polygon points="52,24 56,19 60,24" fill="white" />
          <rect x="86" y="4" width="16" height="60" rx="2" fill="white" />
          <path d="M102 4 H124 Q154 4 154 34 Q154 64 124 64 H102 V48 H120 Q134 48 134 34 Q134 20 120 20 H102 Z" fill="white" />
          <text x="82" y="78" fontFamily="Outfit, sans-serif" fontSize="11" fontWeight="700" letterSpacing="5" fill="rgba(255,255,255,0.4)">IMOBILIÁRIA</text>
        </svg>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="w-[18px] h-[18px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="space-y-1 pt-4 border-t border-white/5">
        <NavLink
          to="/configuracoes"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <Settings className="w-[18px] h-[18px]" />
          Configurações
        </NavLink>
        <button
          onClick={signOut}
          className="sidebar-link w-full text-red-400/60 hover:text-red-400 hover:bg-red-400/5"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Sair
        </button>
      </div>
    </aside>
  )
}
