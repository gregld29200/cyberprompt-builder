import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Let the React plugin handle all JSX/TSX files
      include: '**/*.{jsx,tsx,js,ts}',
      jsxRuntime: 'automatic'
    }),
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          lucide: ['lucide-react'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    cors: true,
  },
  // Specific optimizations for Cloudflare Pages
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react', '@google/generative-ai'],
  }
});
