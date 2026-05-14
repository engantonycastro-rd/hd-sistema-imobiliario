// Tipos gerados pelo Supabase CLI — será atualizado conforme schema evolui
// Execute: npx supabase gen types typescript --project-id <PROJECT_ID> > src/types/database.ts

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          nome: string
          telefone: string | null
          role: 'admin' | 'gerente' | 'corretor'
          avatar_url: string | null
          ativo: boolean
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      imoveis: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          titulo: string
          descricao: string | null
          tipo: 'casa' | 'apartamento' | 'terreno' | 'comercial'
          status: 'disponivel' | 'reservado' | 'vendido'
          valor: number
          endereco: string
          bairro: string
          cidade: string
          uf: string
          quartos: number | null
          banheiros: number | null
          area_m2: number | null
          imagens: string[] | null
          corretor_id: string | null
        }
        Insert: Omit<Database['public']['Tables']['imoveis']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['imoveis']['Insert']>
      }
      leads: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          nome: string
          telefone: string
          email: string | null
          origem: 'site' | 'instagram' | 'facebook' | 'whatsapp' | 'indicacao' | 'outro'
          status: 'novo' | 'contato' | 'visita' | 'proposta' | 'negociacao' | 'ganho' | 'perdido'
          interesse: string | null
          observacoes: string | null
          corretor_id: string | null
          imovel_id: string | null
        }
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['leads']['Insert']>
      }
      atividades: {
        Row: {
          id: string
          created_at: string
          tipo: 'ligacao' | 'visita' | 'proposta' | 'mensagem' | 'reuniao' | 'outro'
          descricao: string
          lead_id: string | null
          imovel_id: string | null
          user_id: string
          data_agendada: string | null
          concluida: boolean
        }
        Insert: Omit<Database['public']['Tables']['atividades']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['atividades']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
