// const Config = require('markdown-it-chain') // TODO 将此webpack链式操作改为rollup支持的操作

const hljs = require('highlight.js')

const containers = require('./containers')
const overWriteFenceRule = require('./fence')


// 配置markdown-it常规代码高亮，相关文档：https://markdown-it.github.io/markdown-it/#MarkdownIt.new
const highlight = (str, lang) => {
  if (!lang || !hljs.getLanguage(lang)) {
    return '<pre><code class="hljs">' + str + '</code></pre>'
  }
  const html = hljs.highlight(lang, str, true, undefined).value
  return `<pre><code class="hljs language-${lang}">${html}</code></pre>`
}
const md = require('markdown-it')({
  html: true,
  highlight
});

const mdContainer = containers(md)
overWriteFenceRule(mdContainer)
// console.log(md, 'ssss')

module.exports = md
