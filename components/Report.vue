<template>
  <v-container>
    <v-row>
      <v-btn @click="generateReport">Generate report</v-btn>
    </v-row>

    <v-row>
      <v-data-table :headers="headers" :items="report" />
    </v-row>
  </v-container>
</template>
<script lang="ts">
import { computed, defineComponent, ref } from '@nuxtjs/composition-api'
import { TimeAggregatorResult } from '.electron/src/timeAggregator'
import { useDate } from '~/composition/useDate'
import { useReport } from '~/composition/useReport'
import { win } from '~/composition/useWindow'

export default defineComponent({
  setup() {
    const date = useDate(ref(new Date().getTime()))
    const result = ref<TimeAggregatorResult[]>([])

    win.ipcRenderer?.on('new-report', (_, message) => {
      result.value = message
    })

    const currentWeek = computed(() => {
      const week = date.firstAndLastDayOfWeek.value

      return {
        from: week.first,
        to: week.last,
      }
    })

    return {
      generateReport() {
        win.ipcRenderer?.send('generate-report', currentWeek.value)
      },
      ...useReport({
        result,
        interval: currentWeek,
      }),
    }
  },
})
</script>
