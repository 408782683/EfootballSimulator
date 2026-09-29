import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command }) => ({
  // 生产构建使用相对路径，便于 Electron 以 file:// 加载；开发环境仍用根路径
  base: command === 'build' ? './' : '/',
  plugins: [vue()],
}))