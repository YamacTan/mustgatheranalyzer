import { Layers, Server, FileText, ChevronRight } from 'lucide-react'
import type { NamespaceSummary } from '../../types'
import { SeverityBadge } from '../common/Badge'

interface NamespaceCardsProps {
  summaries: NamespaceSummary[]
  selectedNamespace: string | null
  onNamespaceSelect: (namespace: string | null) => void
}

// Namespace bazlı özet kart listesi
export function NamespaceCards({ summaries, selectedNamespace, onNamespaceSelect }: NamespaceCardsProps) {
  return (
    <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Layers size={15} className="text-emerald-400" />
          Namespace Özetleri
        </h3>
        {selectedNamespace && (
          <button
            onClick={() => onNamespaceSelect(null)}
            className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            Filtreyi temizle
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pr-1">
        {summaries.map(ns => {
          const isSelected = selectedNamespace === ns.namespace

          return (
            <button
              key={ns.namespace}
              onClick={() => onNamespaceSelect(isSelected ? null : ns.namespace)}
              className={`
                w-full text-left rounded-lg p-3 border transition-all duration-150
                ${isSelected
                  ? 'bg-sky-900/30 border-sky-700/50 shadow-inner'
                  : 'bg-slate-800/40 border-slate-700/30 hover:bg-slate-800/70 hover:border-slate-600/50'
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200 font-mono truncate max-w-[180px]">
                    {ns.namespace}
                  </span>
                  {isSelected && (
                    <span className="text-[9px] text-sky-400 border border-sky-700/50 rounded px-1 py-0.5">
                      Seçili
                    </span>
                  )}
                </div>
                <ChevronRight size={12} className={`text-slate-600 transition-transform ${isSelected ? 'rotate-90 text-sky-500' : ''}`} />
              </div>

              {/* Severity badge'leri */}
              <div className="flex flex-wrap gap-1 mb-2">
                {ns.fatalCount > 0 && <SeverityBadge severity="fatal" count={ns.fatalCount} size="sm" />}
                {ns.panicCount > 0 && <SeverityBadge severity="panic" count={ns.panicCount} size="sm" />}
                {ns.errorCount > 0 && <SeverityBadge severity="error" count={ns.errorCount} size="sm" />}
                {ns.exceptionCount > 0 && <SeverityBadge severity="exception" count={ns.exceptionCount} size="sm" />}
              </div>

              {/* Alt istatistikler */}
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <FileText size={9} />
                  {ns.affectedFiles} dosya
                </span>
                <span className="flex items-center gap-1">
                  <Server size={9} />
                  {ns.affectedPods.length} pod
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
