import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";

export default [
  {
    input: "dist/tsc/index.js",
    output: [
      { file: "dist/esm/index.js", format: "es" },
      { file: "dist/cjs/index.js", format: "cjs" },
    ],
    plugins: [resolve(), commonjs()],
  },

  {
    input: "dist/types/index.d.ts",
    output: { file: "dist/types/index.d.ts", format: "es" },
    plugins: [dts()],
  },
];
