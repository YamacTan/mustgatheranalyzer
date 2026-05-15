import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Vite yapılandırması: tek HTML dosyası çıktısı için singlefile plugin
export default defineConfig({
  plugins: [
    react(),
    // Tüm CSS ve JS'i index.html içine inline eder
    viteSingleFile()
  ],
  build: {
    // Büyük assets'leri de inline et
    assetsInlineLimit: 100_000_000,
    // Chunk bölümlemesini devre dışı bırak
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        manualChunks: undefined
      }
    }
  }
})
