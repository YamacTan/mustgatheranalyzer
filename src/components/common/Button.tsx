import type { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  icon?: ReactNode
}

// Temel düğme bileşeni; variant ve size prop'larıyla şekillenir
export function Button({
  children,
  onClick,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  className = '',
  icon
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-midnight disabled:opacity-40 disabled:cursor-not-allowed'

  const variantClasses = {
    primary: 'bg-sky-600 hover:bg-sky-500 text-white focus:ring-sky-500 shadow-lg shadow-sky-900/20',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 focus:ring-slate-500',
    danger: 'bg-red-900/60 hover:bg-red-800/80 text-red-200 border border-red-800/50 focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 focus:ring-slate-500'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  )
}
