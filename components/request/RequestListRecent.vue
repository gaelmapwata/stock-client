<template>
  <div>
    <v-data-table
      :headers="(headers as any)"
      :items="requests"
      :loading="requestsLoading"
      item-value="id"
    >
      <template #[`item.createdAt`]="{ item }">
        {{ item.createdAt ? formatters.formatDateFns(item.createdAt) : '-' }}
      </template>
      <template #[`item.article`]="{ item }">
        {{ item.article.label }}
      </template>
      <template #[`item.requester`]="{ item }">
        {{ item.requester.email }}
      </template>
      <template #[`item.department`]="{ item }">
        {{ item.department?.label }}
      </template>
      <template #[`item.success`]="{ item }">
        <v-chip v-if="!item.userApproved" append>
          <v-icon start icon="mdi-clock-outline" />
          Pending validation
        </v-chip>

        <v-chip v-if="item.success" variant="flat" color="green" append>
          <v-icon start icon="mdi-check" />
          Succès
        </v-chip>

        <v-tooltip v-else-if="item.error" :text="item.error">
          <template #activator="{ props }">
            <v-chip v-bind="props" variant="flat" color="red">
              <v-icon start icon="mdi-alert-circle" />
              Failure
            </v-chip>
          </template>
        </v-tooltip>
      </template>
      <template #bottom>
        <!-- just for hide -->
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts" setup>
import { formatters } from '@/utilities/formatter.util'
import { RequestI } from '@/types/request'
import { useRequestStore } from '@/stores/request'

const requestStore = useRequestStore()
const { fetchRequestsWithPagination } = requestStore

const requests = ref<RequestI[]>([])
const requestsLoading = ref(false)

const headers = [
  {
    title: 'Date',
    key: 'createdAt'
  },
  {
    title: 'Quantité demandé',
    key: 'requestQuantity',
    sortable: false
  },
  {
    title: 'Article',
    key: 'article',
    sortable: false
  },
  {
    title: 'Demandé par ',
    key: 'requester',
    sortable: false
  },
  {
    title: 'Département',
    key: 'department',
    sortable: false
  },
  {
    title: 'Status',
    key: 'success'
  }
]

async function loadRequests () {
  requestsLoading.value = true
  const { data } = await fetchRequestsWithPagination(
    {
      page: 0,
      limit: 10
    }
  )
  requests.value = data
  requestsLoading.value = false
}

loadRequests()
</script>
