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
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // 手动分包配置
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 3D 库体积较大
            if (id.includes('three') || id.includes('ogl')) {
              return 'three-vendor';
            }

            // Excel 处理库
            if (id.includes('xlsx')) {
              return 'xlsx-vendor';
            }

            // 图表库
            if (id.includes('recharts')) {
              return 'charts-vendor';
            }

            // 动画库
            if (id.includes('framer-motion') || id.includes('gsap')) {
              return 'motion-vendor';
            }

            // 其他所有第三方依赖打包到 vendor 中，避免依赖顺序问题
            return 'vendor';
          }
        },
      },
    },
  },
})
