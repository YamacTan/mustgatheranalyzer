// Hata seviyesi türleri
export type Severity = 'fatal' | 'panic' | 'error' | 'exception' | 'warning'

// Tek bir log satırının yapısı
export interface LogEntry {
  lineNumber: number
  raw: string
  severity: Severity
  timestamp: string | null
  namespace: string
  podName: string
  containerName: string
  filePath: string
  fileName: string
  matchedKeyword: string
}

// Dosya sistemi ağaç düğümü
export interface FileNode {
  id: string
  name: string
  path: string
  type: 'directory' | 'file'
  children: FileNode[]
  // Dosya ise analiz edilen log girişleri
  logEntries?: LogEntry[]
  // Bu düğümün toplam hata sayısı (directory için özyinelemeli)
  errorCount: number
  fatalCount: number
  panicCount: number
  exceptionCount: number
  // Ağaç UI durumu
  handle?: FileSystemDirectoryHandle | FileSystemFileHandle
}

// Namespace bazlı özet
export interface NamespaceSummary {
  namespace: string
  totalErrors: number
  fatalCount: number
  panicCount: number
  errorCount: number
  exceptionCount: number
  warningCount: number
  affectedFiles: number
  affectedPods: string[]
}

// Pod bazlı özet
export interface PodSummary {
  namespace: string
  podName: string
  containers: ContainerSummary[]
  totalErrors: number
}

// Container bazlı özet
export interface ContainerSummary {
  containerName: string
  logFiles: string[]
  entries: LogEntry[]
  errorCount: number
}

// Zaman çizelgesi noktası
export interface TimelinePoint {
  timestamp: Date
  severity: Severity
  count: number
  namespace: string
  label: string
}

// Analiz sonucu: tüm uygulamanın global state'i
export interface AnalysisResult {
  rootPath: string
  totalFiles: number
  analyzedFiles: number
  totalEntries: number
  namespaceSummaries: NamespaceSummary[]
  podSummaries: PodSummary[]
  fileTree: FileNode[]
  allEntries: LogEntry[]
  timelinePoints: TimelinePoint[]
  analysisDate: string
}

// Görüntüleyici filtre durumu
export interface ViewerFilter {
  searchTerm: string
  useRegex: boolean
  severities: Severity[]
  showOnlyErrors: boolean
}

// Uygulama genel durumu
export type AppView = 'dashboard' | 'viewer' | 'welcome'

export interface AppState {
  view: AppView
  selectedFile: FileNode | null
  selectedNamespace: string | null
  isAnalyzing: boolean
  analysisProgress: number
  analysisResult: AnalysisResult | null
  error: string | null
}
