import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  resolve: {
    alias: {
      'virtual:pwa-register': path.resolve(__dirname, 'src/lib/pwaRegisterStub.ts'),
    },
  },
  build: {
    outDir: 'dist-preview',
    chunkSizeWarningLimit: 4000,
  },
})
