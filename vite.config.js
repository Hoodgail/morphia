import { defineConfig } from "vite";
import dts from 'vite-plugin-dts'

export default defineConfig({
     build: {
          lib: {
               entry: 'src/index.ts',
               name: 'morphia',
               fileName: (format) => `main.${format}.js`,
          },
     },
     plugins: [dts()]
})