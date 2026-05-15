import type { AnalysisResult } from '../../types'
import { SummaryCards } from './SummaryCards'
import { SeverityChart } from './SeverityChart'
import { NamespaceCards } from './NamespaceCards'
import { PodTable } from './PodTable'

interface DashboardProps {
  result: AnalysisResult
  selectedNamespace: string | null
  onNamespaceSelect: (namespace: string | null) => void
  onFileSelect: (fileId: string) => void
}

// Ana dashboard bileşeni: tüm dashboard widget'larını düzenler
export function Dashboard({ result, selectedNamespace, onNamespaceSelect, onFileSelect }: DashboardProps) {
  // Namespace filtresi uygulanmışsa ilgili girişleri daralt
  const filteredResult = selectedNamespace
    ? {
        ...result,
        allEntries: result.allEntries.filter(e => e.namespace === selectedNamespace),
        timelinePoints: result.timelinePoints.filter(p => p.namespace === selectedNamespace)
      }
    : result

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
      {/* Filtre başlığı */}
      {selectedNamespace && (
        <div className="flex items-center gap-2 py-2 px-3 bg-sky-900/20 border border-sky-800/30 rounded-lg">
          <span className="text-xs text-sky-400 font-semibold">Namespace filtresi:</span>
          <code className="text-xs text-sky-300">{selectedNamespace}</code>
          <button
            onClick={() => onNamespaceSelect(null)}
            className="text-[10px] text-slate-500 hover:text-slate-300 ml-auto transition-colors"
          >
            Temizle
          </button>
        </div>
      )}

      {/* Üst metrik kartları */}
      <SummaryCards result={filteredResult} />

      {/* Orta bölüm: 2 kolon */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SeverityChart
          summaries={filteredResult.namespaceSummaries}
          onNamespaceClick={onNamespaceSelect}
        />
        <NamespaceCards
          summaries={result.namespaceSummaries}
          selectedNamespace={selectedNamespace}
          onNamespaceSelect={onNamespaceSelect}
        />
      </div>

      {/* Alt bölüm: Pod/Container tablosu — tam genişlik */}
      <PodTable
        podSummaries={result.podSummaries}
        selectedNamespace={selectedNamespace}
        onFileSelect={onFileSelect}
      />
    </div>
  )
}
