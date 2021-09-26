import { readFileSync } from 'fs';
import { createFilter } from '@rollup/pluginutils';
import { stripScript, stripTemplate, genInlineComponentText } from './util';
import md from './config';

const ext = /\.md$/;

/**
 * 将md->vue后文件中展示代码块，转为js组件插入到vue文件中进行展示
 * @param {String} mdStr
 * @returns {String} vueInstance
 */
function GenerateDisplayCode (source: string) {
  console.log(source, 'source: ');
  const content = md.render(source)

  const startTag = '<!--element-demo:'
  const startTagLen = startTag.length
  const endTag = ':element-demo-->'
  const endTagLen = endTag.length

  let componentsString = ''
  let id = 0 // demo 的 id
  const output: string[] = [] // 输出的内容
  let start = 0 // 字符串开始位置

  let commentStart = content.indexOf(startTag)
  let commentEnd = content.indexOf(endTag, commentStart + startTagLen)
  while (commentStart !== -1 && commentEnd !== -1) {
    output.push(content.slice(start, commentStart))

    const commentContent = content.slice(commentStart + startTagLen, commentEnd)
    const html = stripTemplate(commentContent)
    const script = stripScript(commentContent)

    const demoComponentContent = genInlineComponentText(html, script)

    const demoComponentName = `element-demo${id}`
    output.push(`<template #source><${demoComponentName} /></template>`)
    componentsString += `${JSON.stringify(
      demoComponentName,
    )}: ${demoComponentContent},`

    // 重新计算下一次的位置
    id++
    start = commentEnd + endTagLen
    commentStart = content.indexOf(startTag, start)
    commentEnd = content.indexOf(endTag, commentStart + startTagLen)
  }

  // 仅允许在 demo 不存在时，才可以在 Markdown 中写 script 标签
  // todo: 优化这段逻辑
  let pageScript = ''
  if (componentsString) {
    pageScript = `<script>
      import hljs from 'highlight.js'
      import * as Vue from "vue"
      export default {
        name: 'component-doc',
        components: {
          ${componentsString}
        }
      }
    </script>`
  } else if (content.indexOf('<script>') === 0) {
    // 硬编码，有待改善
    start = content.indexOf('</script>') + '</script>'.length
    pageScript = content.slice(0, start)
  }

  output.push(content.slice(start))
  return `
    <template>
      <section class="content element-doc">
        ${output.join('')}
      </section>
    </template>
    ${pageScript}
  `
}


export default function md2vue (options: {
  include?: string[];
  exclude?: string[];
}) {
  const filter = createFilter(options?.include ?? ['**/*.md'], options?.exclude ?? []);
  return {
    name: 'md2vue',
    // todo: 应该是 load 而不是 transform，因为还需要 vue-plugin 对文件进行 transform
    load (id: string): {
      code: string;
      map: { mappings: ''; };
    } {
      console.log(id);
      
      if (!ext.test(id)) return null;
      if (!filter(id)) return null;

      const code = readFileSync(id.split('?')[0], 'utf-8')
      const data = GenerateDisplayCode(code);
      return {
        code: `export default ${JSON.stringify(data.toString())};`,
        map: { mappings: '' }
      };
    },
  }
}
