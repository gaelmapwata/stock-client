<template>
  <div class="page-container">
    <v-card rounded="xl" elevation="0" style="overflow: visible; position: relative; z-index: 2;">
      <v-card-text>
        <RequestFiltre
          v-model="filter"
          @filter="handleFilter()"
        />
      </v-card-text>
    </v-card>
    <v-card :loading="requestsLoading" class="mt-2" rounded="xl" elevation="0">
      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :headers="(headers as any)"
        :items-length="totalItems"
        :items="requests"
        :loading="requestsLoading"
        item-value="id"
        items-per-page-text="Items par page"
        @update:options="loadRequests"
      >
        <template #[`item.index`]="{ index }">
          {{ (itemsPerPage * (page - 1)) + index + 1 }}
        </template>
        <template #[`item.createdAt`]="{ item }">
          {{ item.createdAt ? formatters.formatDateFns(item.createdAt) : '-' }}
        </template>
        <template #[`item.receivedQuantity`]="{ item }">
          <input
            v-model.number="item.receivedQuantity"
            type="number"
            min="0"
            class="quantity-input"
            @change="handleQuantityChange(item)"
          >
        </template>
        <template #[`item.article`]="{ item }">
          {{ item.article.label }}
        </template>
        <template #[`item.requester`]="{ item }">
          {{ item.requester.email }}
        </template>
        <template #[`item.approver`]="{ item }">
          {{ item.approver?.email || '-' }}
        </template>
        <template #[`item.department`]="{ item }">
          {{ item.department?.label }}
        </template>
        <template #[`item.success`]="{ item }">
          <v-chip v-if="!item.approver" append>
            <v-icon start icon="mdi-clock-outline" />
            Pending validation
          </v-chip>

          <v-chip v-if="item.success" variant="flat" color="green" append>
            <v-icon start icon="mdi-check" />
            Success
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
      </v-data-table-server>
    </v-card>
  </div>
</template>

<script setup lang="ts">
// eslint-disable-next-line import/extensions
import RequestFiltre from '~/components/request/RequestFiltre.vue'
import { formatters } from '@/utilities/formatter.util'
import { RequestI } from '~/types/request'
import { useRequestStore } from '~/stores/request'
// import { useSnackbarStore } from '~/stores/snackbar'
import { shouldHaveOneOfPermissions } from '~/utilities/auth.util'

definePageMeta({
  layout: 'admin',
  middleware: [(_, __, next) => shouldHaveOneOfPermissions({ next, permissions: ['REQUEST:READ', 'REQUEST:READ_ALL_REQUESTS'] })]
})

useAdminBreadcrumb('mdi-security', [{
  title: 'Liste demande validé',
  href: '/admin/request-list-validated'
}])

const requestStore = useRequestStore()
// const snackbarStore = useSnackbarStore()
const { fetchRequestsValidated, updateQuantityReceived } = requestStore
// const { showSuccessSnackbar } = snackbarStore

const itemsPerPage = ref(10)
const page = ref(1)
const requests = ref<RequestI[]>([])
const requestsLoading = ref(false)
const filter = ref<Record<string, string | boolean | number>>({
  success: false
})
const totalItems = ref(0)

const headers = [
  {
    title: '#',
    align: 'start',
    sortable: false,
    key: 'index'
  },
  {
    title: 'Date',
    key: 'createdAt',
    sortable: false
  },
  {
    title: 'Quantité demandé',
    key: 'requestQuantity',
    sortable: false
  },
  {
    title: 'Quantité reçu',
    key: 'receivedQuantity',
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
    title: 'Validé par',
    key: 'approver',
    sortable: false
  },
  {
    title: 'Département',
    key: 'department',
    sortable: false
  },
  {
    title: 'Status',
    key: 'success',
    sortable: false
  }
]

function handleFilter () {
  page.value = 1
  loadRequests()
}

async function handleQuantityChange (item: any) {
  if (!item.receivedQuantity || item.receivedQuantity < 0) {
    return null
  }
  const payload:RequestI = {
    id: item.id,
    requestQuantity: item.requestQuantity,
    receivedQuantity: item.receivedQuantity,
    articleId: item.articleId
  }
  await updateQuantityReceived(payload)
}

async function loadRequests () {
  requestsLoading.value = true
  const { data, total } = await fetchRequestsValidated(
    {
      page: page.value,
      limit: itemsPerPage.value,
      filter: { ...filter.value }
    }
  )
  requests.value = data
  totalItems.value = total
  requestsLoading.value = false
}

loadRequests()

</script>
