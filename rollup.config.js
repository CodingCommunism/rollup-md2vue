
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.js',
  output: {
    file: 'build/md2vue.js',
    format: 'cjs'
  },
  plugins: [commonjs()]
};
