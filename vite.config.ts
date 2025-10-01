import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const geminiKey = env.VITE_GEMINI_API_KEY ?? env.GEMINI_API_KEY ?? '';

  return {
    server: {
      port: 5173,
      host: '0.0.0.0',
      headers: {
        'Cross-Origin-Embedder-Policy': 'credentialless',
        'Cross-Origin-Opener-Policy': 'same-origin',
      },
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(geminiKey),
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(geminiKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    optimizeDeps: {
      exclude: ['@mlc-ai/web-llm', '@xenova/transformers'],
      include: ['onnxruntime-web']
    },
    worker: {
      format: 'es'
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'transformers': ['@xenova/transformers']
          }
        }
      }
    }
  };
});
