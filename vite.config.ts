import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'framer-motion': ['framer-motion'],
          'lottie-react': ['lottie-react'],
          'jspdf': ['jspdf']
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.{ts,tsx}', 'supabase/**/*.test.ts'],
    exclude: [...configDefaults.exclude],
    alias: {
      'https://esm.sh/@supabase/supabase-js@2': '@supabase/supabase-js',
      'jsr:@supabase/functions-js/edge-runtime.d.ts': path.resolve(__dirname, 'src/test/noop.ts'),
      'https://deno.land/std@0.168.0/http/server.ts': path.resolve(__dirname, 'src/test/noop.ts')
    }
  }
}));
