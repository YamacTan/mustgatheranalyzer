import type { TimelinePoint } from '../../types'

interface TimelineProps {
  points: TimelinePoint[]
}

// Severity → bar rengi
const SEVERITY_BAR: Record<string, string> = {
  fatal:     'bg-purple-500',
  panic:     'bg-fuchsia-500',
  error:     'bg-red-500',
  exception: 'bg-orange-500',
  warning:   'bg-yellow-500'
}

// Zaman çizelgesi grafiği: 5 dakikalık bucket'lara göre severity dağılımı
export function Timeline({ points }: TimelineProps) {
  if (points.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Hata Zaman Çizelgesi</h3>
        <div className="flex items-center justify-center h-24 text-slate-600 text-xs text-center leading-5">
          Log satırlarında tanınan formatta timestamp bulunamadı.
          <br />
          (ISO 8601, klog, syslog, JSON ts/time alanı desteklenir)
        </div>
      </div>
    )
  }

  // Görünür pencere: en fazla 120 bucket (fazlası kayar)
  const visible = points.slice(-120)
  const maxCount = Math.max(...visible.map(p => p.count), 1)

  // X ekseni etiket indeksleri — eşit aralıklı 4 nokta
  const step = Math.max(1, Math.floor(visible.length / 4))
  const labelIndices = Array.from({ length: 4 }, (_, i) => Math.min(i * step, visible.length - 1))
    .filter((v, i, arr) => arr.indexOf(v) === i)   // tekrar olmasın

  return (
    <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl p-4">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-200">Hata Zaman Çizelgesi</h3>
        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            {['fatal','panic','error','exception'].map(s => (
              <span key={s} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-sm inline-block ${SEVERITY_BAR[s]}`} />
                {s}
              </span>
            ))}
          </div>
          <span className="text-[10px] text-slate-600">{points.length} dilim</span>
        </div>
      </div>

      {/* Bar grafiği */}
      <div className="flex items-end gap-px h-24 w-full overflow-hidden">
        {visible.map((point, i) => {
          const heightPct = Math.max((point.count / maxCount) * 100, 3)
          const barColor  = SEVERITY_BAR[point.severity] ?? 'bg-slate-500'

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end group relative"
              style={{ minWidth: '2px' }}
            >
              {/* Hover tooltip */}
              <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2
                              opacity-0 group-hover:opacity-100 transition-opacity
                              z-20 pointer-events-none">
                <div className="bg-slate-800 border border-slate-600 rounded-lg
                                px-2.5 py-1.5 text-[10px] text-slate-200
                                whitespace-nowrap shadow-xl">
                  <div className="font-semibold text-slate-100 mb-0.5">{point.label}</div>
                  <div className={`${
                    point.severity === 'fatal'     ? 'text-purple-300' :
                    point.severity === 'panic'     ? 'text-fuchsia-300' :
                    point.severity === 'error'     ? 'text-red-300' :
                    point.severity === 'exception' ? 'text-orange-300' :
                                                     'text-yellow-300'
                  }`}>
                    {point.severity}: <span className="font-bold">{point.count}</span>
                  </div>
                </div>
              </div>

              {/* Bar */}
              <div
                className={`w-full ${barColor} rounded-t-sm opacity-70
                            hover:opacity-100 transition-all duration-75 cursor-default`}
                style={{ height: `${heightPct}%` }}
              />
            </div>
          )
        })}
      </div>

      {/* X ekseni etiketleri */}
      <div className="relative mt-1.5 h-3">
        {labelIndices.map(idx => {
          const pct = visible.length <= 1 ? 0 : (idx / (visible.length - 1)) * 100
          return (
            <span
              key={idx}
              className="absolute text-[9px] text-slate-600 -translate-x-1/2"
              style={{ left: `${pct}%` }}
            >
              {visible[idx]?.label ?? ''}
            </span>
          )
        })}
      </div>
    </div>
  )
}
