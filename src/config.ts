// const Config = require('markdown-it-chain') // TODO 将此webpack链式操作改为rollup支持的操作
import hljs from "highlight.js"
import containers from './containers';
import overWriteFenceRule from './fence'
import markdownIt from 'markdown-it';


// 配置markdown-it常规代码高亮，相关文档：https://markdown-it.github.io/markdown-it/#MarkdownIt.new
const highlight = (str: string, lang: string) => {
  if (!lang || !hljs.getLanguage(lang)) {
    return '<pre><code class="hljs">' + str + '</code></pre>'
  }
  const html = hljs.highlight(lang, str, true, undefined).value
  return `<pre><code class="hljs language-${lang}">${html}</code></pre>`
}

const md = markdownIt({
  html: true,
  highlight
});

const mdContainer = containers(md)
overWriteFenceRule(mdContainer)
// console.log(md, 'ssss')

export default md
