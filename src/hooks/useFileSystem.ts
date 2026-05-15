import { useState, useCallback } from 'react'

// File System Access API tarayıcı desteğini kontrol eder
export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window
}

export interface UseFileSystemReturn {
  isSupported: boolean
  isLoading: boolean
  error: string | null
  pickDirectory: () => Promise<FileSystemDirectoryHandle | null>
  findNamespacesDir: (root: FileSystemDirectoryHandle) => Promise<FileSystemDirectoryHandle | null>
}

// File System Access API ile klasör seçme ve namespaces dizinini bulma
export function useFileSystem(): UseFileSystemReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSupported = isFileSystemAccessSupported()

  // Kullanıcıya klasör seçme diyaloğu açar
  const pickDirectory = useCallback(async (): Promise<FileSystemDirectoryHandle | null> => {
    if (!isSupported) {
      setError('Bu tarayıcı File System Access API desteklemiyor. Chrome veya Edge kullanın.')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      // Tarayıcı yerleşik klasör seçici diyalog
      const dirHandle = await (window as Window & typeof globalThis & {
        showDirectoryPicker: (opts?: { mode?: string }) => Promise<FileSystemDirectoryHandle>
      }).showDirectoryPicker({ mode: 'read' })

      return dirHandle
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // Kullanıcı diyaloğu kapattı, hata değil
        return null
      }
      const message = err instanceof Error ? err.message : 'Klasör seçme sırasında bilinmeyen hata.'
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [isSupported])

  // Seçilen kök dizin içinde 'namespaces' klasörünü recursive arar
  // must-gather dosyaları genellikle birkaç seviye derinlikte olabilir
  const findNamespacesDir = useCallback(async (
    root: FileSystemDirectoryHandle,
    depth = 0
  ): Promise<FileSystemDirectoryHandle | null> => {
    // Çok derin aramayı engelle (performans)
    if (depth > 4) return null

    for await (const [name, handle] of root as unknown as AsyncIterable<[string, FileSystemHandle]>) {
      if (handle.kind === 'directory' && name === 'namespaces') {
        return handle as FileSystemDirectoryHandle
      }
    }

    // Kök dizinde bulunamadıysa bir alt seviyede ara
    if (depth < 4) {
      for await (const [, handle] of root as unknown as AsyncIterable<[string, FileSystemHandle]>) {
        if (handle.kind === 'directory') {
          const found = await findNamespacesDir(handle as FileSystemDirectoryHandle, depth + 1)
          if (found) return found
        }
      }
    }

    return null
  }, [])

  return {
    isSupported,
    isLoading,
    error,
    pickDirectory,
    findNamespacesDir
  }
}
