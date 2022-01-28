<template>
  <v-container>
    <v-row>Current state: {{ locked }}</v-row>
    <v-row>Counter: {{ workCounter }}</v-row>
    <v-row>
      <v-btn @click="clicky">Generate report</v-btn>
    </v-row>
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
import { ipcRenderer } from 'electron'
import { TimeAggregatorResult } from '~/.electron/src/timeAggregator'
import Report from '~/components/Report.vue'

type WindowWithIpc = typeof window & { ipcRenderer?: typeof ipcRenderer }

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

    const report = ref<TimeAggregatorResult[]>([])
    const eventName = ref('')

    onMounted(() => {
      setInterval(() => {
        currentDate.value = new Date()
      }, 1000)
    })

    const win = window as WindowWithIpc
    win.ipcRenderer?.on('locked-state', (_, message) => {
      locked.value = Boolean(message)
    })

    win.ipcRenderer?.on('new-report', (_, message) => {
      report.value = message
    })

    return {
      eventName,
      report,
      locked,
      workCounter,
      updateEventName() {
        win.ipcRenderer?.send('new-event', eventName.value)
      },
      clicky() {
        const now = new Date()
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const firstOfNextMonth = new Date(
          firstOfMonth.getFullYear(),
          firstOfMonth.getMonth() + 1,
          1,
        )
        win.ipcRenderer?.send('generate-report', {
          from: firstOfMonth,
          to: firstOfNextMonth,
        })
      },
    }
  },
})
</script>
