import { useState, useMemo, useRef, useCallback } from 'react'
import { ArrowLeft, FileText, Download, ChevronUp, ChevronDown } from 'lucide-react'
import type { FileNode, ViewerFilter, Severity } from '../../types'
import { SearchBar } from './SearchBar'
import { LogLine } from './LogLine'
import { Button } from '../common/Button'

interface LogViewerProps {
  fileNode: FileNode
  onBack: () => void
}

const DEFAULT_FILTER: ViewerFilter = {
  searchTerm: '',
  useRegex: false,
  severities: ['fatal', 'panic', 'error', 'exception', 'warning'],
  showOnlyErrors: true
}

// Log dosyası görüntüleyici: filtreleme, arama ve scroll desteği
export function LogViewer({ fileNode, onBack }: LogViewerProps) {
  const [filter, setFilter] = useState<ViewerFilter>(DEFAULT_FILTER)
  const [currentMatchIdx, setCurrentMatchIdx] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const entries = fileNode.logEntries ?? []

  // Filtre uygulanmış log girdileri
  const filtered = useMemo(() => {
    let result = entries

    // Yalnızca hatalı satırlar
    if (filter.showOnlyErrors) {
      result = result
    }

    // Severity filtresi
    result = result.filter(e => filter.severities.includes(e.severity as Severity))

    // Arama terimi
    if (filter.searchTerm.trim()) {
      try {
        const regex = filter.useRegex
          ? new RegExp(filter.searchTerm, 'gi')
          : new RegExp(filter.searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
        result = result.filter(e => regex.test(e.raw))
      } catch {
        // Geçersiz regex — tüm sonuçları göster
      }
    }

    return result
  }, [entries, filter])

  const handleFilterChange = useCallback((partial: Partial<ViewerFilter>) => {
    setFilter(prev => ({ ...prev, ...partial }))
    setCurrentMatchIdx(0)
  }, [])

  // Önceki / sonraki eşleşmeye git
  const goToPrevMatch = () => {
    setCurrentMatchIdx(prev => (prev - 1 + filtered.length) % filtered.length)
  }
  const goToNextMatch = () => {
    setCurrentMatchIdx(prev => (prev + 1) % filtered.length)
  }

  // Log dosyasını düz metin olarak indir
  const downloadLog = () => {
    const content = entries.map(e => e.raw).join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileNode.name
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const totalErrors = fileNode.errorCount + fileNode.fatalCount + fileNode.panicCount + fileNode.exceptionCount

  return (
    <div className="flex flex-col h-full">
      {/* Başlık çubuğu */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/60 bg-slate-950/80 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          icon={<ArrowLeft size={13} />}
        >
          Dashboard
        </Button>

        <div className="h-4 w-px bg-slate-700" />

        <FileText size={14} className="text-sky-400 flex-shrink-0" />
        <span className="text-sm font-mono text-slate-200 truncate flex-1">
          {fileNode.path}
        </span>

        <span className="text-xs text-red-400 font-semibold flex-shrink-0">
          {totalErrors.toLocaleString('tr-TR')} hata
        </span>

        {/* Eşleşme navigasyonu */}
        {filtered.length > 0 && (
          <div className="flex items-center gap-1 border border-slate-700 rounded-lg overflow-hidden flex-shrink-0">
            <button
              onClick={goToPrevMatch}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Önceki eşleşme"
            >
              <ChevronUp size={12} />
            </button>
            <span className="px-2 text-[10px] text-slate-500">
              {currentMatchIdx + 1}/{filtered.length}
            </span>
            <button
              onClick={goToNextMatch}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Sonraki eşleşme"
            >
              <ChevronDown size={12} />
            </button>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={downloadLog}
          icon={<Download size={13} />}
        >
          İndir
        </Button>
      </div>

      {/* Arama ve filtre çubuğu */}
      <SearchBar
        filter={filter}
        onFilterChange={handleFilterChange}
        totalLines={entries.length}
        matchingLines={filtered.length}
      />

      {/* Log satırları */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent bg-slate-950/40"
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-600 text-xs gap-2">
            <FileText size={24} className="opacity-30" />
            <span>Filtre kriterlerine uyan satır bulunamadı.</span>
          </div>
        ) : (
          filtered.map((entry, idx) => (
            <LogLine
              key={`${entry.lineNumber}-${idx}`}
              entry={entry}
              searchTerm={filter.searchTerm}
              useRegex={filter.useRegex}
              isHighlighted={idx === currentMatchIdx}
            />
          ))
        )}
      </div>
    </div>
  )
}
