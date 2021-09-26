// rollup.config.js
// import run from '@rollup/plugin-run';
const md2vue = require('./src/index');

export default {
  input: './examples/button.md',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    sourcemap: true
  },
  plugins: [
    md2vue()
  ]
};