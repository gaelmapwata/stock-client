<template>
  <div class="d-flex flex-wrap">
    <v-card min-width="140px" class="mr-4 mb-4">
      <v-card-text class="text-center">
        <span>Today</span>
        <p class="text-h3">
          {{ stats.today }}
        </p>
      </v-card-text>
    </v-card>

    <v-card min-width="140px" class="mr-4 mb-4">
      <v-card-text class="text-center">
        <span>Yesterday</span>
        <p class="text-h3">
          {{ stats.yesterday }}
        </p>
      </v-card-text>
    </v-card>

    <v-card min-width="140px" class="mr-4 mb-4">
      <v-card-text class="text-center">
        <span>This week</span>
        <p class="text-h3">
          {{ stats.currentWeek }}
        </p>
      </v-card-text>
    </v-card>

    <v-card min-width="140px" class="mb-4">
      <v-card-text class="text-center">
        <span>This Month</span>
        <p class="text-h3">
          {{ stats.currentMonth }}
        </p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import { useRequestStore } from '@/stores/request'
import { storeToRefs } from 'pinia'

const requestStore = useRequestStore()
const { getRequestsStats } = requestStore
const { stats } = storeToRefs(requestStore)

getRequestsStats()
</script>
