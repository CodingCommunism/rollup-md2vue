import MarkdownIt from "markdown-it/lib"
import hljs from "highlight.js"

// 覆盖默认的 fence 渲染策略
export default (md: MarkdownIt) => {
  const defaultRender = md.renderer.rules.fence
  let index = 0;
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    // 判断该 fence 是否在 :::demo 内
    const prevToken = tokens[idx - 1]
    const isInDemoContainer =
      prevToken &&
      prevToken.nesting === 1 &&
      prevToken.info.trim().match(/^demo\s*(.*)$/)
    if (token.info === 'vue' && isInDemoContainer) {
      const code = `
      <template #highlight>
        <pre class="hljs"><code>${hljs.highlight(tokens[idx], { language: 'html', ignoreIllegals: true }).value}</code></pre>
      </template>`
      index++;
      return code;
    }
    return defaultRender(tokens, idx, options, env, self)
  }
}
