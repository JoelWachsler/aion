<template>
  <v-container>
    <v-row>Tracked today: {{ workCounter }}</v-row>
    <v-row>
      <v-combobox
        v-model="eventName"
        solo
        placeholder="Change tracking"
        :items="eventNames"
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
import { getTrailingCommentRanges } from 'typescript'
import { sendMessage } from '~/composition/useMessage'
import { useMessageListener } from '~/composition/useMessageListener'
import { Messages } from '~/electron/src/messages'
import { TimeEvent } from '~/electron/src/timeAggregator'

export default defineComponent({
  setup() {
    const locked = ref(false)
    const initDate = ref(Date.now())
    const currentDate = ref(Date.now())
    const workCounter = computed(() => {
      const seconds = Math.round(
        (currentDate.value - initDate.value) / 1000,
      )
      return new Date(seconds * 1000).toISOString().substr(11, 8)
    })

    const eventName = ref('')
    const eventNames = ref<string[]>([])

    onMounted(() => {
      setInterval(() => {
        currentDate.value = Date.now()
      }, 1000)

      sendMessage(Messages.GetCurrentEvent)
      sendMessage(Messages.GetTrackingNames)
      sendMessage(Messages.GetSecondsTrackedForDay, Date.now())
    })

    useMessageListener(Messages.SecondsTrackedForDay, (_, secondsTracked: number) => {
      // don't question this :)
      initDate.value = new Date(currentDate.value - secondsTracked * 1000).getTime()
    })

    useMessageListener(Messages.TrackingNamesUpdates, (_, trackingNames: string[]) => {
      eventNames.value = trackingNames
    })

    useMessageListener(Messages.CurrentEvent, (_, message: TimeEvent) => {
      eventName.value = message.name
    })

    return {
      eventName,
      eventNames,
      locked,
      workCounter,
      updateEventName(e: Event) {
        const target = e.target
        if (target instanceof HTMLInputElement) {
          sendMessage(Messages.NewEvent, target.value)
        }
      },
    }
  },
})
</script>
