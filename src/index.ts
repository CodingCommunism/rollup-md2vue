import { readFileSync } from 'fs';
import { createFilter } from '@rollup/pluginutils';
import { stripScript, stripTemplate, genInlineComponentText } from './util';
import md from './config';

const ext = /\.md$/;

const vueComponentCache = new Map<string, string>();

/**
 * 将md->vue后文件中展示代码块，转为js组件插入到vue文件中进行展示
 * @param {String} mdStr
 * @returns {String} vueInstance
 */
function GenerateDisplayCode (resolvedId: string, source: string) {
  // console.log(source, 'source: ');
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
    const demoResolvedId = `@md2vue${resolvedId}/md-component-demo-${id}.vue`;
    vueComponentCache.set(demoResolvedId, commentContent);

    const demoComponentContent = `import('${demoResolvedId}')`;//genInlineComponentText(html, script)

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

  const mdResolvedId = `@md2vue${resolvedId}/markdown-main-component.vue`;
  const mdMainComponent = `
    <template>
      <section class="content element-doc">
        ${output.join('')}
      </section>
    </template>
    ${pageScript}
  `;
  vueComponentCache.set(mdResolvedId, mdMainComponent);
  return mdResolvedId;
}


export default function md2vue (options: {
  include?: string[];
  exclude?: string[];
}) {
  const cacheComponentRegEx = /(\/md\-component\-demo\-\d+\.vue|\/markdown\-main\-component\.vue)$/;
  const filter = createFilter(options?.include ?? ['**/*.md'], options?.exclude ?? []);
  return {
    name: 'md2vue',
    resolveId(id: string) {
      const [path, query] = id.split('?');
      if (!query && vueComponentCache.get(path)) {
        console.log(id, '>>>>>>> resolve id');
        return id + '?md2vueLoad';
      }
      return null;
    },
    load(id: string) {
      if (id.endsWith('?md2vueLoad')) {
        console.log(id, '>>>>>>> load');
        id = id.split('?')[0]
        if(vueComponentCache.get(id)) {
          console.log('get it');
          return {
            code: vueComponentCache.get(id),
            map: { mappings: '' }
          };
        }
      }
      return null;
    },
    transform (code: string, id: string): {
      code: string;
      map: { mappings: ''; };
    } {
      
      if (!ext.test(id)) return null;
      if (!filter(id)) return null;

      console.log(id, id.split('?')[0], '<<<<<<<');
      // const code = readFileSync(id.split('?')[0], 'utf-8')
      const mdResolvedId = GenerateDisplayCode(id, code);
      return {
        code: `
          import component from '${mdResolvedId}';
          export default component;
        `,
        map: { mappings: '' }
      };
    },
  }
}
