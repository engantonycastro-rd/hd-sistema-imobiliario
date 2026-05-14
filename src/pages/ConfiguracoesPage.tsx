import { useEffect, useState } from 'react'
import { db } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import AppLayout from '@/components/layout/AppLayout'
import { getInitials } from '@/lib/utils'
import { Save, User, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ConfiguracoesPage() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setNome(profile.nome)
      setTelefone(profile.telefone ?? '')
    }
  }, [profile])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    const { error } = await db.from('profiles').update({ nome, telefone: telefone || null }).eq('id', user.id)
    setSaving(false)
    if (error) { toast.error('Erro ao salvar'); return }
    toast.success('Perfil atualizado')
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-sm text-white/40 mt-1">Gerencie seu perfil e preferências</p>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-display text-sm font-semibold text-white/60 flex items-center gap-2 mb-5">
            <User className="w-4 h-4" /> Meu Perfil
          </h3>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-accent/15 border-2 border-accent/25 flex items-center justify-center">
              <span className="text-xl font-bold text-accent">{profile ? getInitials(profile.nome) : '?'}</span>
            </div>
            <div>
              <p className="font-medium">{profile?.nome}</p>
              <p className="text-sm text-white/40">{profile?.email}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Shield className="w-3 h-3 text-white/30" />
                <span className="text-xs text-white/30 capitalize">{profile?.role}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Nome</label>
              <input value={nome} onChange={e => setNome(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Telefone</label>
              <input value={telefone} onChange={e => setTelefone(e.target.value)} className="input-field" placeholder="(84) 99999-9999" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">E-mail</label>
              <input value={profile?.email ?? ''} disabled className="input-field opacity-50 cursor-not-allowed" />
              <p className="text-[11px] text-white/25 mt-1">O e-mail não pode ser alterado por aqui</p>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-2 mt-6">
            <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-display text-sm font-semibold text-white/60 mb-4">Sobre o Sistema</h3>
          <div className="space-y-2 text-sm text-white/40">
            <p>HD Imobiliária — Sistema de Gestão v0.1.0</p>
            <p>CRECI 6547-J — Zona Norte/RN</p>
            <p>Grupo Conexão</p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
