import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: [
          { find: /^formdata-polyfill(\/.*)?$/, replacement: path.resolve(__dirname, './empty.js') },
          { find: /^node-fetch(\/.*)?$/, replacement: path.resolve(__dirname, './empty.js') },
          { find: /^whatwg-fetch$/, replacement: path.resolve(__dirname, './empty.js') },
          { find: /^isomorphic-fetch$/, replacement: path.resolve(__dirname, './empty.js') },
          { find: /^node-domexception$/, replacement: path.resolve(__dirname, './empty.js') },
          { find: '@', replacement: path.resolve(__dirname, './src') }
        ]
      },
      optimizeDeps: {
        exclude: ['formdata-polyfill', 'node-fetch', 'whatwg-fetch', 'isomorphic-fetch']
      }
    };
});
