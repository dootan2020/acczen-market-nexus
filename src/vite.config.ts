
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    // Tạo báo cáo phân tích bundle trong stats.html (chỉ trong chế độ build)
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
    // Cải thiện cài đặt build cho hiệu suất
    target: 'es2018',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: mode !== 'production', // Chỉ trong dev và staging
    minify: mode === 'production' ? 'terser' : false, // Chỉ sử dụng terser trong production
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      }
    },
    // Chiến lược phân chia chunk tối ưu
    rollupOptions: {
      output: {
        manualChunks: {
          // Giảm số lượng chunks để tránh lỗi loading
          vendor: [
            'react', 
            'react-dom', 
            'react-router-dom',
            '@tanstack/react-query',
          ],
          // Nhóm UI components
          ui: [
            '@/components/ui/button',
            '@/components/ui/dialog',
            '@/components/ui/input',
            '@/components/ui/toast',
          ]
        },
        // Đặt tên file nhất quán với hashing nội dung để bảo vệ cache
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
    // Giữ lại CSS cho dev
    devSourcemap: true,
  },
  // Cải thiện caching cho phát triển nhanh hơn
  cacheDir: '.vite_cache',
}));
