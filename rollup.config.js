import { defineConfig } from 'rollup';
import { resolve } from 'path';
import ts from 'rollup-plugin-ts';

export default defineConfig({
  input: resolve(__dirname, 'src', 'request.ts'),
  output: {
    format: 'esm',
    file: './dist/request.js',
  },
  plugins: [ts()],
});
