import { useState } from 'react'
import { ChevronDown, ChevronRight, Server, Box, FileText } from 'lucide-react'
import type { PodSummary } from '../../types'
import { SeverityBadge } from '../common/Badge'

interface PodTableProps {
  podSummaries: PodSummary[]
  selectedNamespace: string | null
  onFileSelect?: (fileId: string) => void
}

// Pod ve container bazlı hata detay tablosu
export function PodTable({ podSummaries, selectedNamespace, onFileSelect }: PodTableProps) {
  const [expandedPods, setExpandedPods] = useState<Set<string>>(new Set())

  // Namespace filtresi uygulandıysa daralt
  const filtered = selectedNamespace
    ? podSummaries.filter(p => p.namespace === selectedNamespace)
    : podSummaries

  const togglePod = (key: string) => {
    setExpandedPods(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Server size={15} className="text-indigo-400" />
          Pod / Container Detayları
        </h3>
        <span className="text-[10px] text-slate-500">
          {filtered.length} pod
          {selectedNamespace && ` · ${selectedNamespace}`}
        </span>
      </div>

      <div className="space-y-1.5 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pr-1">
        {filtered.length === 0 ? (
          <div className="text-center text-slate-600 text-xs py-8">
            Seçilen namespace için pod bulunamadı.
          </div>
        ) : (
          filtered.map(pod => {
            const podKey = `${pod.namespace}/${pod.podName}`
            const isExpanded = expandedPods.has(podKey)

            return (
              <div key={podKey} className="border border-slate-800/40 rounded-lg overflow-hidden">
                {/* Pod başlık satırı */}
                <button
                  onClick={() => togglePod(podKey)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 bg-slate-800/40 hover:bg-slate-800/70 transition-colors text-left"
                >
                  {isExpanded
                    ? <ChevronDown size={13} className="text-slate-500 flex-shrink-0" />
                    : <ChevronRight size={13} className="text-slate-500 flex-shrink-0" />
                  }
                  <Server size={13} className="text-indigo-400 flex-shrink-0" />
                  <span className="text-xs font-mono text-slate-300 flex-1 truncate">
                    <span className="text-slate-500">{pod.namespace} / </span>
                    <span className="font-semibold text-slate-200">{pod.podName}</span>
                  </span>
                  <span className="text-xs text-red-400 font-bold flex-shrink-0">
                    {pod.totalErrors.toLocaleString('tr-TR')} hata
                  </span>
                </button>

                {/* Container detayları */}
                {isExpanded && (
                  <div className="border-t border-slate-800/40">
                    {pod.containers.map(container => (
                      <div
                        key={container.containerName}
                        className="px-3 py-2.5 border-b border-slate-800/30 last:border-0"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Box size={12} className="text-sky-400 flex-shrink-0" />
                          <span className="text-xs font-mono text-sky-300">
                            {container.containerName}
                          </span>
                          <span className="text-[10px] text-slate-600">
                            {container.errorCount} hata · {container.logFiles.length} dosya
                          </span>
                        </div>

                        {/* Son 5 hata girişi */}
                        <div className="space-y-1 ml-4">
                          {container.entries.slice(0, 5).map((entry, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <SeverityBadge severity={entry.severity} size="sm" />
                              <span className="text-[10px] font-mono text-slate-400 truncate flex-1">
                                {entry.raw.slice(0, 120)}
                              </span>
                            </div>
                          ))}
                          {container.entries.length > 5 && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  // İlgili dosyayı bul ve seç
                                  const firstFile = container.logFiles[0]
                                  if (firstFile && onFileSelect) {
                                    onFileSelect(firstFile)
                                  }
                                }}
                                className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
                              >
                                <FileText size={9} />
                                +{container.entries.length - 5} satır daha — görüntüle
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
