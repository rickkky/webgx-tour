import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import dts from 'vite-plugin-dts';

export default defineConfig(() => {
  return {
    build: {
      lib: {
        entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        name: 'Crate',
        fileName: 'index',
      },
    },
    sourcemap: true,
    plugins: [
      dts({
        rollupTypes: true,
      }),
    ],
    server: {
      host: true,
      port: 5200,
    },
  };
});
