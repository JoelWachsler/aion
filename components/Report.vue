<template>
  <v-data-table :headers="headers" :items="report" />
</template>
<script lang="ts">
import { computed, defineComponent, ref } from '@nuxtjs/composition-api'
import { TimeAggregatorResult } from '.electron/src/timeAggregator'
import { useReport } from '~/composition/useReport'
import { useDate } from '~/composition/useDate'

export default defineComponent({
  setup() {
    const data: TimeAggregatorResult[] = [
      {
        date: new Date().getTime(),
        name: 'first',
        seconds: 123,
      },
      {
        date: new Date().getTime(),
        name: 'second',
        seconds: 123,
      },
      {
        date: new Date(new Date().setDate(29)).getTime(),
        name: 'third',
        seconds: 5400,
      },
    ]

    const date = useDate(ref(new Date().getTime()))

    return {
      ...useReport({
        result: ref(data),
        interval: computed(() => {
          const week = date.firstAndLastDayOfWeek.value

          return {
            from: week.first,
            to: week.last,
          }
        }),
      }),
    }
  },
})
</script>
