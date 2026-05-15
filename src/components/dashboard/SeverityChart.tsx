import type { NamespaceSummary } from '../../types'

interface SeverityChartProps {
  summaries: NamespaceSummary[]
  onNamespaceClick?: (namespace: string) => void
}

// Yatay bar chart: namespace bazlı severity dağılımı
export function SeverityChart({ summaries, onNamespaceClick }: SeverityChartProps) {
  const top = summaries.slice(0, 10)
  const maxTotal = Math.max(...top.map(s => s.totalErrors), 1)

  // Segment genişliğini yüzde olarak hesapla
  const pct = (val: number, total: number) =>
    total === 0 ? 0 : Math.round((val / total) * 100)

  return (
    <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200">Namespace Bazlı Hata Dağılımı</h3>
        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-purple-500 inline-block" /> Fatal
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-fuchsia-500 inline-block" /> Panic
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-red-500 inline-block" /> Error
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-orange-500 inline-block" /> Exception
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {top.map(ns => {
          const barWidth = pct(ns.totalErrors, maxTotal)
          const totalForPercent = ns.totalErrors || 1

          return (
            <div
              key={ns.namespace}
              className="group cursor-pointer"
              onClick={() => onNamespaceClick?.(ns.namespace)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-300 font-mono truncate max-w-[200px] group-hover:text-sky-400 transition-colors">
                  {ns.namespace}
                </span>
                <span className="text-xs text-slate-500 font-semibold ml-2 flex-shrink-0">
                  {ns.totalErrors.toLocaleString('tr-TR')}
                </span>
              </div>

              {/* Stacked bar */}
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden w-full">
                <div
                  className="h-full flex rounded-full overflow-hidden transition-all duration-300"
                  style={{ width: `${barWidth}%` }}
                >
                  {ns.fatalCount > 0 && (
                    <div
                      className="bg-purple-500 h-full"
                      style={{ width: `${pct(ns.fatalCount, totalForPercent)}%` }}
                      title={`Fatal: ${ns.fatalCount}`}
                    />
                  )}
                  {ns.panicCount > 0 && (
                    <div
                      className="bg-fuchsia-500 h-full"
                      style={{ width: `${pct(ns.panicCount, totalForPercent)}%` }}
                      title={`Panic: ${ns.panicCount}`}
                    />
                  )}
                  {ns.errorCount > 0 && (
                    <div
                      className="bg-red-500 h-full"
                      style={{ width: `${pct(ns.errorCount, totalForPercent)}%` }}
                      title={`Error: ${ns.errorCount}`}
                    />
                  )}
                  {ns.exceptionCount > 0 && (
                    <div
                      className="bg-orange-500 h-full"
                      style={{ width: `${pct(ns.exceptionCount, totalForPercent)}%` }}
                      title={`Exception: ${ns.exceptionCount}`}
                    />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
