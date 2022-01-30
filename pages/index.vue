<template>
  <v-container>
    <v-row>Current state: {{ locked }}</v-row>
    <v-row>Counter: {{ workCounter }}</v-row>
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
import { Messages } from '~/electron/src/messages'
import { TimeEvent } from '~/electron/src/timeAggregator'
import { sendMessage } from '~/composition/useMessage'
import { useMessageListener } from '~/composition/useMessageListener'

export default defineComponent({
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
    const eventNames = ref<string[]>([])

    onMounted(() => {
      setInterval(() => {
        currentDate.value = new Date()
      }, 1000)

      sendMessage(Messages.GetCurrentEvent, null)
      sendMessage(Messages.GetTrackingNames, null)
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
      updateEventName() {
        sendMessage(Messages.NewEvent, eventName.value)
      },
    }
  },
})
</script>
