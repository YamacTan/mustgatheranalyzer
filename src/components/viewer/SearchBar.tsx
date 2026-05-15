import { Search, Regex, X, SlidersHorizontal } from 'lucide-react'
import type { ViewerFilter, Severity } from '../../types'

interface SearchBarProps {
  filter: ViewerFilter
  onFilterChange: (filter: Partial<ViewerFilter>) => void
  totalLines: number
  matchingLines: number
}

const ALL_SEVERITIES: Severity[] = ['fatal', 'panic', 'error', 'exception', 'warning']

const SEVERITY_LABELS: Record<Severity, string> = {
  fatal: 'Fatal',
  panic: 'Panic',
  error: 'Error',
  exception: 'Exception',
  warning: 'Warning'
}

const SEVERITY_TOGGLE_CLASSES: Record<Severity, string> = {
  fatal: 'bg-purple-900/60 text-purple-300 border-purple-700/50',
  panic: 'bg-fuchsia-900/60 text-fuchsia-300 border-fuchsia-700/50',
  error: 'bg-red-900/60 text-red-300 border-red-800/50',
  exception: 'bg-orange-900/60 text-orange-300 border-orange-800/50',
  warning: 'bg-yellow-900/60 text-yellow-300 border-yellow-800/50'
}

// Log viewer arama ve filtre çubuğu
export function SearchBar({ filter, onFilterChange, totalLines, matchingLines }: SearchBarProps) {
  const toggleSeverity = (severity: Severity) => {
    const current = new Set(filter.severities)
    current.has(severity) ? current.delete(severity) : current.add(severity)
    onFilterChange({ severities: Array.from(current) })
  }

  return (
    <div className="flex flex-col gap-2 p-3 border-b border-slate-800/60 bg-slate-950/50">
      {/* Arama satırı */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={filter.searchTerm}
            onChange={e => onFilterChange({ searchTerm: e.target.value })}
            placeholder={filter.useRegex ? 'Regex gir...' : 'Log satırında ara...'}
            className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg pl-7 pr-20 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-700 focus:ring-1 focus:ring-sky-800 font-mono"
          />

          {/* Regex ve temizle düğmeleri */}
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              onClick={() => onFilterChange({ useRegex: !filter.useRegex })}
              title="Regex modunu aç/kapat"
              className={`p-1 rounded transition-colors ${
                filter.useRegex
                  ? 'text-sky-400 bg-sky-900/40'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Regex size={12} />
            </button>
            {filter.searchTerm && (
              <button
                onClick={() => onFilterChange({ searchTerm: '' })}
                className="p-1 text-slate-500 hover:text-slate-300 rounded transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Yalnızca hatalı satırlar toggle */}
        <button
          onClick={() => onFilterChange({ showOnlyErrors: !filter.showOnlyErrors })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors flex-shrink-0 ${
            filter.showOnlyErrors
              ? 'bg-red-900/40 text-red-300 border-red-800/50'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-300'
          }`}
        >
          <SlidersHorizontal size={12} />
          Sadece hatalar
        </button>
      </div>

      {/* Severity filtre düğmeleri + eşleşme sayacı */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {ALL_SEVERITIES.map(sev => {
            const isActive = filter.severities.includes(sev)
            return (
              <button
                key={sev}
                onClick={() => toggleSeverity(sev)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                  isActive
                    ? SEVERITY_TOGGLE_CLASSES[sev]
                    : 'bg-transparent text-slate-600 border-slate-800 hover:border-slate-600 hover:text-slate-500'
                }`}
              >
                {SEVERITY_LABELS[sev]}
              </button>
            )
          })}
        </div>

        {/* Eşleşme istatistiği */}
        <span className="text-[10px] text-slate-600 flex-shrink-0">
          {matchingLines.toLocaleString('tr-TR')} / {totalLines.toLocaleString('tr-TR')} satır
        </span>
      </div>
    </div>
  )
}
