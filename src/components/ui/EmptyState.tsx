import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-white/20" />
      </div>
      <h3 className="font-display text-base font-semibold text-white/60 mb-1">{title}</h3>
      <p className="text-sm text-white/30 max-w-xs">{description}</p>
      {action && (
        <button onClick={action.onClick} className="btn-primary text-sm mt-5">
          {action.label}
        </button>
      )}
    </div>
  )
}
