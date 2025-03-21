import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'

const imagePaths = Array.from({ length: 145 }, (_, i) => `/assets/${i}.jpg`);

export default defineConfig({
  plugins: [
    react(),
    VitePWA({ 
      registerType: 'autoUpdate',
      workbox: {
      cleanupOutdatedCaches: false,
      includeAssets: ["comic.svg", ...imagePaths],
      manifest: {
        name: "Invincible Comic Book Reader",
        short_name: "PWA",
        description: "read Invincible from start to finish",
        theme_color: "#f4ed24",
        background_color: "#00bcf0", 
        display: "standalone",
        orientation: "portrait",
        icons: [
          {
            src: "/comic.svg",
            sizes: "192x192",
            type: "image/svg",
          },
          {
            src: "/comic.svg",
            sizes: "512x512",
            type: "image/svg",
          },
        ],
      },
    } })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});