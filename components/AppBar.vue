<template>
  <v-app-bar app flat dense>
    <v-tabs centered>
      <v-tab :to="{ name: 'index' }" exact>Track</v-tab>
      <v-tab :to="{ name: 'report' }" exact>Report</v-tab>
      <v-tab :to="{ name: 'activity' }" exact>Activity</v-tab>
      <v-tab :to="{ name: 'settings' }" exact>Settings</v-tab>
    </v-tabs>
  </v-app-bar>
</template>
