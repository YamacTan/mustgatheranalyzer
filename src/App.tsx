import { useCallback } from 'react'
import {
  FolderOpen,
  Loader2,
  AlertCircle,
  Download,
  LayoutDashboard,
  Terminal,
  ShieldAlert
} from 'lucide-react'
import { useFileSystem } from './hooks/useFileSystem'
import { useLogAnalysis } from './hooks/useLogAnalysis'
import { Sidebar } from './components/layout/Sidebar'
import { MainContent } from './components/layout/MainContent'
import { Button } from './components/common/Button'
import { exportToHtml, downloadHtml } from './utils/exportHtml'

export default function App() {
  const { isSupported, pickDirectory, findNamespacesDir } = useFileSystem()
  const {
    state,
    startAnalysis,
    selectFile,
    selectNamespace,
    resetAnalysis,
    goToDashboard
  } = useLogAnalysis()

  const { view, isAnalyzing, analysisProgress, analysisResult, error } = state

  // Klasör seç ve analizi başlat
  const handleOpenFolder = useCallback(async () => {
    const rootHandle = await pickDirectory()
    if (!rootHandle) return

    const namespacesDir = await findNamespacesDir(rootHandle)
    if (!namespacesDir) {
      // namespaces klasörü bulunamadı — kök dizinin kendisini kullan
      await startAnalysis(rootHandle, rootHandle.name)
      return
    }

    await startAnalysis(namespacesDir, rootHandle.name)
  }, [pickDirectory, findNamespacesDir, startAnalysis])

  // HTML rapor exportu
  const handleExport = useCallback(() => {
    if (!analysisResult) return
    const html = exportToHtml(analysisResult)
    const date = new Date().toISOString().slice(0, 10)
    downloadHtml(html, `must-gather-report-${date}.html`)
  }, [analysisResult])

  // Hoş geldin / yükleme ekranı
  if (view === 'welcome' || isAnalyzing) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-midnight p-6">
        {/* Logo ve başlık */}
        <div className="flex flex-col items-center gap-4 mb-12">
          <div className="p-4 bg-slate-800/60 border border-slate-700/50 rounded-2xl shadow-2xl">
            <ShieldAlert size={40} className="text-sky-400" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-100 font-display tracking-tight">
              Must-Gather Log Analyzer
            </h1>
            <p className="text-sm text-slate-500 mt-1.5">
              OpenShift must-gather çıktılarını derinlemesine analiz et
            </p>
          </div>
        </div>

        {/* Yükleniyor */}
        {isAnalyzing ? (
          <div className="flex flex-col items-center gap-4 max-w-sm w-full">
            <div className="flex items-center gap-3 text-slate-300">
              <Loader2 size={20} className="animate-spin text-sky-400" />
              <span className="text-sm">Loglar analiz ediliyor...</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5">
              <div
                className="bg-sky-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((analysisProgress / 100) * 100, 95)}%` }}
              />
            </div>
            <span className="text-xs text-slate-600">
              {analysisProgress} dosya tarandı
            </span>
          </div>
        ) : (
          /* Başlangıç butonu ve özellik listesi */
          <div className="flex flex-col items-center gap-6 max-w-md w-full">
            {/* Tarayıcı desteği uyarısı */}
            {!isSupported && (
              <div className="flex items-start gap-2 p-3 bg-amber-950/40 border border-amber-800/40 rounded-xl w-full">
                <AlertCircle size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300">
                  Bu tarayıcı File System Access API'ını desteklemiyor.
                  Lütfen <strong>Chrome</strong> veya <strong>Edge</strong> kullanın.
                </p>
              </div>
            )}

            {/* Hata mesajı */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-950/40 border border-red-800/40 rounded-xl w-full">
                <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              onClick={handleOpenFolder}
              disabled={!isSupported}
              icon={<FolderOpen size={18} />}
              className="w-full justify-center"
            >
              Must-Gather Klasörü Seç
            </Button>

            {/* Özellik açıklaması */}
            <div className="grid grid-cols-2 gap-2 w-full">
              {[
                { icon: <Terminal size={13} />, text: 'Recursive log tarama' },
                { icon: <AlertCircle size={13} />, text: 'Error/Panic/Fatal/Exception tespiti' },
                { icon: <LayoutDashboard size={13} />, text: 'Namespace & pod gruplandırma' },
                { icon: <Download size={13} />, text: 'Taşınabilir HTML export' }
              ].map((feat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2.5 bg-slate-900/60 border border-slate-800/40 rounded-lg"
                >
                  <span className="text-sky-400">{feat.icon}</span>
                  <span className="text-xs text-slate-400">{feat.text}</span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-700 text-center">
              Tüm analiz tarayıcıda yerel olarak yapılır. Hiçbir veri sunucuya gönderilmez.
            </p>
          </div>
        )}
      </div>
    )
  }

  // Ana uygulama arayüzü — analiz tamamlandıktan sonra
  return (
    <div className="h-full flex flex-col bg-midnight">
      {/* Üst nav çubuğu */}
      <header className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-800/60 bg-ink/80 backdrop-blur-sm flex-shrink-0 z-10">
        <div className="flex items-center gap-2 flex-1">
          <ShieldAlert size={16} className="text-sky-400" />
          <span className="text-sm font-semibold text-slate-200 font-display">
            Must-Gather Log Analyzer
          </span>
          {analysisResult && (
            <span className="text-xs text-slate-600">
              · {analysisResult.rootPath}
            </span>
          )}
        </div>

        {/* Sağ kontroller */}
        <div className="flex items-center gap-2">
          {view === 'viewer' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={goToDashboard}
              icon={<LayoutDashboard size={13} />}
            >
              Dashboard
            </Button>
          )}

          {analysisResult && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
              icon={<Download size={13} />}
            >
              HTML Export
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenFolder}
            icon={<FolderOpen size={13} />}
          >
            Yeni Analiz
          </Button>
        </div>
      </header>

      {/* Ana içerik: sol sidebar + sağ panel */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {analysisResult && (
          <Sidebar
            nodes={analysisResult.fileTree}
            rootName={analysisResult.rootPath}
            selectedFileId={state.selectedFile?.id ?? null}
            onFileSelect={selectFile}
            onReset={resetAnalysis}
          />
        )}

        <MainContent
          state={state}
          onNamespaceSelect={selectNamespace}
          onFileSelect={selectFile}
          onBack={goToDashboard}
        />
      </div>
    </div>
  )
}
