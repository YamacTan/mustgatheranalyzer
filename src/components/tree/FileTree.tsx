import { useState } from 'react'
import { Search, X, FolderTree } from 'lucide-react'
import type { FileNode } from '../../types'
import { TreeNode } from './TreeNode'

interface FileTreeProps {
  nodes: FileNode[]
  onFileSelect: (fileId: string) => void
  selectedFileId: string | null
}

// Sol panel: Klasör ağacı bileşeni — arama destekli
export function FileTree({ nodes, onFileSelect, selectedFileId }: FileTreeProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Arama terimine göre ağacı filtrele (dosya adı üzerinden)
  const filteredNodes = searchTerm.trim()
    ? filterTree(nodes, searchTerm.toLowerCase())
    : nodes

  return (
    <div className="flex flex-col h-full">
      {/* Başlık */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-800/60">
        <FolderTree size={14} className="text-sky-400 flex-shrink-0" />
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Dosya Ağacı
        </span>
      </div>

      {/* Arama kutusu */}
      <div className="px-2 py-2 border-b border-slate-800/40">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Dosya ara..."
            className="w-full bg-slate-900/60 border border-slate-700/50 rounded-md pl-7 pr-7 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-sky-700 focus:ring-1 focus:ring-sky-800"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Ağaç */}
      <div className="flex-1 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {filteredNodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-600 text-xs gap-1">
            <Search size={20} className="opacity-40" />
            <span>Sonuç bulunamadı</span>
          </div>
        ) : (
          filteredNodes.map(node => (
            <TreeNode
              key={node.id}
              node={node}
              depth={0}
              onFileSelect={onFileSelect}
              selectedFileId={selectedFileId}
            />
          ))
        )}
      </div>
    </div>
  )
}

// Ağaçta arama terimiyle eşleşen düğümleri özyinelemeli filtreler
function filterTree(nodes: FileNode[], term: string): FileNode[] {
  return nodes.reduce<FileNode[]>((acc, node) => {
    if (node.type === 'file') {
      if (node.name.toLowerCase().includes(term)) {
        acc.push(node)
      }
    } else {
      const filteredChildren = filterTree(node.children, term)
      if (filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren })
      } else if (node.name.toLowerCase().includes(term)) {
        acc.push(node)
      }
    }
    return acc
  }, [])
}
