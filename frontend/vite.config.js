import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },

  // Development server
  server: {
    port: 3000,
    host: true,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
      'Surrogate-Control': 'no-store',
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
    // Enable SPA fallback for client-side routing
    historyApiFallback: true,
  },

  // esbuild configuration for JSX in .js files
  esbuild: {
    // Don't inject React import since files already have it
    loader: 'jsx',
  },

  // Optimize deps to pre-bundle with esbuild
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },

  // Build configuration
  build: {
    outDir: 'build',
    sourcemap: true,
    // Disable CSS code splitting to prevent FOUC (Flash of Unstyled Content)
    // All CSS will be bundled into a single file that loads before JS
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor splitting for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['recharts'],
          'map-vendor': ['leaflet', 'react-leaflet'],
        },
        // Ensure CSS loads before JS to prevent FOUC
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    // Increase chunk size warning limit for larger map libraries
    chunkSizeWarningLimit: 1000,
  },

  // Preview server (for production builds)
  preview: {
    port: 3000,
    host: true,
  },

  // Environment variables prefix
  envPrefix: 'VITE_',

  // Test configuration (for Vitest)
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.jsx',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      exclude: [
        'node_modules/',
        'src/setupTests.jsx',
        'src/reportWebVitals.js',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/__tests__/**',
        '**/__mocks__/**',
      ],
      thresholds: {
        statements: 25,
        branches: 15,
        functions: 20,
        lines: 25,
      },
    },
  },
});
