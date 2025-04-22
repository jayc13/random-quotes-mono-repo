import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
/// <reference types="vitest" /> // Add this triple slash directive

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ssr options are usually handled by the server setup and build commands,
  // but we might need to specify build inputs if not using defaults.
  // For now, let's ensure the basic config is clean.
  // We might need to add `ssr: { noExternal: ['@mui/material'] }` later if MUI causes issues with SSR externalization.
  build: {
    // Ensure client build output goes to dist/client
    // Ensure server build output goes to dist/server
    // Vite handles much of this automatically when running `vite build --ssr`
    // Keep the config simple for now, adjustments can be made if needed.
  },
  test: { // Add this section for Vitest config
    globals: true,
    environment: 'happy-dom', // Use happy-dom for DOM environment
    setupFiles: './src/setupTests.ts', // Optional: if using a setup file
    // include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,jsx,tsx}'], // Default include pattern
    css: false, // Optional: If testing CSS is not needed
  },
});
