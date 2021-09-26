const path = require('path');
const rollup = require('rollup');
const md = require('./src/index');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const vuePlugin = require('rollup-plugin-vue')

// async function bundleFileAndGetCode () {
//   const bundle = await rollup.rollup({
//     input: path.resolve(__dirname, "./examples/button.md"),
//     plugins: [md()]
//   })
//   // console.log(bundle.cache.modules, 'bundless')
//   return bundle
// }
async function bundleFileAndGetCode () {
  const bundle = await rollup.rollup({
    input: path.resolve(__dirname, "./demo.vue"),
    plugins: [nodeResolve(), vuePlugin()]
  })
  // console.log(bundle.cache.modules, 'bundless')
  return bundle
}
bundleFileAndGetCode()

