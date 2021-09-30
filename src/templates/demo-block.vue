<template>
  <slot></slot>
  <div class="source">
    <slot name="source"></slot>
  </div>
  <div class="precode">
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