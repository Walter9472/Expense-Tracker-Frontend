<script setup lang="ts">
import { ref } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import CategoryList from './components/CategoryList.vue'
</script>

<template>
  <div id="app">
    <CategoryList :categories="categoryArray" />
  </div>
</template>

<script lang="ts">
const categoryArray = ref([
  { id: 1, name: 'Lebensmittel' },
  { id: 2, name: 'Miete' },
  { id: 3, name: 'Freizeit' }
])

export default {
  components: { CategoryList },
  data() {
    return {
      categoryArray
    }
  }
}
</script>