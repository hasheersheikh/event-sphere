import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'City Pulse',
        short_name: 'CityPulse',
        description: 'Premium event discovery and management platform',
        theme_color: '#10b981',
        background_color: '#09090b',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        // Delete leftover caches from previous deploys so they don't grow forever
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/uploads/],
        runtimeCaching: [
          // Google Fonts - CacheFirst with very long cache
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Google Fonts static files
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Cloudinary images - CacheFirst: images are immutable (versioned URLs),
          // serving from cache is faster than revalidating
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cloudinary-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 90 // 90 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Local images - CacheFirst
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 150,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // API calls - NetworkFirst with short cache
          {
            urlPattern: /\/api\/(events|venues|local-stores)/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'public-api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Static assets (JS, CSS) - StaleWhileRevalidate
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-assets-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Documents (PDF, etc)
          {
            urlPattern: /\.(?:pdf|doc|docx|xls|xlsx)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'documents-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        // Strip every console.* call (log/warn/error/info) from production bundles
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Check specific libraries BEFORE generic 'react' to avoid false matches
            // UI library - Radix UI components
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }

            // Tanstack Query - API state management
            if (id.includes('@tanstack')) {
              return 'tanstack';
            }

            // Heavy charting library
            if (id.includes('recharts')) {
              return 'recharts';
            }

            // Animation library
            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }

            // PDF generation - heavy, lazy loaded
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'pdf-vendor';
            }

            // Authentication - check BEFORE 'react' to avoid @react-oauth matching
            if (id.includes('@react-oauth') || id.includes('google-auth')) {
              return 'auth-vendor';
            }

            // Form handling - check BEFORE 'react' to avoid react-hook-form matching
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'forms';
            }

            // Date utilities
            if (id.includes('date-fns')) {
              return 'date-utils';
            }

            // Icons
            if (id.includes('lucide')) {
              return 'icons';
            }

            // Core React - must be AFTER specific checks to avoid false matches
            // Use /node_modules/ boundary to ensure we only match core react packages
            if (/\/node_modules\/(react|react-dom|react-router)\//.test(id)) {
              return 'react-core';
            }

            // Everything else node_modules
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Reduce memory usage during build
    sourcemap: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
    ],
  },
}));
