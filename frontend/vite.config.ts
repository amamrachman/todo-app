import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import compression from "vite-plugin-compression";
import terser from "@rollup/plugin-terser";

export default defineConfig({
  plugins: [
    react(),

    compression({
      algorithm: "gzip",
      ext: ".gz",
    }),

    compression({
      algorithm: "brotliCompress",
      ext: ".br",
    }),
  ],

  build: {
    target: "es2020",
    minify: "terser",
    rollupOptions: {
      plugins: [
        terser({
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
          mangle: true,
        }),
      ],
      output: {
        manualChunks: (id) => {
          if (id.includes("react")) {
            return "vendor";
          }
          if (id.includes("lucide-react")) {
            return "ui";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },

  server: {
    port: 5173,
    strictPort: true,
    host: true,
    cors: true,

    watch: {
      usePolling: true,
      interval: 100,
    },

    hmr: {
      clientPort: 5173,
    },
  },

  optimizeDeps: {
    include: ["react", "react-dom", "axios"],
    exclude: ["lucide-react"],
  },
});
