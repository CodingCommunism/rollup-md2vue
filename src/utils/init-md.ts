import containers from './md-containers';
import overWriteFenceRule from './fence'
import markdownIt from 'markdown-it';
import hljs from 'highlight.js';


// 配置markdown-it常规代码高亮，相关文档：https://markdown-it.github.io/markdown-it/#MarkdownIt.new
// 增加 highlightjs/vue-plugin 的 peerDependency，以达到高亮效果和正常显示的效果
const highlight = (str: string, lang: string) => {
  if (lang && hljs.getLanguage(lang)) {
    return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
  }
  return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
}

const md = markdownIt({
  html: true,
  highlight
});

const mdContainer = containers(md)
overWriteFenceRule(mdContainer)

export default md
