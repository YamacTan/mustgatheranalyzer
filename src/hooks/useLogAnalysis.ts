import { useState, useCallback } from 'react'
import type { AnalysisResult, AppState } from '../types'
import { buildFileTree, findNodeById } from '../utils/fileTree'
import {
  buildNamespaceSummaries,
  buildPodSummaries,
  buildTimelinePoints
} from '../utils/logParser'

const INITIAL_STATE: AppState = {
  view: 'welcome',
  selectedFile: null,
  selectedNamespace: null,
  isAnalyzing: false,
  analysisProgress: 0,
  analysisResult: null,
  error: null
}

export interface UseLogAnalysisReturn {
  state: AppState
  startAnalysis: (
    namespacesDir: FileSystemDirectoryHandle,
    rootName: string
  ) => Promise<void>
  selectFile: (fileId: string) => void
  selectNamespace: (namespace: string | null) => void
  resetAnalysis: () => void
  goToDashboard: () => void
}

export function useLogAnalysis(): UseLogAnalysisReturn {
  const [state, setState] = useState<AppState>(INITIAL_STATE)

  // Analizi başlatır: namespaces dizinini tarar, logları parse eder, sonuçları state'e yazar
  const startAnalysis = useCallback(async (
    namespacesDir: FileSystemDirectoryHandle,
    rootName: string
  ) => {
    setState(prev => ({
      ...prev,
      isAnalyzing: true,
      analysisProgress: 0,
      error: null,
      view: 'welcome'
    }))

    try {
      // Progress callback: her .log dosyası tarandığında UI'ı güncelle
      const onProgress = (count: number) => {
        setState(prev => ({ ...prev, analysisProgress: count }))
      }

      const { nodes, allEntries, fileCount } = await buildFileTree(
        namespacesDir,
        ['namespaces'],
        onProgress
      )

      // Özet yapıları oluştur
      const namespaceSummaries = buildNamespaceSummaries(allEntries)
      const podSummaries = buildPodSummaries(allEntries)
      const timelinePoints = buildTimelinePoints(allEntries)

      const result: AnalysisResult = {
        rootPath: rootName,
        // totalFiles ve analyzedFiles aynı kaynaktan; ikisi de taranan .log sayısı
        totalFiles: fileCount,
        analyzedFiles: fileCount,
        totalEntries: allEntries.length,
        namespaceSummaries,
        podSummaries,
        fileTree: nodes,
        allEntries,
        timelinePoints,
        analysisDate: new Date().toISOString()
      }

      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        analysisProgress: fileCount,
        analysisResult: result,
        view: 'dashboard'
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analiz sırasında bilinmeyen hata oluştu.'
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: message
      }))
    }
  }, [])

  // Dosya ağacından bir dosya seçildiğinde log viewer'ı açar
  // findNodeById: fileTree.ts içinde iterative BFS ile çalışır — stack overflow riski yok
  const selectFile = useCallback((fileId: string) => {
    setState(prev => {
      if (!prev.analysisResult) return prev

      const file = findNodeById(prev.analysisResult.fileTree, fileId)
      return {
        ...prev,
        selectedFile: file,
        view: file ? 'viewer' : prev.view
      }
    })
  }, [])

  // Namespace filtresi seçimi
  const selectNamespace = useCallback((namespace: string | null) => {
    setState(prev => ({
      ...prev,
      selectedNamespace: namespace,
      view: 'dashboard'
    }))
  }, [])

  // Dashboard'a dön
  const goToDashboard = useCallback(() => {
    setState(prev => ({
      ...prev,
      view: 'dashboard',
      selectedFile: null
    }))
  }, [])

  // Analizi sıfırla, hoş geldin ekranına dön
  const resetAnalysis = useCallback(() => {
    setState(INITIAL_STATE)
  }, [])

  return {
    state,
    startAnalysis,
    selectFile,
    selectNamespace,
    resetAnalysis,
    goToDashboard
  }
}
