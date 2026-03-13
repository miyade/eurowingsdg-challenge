import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '~': resolve(__dirname, 'app'),
      '#shared': resolve(__dirname, 'shared'),
    },
  },
  test: {
    include: ['app/tests/unit/**/*.spec.ts'],
  },
})
