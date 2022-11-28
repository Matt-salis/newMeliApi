
<script setup>
  import { RouterLink, RouterView } from 'vue-router'
  import Nav from './components/nav.vue';
</script>

<template>
  <header style="position: sticky !important;top: 0; z-index: 300 !important;" id="app">
    <Nav />
  </header>
  <RouterView />
</template>



<!-- <style scoped>
.inline {
  display: inline-flex;
  justify-items: space-around;
  align-items: center;
}
</style> -->
