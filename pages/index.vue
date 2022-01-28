<template>
  <v-container>
    <v-row>Current state: {{ locked }}</v-row>
    <v-row>Counter: {{ workCounter }}</v-row>
    <v-row>
      <report />
    </v-row>
    <v-row>
      <v-text-field
        v-model="eventName"
        placeholder="change event name"
        @blur="updateEventName"
        @keyup.native.enter="updateEventName"
      />
    </v-row>
  </v-container>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  ref,
} from '@nuxtjs/composition-api'
import Report from '~/components/Report.vue'
import { win } from '~/composition/useWindow'

export default defineComponent({
  components: {
    Report,
  },
  setup() {
    const locked = ref(false)
    const initDate = ref(new Date())
    const currentDate = ref(new Date())
    const workCounter = computed(() => {
      const seconds = Math.round(
        (currentDate.value.getTime() - initDate.value.getTime()) / 1000,
      )
      return new Date(seconds * 1000).toISOString().substr(11, 8)
    })

    const eventName = ref('')

    onMounted(() => {
      setInterval(() => {
        currentDate.value = new Date()
      }, 1000)
    })

    win.ipcRenderer?.on('locked-state', (_, message) => {
      locked.value = Boolean(message)
    })

    return {
      eventName,
      locked,
      workCounter,
      updateEventName() {
        win.ipcRenderer?.send('new-event', eventName.value)
      },
    }
  },
})
</script>
