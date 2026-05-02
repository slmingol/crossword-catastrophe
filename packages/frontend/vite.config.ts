import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 3000,
    strictPort: false,
    // Disable host checking for Docker deployments
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'docker-host-01.bub.lan',
      '.bub.lan', // Allow all *.bub.lan domains
      'crosscat.lamolabs.org',
      '.lamolabs.org', // Allow all *.lamolabs.org domains
      'crosscat.svcs.lamolabs.com',
      '.lamolabs.com', // Allow all *.lamolabs.com domains
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
    hmr: {
      clientPort: 3000,
    },
  },
});
