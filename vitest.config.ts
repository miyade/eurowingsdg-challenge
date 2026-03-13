import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '~': resolve(__dirname, 'app'),
      '#shared': resolve(__dirname, 'shared'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['app/tests/unit/**/*.spec.ts'],
    typecheck: {
      tsconfig: './tsconfig.vitest.json',
    },
  },
})
