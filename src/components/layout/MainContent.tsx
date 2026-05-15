import type { AppState } from '../../types'
import { Dashboard } from '../dashboard/Dashboard'
import { LogViewer } from '../viewer/LogViewer'

interface MainContentProps {
  state: AppState
  onNamespaceSelect: (namespace: string | null) => void
  onFileSelect: (fileId: string) => void
  onBack: () => void
}

// Sağ ana içerik alanı: dashboard veya log viewer görünümünü seçer
export function MainContent({ state, onNamespaceSelect, onFileSelect, onBack }: MainContentProps) {
  const { view, analysisResult, selectedFile, selectedNamespace } = state

  if (view === 'viewer' && selectedFile) {
    return (
      <div className="flex-1 overflow-hidden min-h-0">
        <LogViewer fileNode={selectedFile} onBack={onBack} />
      </div>
    )
  }

  if (view === 'dashboard' && analysisResult) {
    return (
      <div className="flex-1 overflow-hidden min-h-0">
        <Dashboard
          result={analysisResult}
          selectedNamespace={selectedNamespace}
          onNamespaceSelect={onNamespaceSelect}
          onFileSelect={onFileSelect}
        />
      </div>
    )
  }

  // Fallback: boş durum
  return null
}
