import { readFileSync } from 'fs';
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
  external: ['highlight.js'],
  plugins: [
    json(),
    typescript({
      tsconfigOverride: { compilerOptions: { declaration: false } },
    }),
    resolve(),
    commonjs({ extensions: ['.ts', '.js'], sourceMap: true }),
    {
      name: 'loadDemoBlock',
      load(id) {
        if(id.endsWith('demo-block.vue')) {
          const content = readFileSync(id, {encoding: 'utf-8'})
          return `
            const str = \`${content}\`;
            export default str;
          `
        }
        return null
      }
    }
  ]
};
