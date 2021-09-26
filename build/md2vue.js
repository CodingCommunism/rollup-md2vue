'use strict';

var require$$0$3 = require('@rollup/pluginutils');
var require$$0 = require('@vue/compiler-dom');
var require$$0$2 = require('highlight.js');
var require$$0$1 = require('markdown-it-container');
var require$$3 = require('markdown-it');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var require$$0__default$3 = /*#__PURE__*/_interopDefaultLegacy(require$$0$3);
var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);
var require$$0__default$2 = /*#__PURE__*/_interopDefaultLegacy(require$$0$2);
var require$$0__default$1 = /*#__PURE__*/_interopDefaultLegacy(require$$0$1);
var require$$3__default = /*#__PURE__*/_interopDefaultLegacy(require$$3);

// const { compileTemplate } = require('@vue/component-compiler-utils');
const compiler = require$$0__default["default"]; // 模板
// const compiler = require('@vue/compiler-sfc') // 模板


function stripScript$1 (content) {
  const result = content.match(/<(script)>([\s\S]+)<\/\1>/);
  return result && result[2] ? result[2].trim() : ''
}

function stripStyle (content) {
  const result = content.match(/<(style)\s*>([\s\S]+)<\/\1>/);
  return result && result[2] ? result[2].trim() : ''
}

// 编写例子时不一定有 template。所以采取的方案是剔除其他的内容
function stripTemplate$1 (content) {
  content = content.trim();
  if (!content) {
    return content
  }
  content = content.replace(/<(script|style)[\s\S]+<\/\1>/g, '').trim();
  // 过滤<template>
  const ret = content.match(/<(template)\s*>([\s\S]+)<\/\1>/);
  return ret ? ret[2].trim() : content
}

// function pad(source) {
//   return source
//     .split(/\r?\n/)
//     .map(line => `  ${line}`)
//     .join('\n')
// }

function genInlineComponentText$1 (template, script) {
  // const finalOptions = {
  //   source: `<div>${template}</div>`,
  //   filename: 'inline-component', // TODO：这里有待调整
  //   compiler
  // };

  // const compiled = compiler.compile(template, { mode: "module"})
  const compiled = compiler.compile(template, { prefixIdentifiers: true });
  // const compiled = compileTemplate(finalOptions);

  // errors
  // if (compiled.errors && compiled.errors.length) {
  //   console.error(
  //     `\n  Error compiling template:\n${pad(compiled.source)}\n` +
  //       compiled.errors.map(e => `  - ${e}`).join('\n') +
  //       '\n'
  //   );
  // }

  const code = compiled.code.replace(/return\s+?function\s+?render/, () => {
    return 'function render '
  });

  let demoComponentContent = `
    ${code}
  `;

  // todo: 这里采用了硬编码有待改进
  script = script.trim();
  if (script) {
    script = script
      .replace(/export\s+default/, 'const democomponentExport =')
      .replace(/import ([,{}\w\s]+) from (['"\w]+)/g, function (s0, s1, s2) {
        if (s2 === `'vue'`) {
          return `
        const ${s1} = Vue
        `
        } else if (s2 === `'element3'`) {
          return `
            const ${s1} = Element3
          `
        }
      });
  } else {
    script = 'const democomponentExport = {}';
  }
  demoComponentContent = `(function() {
    ${demoComponentContent}
    ${script}
    return {
      mounted(){
        this.$nextTick(()=>{
          const blocks = document.querySelectorAll('pre code:not(.hljs)')
          Array.prototype.forEach.call(blocks, hljs.highlightBlock)
        })
      },
      render,
      ...democomponentExport
    }
  })()`;
  return demoComponentContent
}

var util = {
  stripScript: stripScript$1,
  stripStyle,
  stripTemplate: stripTemplate$1,
  genInlineComponentText: genInlineComponentText$1
};

// 把md中的demo部分取出来 分成两份，一份代码高亮展示，一份渲染

const mdContainer$1 = require$$0__default$1["default"];

var containers$1 = (md) => {
  md.use(mdContainer$1, 'demo', {
    validate (params) {
      return params.trim().match(/^demo\s*(.*)$/)
    },
    render (tokens, idx) {
      const m = tokens[idx].info.trim().match(/^demo\s*(.*)$/);
      if (tokens[idx].nesting === 1) {
        const description = m && m.length > 1 ? m[1] : '';
        const content =
          tokens[idx + 1].type === 'fence' ? tokens[idx + 1].content : '';
        return `<demo-block>
        ${description ? `<div>${md.render(description)}</div>` : ''}
        <!--element-demo: ${content}:element-demo-->
        `
      }
      return '</demo-block>'
    }
  });

  md.use(mdContainer$1, 'tip');
  md.use(mdContainer$1, 'warning');
  return md
};

// 覆盖默认的 fence 渲染策略
var fence = (md) => {
  const defaultRender = md.renderer.rules.fence;
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    // 判断该 fence 是否在 :::demo 内
    const prevToken = tokens[idx - 1];
    const isInDemoContainer =
      prevToken &&
      prevToken.nesting === 1 &&
      prevToken.info.trim().match(/^demo\s*(.*)$/);
    if (token.info === 'html' && isInDemoContainer) {
      return `<template #highlight><pre v-pre><code class="html">${md.utils.escapeHtml(
        token.content
      )}</code></pre></template>`
    }
    return defaultRender(tokens, idx, options, env, self)
  };
};

