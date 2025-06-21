import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react'
    }),
    tanstackRouter({
      routesDirectory: './src/presentation/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
