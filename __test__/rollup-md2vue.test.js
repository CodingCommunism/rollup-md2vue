var rollup = require('rollup');
var md = require('../src/index');

it('returns a module for the markdown file', async () => {
  const file = rollup.rollup({
    input: 'samples/main.js',
    plugins: [md()]
  })
  console.log('file: ', file)
  // expect(file.filename).toEqual('test.md')
})