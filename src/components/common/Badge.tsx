import type { Severity } from '../../types'
import { getSeverityColors } from '../../utils/logParser'

interface BadgeProps {
  severity: Severity
  count?: number
  label?: string
  size?: 'sm' | 'md'
}

// Severity'ye göre renklendirilmiş badge bileşeni
export function SeverityBadge({ severity, count, label, size = 'md' }: BadgeProps) {
  const colors = getSeverityColors(severity)
  const displayLabel = label ?? severity.toUpperCase()
  const sizeClasses = size === 'sm'
    ? 'px-1.5 py-0.5 text-[10px]'
    : 'px-2 py-0.5 text-xs'

  return (
    <span className={`inline-flex items-center gap-1 rounded font-semibold ${sizeClasses} ${colors.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {displayLabel}
      {count !== undefined && (
        <span className="opacity-75">· {count.toLocaleString('tr-TR')}</span>
      )}
    </span>
  )
}

// Sayı vurgulama badge'i
interface CountBadgeProps {
  count: number
  variant?: 'error' | 'warning' | 'neutral' | 'info'
}

export function CountBadge({ count, variant = 'error' }: CountBadgeProps) {
  const variantClasses = {
    error: 'bg-red-900/60 text-red-300 border border-red-800/40',
    warning: 'bg-yellow-900/60 text-yellow-300 border border-yellow-800/40',
    neutral: 'bg-slate-800 text-slate-300 border border-slate-700',
    info: 'bg-sky-900/60 text-sky-300 border border-sky-800/40'
  }

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${variantClasses[variant]}`}>
      {count.toLocaleString('tr-TR')}
    </span>
  )
}
