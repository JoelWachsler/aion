<template>
  <v-container>
    <v-row>
      Current state: {{ locked }}
    </v-row>
    <v-row>
      Counter: {{ workCounter }}
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from '@nuxtjs/composition-api'
import { ipcRenderer } from 'electron'

type WindowWithIpc = typeof window & { ipcRenderer?: typeof ipcRenderer }

export default defineComponent({
  setup() {
    const locked = ref(false)
    const initDate = ref(new Date())
    const currentDate = ref(new Date())
    const workCounter = computed(() => {
      const seconds = Math.round((currentDate.value.getTime() - initDate.value.getTime()) / 1000)
      return new Date(seconds * 1000).toISOString().substr(11, 8)
    })

    onMounted(() => {
      setInterval(() => {
        currentDate.value = new Date()
      }, 1000)
    })

    const win = window as WindowWithIpc
    win.ipcRenderer?.on('locked-state', (_, message) => {
      locked.value = Boolean(message)
    })

    return {
      locked,
      workCounter,
    }
  },
})
</script>
