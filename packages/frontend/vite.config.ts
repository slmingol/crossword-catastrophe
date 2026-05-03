import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Read version from package.json
const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8')
);

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
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
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:3001',
        changeOrigin: true,
      },
    },
    hmr: false, // Disable HMR to prevent constant reloads in production
  },
});
