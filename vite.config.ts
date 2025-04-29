
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    // Generate bundle analysis report in stats.html (only in build mode)
    mode === 'production' && 
    visualizer({
      filename: 'stats.html',
      gzipSize: true,
      brotliSize: true,
      open: false,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Improved build settings for performance
    target: 'es2018',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: mode !== 'production', // Only in dev and staging
    minify: mode === 'production' ? 'terser' : false, // Only use terser in production
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      }
    },
    // Optimized chunking strategy
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react', 
            'react-dom', 
            'react-router-dom',
            '@tanstack/react-query',
          ],
          // Fix: Reference specific files instead of directories
          ui: [
            '@/components/ui/button',
            '@/components/ui/dialog',
            '@/components/ui/input',
            '@/components/ui/toast',
            '@/components/ui/accordion',
            '@/components/ui/dropdown-menu',
            '@/components/ui/card',
            '@/components/ui/form',
          ],
          // Fix: Reference specific utility files instead of directories
          utils: [
            '@/lib/utils.ts',
            '@/utils/formatters.ts',
            '@/utils/product-utils.ts',
            '@/utils/debugTools.ts',
            '@/utils/corsProxy.ts',
          ],
          // Fix: Reference specific API utilities
          api: [
            '@/utils/api/config.ts',
            '@/utils/api/orderApi.ts',
            '@/utils/api/stockApi.ts',
            '@/utils/api/taphoammoApi.ts',
          ],
          // Media handling in separate chunk
          media: [
            'lucide-react',
            '@/components/ui/lazy-image',
          ],
        },
        // Consistent file naming with content hashing for cache busting
        entryFileNames: 'assets/js/[name].[hash].js',
        chunkFileNames: 'assets/js/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return `assets/[name].[hash].[ext]`;
          
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          
          if (/\.(png|jpe?g|svg|gif|webp|avif)$/.test(assetInfo.name)) {
            return `assets/images/[name].[hash].[ext]`;
          }
          
          if (/\.(css)$/.test(assetInfo.name)) {
            return `assets/css/[name].[hash].[ext]`;
          }
          
          if (/\.(woff2?|ttf|eot|otf)$/.test(assetInfo.name)) {
            return `assets/fonts/[name].[hash].[ext]`;
          }
          
          return `assets/[name].[hash].[ext]`;
        },
      }
    }
  },
  css: {
    // Extract critical CSS and optimize it
    postcss: {
      plugins: [
        // Already defined in postcss.config.js
      ],
    },
    // Minimize CSS in production
    devSourcemap: true,
  },
  // Improve caching for faster development
  cacheDir: '.vite_cache',
}));
