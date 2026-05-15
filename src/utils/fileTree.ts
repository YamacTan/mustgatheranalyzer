import type { FileNode, LogEntry } from '../types'
import { parseLogContent } from './logParser'

// ---------------------------------------------------------------------------
// Ana tarama fonksiyonu
//
// Mimari:
//   - Dizin handle'larını explicit bir DFS stack'inde tut
//   - Tüm LogEntry'leri global tek bir `allEntries` array'ine doğrudan push et
//     (parent→child zinciri yok; LIFO sırası bozukluğundan kaçınılır)
//   - FileNode ağacı ayrı olarak inşa edilir; dizin node'ları çocukları
//     doldurulduktan sonra count aggregation'a sokulur
// ---------------------------------------------------------------------------

interface StackItem {
  handle: FileSystemDirectoryHandle
  pathSegments: string[]
  // Bu dizin tamamlandığında node listesinin ekleneceği parent dizi
  parentChildren: FileNode[]
}

export async function buildFileTree(
  rootHandle: FileSystemDirectoryHandle,
  pathSegments: string[] = [],
  onProgress?: (filesScanned: number) => void
): Promise<{ nodes: FileNode[]; allEntries: LogEntry[]; fileCount: number }> {

  // Tüm log girdileri için tek global liste
  const allEntries: LogEntry[] = []
  let fileCount = 0

  // Kök node listesi
  const rootChildren: FileNode[] = []

  // DFS stack
  const stack: StackItem[] = [{
    handle: rootHandle,
    pathSegments,
    parentChildren: rootChildren
  }]

  while (stack.length > 0) {
    const { handle, pathSegments: segs, parentChildren } = stack.pop()!

    // Bu dizinin doğrudan çocuklarını tutan liste
    const localNodes: FileNode[] = []

    for await (const [name, childHandle] of handle as unknown as AsyncIterable<[string, FileSystemHandle]>) {
      const currentPath = [...segs, name]
      const id = currentPath.join('/')

      if (childHandle.kind === 'directory') {
        // Dizin node'u — children şimdilik boş; stack işleyince dolacak
        const dirNode: FileNode = {
          id,
          name,
          path: id,
          type: 'directory',
          children: [],
          logEntries: [],
          errorCount: 0,
          fatalCount: 0,
          panicCount: 0,
          exceptionCount: 0,
          handle: childHandle as FileSystemDirectoryHandle
        }
        localNodes.push(dirNode)

        // Alt dizini stack'e ekle; çıktısını dirNode.children'a yaz
        stack.push({
          handle: childHandle as FileSystemDirectoryHandle,
          pathSegments: currentPath,
          parentChildren: dirNode.children
        })

      } else if (childHandle.kind === 'file' && name.endsWith('.log')) {
        const fileHandle = childHandle as FileSystemFileHandle
        const file = await fileHandle.getFile()
        const content = await file.text()
        const filePath = id
        const entries = parseLogContent(content, filePath, name)

        // Severity sayıları
        let errorCount = 0, fatalCount = 0, panicCount = 0, exceptionCount = 0
        for (const e of entries) {
          switch (e.severity) {
            case 'error':     errorCount++;     break
            case 'fatal':     fatalCount++;     break
            case 'panic':     panicCount++;     break
            case 'exception': exceptionCount++; break
            default: break
          }
        }

        const fileNode: FileNode = {
          id,
          name,
          path: filePath,
          type: 'file',
          children: [],
          logEntries: entries,
          errorCount,
          fatalCount,
          panicCount,
          exceptionCount,
          handle: fileHandle
        }

        localNodes.push(fileNode)

        // Doğrudan global listeye ekle — zincir yok, sıra bağımsız
        for (const entry of entries) {
          allEntries.push(entry)
        }

        fileCount++
        onProgress?.(fileCount)
      }
    }

    // Dizinler önce, dosyalar sonra; her grupta alfabetik
    localNodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
      return a.name.localeCompare(b.name)
    })

    // Tüm node'ları parent'a ekle
    for (const node of localNodes) {
      parentChildren.push(node)
    }
  }

  // Tüm tarama bitti; ağaçtaki count'ları aşağıdan yukarı topla
  aggregateCountsIterative(rootChildren)

  return { nodes: rootChildren, allEntries, fileCount }
}

// ---------------------------------------------------------------------------
// iterative post-order count aggregation
// ---------------------------------------------------------------------------
function aggregateCountsIterative(roots: FileNode[]): void {
  const order: FileNode[] = []
  const stack: FileNode[] = [...roots]

  while (stack.length > 0) {
    const node = stack.pop()!
    order.push(node)
    for (let i = node.children.length - 1; i >= 0; i--) {
      stack.push(node.children[i])
    }
  }

  for (let i = order.length - 1; i >= 0; i--) {
    const node = order[i]
    if (node.type === 'file') continue

    node.errorCount = 0
    node.fatalCount = 0
    node.panicCount = 0
    node.exceptionCount = 0

    for (const child of node.children) {
      node.errorCount     += child.errorCount
      node.fatalCount     += child.fatalCount
      node.panicCount     += child.panicCount
      node.exceptionCount += child.exceptionCount
    }
  }
}

// ---------------------------------------------------------------------------
// findNodeById — iterative BFS
// ---------------------------------------------------------------------------
export function findNodeById(nodes: FileNode[], id: string): FileNode | null {
  const queue: FileNode[] = [...nodes]

  while (queue.length > 0) {
    const node = queue.shift()!
    if (node.id === id) return node
    for (const child of node.children) {
      queue.push(child)
    }
  }

  return null
}

// ---------------------------------------------------------------------------
// Yardımcı fonksiyonlar
// ---------------------------------------------------------------------------

export function flattenErrorFiles(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = []
  const stack: FileNode[] = [...nodes]

  while (stack.length > 0) {
    const node = stack.pop()!
    if (node.type === 'file' && (node.logEntries?.length ?? 0) > 0) {
      result.push(node)
    }
    for (let i = node.children.length - 1; i >= 0; i--) {
      stack.push(node.children[i])
    }
  }

  return result
}

export function getNamespaceFiles(nodes: FileNode[], namespace: string): FileNode[] {
  const nsNode = nodes.find(n => n.name === 'namespaces')
  if (!nsNode) return []

  const targetNs = nsNode.children.find(n => n.name === namespace)
  if (!targetNs) return []

  return flattenErrorFiles([targetNs])
}

export function getTreeStats(nodes: FileNode[]): {
  totalErrors: number
  totalFatal: number
  totalPanic: number
  totalException: number
} {
  let totalErrors = 0, totalFatal = 0, totalPanic = 0, totalException = 0

  for (const node of nodes) {
    totalErrors     += node.errorCount
    totalFatal      += node.fatalCount
    totalPanic      += node.panicCount
    totalException  += node.exceptionCount
  }

  return { totalErrors, totalFatal, totalPanic, totalException }
}
