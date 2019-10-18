import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import {lstatSync, readdirSync } from 'fs';
import path from 'path';
import {uglify} from 'rollup-plugin-uglify';

export default {
  input: 'src/index.js',
  output: {
    name: 'Chord',
    file: 'dist/Chord.js',
    format: 'umd',
  },
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**' // 只编译我们的源代码
    }),
    uglify(),
  ]
}
