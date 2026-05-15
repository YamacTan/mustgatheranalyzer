import { AlertOctagon, Zap, Bug, Code2, AlertTriangle, FileSearch, Server, Layers } from 'lucide-react'
import type { AnalysisResult } from '../../types'

interface SummaryCardsProps {
  result: AnalysisResult
}

// Dashboard üst satırı: Genel istatistik kartları
export function SummaryCards({ result }: SummaryCardsProps) {
  const fatalCount = result.allEntries.filter(e => e.severity === 'fatal').length
  const panicCount = result.allEntries.filter(e => e.severity === 'panic').length
  const errorCount = result.allEntries.filter(e => e.severity === 'error').length
  const exceptionCount = result.allEntries.filter(e => e.severity === 'exception').length

  const cards = [
    {
      label: 'Fatal',
      value: fatalCount,
      icon: <AlertOctagon size={18} />,
      bg: 'bg-purple-950/50',
      border: 'border-purple-800/40',
      text: 'text-purple-300',
      iconBg: 'bg-purple-900/60',
      iconColor: 'text-purple-400',
      glow: 'shadow-purple-900/20'
    },
    {
      label: 'Panic',
      value: panicCount,
      icon: <Zap size={18} />,
      bg: 'bg-fuchsia-950/50',
      border: 'border-fuchsia-800/40',
      text: 'text-fuchsia-300',
      iconBg: 'bg-fuchsia-900/60',
      iconColor: 'text-fuchsia-400',
      glow: 'shadow-fuchsia-900/20'
    },
    {
      label: 'Error',
      value: errorCount,
      icon: <Bug size={18} />,
      bg: 'bg-red-950/50',
      border: 'border-red-800/40',
      text: 'text-red-300',
      iconBg: 'bg-red-900/60',
      iconColor: 'text-red-400',
      glow: 'shadow-red-900/20'
    },
    {
      label: 'Exception',
      value: exceptionCount,
      icon: <Code2 size={18} />,
      bg: 'bg-orange-950/50',
      border: 'border-orange-800/40',
      text: 'text-orange-300',
      iconBg: 'bg-orange-900/60',
      iconColor: 'text-orange-400',
      glow: 'shadow-orange-900/20'
    },
    {
      label: 'Toplam Hata',
      value: result.totalEntries,
      icon: <AlertTriangle size={18} />,
      bg: 'bg-slate-900/60',
      border: 'border-slate-700/40',
      text: 'text-slate-200',
      iconBg: 'bg-slate-800',
      iconColor: 'text-slate-400',
      glow: 'shadow-slate-900/10'
    },
    {
      label: 'Log Dosyası',
      value: result.analyzedFiles,
      icon: <FileSearch size={18} />,
      bg: 'bg-sky-950/40',
      border: 'border-sky-800/30',
      text: 'text-sky-300',
      iconBg: 'bg-sky-900/50',
      iconColor: 'text-sky-400',
      glow: 'shadow-sky-900/10'
    },
    {
      label: 'Namespace',
      value: result.namespaceSummaries.length,
      icon: <Layers size={18} />,
      bg: 'bg-emerald-950/40',
      border: 'border-emerald-800/30',
      text: 'text-emerald-300',
      iconBg: 'bg-emerald-900/50',
      iconColor: 'text-emerald-400',
      glow: 'shadow-emerald-900/10'
    },
    {
      label: 'Pod',
      value: result.podSummaries.length,
      icon: <Server size={18} />,
      bg: 'bg-indigo-950/40',
      border: 'border-indigo-800/30',
      text: 'text-indigo-300',
      iconBg: 'bg-indigo-900/50',
      iconColor: 'text-indigo-400',
      glow: 'shadow-indigo-900/10'
    }
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 mb-6">
      {cards.map(card => (
        <div
          key={card.label}
          className={`
            ${card.bg} border ${card.border} rounded-xl p-3.5
            shadow-lg ${card.glow} flex flex-col gap-2.5
          `}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-semibold uppercase tracking-widest ${card.text} opacity-70`}>
              {card.label}
            </span>
            <span className={`p-1.5 rounded-lg ${card.iconBg} ${card.iconColor}`}>
              {card.icon}
            </span>
          </div>
          <div className={`text-2xl font-bold font-display ${card.text}`}>
            {card.value.toLocaleString('tr-TR')}
          </div>
        </div>
      ))}
    </div>
  )
}
