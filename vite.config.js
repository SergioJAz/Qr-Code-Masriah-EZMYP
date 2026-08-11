import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves the site from https://<user>.github.io/<repo>/, so the
  // build needs to know that prefix. The Pages workflow sets BASE_PATH for it.
  // Everywhere else (local dev, Vercel, Netlify, Cloudflare) the default '/'
  // is correct, so nothing needs changing to switch hosts.
  base: process.env.BASE_PATH || '/',
  server: {
    // Lets you open the dev server from your phone on the same Wi-Fi.
    host: true,
  },
});
