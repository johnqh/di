/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        'examples/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
        // Interface-only files that generate no executable code
        'src/env.ts',
        'src/navigation/navigation.ts',
        'src/notification/notification.ts',
        'src/storage/storage.ts',
        'src/network/network.interface.ts',
        'src/analytics/analytics.interface.ts',
      ],
      thresholds: {
        global: {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
      },
    },
    include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
  },
})