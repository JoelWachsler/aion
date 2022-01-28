<template>
  <v-container>
    <v-row>
      <v-data-table :headers="headers" :items="report" />
    </v-row>
  </v-container>
</template>
<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from '@nuxtjs/composition-api'
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

    const generateReport = () => {
      win.ipcRenderer?.send('generate-report', currentWeek.value)
    }

    let reportRefresher: ReturnType<typeof setInterval> | null
    onMounted(() => {
      generateReport()
      reportRefresher = setInterval(generateReport, 10000)
    })

    onBeforeUnmount(() => {
      if (reportRefresher) {
        clearInterval(reportRefresher)
        reportRefresher = null
      }
    })

    return {
      ...useReport({
        result,
        interval: currentWeek,
      }),
    }
  },
})
</script>
