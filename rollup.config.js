import { resolve } from "path";
import ts from "rollup-plugin-ts";

export default [
  {
    input: resolve(__dirname, "src", "decorator.ts"),
    output: {
      format: "commonjs",
      exports: "default",
      file: "./dist/decorator.js",
    },
    plugins: [ts()],
  },
  {
    input: resolve(__dirname, "src", "decorator.ts"),
    output: {
      format: "es",
      file: "./dist/decorator.esm.js",
    },
    plugins: [ts()],
  },
];
