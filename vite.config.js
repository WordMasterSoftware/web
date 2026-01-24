import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    open: true
  },
  build: {
    rollupOptions: {
      output: {
        // 手动分包配置
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // 将所有 node_modules 中的依赖打包到一个叫 vendor 的文件中
          }
        },
      },
    },
  },
})
