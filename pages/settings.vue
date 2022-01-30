<template>
  <v-container>
    <v-row>
      <v-btn color="error" @click="clearDatabase">
        Clear database
      </v-btn>
    </v-row>
  </v-container>
</template>
<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import { Messages } from '~/electron/src/messages'
import { win } from '~/composition/useWindow'

export default defineComponent({
  setup() {
    return {
      clearDatabase() {
        win.ipcRenderer?.send(Messages.ClearDatabase)
      },
    }
  },
})
</script>
