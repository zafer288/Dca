import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Docker ortamında enjekte edilen window.env değişkenini process.env gibi gösteriyoruz.
    // Bu sayede kod içinde process.env.API_KEY kullanımı bozulmadan çalışır.
    'process.env': 'window.env || {}'
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});