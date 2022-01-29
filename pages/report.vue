<template>
  <v-container>
    <v-row>
      <v-data-table :headers="headers" :items="report" />
    </v-row>
  </v-container>
</template>
<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted, onUnmounted, ref } from '@nuxtjs/composition-api'
import { IpcRendererEvent } from 'electron'
import { TimeAggregatorResult } from '.electron/src/timeAggregator'
import { useDate } from '~/composition/useDate'
import { useReport } from '~/composition/useReport'
import { win } from '~/composition/useWindow'
import { Messages } from '~/.electron/src/messages'

export default defineComponent({
  setup() {
    const date = useDate(ref(new Date().getTime()))
    const result = ref<TimeAggregatorResult[]>([])

    const newReportListener = {
      name: Messages.NewReport,
      listener: (_: IpcRendererEvent, message: TimeAggregatorResult[]) => {
        result.value = message
      },
    }

    win.ipcRenderer?.on(newReportListener.name, newReportListener.listener)

    onUnmounted(() => {
      win.ipcRenderer?.off(newReportListener.name, newReportListener.listener)
    })

    const currentWeek = computed(() => {
      const week = date.firstAndLastDayOfWeek.value

      return {
        from: week.first,
        to: week.last,
      }
    })

    const generateReport = () => {
      win.ipcRenderer?.send(Messages.GenerateReport, currentWeek.value)
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
