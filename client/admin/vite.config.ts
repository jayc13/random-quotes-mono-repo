import react from "@vitejs/plugin-react";
import {defineConfig} from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 800, // Set the limit to 800 kB
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          antdLib: ['antd/lib'],
          antdEs: ['antd/es'],
          refinedevCore: ['@refinedev/core'],
          refinedevAntd: ['@refinedev/antd'],
          quotesPage: ['src/pages/quotes/list.tsx'], // Quotes page
          indexCategoriesPage: ['src/pages/categories/list.tsx'], // Categories List page
          showCategoriesPage: ['src/pages/categories/show.tsx'], // Categories Show page
        },
      },
    },
  },
});
