import path from 'path';
import { defineConfig } from 'vite';

const getPath = (relativePath: string) => path.resolve(__dirname, relativePath);

export default defineConfig({
  base: '/',
  resolve: {
    alias: {
      '@': getPath('./src'),
    }
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
  },
});