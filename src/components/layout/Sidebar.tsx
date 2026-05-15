import { useState } from 'react'
import { ChevronLeft, ChevronRight, FolderOpen, RotateCcw } from 'lucide-react'
import type { FileNode } from '../../types'
import { FileTree } from '../tree/FileTree'

interface SidebarProps {
  nodes: FileNode[]
  rootName: string
  selectedFileId: string | null
  onFileSelect: (fileId: string) => void
  onReset: () => void
}

// Sol panel: collapse/expand destekli kenar çubuğu
export function Sidebar({ nodes, rootName, selectedFileId, onFileSelect, onReset }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={`
        flex flex-col bg-ink border-r border-slate-800/60 transition-all duration-200 flex-shrink-0
        ${isCollapsed ? 'w-10' : 'w-64'}
      `}
      style={{ minHeight: 0 }}
    >
      {/* Kenar çubuğu başlığı */}
      <div className={`
        flex items-center border-b border-slate-800/60 flex-shrink-0
        ${isCollapsed ? 'justify-center py-3 px-0' : 'gap-2 px-3 py-2.5 justify-between'}
      `}>
        {!isCollapsed && (
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <FolderOpen size={14} className="text-amber-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-slate-300 truncate">
              {rootName}
            </span>
          </div>
        )}

        <div className={`flex items-center gap-1 ${isCollapsed ? 'flex-col' : ''}`}>
          {/* Sıfırla düğmesi */}
          {!isCollapsed && (
            <button
              onClick={onReset}
              title="Yeni analiz"
              className="p-1.5 text-slate-600 hover:text-slate-300 hover:bg-slate-800 rounded-md transition-colors"
            >
              <RotateCcw size={12} />
            </button>
          )}

          {/* Collapse/expand düğmesi */}
          <button
            onClick={() => setIsCollapsed(prev => !prev)}
            title={isCollapsed ? 'Genişlet' : 'Daralt'}
            className="p-1.5 text-slate-600 hover:text-slate-300 hover:bg-slate-800 rounded-md transition-colors"
          >
            {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>
      </div>

      {/* Dosya ağacı — collapse edilince gizlenir */}
      {!isCollapsed && (
        <div className="flex-1 overflow-hidden min-h-0">
          <FileTree
            nodes={nodes}
            onFileSelect={onFileSelect}
            selectedFileId={selectedFileId}
          />
        </div>
      )}

      {/* Collapsed durum — sadece ikon */}
      {isCollapsed && (
        <div className="flex-1 flex flex-col items-center pt-2 gap-2">
          <button
            onClick={onReset}
            title="Yeni analiz"
            className="p-1.5 text-slate-600 hover:text-slate-300 hover:bg-slate-800 rounded-md transition-colors"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      )}
    </div>
  )
}
