import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }

    const fetch = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(data)
      setLoading(false)
    }
    fetch()
  }, [user])

  const isAdmin = profile?.role === 'admin'
  const isGerente = profile?.role === 'gerente'
  const isAdminOrGerente = isAdmin || isGerente

  return { profile, loading, isAdmin, isGerente, isAdminOrGerente }
}
