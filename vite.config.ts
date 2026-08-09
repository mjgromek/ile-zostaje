import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// No CDN, no external asset host: everything the page loads is emitted into the
// bundle. Acceptance criterion 7 fails on any outbound request.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  preview: { port: 5173, strictPort: true },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