// const Config = require('markdown-it-chain') // TODO 将此webpack链式操作改为rollup支持的操作

const hljs = require$$0__default$2["default"];

const containers = containers$1;
const overWriteFenceRule = fence;


// 配置markdown-it常规代码高亮，相关文档：https://markdown-it.github.io/markdown-it/#MarkdownIt.new
const highlight = (str, lang) => {
  if (!lang || !hljs.getLanguage(lang)) {
    return '<pre><code class="hljs">' + str + '</code></pre>'
  }
  const html = hljs.highlight(lang, str, true, undefined).value;
  return `<pre><code class="hljs language-${lang}">${html}</code></pre>`
};
const md$1 = require$$3__default["default"]({
  html: true,
  highlight
});

const mdContainer = containers(md$1);
overWriteFenceRule(mdContainer);
// console.log(md, 'ssss')

var config = md$1;

const { createFilter } = require$$0__default$3["default"];
const { stripScript, stripTemplate, genInlineComponentText } = util;
const md = config;

const ext = /\.md$/;

/**
 * 将md->vue后文件中展示代码块，转为js组件插入到vue文件中进行展示
 * @param {String} vue
 * @returns {String} vue
 */
function GenerateDisplayCode (source) {
  console.log(source, 'source: ');
  const content = md.render(source);

  const startTag = '<!--element-demo:';
  const startTagLen = startTag.length;
  const endTag = ':element-demo-->';
  const endTagLen = endTag.length;

  let componenetsString = '';
  let id = 0; // demo 的 id
  const output = []; // 输出的内容
  let start = 0; // 字符串开始位置

  let commentStart = content.indexOf(startTag);
  let commentEnd = content.indexOf(endTag, commentStart + startTagLen);
  while (commentStart !== -1 && commentEnd !== -1) {
    output.push(content.slice(start, commentStart));

    const commentContent = content.slice(commentStart + startTagLen, commentEnd);
    const html = stripTemplate(commentContent);
    const script = stripScript(commentContent);

    const demoComponentContent = genInlineComponentText(html, script);

    const demoComponentName = `element-demo${id}`;
    output.push(`<template #source><${demoComponentName} /></template>`);
    componenetsString += `${JSON.stringify(
      demoComponentName,
    )}: ${demoComponentContent},`;

    // 重新计算下一次的位置
    id++;
    start = commentEnd + endTagLen;
    commentStart = content.indexOf(startTag, start);
    commentEnd = content.indexOf(endTag, commentStart + startTagLen);
  }

  // 仅允许在 demo 不存在时，才可以在 Markdown 中写 script 标签
  // todo: 优化这段逻辑
  let pageScript = '';
  if (componenetsString) {
    pageScript = `<script>
      import hljs from 'highlight.js'
      import * as Vue from "vue"
      export default {
        name: 'component-doc',
        components: {
          ${componenetsString}
        }
      }
    </script>`;
  } else if (content.indexOf('<script>') === 0) {
    // 硬编码，有待改善
    start = content.indexOf('</script>') + '</script>'.length;
    pageScript = content.slice(0, start);
  }

  output.push(content.slice(start));
  return `
    <template>
      <section class="content element-doc">
        ${output.join('')}
      </section>
    </template>
    ${pageScript}
  `
}


var src = function md2vue (options = {}) {
  const filter = createFilter(options.include || ['**/*.md'], options.exclude);
  return {
    name: 'md2vue',
    transform (code, id) {
      if (!ext.test(id)) return null;
      if (!filter(id)) return null;

      const data = GenerateDisplayCode(code);
      return {
        code: `export default ${JSON.stringify(data.toString())};`,
        map: { mappings: '' }
      };
    }

  }
};

module.exports = src;
