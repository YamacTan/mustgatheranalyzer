import type { LogEntry, Severity } from '../../types'
import { getSeverityColors } from '../../utils/logParser'

interface LogLineProps {
  entry: LogEntry
  searchTerm: string
  useRegex: boolean
  isHighlighted: boolean
}

// Arama terimi geçen kısımları vurgular; XSS'e karşı güvenli
function highlightText(text: string, term: string, useRegex: boolean): JSX.Element {
  if (!term) return <>{text}</>

  try {
    const regex = useRegex
      ? new RegExp(`(${term})`, 'gi')
      : new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')

    const parts = text.split(regex)

    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-yellow-400/30 text-yellow-200 rounded-sm">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    )
  } catch {
    // Geçersiz regex durumunda düz metin göster
    return <>{text}</>
  }
}

// Severity badge'i için kısa etiket
const SEVERITY_SHORT: Record<Severity, string> = {
  fatal: 'FTL',
  panic: 'PNC',
  error: 'ERR',
  exception: 'EXC',
  warning: 'WRN'
}

// Tek bir log satırı bileşeni
export function LogLine({ entry, searchTerm, useRegex, isHighlighted }: LogLineProps) {
  const colors = getSeverityColors(entry.severity)

  return (
    <div
      className={`
        flex items-start gap-0 text-[11px] font-mono
        border-b border-slate-800/20 hover:bg-slate-800/20 transition-colors
        ${isHighlighted ? `${colors.bg} ${colors.border} border-l-2` : ''}
      `}
    >
      {/* Satır numarası */}
      <span className="flex-shrink-0 w-10 text-right text-slate-600 py-1 px-2 select-none border-r border-slate-800/40">
        {entry.lineNumber}
      </span>

      {/* Severity etiketi */}
      <span className={`flex-shrink-0 px-1.5 py-1 font-bold ${colors.text} w-10 text-center border-r border-slate-800/40`}>
        {SEVERITY_SHORT[entry.severity]}
      </span>

      {/* Timestamp */}
      {entry.timestamp && (
        <span className="flex-shrink-0 px-2 py-1 text-slate-600 border-r border-slate-800/40 whitespace-nowrap">
          {entry.timestamp.slice(0, 19)}
        </span>
      )}

      {/* Log mesajı */}
      <span className={`flex-1 py-1 px-2 break-all ${isHighlighted ? colors.text : 'text-slate-300'}`}>
        {highlightText(entry.raw, searchTerm, useRegex)}
      </span>
    </div>
  )
}
