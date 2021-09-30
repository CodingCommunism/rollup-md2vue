import { createFilter } from '@rollup/pluginutils';
import md from './utils/init-md';
import DemoBlockStr from './templates/demo-block.vue';

const ext = /\.md$/;

const vueComponentCache = new Map<string, string>();
const innerDemoBlockPath = '@md2vue/demo-block.vue';

/**
 * 将md->vue后文件中展示代码块，转为js组件插入到vue文件中进行展示
 * @param {String} mdStr
 * @returns {String} vueInstance
 */
function GenerateDisplayCode (resolvedId: string, demoBlockPath: string, source: string) {

  const content = md.render(source)

  const startTag = '<!--docs-demo:'
  const startTagLen = startTag.length
  const endTag = ':docs-demo-->'
  const endTagLen = endTag.length

  let componentsString = 'DemoBlock,'
  let id = 0 // demo 的 id
  const output: string[] = [] // 输出的内容
  const importer: string[] = [
    `import DemoBlock from '${demoBlockPath}';`
  ];
  let start = 0 // 字符串开始位置

  let commentStart = content.indexOf(startTag)
  let commentEnd = content.indexOf(endTag, commentStart + startTagLen)
  while (commentStart !== -1 && commentEnd !== -1) {
    output.push(content.slice(start, commentStart))
    const commentContent: string = content.slice(commentStart + startTagLen, commentEnd)

    const demoResolvedId = `@md2vue${resolvedId}/md-component-demo-${id}.vue?mt=${new Date().getTime()}`;
    vueComponentCache.set(demoResolvedId, commentContent);

    const demoComponentName = `doc-demo${id}`
    const demoComponentImporter = `import DocDemo${id} from '${demoResolvedId}';`;

    importer.push(demoComponentImporter);
    output.push(`<template #source><${demoComponentName} /></template>`)
    componentsString += `DocDemo${id},`

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
      ${importer.join('\n')}

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

  const mdResolvedId = `@md2vue${resolvedId}/markdown-main-component.vue?mt=${new Date().getTime()}`;
  const mdMainComponent = `
    <template>
      ${output.join('')}
    </template>
    ${pageScript}
  `;

  vueComponentCache.set(mdResolvedId, mdMainComponent);
  return mdResolvedId;
}


export default function md2vue (options: {
  include?: string[];
  exclude?: string[];
  blockComponent?: string;
}) {
  const filter = createFilter(options?.include ?? ['**/*.md'], options?.exclude ?? []);

  let demoBlockPath: string = innerDemoBlockPath;
  if (options?.blockComponent) {
    demoBlockPath = options?.blockComponent;
  } else {
    vueComponentCache.set(demoBlockPath, DemoBlockStr);
  }

  return {
    name: 'md2vue',
    resolveId(id: string) {
      if (vueComponentCache.get(id)) {
        return id
      }
      return null;
    },
    load(id: string) {
      if(vueComponentCache.get(id)) {
        return {
          code: vueComponentCache.get(id),
          map: { mappings: '' }
        };
      }
      return null;
    },
    transform (code: string, id: string): {
      code: string;
      map: { mappings: ''; };
    } {
      
      if (!ext.test(id)) return null;
      if (!filter(id)) return null;

      const mdResolvedId = GenerateDisplayCode(id, demoBlockPath, code);
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
