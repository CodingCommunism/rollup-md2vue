
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';

const output = ['esm', 'umd'].map(item => ({
  dir: `dist/${item}`,
  name: `index.js`,
  format: item,
}));

export default {
  input: 'src/index.ts',
  output,
  plugins: [
    json(),
    typescript({
      tsconfigOverride: { compilerOptions: { declaration: false } },
    }),
    resolve(),
    commonjs({ extensions: ['.ts', '.js'], sourceMap: true }),
  ]
};
