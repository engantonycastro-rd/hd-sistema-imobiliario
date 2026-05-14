import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return phone
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export const LEAD_STATUS_CONFIG = {
  novo:        { label: 'Novo',        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  contato:     { label: 'Contato',     color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  visita:      { label: 'Visita',      color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  proposta:    { label: 'Proposta',    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  negociacao:  { label: 'Negociação',  color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  ganho:       { label: 'Ganho',       color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  perdido:     { label: 'Perdido',     color: 'bg-red-500/20 text-red-400 border-red-500/30' },
} as const

export const IMOVEL_TIPO_LABEL = {
  casa: 'Casa',
  apartamento: 'Apartamento',
  terreno: 'Terreno',
  comercial: 'Comercial',
} as const

export const IMOVEL_STATUS_LABEL = {
  disponivel: 'Disponível',
  reservado: 'Reservado',
  vendido: 'Vendido',
} as const

export const ORIGEM_LABEL = {
  site: 'Site',
  instagram: 'Instagram',
  facebook: 'Facebook',
  whatsapp: 'WhatsApp',
  indicacao: 'Indicação',
  outro: 'Outro',
} as const

export const ATIVIDADE_TIPO_LABEL = {
  ligacao: 'Ligação',
  visita: 'Visita',
  proposta: 'Proposta',
  mensagem: 'Mensagem',
  reuniao: 'Reunião',
  outro: 'Outro',
} as const
