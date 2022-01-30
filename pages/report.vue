<template>
  <v-container>
    <v-row>
      <v-data-table :headers="headers" :items="report" />
    </v-row>
  </v-container>
</template>
<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from '@nuxtjs/composition-api'
import { TimeAggregatorResult } from 'electron/src/timeAggregator'
import { Messages } from '~/electron/src/messages'
import { useDate } from '~/composition/useDate'
import { sendMessage } from '~/composition/useMessage'
import { useMessageListener } from '~/composition/useMessageListener'
import { useReport } from '~/composition/useReport'

export default defineComponent({
  setup() {
    const date = useDate(ref(new Date().getTime()))
    const result = ref<TimeAggregatorResult[]>([])

    useMessageListener(Messages.NewReport, (_, message: TimeAggregatorResult[]) => {
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
      sendMessage(Messages.GenerateReport, currentWeek.value)
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
