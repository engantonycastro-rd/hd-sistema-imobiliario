import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Mail, Lock, Users, Home, PieChart, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Preencha todos os campos')
      return
    }

    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)

    if (error) {
      toast.error('E-mail ou senha incorretos')
    } else {
      navigate('/dashboard')
    }
  }

  const features = [
    { icon: Users, title: 'CRM de Leads', desc: 'Kanban visual e automações' },
    { icon: Home, title: 'Catálogo de Imóveis', desc: 'Fotos, vídeos e filtros' },
    { icon: PieChart, title: 'Dashboard', desc: 'Métricas em tempo real' },
    { icon: Phone, title: 'WhatsApp', desc: 'Integração direta' },
  ]

  return (
    <div className="relative min-h-screen flex overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute -top-[30%] -right-[20%] w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(circle,rgba(232,101,10,0.08)_0%,transparent_70%)] animate-[float_20s_ease-in-out_infinite]" />
        <div className="absolute -bottom-[20%] -left-[15%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(26,58,95,0.25)_0%,transparent_70%)] animate-[float_25s_ease-in-out_infinite_reverse]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
          }}
        />
      </div>

      {/* LEFT: Login Panel */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full lg:w-[520px] lg:flex-shrink-0 px-6 sm:px-10 py-10">
        {/* Divider line (desktop) */}
        <div className="hidden lg:block absolute right-0 top-[10%] h-[80%] w-px bg-gradient-to-b from-transparent via-white/8 to-transparent" />

        {/* Logo */}
        <div className="mb-12 text-center animate-fade-down">
          <svg viewBox="0 0 200 80" className="h-16 w-auto mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
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

        {/* Login Card */}
        <div className="w-full max-w-[400px] glass-card p-8 sm:p-10 animate-fade-up relative overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

          <div className="text-center mb-8">
            <h2 className="font-display text-xl font-bold tracking-tight">Bem-vindo de volta</h2>
            <p className="text-sm text-white/50 mt-1">Acesse o sistema de gestão</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/25 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="input-field pl-11"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/25 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-11"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-white/50">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/10 bg-navy-900/60 text-accent focus:ring-accent/20 accent-accent"
                />
                Lembrar de mim
              </label>
              <a href="#" className="text-sm text-accent font-medium hover:text-accent-hover transition-colors">
                Esqueci a senha
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-[11px] text-white/25 uppercase tracking-widest">ou</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <p className="text-center text-sm text-white/50">
            Novo corretor?{' '}
            <a href="#" className="text-accent font-semibold hover:text-accent-hover transition-colors">
              Solicite acesso
            </a>
          </p>
        </div>

        {/* Footer */}
        <p className="absolute bottom-6 text-[11px] text-white/25 tracking-wide">
          HD Imobiliária — CRECI 6547-J • Grupo Conexão
        </p>
      </div>

      {/* RIGHT: Branding Panel (desktop only) */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center px-16 relative z-10">
        <div className="max-w-[560px] animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-[11px] font-semibold text-accent uppercase tracking-[1.5px] mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Sistema Ativo
          </div>

          <h1 className="font-display text-5xl font-extrabold leading-[1.1] tracking-tight mb-5">
            Gestão Imobiliária
            <br />
            <span className="text-gradient-accent">& Comercial</span>
            <br />
            Inteligente
          </h1>

          <p className="text-base leading-relaxed text-white/50 mb-10 max-w-[440px]">
            Gerencie leads, imóveis, equipe e vendas em um ecossistema
            completo dedicado à sua imobiliária.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f.title} className="glass-card-hover flex items-start gap-3 p-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                  <f.icon className="w-[18px] h-[18px] text-accent" />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold tracking-tight">{f.title}</h4>
                  <span className="text-[11.5px] text-white/30">{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
