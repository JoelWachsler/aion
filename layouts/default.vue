<template>
  <v-app dark>
    <v-main>
      <AppBar />

      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>
<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import AppBar from '~/components/AppBar.vue'

export default defineComponent({
  components: {
    AppBar,
  },
})
</script>
