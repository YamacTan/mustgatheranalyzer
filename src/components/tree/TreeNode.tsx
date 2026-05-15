import { useState } from 'react'
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  AlertTriangle
} from 'lucide-react'
import type { FileNode } from '../../types'
import { CountBadge } from '../common/Badge'

interface TreeNodeProps {
  node: FileNode
  depth: number
  onFileSelect: (fileId: string) => void
  selectedFileId: string | null
}

// Tek bir ağaç düğümünü render eder; directory ise collapse/expand destekli
export function TreeNode({ node, depth, onFileSelect, selectedFileId }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(depth < 2)
  const isSelected = selectedFileId === node.id
  const totalErrors = node.errorCount + node.fatalCount + node.panicCount + node.exceptionCount
  const hasErrors = totalErrors > 0

  const indentStyle = { paddingLeft: `${depth * 12 + 8}px` }

  if (node.type === 'directory') {
    return (
      <div>
        <button
          onClick={() => setIsExpanded(prev => !prev)}
          style={indentStyle}
          className={`
            w-full flex items-center gap-1.5 py-1 pr-2 text-left rounded-md
            hover:bg-slate-800/60 transition-colors duration-100 group
            ${hasErrors ? 'text-slate-200' : 'text-slate-400'}
          `}
        >
          {/* Ok ikonu */}
          <span className="flex-shrink-0 text-slate-500 group-hover:text-slate-300 transition-colors">
            {isExpanded
              ? <ChevronDown size={12} />
              : <ChevronRight size={12} />
            }
          </span>

          {/* Klasör ikonu */}
          <span className={`flex-shrink-0 ${hasErrors ? 'text-amber-400' : 'text-slate-500'}`}>
            {isExpanded
              ? <FolderOpen size={14} />
              : <Folder size={14} />
            }
          </span>

          {/* Klasör adı */}
          <span className="flex-1 text-xs truncate font-medium">{node.name}</span>

          {/* Hata sayısı badge'i */}
          {hasErrors && (
            <span className="flex-shrink-0">
              <CountBadge count={totalErrors} variant="error" />
            </span>
          )}
        </button>

        {/* Alt düğümler — collapse animasyonu */}
        {isExpanded && node.children.length > 0 && (
          <div>
            {node.children.map(child => (
              <TreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                onFileSelect={onFileSelect}
                selectedFileId={selectedFileId}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Dosya düğümü
  const entryCount = node.logEntries?.length ?? 0

  return (
    <button
      onClick={() => onFileSelect(node.id)}
      style={indentStyle}
      className={`
        w-full flex items-center gap-1.5 py-1 pr-2 text-left rounded-md
        transition-colors duration-100 group
        ${isSelected
          ? 'bg-sky-900/40 text-sky-300 border border-sky-800/50'
          : entryCount > 0
            ? 'text-slate-300 hover:bg-red-950/20 hover:text-red-200'
            : 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-400'
        }
      `}
    >
      {/* Dosya ikonu */}
      <span className={`flex-shrink-0 w-3 ${entryCount > 0 ? 'text-red-400' : 'text-slate-600'}`}>
        {entryCount > 0
          ? <AlertTriangle size={12} />
          : <FileText size={12} />
        }
      </span>

      {/* Dosya adı */}
      <span className="flex-1 text-xs truncate font-mono">{node.name}</span>

      {/* Log girişi sayısı */}
      {entryCount > 0 && (
        <span className="flex-shrink-0">
          <CountBadge count={entryCount} variant="error" />
        </span>
      )}
    </button>
  )
}
