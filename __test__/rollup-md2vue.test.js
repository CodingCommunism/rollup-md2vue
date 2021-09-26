const rollup = require('rollup');
const md2vue = require('../build/md2vue.js');

describe("md2vue", () => {
  it('returns a module for the markdown file', () => {
    const file = rollup.rollup({
      input: '../examples/main.js',
      plugins: [md2vue()]
    })
  })
});

