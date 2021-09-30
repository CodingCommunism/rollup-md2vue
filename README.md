# rollup-plugin-md2vue

> Roll markdown to Vue 3 component with Rollup, extract 'demo' and convert it into execution effect and code display.


``` js
import md2vue from 'rollup-plugin-md2vue'

export default {
  plugins: [
    md2vue(/* options */)
  ]
}
```

## Options

``` js
export interface Options {
  include: string | RegExp | (string | RegExp)[]
  exclude: string | RegExp | (string | RegExp)[]
  
  // the path of your custom demo-block component
  // e.g. '/src/components/demo-block.vue'
  blockComponent: string
}
```



## Question

- Q: No highlight of code?

  - Check your dependency, your project must install `hightlight.js`.
  - Check init hightlight.js and import its style file. [Use highlight.js in ES6 Modules](https://github.com/highlightjs/highlight.js#es6-modules--import)

- Q: custom demo-block component can't display?

  - Your component must have three slot for demo's title(default), display area(name='source'), source code(name='highlight')

    ```html
    <template>
      <slot></slot>
      <div>
        <slot name="source"></slot>
      </div>
      <div>
        <slot name="highlight"></slot>
      </div>
    </template>
    <script>
    export default {
      name: 'demo-block'
    }
    </script>
    <style>
    </style>
    ```

