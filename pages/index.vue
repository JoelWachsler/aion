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
  onBeforeUnmount,
  onMounted,
  ref,
} from '@nuxtjs/composition-api'
import { IpcRendererEvent } from 'electron'
import { TimeEvent } from '~/.electron/src/timeAggregator'
import { win } from '~/composition/useWindow'
import { Messages } from '~/.electron/src/messages'

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

      win.ipcRenderer?.send(Messages.GetCurrentEvent, null)
      win.ipcRenderer?.send(Messages.GetTrackingNames, null)
    })

    const trackingNameUpdatesListener = {
      name: Messages.TrackingNamesUpdates,
      listener: (_: IpcRendererEvent, trackingNames: string[]) => {
        eventNames.value = trackingNames
      },
    }

    win.ipcRenderer?.on(trackingNameUpdatesListener.name, trackingNameUpdatesListener.listener)

    const currentEventListener = {
      name: Messages.CurrentEvent,
      listener: (_: IpcRendererEvent, message: TimeEvent) => {
        eventName.value = message.name
      },
    }

    win.ipcRenderer?.on(currentEventListener.name, currentEventListener.listener)

    onBeforeUnmount(() => {
      win.ipcRenderer?.off(trackingNameUpdatesListener.name, trackingNameUpdatesListener.listener)
      win.ipcRenderer?.off(currentEventListener.name, currentEventListener.listener)
    })

    return {
      eventName,
      eventNames,
      locked,
      workCounter,
      updateEventName() {
        win.ipcRenderer?.send(Messages.NewEvent, eventName.value)
      },
    }
  },
})
</script>
